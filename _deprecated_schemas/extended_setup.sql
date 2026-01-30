-- Extended schema setup for permission tiers and profiles
-- Run this AFTER schema.sql

-- 1. Permission Tier Enum
CREATE TYPE IF NOT EXISTS public.permission_tier AS ENUM ('L1', 'L2', 'L3', 'L4');

-- 2. Role to Tier Mapping Table
CREATE TABLE IF NOT EXISTS public.role_tier_map (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roles TEXT[] NOT NULL,
  tier public.permission_tier NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tier)
);

-- 3. Populate Role Tier Map
INSERT INTO public.role_tier_map (roles, tier, description)
VALUES
  (ARRAY['staff', 'analyst'], 'L1', 'All staff members - basic access'),
  (ARRAY['coordinator'], 'L2', 'Coordinators - enhanced access'),
  (ARRAY['executive', 'director', 'manager'], 'L3', 'Executives and Directors - Executive Cockpit + Agent Mesh'),
  (ARRAY['super_admin', 'admin'], 'L4', 'Super Admin - full access including Settings')
ON CONFLICT (tier) DO NOTHING;

-- 4. Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 5. Profiles table (referenced by permission system)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  tier public.permission_tier,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Function to auto-assign tier based on role
CREATE OR REPLACE FUNCTION public.set_profile_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- Get tier from role_tier_map
  SELECT tier INTO NEW.tier
  FROM public.role_tier_map
  WHERE NEW.role = ANY(roles);

  -- If no match, default to L1
  IF NEW.tier IS NULL THEN
    NEW.tier := 'L1';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_tier_on_profile_change ON public.profiles;

-- 8. Trigger to auto-set tier when role is inserted/updated
CREATE TRIGGER set_tier_on_profile_change
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_tier();

-- 9. Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 10. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update profiles" ON public.profiles;

-- 11. RLS Policies
-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (clerk_user_id = current_setting('request.jwt.claims')::json->>'sub');

-- Policy: Super admins (L4) can read all profiles
CREATE POLICY "Super admins can read all profiles" ON public.profiles
  FOR SELECT USING (
    (SELECT tier FROM public.profiles WHERE clerk_user_id = current_setting('request.jwt.claims')::json->>'sub') = 'L4'
  );

-- Policy: Super admins can update any profile
CREATE POLICY "Super admins can update profiles" ON public.profiles
  FOR UPDATE USING (
    (SELECT tier FROM public.profiles WHERE clerk_user_id = current_setting('request.jwt.claims')::json->>'sub') = 'L4'
  );

-- Policy: Super admins can insert profiles
CREATE POLICY "Super admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    (SELECT tier FROM public.profiles WHERE clerk_user_id = current_setting('request.jwt.claims')::json->>'sub') = 'L4'
    OR current_setting('request.jwt.claims')::json->>'sub' = ''
  );

-- 12. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON public.profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 13. Realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
