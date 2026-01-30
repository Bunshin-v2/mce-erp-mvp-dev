-- 1. EXTEND PERMISSIONS SYSTEM (L1-L4 Tiers)
DO $$ BEGIN
    CREATE TYPE public.permission_tier AS ENUM ('L1', 'L2', 'L3', 'L4');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.doc_sensitivity AS ENUM ('public', 'internal', 'restricted', 'confidential');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table to map existing text roles to Tiers
CREATE TABLE IF NOT EXISTS public.role_tier_map (
    role_name text PRIMARY KEY,
    tier public.permission_tier NOT NULL
);

-- Seed Role-Tier Map
INSERT INTO public.role_tier_map (role_name, tier) VALUES
('staff', 'L1'),
('engineer', 'L1'),
('dept_head', 'L2'),
('manager', 'L2'),
('executive', 'L3'),
('chairman', 'L3'),
('vice_chairman', 'L3'),
('super_admin', 'L4')
ON CONFLICT (role_name) DO UPDATE SET tier = EXCLUDED.tier;

-- Departments Structure
CREATE TABLE IF NOT EXISTS public.departments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profile_departments (
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    PRIMARY KEY (profile_id, department_id)
);

-- 2. AGENT MESH TRACKING
CREATE TABLE IF NOT EXISTS public.agent_activity (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id text NOT NULL, -- e.g., 'P1.CONTRACT_EXTRACTOR'
    action_type text NOT NULL, -- e.g., 'EXTRACTION', 'RISK_SCAN'
    status text NOT NULL DEFAULT 'processing', -- processing, completed, awaiting_hil, failed
    payload jsonb DEFAULT '{}', -- input data
    result jsonb DEFAULT '{}', -- output data
    hil_required boolean DEFAULT false,
    hil_status text, -- approved, rejected, modified
    hil_by uuid REFERENCES public.profiles(id),
    hil_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 3. AUDIT LOGGING (Immutable History)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id),
    action text NOT NULL,
    entity_type text NOT NULL, -- e.g., 'project', 'tender', 'document'
    entity_id uuid,
    old_value jsonb,
    new_value jsonb,
    timestamp timestamptz DEFAULT now()
);

-- 4. UPDATE EXISTING TABLES
ALTER TABLE public.projects_master ADD CONSTRAINT unique_project_code UNIQUE (PROJECT_CODE);

-- Create Invoices table if not exists
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number text NOT NULL UNIQUE,
    amount numeric NOT NULL,
    status text DEFAULT 'Draft',
    due_date date,
    created_at timestamptz DEFAULT now()
);

-- Add sensitivity to documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS sensitivity public.doc_sensitivity DEFAULT 'internal';
-- Add currency default to tenders as requested in Module 1
ALTER TABLE public.tenders ALTER COLUMN value_currency SET DEFAULT 'AED';

-- 5. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_current_user_tier()
RETURNS public.permission_tier AS $$
DECLARE
    user_role text;
    user_tier public.permission_tier;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    SELECT tier INTO user_tier FROM public.role_tier_map WHERE role_name = user_role;
    RETURN COALESCE(user_tier, 'L1');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;