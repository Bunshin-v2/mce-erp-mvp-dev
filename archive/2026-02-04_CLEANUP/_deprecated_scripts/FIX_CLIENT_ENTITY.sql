-- FIX: Missing Client Entity UID in Projects Master
-- This script adds the client_entity_uid column which is causing 400 Bad Request errors in the dashboard

DO $$ 
BEGIN 
    -- Add client_entity_uid if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='client_entity_uid') THEN
        ALTER TABLE public.projects_master ADD COLUMN client_entity_uid text;
    END IF;

END $$;

-- Grant permissions
GRANT ALL ON public.projects_master TO authenticated;
GRANT ALL ON public.projects_master TO anon;
