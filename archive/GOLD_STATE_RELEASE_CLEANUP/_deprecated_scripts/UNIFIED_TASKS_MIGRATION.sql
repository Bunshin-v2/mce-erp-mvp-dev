-- UNIFIED TASKS MIGRATION (TodoTracker Logic)
-- Purpose: Consolidate all task-like entities into a single source of truth.

-- 1. Upgrade 'tasks' table to handle Tender Requirements and Project Tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS tender_id uuid REFERENCES public.tenders(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects_master(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS section_name text, -- For "Volume 1", "Technical", etc.
ADD COLUMN IF NOT EXISTS is_mandatory boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS evidence_doc_id uuid REFERENCES public.documents(id);

-- 2. Migrate existing Tender Requirements to the Unified Tasks Table
-- (Only if the table exists)
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tender_requirements') THEN
        INSERT INTO public.tasks (title, tender_id, section_name, is_mandatory, status, created_at)
        SELECT requirement, tender_id, section_name, is_mandatory, status, created_at 
        FROM public.tender_requirements;
        
        -- Drop the redundant table
        DROP TABLE public.tender_requirements CASCADE;
    END IF;
END $$;

-- 3. Update the Tender Wizard to use the Unified Tasks Table
CREATE OR REPLACE FUNCTION generate_tender_checklist(
    target_tender_id uuid,
    template_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Idempotency Check
    IF EXISTS (SELECT 1 FROM public.tasks WHERE tender_id = target_tender_id) THEN
        RETURN;
    END IF;

    -- Insert Standard RFP Template into Unified Tasks
    IF template_type = 'RFP' THEN
        INSERT INTO public.tasks (tender_id, section_name, title, is_mandatory, status, priority)
        VALUES 
            (target_tender_id, 'Volume 1: Commercial', 'Form of Tender', true, 'pending', 'high'),
            (target_tender_id, 'Volume 1: Commercial', 'Trade License Copy', true, 'pending', 'medium'),
            (target_tender_id, 'Volume 1: Commercial', 'Tender Bond', true, 'pending', 'high'),
            (target_tender_id, 'Volume 1: Commercial', 'Pricing Schedule', true, 'pending', 'high'),
            (target_tender_id, 'Volume 2: Technical', 'Method Statement', true, 'pending', 'medium'),
            (target_tender_id, 'Volume 2: Technical', 'HSE Plan', true, 'pending', 'medium'),
            (target_tender_id, 'Volume 2: Technical', 'Project Schedule', true, 'pending', 'high'),
            (target_tender_id, 'Volume 2: Technical', 'Resources Histogram', false, 'pending', 'low');
    END IF;

    -- Insert Design & Build Template into Unified Tasks
    IF template_type = 'DESIGN_BUILD' THEN
        INSERT INTO public.tasks (tender_id, section_name, title, is_mandatory, status, priority)
        VALUES 
            (target_tender_id, 'Design', 'Concept Drawings', true, 'pending', 'high'),
            (target_tender_id, 'Design', 'BIM Execution Plan', true, 'pending', 'high'),
            (target_tender_id, 'Commercial', 'Lump Sum Breakdown', true, 'pending', 'high'),
            (target_tender_id, 'Legal', 'JV Agreement', false, 'pending', 'medium');
    END IF;
END;
$$;

-- 4. Update the Reset Function
CREATE OR REPLACE FUNCTION reset_tender_checklist(target_tender_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.tasks WHERE tender_id = target_tender_id;
END;
$$;
