-- MCE SPRINT - HOUR 0-4: RBAC & ALARM ENGINE SETUP
-- ============================================================================

-- 1. ALARM ENGINE TABLES
-- ----------------------------------------------------------------------------

-- Update existing alerts table if needed
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS rule_id uuid REFERENCES alarm_rules(id) ON DELETE SET NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS related_entity_type text;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS related_entity_id uuid;

-- Alarm Rules (System automation triggers)
CREATE TABLE IF NOT EXISTS alarm_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  entity_type text NOT NULL, -- 'project', 'tender', 'document'
  condition_field text NOT NULL,
  condition_operator text NOT NULL,
  condition_value text NOT NULL,
  base_severity text NOT NULL,
  ack_required boolean DEFAULT true,
  channels text[] DEFAULT ARRAY['in_app'],
  is_active boolean DEFAULT true,
  timing_sequence text[] DEFAULT ARRAY['T-14', 'T-7', 'T-3', 'T-1', 'T-0'],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL, -- Clerk User ID
  sound_enabled boolean DEFAULT true,
  sound_volume integer DEFAULT 75,
  email_enabled boolean DEFAULT true,
  email_frequency text DEFAULT 'immediate_critical',
  quiet_hours_enabled boolean DEFAULT false,
  quiet_hours_start time DEFAULT '22:00',
  quiet_hours_end time DEFAULT '07:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Snooze Records
CREATE TABLE IF NOT EXISTS notification_snoozes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id text NOT NULL, -- Clerk User ID
  snoozed_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 2. ROW-LEVEL SECURITY
-- ----------------------------------------------------------------------------

ALTER TABLE alarm_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_snoozes ENABLE ROW LEVEL SECURITY;

-- 1. Projects Master Policies
DROP POLICY IF EXISTS "Allow public all" ON projects_master;
CREATE POLICY "Everyone can read projects" ON projects_master FOR SELECT USING (true);
CREATE POLICY "L3+ can edit projects" ON projects_master FOR ALL 
    USING (get_user_tier() IN ('L3', 'L4'))
    WITH CHECK (get_user_tier() IN ('L3', 'L4'));

-- 2. Profiles Policies
DROP POLICY IF EXISTS "Allow public all" ON profiles;
CREATE POLICY "Everyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE
    USING (clerk_user_id = get_user_id())
    WITH CHECK (clerk_user_id = get_user_id());
CREATE POLICY "Admin can manage all profiles" ON profiles FOR ALL
    USING (get_user_tier() = 'L4');

-- 3. Documents Policies
DROP POLICY IF EXISTS "Tenant isolation for documents" ON documents;
DROP POLICY IF EXISTS "Allow public all" ON documents;
CREATE POLICY "Tier-based document access" ON documents FOR SELECT
    USING (get_user_tier() >= sensitivity_level);
CREATE POLICY "L3+ can manage documents" ON documents FOR ALL
    USING (get_user_tier() IN ('L3', 'L4'));

-- 4. Invoices Policies
DROP POLICY IF EXISTS "Allow public all" ON invoices;
CREATE POLICY "Everyone can read invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "L3+ can manage invoices" ON invoices FOR ALL
    USING (get_user_tier() IN ('L3', 'L4'));

-- 5. Tenders Policies
DROP POLICY IF EXISTS "Allow public all" ON tenders;
CREATE POLICY "Everyone can read tenders" ON tenders FOR SELECT USING (true);
CREATE POLICY "Owner/Admin can manage tenders" ON tenders FOR ALL
    USING (owner_user_id = get_user_id() OR get_user_tier() = 'L4')
    WITH CHECK (owner_user_id = get_user_id() OR get_user_tier() = 'L4');

-- 6. Audit Logs Policies
DROP POLICY IF EXISTS "Allow public all" ON audit_logs;
CREATE POLICY "Admin read-only audit logs" ON audit_logs FOR SELECT
    USING (get_user_tier() = 'L4');

-- 7. Notification/Alert Policies
DROP POLICY IF EXISTS "Allow public all" ON alerts;
CREATE POLICY "Everyone can read alerts" ON alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public all" ON notifications;
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT
    USING (user_id = get_user_id());

-- 8. Alarm Engine Policies
DROP POLICY IF EXISTS "Allow admin to manage alarm rules" ON alarm_rules;
CREATE POLICY "Allow admin to manage alarm rules" ON alarm_rules FOR ALL
    USING (get_user_role() IN ('super_admin', 'admin'))
    WITH CHECK (get_user_role() IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Users can manage their own preferences" ON notification_preferences;
CREATE POLICY "Users can manage their own preferences" ON notification_preferences
    FOR ALL
    USING (user_id = get_user_id())
    WITH CHECK (user_id = get_user_id());

DROP POLICY IF EXISTS "Users can manage their own snoozes" ON notification_snoozes;
CREATE POLICY "Users can manage their own snoozes" ON notification_snoozes
    FOR ALL
    USING (user_id = get_user_id())
    WITH CHECK (user_id = get_user_id());


-- 3. REALTIME SUBSCRIPTIONS
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE alarm_rules;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;