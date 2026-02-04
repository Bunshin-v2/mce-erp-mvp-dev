-- ENSURE FULL SCHEMA: The Final Guarantee
-- This script adds every single missing column required by the new "Full Dossier" UI.
-- Run this to prevent "Column not found" errors.

DO $$ 
BEGIN 
    -- 0. Core Table Integrity (Base Columns)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_name') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_name" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='client_name') THEN
        ALTER TABLE public.projects_master ADD COLUMN "client_name" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_code') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_code" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_status') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_status" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='contract_value_excl_vat') THEN
        ALTER TABLE public.projects_master ADD COLUMN "contract_value_excl_vat" numeric(15,2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='completion_percent') THEN
        ALTER TABLE public.projects_master ADD COLUMN "completion_percent" numeric(5,2) DEFAULT 0.00;
    END IF;

    -- 1. Identity & Location
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_location_city') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_location_city" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='end_client_name') THEN
        ALTER TABLE public.projects_master ADD COLUMN "end_client_name" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='scope_of_services_enum') THEN
        ALTER TABLE public.projects_master ADD COLUMN "scope_of_services_enum" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_type') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_type" text;
    END IF;

    -- 2. Timeline
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_commencement_date') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_commencement_date" date;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_completion_date_planned') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_completion_date_planned" date;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='contract_duration') THEN
        ALTER TABLE public.projects_master ADD COLUMN "contract_duration" text;
    END IF;

    -- 3. Commercial Framework
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='contract_form') THEN
        ALTER TABLE public.projects_master ADD COLUMN "contract_form" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='payment_terms_days') THEN
        ALTER TABLE public.projects_master ADD COLUMN "payment_terms_days" integer DEFAULT 30;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='vat_rate_percent') THEN
        ALTER TABLE public.projects_master ADD COLUMN "vat_rate_percent" numeric(5,2) DEFAULT 5.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='retention_percent') THEN
        ALTER TABLE public.projects_master ADD COLUMN "retention_percent" numeric(5,2) DEFAULT 10.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='performance_bond_percent') THEN
        ALTER TABLE public.projects_master ADD COLUMN "performance_bond_percent" numeric(5,2) DEFAULT 10.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='ld_applicable') THEN
        ALTER TABLE public.projects_master ADD COLUMN "ld_applicable" boolean DEFAULT false;
    END IF;

    -- 4. Risk & Personnel & Remarks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='delivery_risk_rating') THEN
        ALTER TABLE public.projects_master ADD COLUMN "delivery_risk_rating" text DEFAULT 'Nominal';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='project_director') THEN
        ALTER TABLE public.projects_master ADD COLUMN "project_director" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='commercial_manager') THEN
        ALTER TABLE public.projects_master ADD COLUMN "commercial_manager" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='hse_lead') THEN
        ALTER TABLE public.projects_master ADD COLUMN "hse_lead" text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='remarks') THEN
        ALTER TABLE public.projects_master ADD COLUMN "remarks" text;
    END IF;

END $$;

-- 4. Grant access to ensure the app can read/write these new columns
GRANT ALL ON public.projects_master TO authenticated;
GRANT ALL ON public.projects_master TO anon;
