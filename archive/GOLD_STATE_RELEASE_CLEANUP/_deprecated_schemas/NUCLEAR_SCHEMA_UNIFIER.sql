-- NUCLEAR SCHEMA UNIFIER: The Final Fix for Casing Mismatches
-- This script standardizes all projects_master columns to lowercase to match the frontend

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- 1. Rename any uppercase columns to lowercase if they exist
    FOR r IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'projects_master' 
        AND column_name <> lower(column_name)
    LOOP
        EXECUTE format('ALTER TABLE public.projects_master RENAME COLUMN %I TO %I', r.column_name, lower(r.column_name));
    END LOOP;

    -- 2. Ensure all required columns exist in lowercase
    -- (The previous repair script should have added these, but we verify here)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_name') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_name" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_code') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_code" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='client_name') THEN
        ALTER TABLE public.projects_master ADD COLUMN "client_name" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='contract_value_excl_vat') THEN
        ALTER TABLE public.projects_master ADD COLUMN "contract_value_excl_vat" numeric(18,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_status') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_status" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='completion_percent') THEN
        ALTER TABLE public.projects_master ADD COLUMN "completion_percent" numeric(5,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='contract_duration') THEN
        ALTER TABLE public.projects_master ADD COLUMN "contract_duration" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='remarks') THEN
        ALTER TABLE public.projects_master ADD COLUMN "remarks" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_commencement_date') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_commencement_date" timestamptz;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_completion_date_planned') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_completion_date_planned" timestamptz;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='scope_of_services_enum') THEN
        ALTER TABLE public.projects_master ADD COLUMN "scope_of_services_enum" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_type') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_type" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='client_entity_uid') THEN
        ALTER TABLE public.projects_master ADD COLUMN "client_entity_uid" uuid;
    END IF;
END $$;

-- 3. Update Audit Trigger to use standardized lowercase keys
CREATE OR REPLACE FUNCTION audit_project_changes()
RETURNS TRIGGER AS $$
DECLARE
    entity_id_val TEXT;
    old_data JSONB;
    new_data JSONB;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        old_data := to_jsonb(OLD);
        entity_id_val := old_data->>'id';
        
        INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, diff)
        VALUES ('SYSTEM_AGENT', TG_OP, 'PROJECT', entity_id_val, jsonb_build_object('old', old_data, 'new', null));
        RETURN OLD;
    ELSE
        new_data := to_jsonb(NEW);
        old_data := to_jsonb(OLD);
        entity_id_val := new_data->>'id';

        INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, diff)
        VALUES ('SYSTEM_AGENT', TG_OP, 'PROJECT', entity_id_val, jsonb_build_object('old', old_data, 'new', new_data));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;
