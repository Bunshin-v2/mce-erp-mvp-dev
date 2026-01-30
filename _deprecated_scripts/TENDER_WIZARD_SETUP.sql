-- TENDER INTAKE WIZARD & CHECKLIST SCHEMA
-- Purpose: Enable 'Idempotent' checklist generation and evidence tracking.

-- 1. Create Tender Requirements Table
CREATE TABLE IF NOT EXISTS public.tender_requirements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tender_id uuid REFERENCES public.tenders(id) ON DELETE CASCADE,
    section_name text NOT NULL, -- e.g. "Volume 1: Commercial"
    requirement text NOT NULL, -- e.g. "Trade License"
    is_mandatory boolean DEFAULT true,
    status text DEFAULT 'pending', -- pending, in_progress, completed, blocked
    evidence_doc_id uuid REFERENCES public.documents(id), -- Link to uploaded evidence
    assigned_to uuid REFERENCES auth.users(id),
    due_date timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 2. RLS Policies
ALTER TABLE public.tender_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read tender requirements" ON public.tender_requirements
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert tender requirements" ON public.tender_requirements
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update tender requirements" ON public.tender_requirements
    FOR UPDATE TO authenticated USING (true);

-- 3. Idempotency Function
-- This function generates the checklist ONLY if it doesn't exist.
CREATE OR REPLACE FUNCTION generate_tender_checklist(
    target_tender_id uuid,
    template_type text -- 'RFP' or 'DESIGN_BUILD'
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    -- Idempotency Check: If requirements exist, do nothing.
    IF EXISTS (SELECT 1 FROM public.tender_requirements WHERE tender_id = target_tender_id) THEN
        RETURN;
    END IF;

    -- Insert Standard RFP Template
    IF template_type = 'RFP' THEN
        INSERT INTO public.tender_requirements (tender_id, section_name, requirement, is_mandatory)
        VALUES 
            (target_tender_id, 'Volume 1: Commercial', 'Form of Tender', true),
            (target_tender_id, 'Volume 1: Commercial', 'Trade License Copy', true),
            (target_tender_id, 'Volume 1: Commercial', 'Tender Bond', true),
            (target_tender_id, 'Volume 1: Commercial', 'Pricing Schedule', true),
            (target_tender_id, 'Volume 2: Technical', 'Method Statement', true),
            (target_tender_id, 'Volume 2: Technical', 'HSE Plan', true),
            (target_tender_id, 'Volume 2: Technical', 'Project Schedule', true),
            (target_tender_id, 'Volume 2: Technical', 'Resources Histogram', false);
    END IF;

    -- Insert Design & Build Template
    IF template_type = 'DESIGN_BUILD' THEN
        INSERT INTO public.tender_requirements (tender_id, section_name, requirement, is_mandatory)
        VALUES 
            (target_tender_id, 'Design', 'Concept Drawings', true),
            (target_tender_id, 'Design', 'BIM Execution Plan', true),
            (target_tender_id, 'Commercial', 'Lump Sum Breakdown', true),
            (target_tender_id, 'Legal', 'JV Agreement', false);
    END IF;
END;
$$;
