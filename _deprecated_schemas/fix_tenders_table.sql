-- FIX: Create missing Tenders table
CREATE TABLE IF NOT EXISTS public.tenders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    client text NOT NULL,
    status text DEFAULT 'OPEN', -- OPEN, ACTIVE, SUBMITTED, AWARDED, LOST
    value numeric(18,2) DEFAULT 0,
    probability text DEFAULT 'Medium', -- High, Medium, Low
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;

-- Allow public read for demo
CREATE POLICY "Allow public read tenders" ON public.tenders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public insert tenders" ON public.tenders FOR INSERT TO authenticated WITH CHECK (true);

-- Seed Data
INSERT INTO public.tenders (title, client, status, value, probability) VALUES
('New Hospital Extension', 'RAFED', 'ACTIVE', 12500000, 'High'),
('Luxury Villa Complex', 'ZAAD DEVELOPMENT', 'OPEN', 45000000, 'Medium'),
('Digital Infrastructure Upgrade', 'AD POLICE', 'SUBMITTED', 8200000, 'Low')
ON CONFLICT DO NOTHING;
