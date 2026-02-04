-- LIABILITY & DLP TRACKING MODULE

-- 1. Liability Periods (DLP)
CREATE TABLE IF NOT EXISTS public.liabilities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects_master(id) ON DELETE CASCADE,
    type text CHECK (type IN ('DLP', 'Warranty', 'Retention')),
    start_date date,
    end_date date,
    status text DEFAULT 'Active', -- Active, Expired, Released
    value_amount numeric,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- 2. Insurance Policies
CREATE TABLE IF NOT EXISTS public.insurance_policies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    provider text NOT NULL,
    policy_number text,
    type text, -- PI, PL, CAR
    coverage_amount numeric,
    expiry_date date,
    status text DEFAULT 'Active',
    created_at timestamptz DEFAULT now()
);

-- 3. Risk Register
CREATE TABLE IF NOT EXISTS public.risk_register (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects_master(id),
    description text NOT NULL,
    impact text CHECK (impact IN ('Low', 'Medium', 'High', 'Critical')),
    probability text CHECK (probability IN ('Low', 'Medium', 'High')),
    mitigation_plan text,
    status text DEFAULT 'Open',
    created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_register ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read Liabilities" ON public.liabilities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read Insurance" ON public.insurance_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read Risks" ON public.risk_register FOR SELECT TO authenticated USING (true);
