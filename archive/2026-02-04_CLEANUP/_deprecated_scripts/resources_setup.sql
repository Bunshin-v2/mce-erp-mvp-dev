-- MODULE 5: RESOURCES & MANPOWER
-- Purpose: Track Staffing Demand, Vacancies, and Assignments per Project

-- 1. Standard Positions (The "Catalog" of Roles)
CREATE TABLE IF NOT EXISTS public.manpower_positions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL, -- e.g., "Senior Project Manager", "Site Engineer"
    discipline text, -- e.g., "Civil", "MEP", "Architecture"
    default_rate numeric, -- Standard hourly/monthly cost
    created_at timestamptz DEFAULT now()
);

-- 2. Demand / Requirements (What the Project NEEDS)
CREATE TABLE IF NOT EXISTS public.manpower_requirements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    position_id uuid REFERENCES public.manpower_positions(id),
    
    -- Timeline for this specific role on this project
    start_date date NOT NULL,
    end_date date,
    
    quantity integer DEFAULT 1, -- How many of this role?
    status text DEFAULT 'open', -- open, filled, on_hold
    
    created_at timestamptz DEFAULT now()
);

-- 3. Assignments (Who is actually DOING the work)
CREATE TABLE IF NOT EXISTS public.manpower_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    requirement_id uuid REFERENCES public.manpower_requirements(id) ON DELETE CASCADE,
    profile_id uuid REFERENCES public.profiles(id), -- The actual person
    
    assigned_at timestamptz DEFAULT now(),
    status text DEFAULT 'active' -- active, completed, terminated
);

-- 4. Seed Data (Standard Construction Roles)
INSERT INTO public.manpower_positions (title, discipline) VALUES
('Project Director', 'Management'),
('Construction Manager', 'Operations'),
('Senior Architect', 'Design'),
('QA/QC Engineer', 'Quality'),
('HSE Officer', 'Safety'),
('MEP Coordinator', 'MEP'),
('Planning Engineer', 'Controls')
ON CONFLICT DO NOTHING;

-- 5. RLS Policies
ALTER TABLE public.manpower_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manpower_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manpower_assignments ENABLE ROW LEVEL SECURITY;

-- Everyone can view positions
CREATE POLICY "View Positions" ON public.manpower_positions FOR SELECT TO authenticated USING (true);

-- L2+ (Managers) can manage requirements
CREATE POLICY "Manage Requirements" ON public.manpower_requirements 
FOR ALL TO authenticated 
USING (get_current_user_tier() >= 'L2');

-- L1 (Staff) can view their own assignments
CREATE POLICY "View Own Assignments" ON public.manpower_assignments 
FOR SELECT TO authenticated 
USING (profile_id = auth.uid() OR get_current_user_tier() >= 'L2');
