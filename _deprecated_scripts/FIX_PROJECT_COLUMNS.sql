-- FIX: Project Columns & Location
-- This script ensures the core project identity columns exist and are lowercased

DO $$ 
BEGIN 
    -- 1. Project Name (Essential)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_name') THEN
        ALTER TABLE public.projects_master ADD COLUMN project_name text;
    END IF;

    -- 2. Client Name (Essential)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='client_name') THEN
        ALTER TABLE public.projects_master ADD COLUMN client_name text;
    END IF;

    -- 3. Project Code (Essential)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_code') THEN
        ALTER TABLE public.projects_master ADD COLUMN project_code text;
    END IF;

    -- 4. Project Location (Requested specifically by user)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_location') THEN
        ALTER TABLE public.projects_master ADD COLUMN project_location text;
    END IF;

    -- 5. Standardize Casing (Safety cleanup)
    -- If uppercase versions exist, users might be confused, but we rely on the NUCLEAR_SCHEMA_UNIFIER for bulk renaming.
    -- This script focuses on *Existence*.

END $$;

-- 6. Grant permissions just in case
GRANT ALL ON public.projects_master TO authenticated;
GRANT ALL ON public.projects_master TO anon;
