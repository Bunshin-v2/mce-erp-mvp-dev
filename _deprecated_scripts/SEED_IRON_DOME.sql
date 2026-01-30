-- IRON DOME: SEED DATA
-- Purpose: Populate Purchase Orders to enable Financial Breach Detection.

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects_master(id), -- Changed to projects_master to match your schema
    po_number text NOT NULL UNIQUE,
    vendor_name text NOT NULL,
    total_amount numeric NOT NULL,
    remaining_balance numeric NOT NULL,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

-- 2. Insert Dummy POs linked to existing Projects (if possible, otherwise unlinked)
-- We use a DO block to find a valid project ID
DO $$
DECLARE
    target_project_id uuid;
BEGIN
    SELECT id INTO target_project_id FROM public.projects_master LIMIT 1;

    IF target_project_id IS NOT NULL THEN
        -- Case 1: Healthy PO
        INSERT INTO public.purchase_orders (project_id, po_number, vendor_name, total_amount, remaining_balance, status)
        VALUES (target_project_id, 'PO-2026-001', 'Al Futtaim Engineering', 5000000, 2500000, 'active')
        ON CONFLICT (po_number) DO NOTHING;

        -- Case 2: BREACHED PO (Iron Dome Trigger)
        INSERT INTO public.purchase_orders (project_id, po_number, vendor_name, total_amount, remaining_balance, status)
        VALUES (target_project_id, 'PO-2026-009', 'Global Steel Co', 1200000, -50000, 'exhausted')
        ON CONFLICT (po_number) DO NOTHING;
        
        -- Case 3: Critical Low Balance
        INSERT INTO public.purchase_orders (project_id, po_number, vendor_name, total_amount, remaining_balance, status)
        VALUES (target_project_id, 'PO-2026-012', 'Speed Readymix', 850000, 5000, 'active')
        ON CONFLICT (po_number) DO NOTHING;
    END IF;
END $$;
