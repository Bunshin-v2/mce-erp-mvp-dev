-- 1. Ensure Profiles Table Exists and has correct columns
-- We use DO blocks or separate statements because internal IF NOT EXISTS for columns is a Postgres 9.6+ feature but we want to be safe.

CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'staff',
  tier TEXT DEFAULT 'L1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add columns if they don't exist (e.g. if table existed but was different)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tier') THEN
        ALTER TABLE profiles ADD COLUMN tier TEXT DEFAULT 'L1';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'staff';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'clerk_user_id') THEN
        ALTER TABLE profiles ADD COLUMN clerk_user_id TEXT UNIQUE;
    END IF;
END $$;

-- 2. Create the wrapper function to get current user ID
-- This maps the Clerk ID (from the JWT) to the profile ID
CREATE OR REPLACE FUNCTION get_current_user_tier()
RETURNS TEXT AS $$
DECLARE
  v_tier TEXT;
BEGIN
  -- Check if the request has a valid JWT with a 'sub' claim (Clerk User ID)
  -- The JWT from Clerk will have 'sub' matching 'clerk_user_id'
  SELECT tier INTO v_tier
  FROM profiles
  WHERE clerk_user_id = auth.jwt() ->> 'sub';
  
  RETURN v_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable RLS on Critical Tables
ALTER TABLE projects_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Drop existing to avoid conflicts)

-- Drop policies if they exist to allow re-running this script
DROP POLICY IF EXISTS "L4 Super Admins see all projects" ON projects_master;
DROP POLICY IF EXISTS "L3 Executives see all projects" ON projects_master;
DROP POLICY IF EXISTS "Staff see assigned projects" ON projects_master;
DROP POLICY IF EXISTS "Only L3+ can modify projects" ON projects_master;
DROP POLICY IF EXISTS "Only L3+ can update projects" ON projects_master;

-- POLICY: L4 (Super Admin) can see EVERYTHING
CREATE POLICY "L4 Super Admins see all projects"
ON projects_master
FOR ALL
USING (
  (SELECT tier FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub') = 'L4'
);

-- POLICY: L3 (Executives) can see EVERYTHING
CREATE POLICY "L3 Executives see all projects"
ON projects_master
FOR ALL
USING (
  (SELECT tier FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub') = 'L3'
);

-- POLICY: L1/L2 Staff have basic view access
CREATE POLICY "Staff see assigned projects"
ON projects_master
FOR SELECT
USING (
  TRUE 
);

-- POLICY: Only L3+ can INSERT/UPDATE projects
CREATE POLICY "Only L3+ can modify projects"
ON projects_master
FOR INSERT
WITH CHECK (
  (SELECT tier FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub') IN ('L3', 'L4')
);

CREATE POLICY "Only L3+ can update projects"
ON projects_master
FOR UPDATE
USING (
  (SELECT tier FROM profiles WHERE clerk_user_id = auth.jwt() ->> 'sub') IN ('L3', 'L4')
);

-- 5. Insert a Test User (Yourself)
-- Please replace 'REPLACE_WITH_YOUR_USER_ID' with your actual Clerk User ID from the Dashboard
-- Example: 'user_2rj...etc'

-- UNCOMMENT THE LINES BELOW AND ADD YOUR ID TO RUN
-- INSERT INTO profiles (clerk_user_id, full_name, role, tier)
-- VALUES ('REPLACE_WITH_YOUR_USER_ID', 'Admin User', 'super_admin', 'L4')
-- ON CONFLICT (clerk_user_id) DO UPDATE SET tier = 'L4';
