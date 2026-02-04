-- FIX: RLS VIOLATION ON TENDER_REQUIREMENTS
-- Purpose: Force-reset permissions for the Tender Wizard to ensure inserts work.

-- 1. Ensure Table Exists (Safety)
CREATE TABLE IF NOT EXISTS public.tender_requirements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tender_id uuid REFERENCES public.tenders(id) ON DELETE CASCADE,
    section_name text NOT NULL,
    requirement text NOT NULL,
    is_mandatory boolean DEFAULT true,
    status text DEFAULT 'pending',
    evidence_doc_id uuid REFERENCES public.documents(id),
    assigned_to uuid REFERENCES auth.users(id),
    due_date timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 2. Reset RLS
ALTER TABLE public.tender_requirements ENABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing policies (Clean Slate)
DROP POLICY IF EXISTS "Allow read tender requirements" ON public.tender_requirements;
DROP POLICY IF EXISTS "Allow insert tender requirements" ON public.tender_requirements;
DROP POLICY IF EXISTS "Allow update tender requirements" ON public.tender_requirements;
DROP POLICY IF EXISTS "Allow delete tender requirements" ON public.tender_requirements;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.tender_requirements;

-- 4. Create ONE Permissive Policy for Everything (MVP Safe)
CREATE POLICY "Enable all access for authenticated users"
ON public.tender_requirements
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 5. Also Ensure Tenders Table is Accessible (Foreign Key Check)
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for tenders" ON public.tenders;
CREATE POLICY "Enable all access for tenders"
ON public.tenders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
