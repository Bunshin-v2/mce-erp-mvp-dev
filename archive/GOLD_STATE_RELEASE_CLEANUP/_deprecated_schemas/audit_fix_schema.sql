-- AUDIT FIX: Database Schema Alignment
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create missing Tenders table
CREATE TABLE IF NOT EXISTS public.tenders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    client text NOT NULL,
    status text DEFAULT 'OPEN',
    value numeric(18,2) DEFAULT 0,
    probability text DEFAULT 'Medium',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Add missing COMPLETION_PERCENT to projects_master
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='COMPLETION_PERCENT') THEN
        ALTER TABLE public.projects_master ADD COLUMN COMPLETION_PERCENT numeric(5,2) DEFAULT 0;
    END IF;
END $$;

-- 3. Add missing UPDATED_AT to projects_master (used in stagnant logic)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects_master' AND column_name='updated_at') THEN
        ALTER TABLE public.projects_master ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- 4. Seed Tenders
INSERT INTO public.tenders (title, client, status, value, probability) VALUES
('New Hospital Extension', 'RAFED', 'ACTIVE', 12500000, 'High'),
('Luxury Villa Complex', 'ZAAD DEVELOPMENT', 'OPEN', 45000000, 'Medium'),
('Digital Infrastructure Upgrade', 'AD POLICE', 'SUBMITTED', 8200000, 'Low')
ON CONFLICT DO NOTHING;

-- 5. Update some projects with completion data for testing
UPDATE public.projects_master SET COMPLETION_PERCENT = 75 WHERE PROJECT_NAME = 'New Corniche Hospital';
UPDATE public.projects_master SET COMPLETION_PERCENT = 45 WHERE PROJECT_NAME = 'Abu Dhabi Stem Cell Research Lab & Hospital';

-- Enable RLS for Tenders
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read tenders" ON public.tenders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public insert tenders" ON public.tenders FOR INSERT TO authenticated WITH CHECK (true);
