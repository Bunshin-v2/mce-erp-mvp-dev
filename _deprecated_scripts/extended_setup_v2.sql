-- UPDATE SCHEMA: Add missing columns from Master Sheet
-- Ensuring 100% data parity with the source CSV

ALTER TABLE public.projects_master 
ADD COLUMN IF NOT EXISTS "CONTRACT_DURATION" text,
ADD COLUMN IF NOT EXISTS "REMARKS" text;
