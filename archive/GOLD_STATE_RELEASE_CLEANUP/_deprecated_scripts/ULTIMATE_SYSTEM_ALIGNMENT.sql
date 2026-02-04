-- ULTIMATE SYSTEM ALIGNMENT: Finalizing all supporting tables
-- Ensures every table matches the naming conventions expected by the frontend hooks

-- 1. Standardize agent_activity
CREATE TABLE IF NOT EXISTS public.agent_activity_temp (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name text NOT NULL,
    action text NOT NULL,
    document_id uuid,
    timestamp timestamptz DEFAULT now()
);

-- Copy data if old table existed, then swap
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'agent_activity') THEN
        -- Attempt to preserve data if possible (ignoring schema differences)
        INSERT INTO public.agent_activity_temp (id, agent_name, action, timestamp)
        SELECT id, COALESCE(agent_id, 'SYSTEM'), COALESCE(action_type, 'UPDATE'), created_at 
        FROM public.agent_activity ON CONFLICT DO NOTHING;
        
        DROP TABLE public.agent_activity CASCADE;
    END IF;
    ALTER TABLE public.agent_activity_temp RENAME TO agent_activity;
END $$;

-- 2. Standardize audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs_temp (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id text NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    diff jsonb,
    created_at timestamptz DEFAULT now()
);

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'audit_logs') THEN
        INSERT INTO public.audit_logs_temp (id, actor_id, action, entity_type, entity_id, diff, created_at)
        SELECT id, COALESCE(user_id::text, 'SYSTEM'), action, entity_type, entity_id::text, jsonb_build_object('old', old_value, 'new', new_value), COALESCE(timestamp, created_at)
        FROM public.audit_logs ON CONFLICT DO NOTHING;
        
        DROP TABLE public.audit_logs CASCADE;
    END IF;
    ALTER TABLE public.audit_logs_temp RENAME TO audit_logs;
END $$;

-- 3. Verify Alerts Schema
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS "title" text;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now();

-- 4. Verify Tenders Schema
ALTER TABLE public.tenders ADD COLUMN IF NOT EXISTS "created_at" timestamptz DEFAULT now();

-- 5. Final RLS Reset for supporting tables
ALTER TABLE public.agent_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Activity" ON agent_activity;
CREATE POLICY "Public Read Activity" ON agent_activity FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Audit" ON audit_logs;
CREATE POLICY "Public Read Audit" ON audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read PO" ON purchase_orders;
CREATE POLICY "Public Read PO" ON purchase_orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Alerts" ON alerts;
CREATE POLICY "Public Read Alerts" ON alerts FOR SELECT USING (true);
