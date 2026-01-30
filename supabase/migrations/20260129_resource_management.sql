-- Resource Management System Tables
-- Created: 2026-01-29

-- team_members: Employee/contractor records with skills tracking
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL,
  department TEXT,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  availability_start DATE,
  availability_end DATE,
  utilization_target_percent INTEGER DEFAULT 80,
  billable BOOLEAN DEFAULT true,
  cost_per_hour DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  is_active BOOLEAN DEFAULT true
);

-- resource_pools: Skill-based grouping for quick allocation
CREATE TABLE IF NOT EXISTS resource_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_name TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  typical_allocation_percent INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- pool_members: Join table for team_members -> resource_pools
CREATE TABLE IF NOT EXISTS pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  resource_pool_id UUID NOT NULL REFERENCES resource_pools(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_member_id, resource_pool_id)
);

-- resource_allocations: Project-specific assignments
CREATE TABLE IF NOT EXISTS resource_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects_master(id) ON DELETE CASCADE,
  allocation_percent INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  role_in_project TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'On Hold', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- manpower_plans: CSV import storage for bulk uploads
CREATE TABLE IF NOT EXISTS manpower_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  uploaded_by UUID,
  file_name TEXT,
  data JSONB,
  row_count INTEGER,
  import_status TEXT DEFAULT 'Pending',
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- utilization_metrics: Calculated aggregates (updated by cron job)
CREATE TABLE IF NOT EXISTS utilization_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  total_allocation_percent INTEGER,
  projects_count INTEGER,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_member_id, period)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_is_active ON team_members(is_active);
CREATE INDEX IF NOT EXISTS idx_allocations_team_member ON resource_allocations(team_member_id);
CREATE INDEX IF NOT EXISTS idx_allocations_project ON resource_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_allocations_status ON resource_allocations(status);
CREATE INDEX IF NOT EXISTS idx_utilization_period ON utilization_metrics(period);
CREATE INDEX IF NOT EXISTS idx_pool_members_team ON pool_members(team_member_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON pool_members(resource_pool_id);

-- Add RLS (Row Level Security)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE manpower_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilization_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow L3+ to view, L4 to modify
-- Using get_user_tier() from our RBAC system
CREATE POLICY team_members_read ON team_members
  FOR SELECT USING (
    get_user_tier() IN ('L1', 'L2', 'L3', 'L4')
  );

CREATE POLICY team_members_insert ON team_members
  FOR INSERT WITH CHECK (
    get_user_tier() = 'L4'
  );

CREATE POLICY team_members_update ON team_members
  FOR UPDATE USING (
    get_user_tier() = 'L4'
  );

CREATE POLICY resource_allocations_read ON resource_allocations
  FOR SELECT USING (
    get_user_tier() IN ('L1', 'L2', 'L3', 'L4')
  );

CREATE POLICY resource_allocations_insert ON resource_allocations
  FOR INSERT WITH CHECK (
    get_user_tier() IN ('L3', 'L4')
  );

CREATE POLICY resource_allocations_update ON resource_allocations
  FOR UPDATE USING (
    get_user_tier() IN ('L3', 'L4')
  );

-- Function to calculate utilization metrics
CREATE OR REPLACE FUNCTION calculate_team_utilization()
RETURNS TABLE (team_member_id UUID, total_allocation INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ra.team_member_id,
    SUM(ra.allocation_percent)::INTEGER as total_allocation
  FROM resource_allocations ra
  WHERE ra.status = 'Active'
    AND ra.start_date <= CURRENT_DATE
    AND (ra.end_date IS NULL OR ra.end_date >= CURRENT_DATE)
  GROUP BY ra.team_member_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update utilization_metrics
CREATE OR REPLACE FUNCTION update_utilization_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO utilization_metrics (
    team_member_id,
    period,
    total_allocation_percent,
    projects_count,
    calculated_at
  )
  SELECT
    ra.team_member_id,
    CURRENT_DATE,
    COALESCE(SUM(ra.allocation_percent), 0)::INTEGER,
    COUNT(DISTINCT ra.project_id)::INTEGER,
    NOW()
  FROM resource_allocations ra
  WHERE ra.team_member_id = NEW.team_member_id
    AND ra.status = 'Active'
    AND ra.start_date <= CURRENT_DATE
    AND (ra.end_date IS NULL OR ra.end_date >= CURRENT_DATE)
  GROUP BY ra.team_member_id
  ON CONFLICT (team_member_id, period)
  DO UPDATE SET
    total_allocation_percent = EXCLUDED.total_allocation_percent,
    projects_count = EXCLUDED.projects_count,
    calculated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS allocations_update_metrics ON resource_allocations;
CREATE TRIGGER allocations_update_metrics
AFTER INSERT OR UPDATE ON resource_allocations
FOR EACH ROW
EXECUTE FUNCTION update_utilization_metrics();

-- Note: cron.schedule depends on pg_cron extension
-- SELECT cron.schedule(
--   'update_resource_utilization',
--   '0 * * * *',
--   $$
--   SELECT update_utilization_metrics();
--   $$
-- ) ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule;
