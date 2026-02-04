-- MODULE: EXTERNAL MESH / INTEGRATIONS
-- Purpose: Track status and logs of external system bridges (QuickBooks, SharePoint, etc.)

CREATE TABLE IF NOT EXISTS public.integrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE, -- e.g., 'QuickBooks Enterprise'
    category text NOT NULL, -- e.g., 'Financials'
    status text DEFAULT 'Connected', -- Connected, Syncing, Config Required, Error
    uptime text DEFAULT '100%',
    last_sync_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.integration_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE,
    event_title text NOT NULL,
    items_processed integer DEFAULT 0,
    status text DEFAULT 'Success',
    timestamp timestamptz DEFAULT now()
);

-- Seed Initial Integration Mesh
INSERT INTO public.integrations (name, category, status, uptime) VALUES
('QuickBooks Enterprise', 'Financials', 'Connected', '99.9%'),
('SharePoint Online', 'Documents', 'Syncing', '100%'),
('Oracle Primavera', 'Project Control', 'Config Required', 'N/A'),
('Clerk Auth', 'Security', 'Connected', '100%')
ON CONFLICT (name) DO NOTHING;

-- RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View Integrations" ON public.integrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "View Integration Logs" ON public.integration_logs FOR SELECT TO authenticated USING (true);
