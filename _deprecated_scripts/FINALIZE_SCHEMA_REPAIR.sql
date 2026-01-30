-- FINALIZE SCHEMA REPAIR: Standardize all columns to lowercase
-- This ensures the SEED script works regardless of previous casing errors

-- 1. Add/Verify columns exist in lowercase (Postgres Standard)
DO $$ 
BEGIN 
    -- Required columns for the master sheet
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_name') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_name" text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='client_name') THEN
        ALTER TABLE public.projects_master ADD COLUMN "client_name" text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_code') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_code" text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_location_city') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_location_city" text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_status') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_status" text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='scope_of_services_enum') THEN
        ALTER TABLE public.projects_master ADD COLUMN "scope_of_services_enum" text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_type') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_type" text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='contract_value_excl_vat') THEN
        ALTER TABLE public.projects_master ADD COLUMN "contract_value_excl_vat" numeric(18,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_commencement_date') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_commencement_date" timestamptz;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_completion_date_planned') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_completion_date_planned" timestamptz;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='contract_duration') THEN
        ALTER TABLE public.projects_master ADD COLUMN "contract_duration" text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='remarks') THEN
        ALTER TABLE public.projects_master ADD COLUMN "remarks" text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='completion_percent') THEN
        ALTER TABLE public.projects_master ADD COLUMN "completion_percent" numeric(5,2) DEFAULT 0;
    END IF;
END $$;
