-- MODULE 4: TENDER CHECKLISTS & INTAKE
-- Purpose: Manage the Table of Contents (TOC) and Requirements for Tenders

-- 1. Templates (The "Master" Lists)
CREATE TABLE IF NOT EXISTS public.tender_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL, -- e.g., "Standard Construction Tender", "Design & Build"
    description text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tender_template_sections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid REFERENCES public.tender_templates(id) ON DELETE CASCADE,
    title text NOT NULL, -- e.g., "Volume 1: Commercial", "Volume 2: Technical"
    order_index integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.tender_template_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id uuid REFERENCES public.tender_template_sections(id) ON DELETE CASCADE,
    requirement text NOT NULL, -- e.g., "Trade License", "Performance Bond", "BoQ"
    is_mandatory boolean DEFAULT true,
    order_index integer DEFAULT 0
);

-- 2. Tender Instances (The Actual Checklist for a Tender)
CREATE TABLE IF NOT EXISTS public.tender_checklists (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tender_id uuid REFERENCES public.tenders(id) ON DELETE CASCADE,
    template_name text, -- Snapshot of which template was used
    status text DEFAULT 'draft', -- draft, active, completed
    progress integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tender_checklist_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    checklist_id uuid REFERENCES public.tender_checklists(id) ON DELETE CASCADE,
    section_title text,
    requirement text NOT NULL,
    status text DEFAULT 'pending', -- pending, uploaded, verified, waiver
    evidence_doc_id uuid REFERENCES public.documents(id), -- Link to uploaded file
    assigned_to uuid REFERENCES public.profiles(id),
    due_at timestamptz,
    verified_by uuid REFERENCES public.profiles(id),
    verified_at timestamptz
);

-- 3. Seed Data (Standard Templates)
INSERT INTO public.tender_templates (name, description) VALUES 
('Standard Construction Tender', 'Typical RFP requirements for UAE construction projects.')
ON CONFLICT DO NOTHING;

-- (We would run a script to seed the sections/items after creating the template)

-- 4. RLS Policies
ALTER TABLE public.tender_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View Checklists" ON public.tender_checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Edit Checklists" ON public.tender_checklists FOR ALL TO authenticated USING (true); -- Refine to L2+ later