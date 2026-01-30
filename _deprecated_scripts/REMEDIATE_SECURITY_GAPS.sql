-- REMEDIATE_SECURITY_GAPS.sql
-- 1. Create Restricted Role for AI Agent
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ai_agent') THEN
    CREATE ROLE ai_agent WITH LOGIN PASSWORD 'nexus_safe_ai_2026';
  END IF;
END
$$;

-- 2. Grant Minimal Privileges
GRANT CONNECT ON DATABASE postgres TO ai_agent;
GRANT USAGE ON SCHEMA public TO ai_agent;

-- Grant Read-Only on Projects (AI needs to read context, but never write)
GRANT SELECT ON public.projects_master TO ai_agent;

-- Grant Insert on Documents/Logs (if needed in future, but keeping tight for now)
-- GRANT INSERT ON public.documents TO ai_agent; 

-- 3. Enable RLS on Critical Table
ALTER TABLE public.projects_master ENABLE ROW LEVEL SECURITY;

-- 4. Define Policies (White-list Model)

-- Policy A: Allow AI Agent and App Users to READ
DROP POLICY IF EXISTS "Allow Read Projects" ON public.projects_master;
CREATE POLICY "Allow Read Projects" ON public.projects_master 
FOR SELECT 
TO authenticated, anon, ai_agent 
USING (true);

-- Policy B: Allow ONLY Authenticated Users to WRITE (Create Projects)
-- AI Agent is EXCLUDED here.
DROP POLICY IF EXISTS "Allow Write Projects" ON public.projects_master;
CREATE POLICY "Allow Write Projects" ON public.projects_master 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Update Projects" ON public.projects_master;
CREATE POLICY "Allow Update Projects" ON public.projects_master 
FOR UPDATE
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow Delete Projects" ON public.projects_master;
CREATE POLICY "Allow Delete Projects" ON public.projects_master 
FOR DELETE
TO authenticated 
USING (true);
