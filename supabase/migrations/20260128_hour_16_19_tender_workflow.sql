-- MCE SPRINT - HOUR 16-19: TENDER WORKFLOW AUTOMATION
-- ============================================================================

-- 1. EXTEND TENDERS TABLE
-- ----------------------------------------------------------------------------
ALTER TABLE tenders ADD COLUMN IF NOT EXISTS next_followup_at timestamptz;

-- 2. TENDER COMMS EVENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tender_comms_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'email', 'call', 'meeting', 'site_visit'
  notes text,
  event_at timestamptz NOT NULL DEFAULT now(),
  logged_by_user_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. RLS POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE tender_comms_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage comms for their tenders" ON tender_comms_events;
CREATE POLICY "Users can manage comms for their tenders" ON tender_comms_events
    FOR ALL
    USING (
        tender_id IN (
            SELECT id FROM tenders 
            WHERE owner_user_id = get_user_id() 
            OR get_user_tier() = 'L4'
        )
    )
    WITH CHECK (
        tender_id IN (
            SELECT id FROM tenders 
            WHERE owner_user_id = get_user_id() 
            OR get_user_tier() = 'L4'
        )
    );

-- 4. REALTIME
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE tender_comms_events;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
