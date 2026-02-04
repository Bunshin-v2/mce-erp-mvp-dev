ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS type text;

INSERT INTO public.documents (title, category, status, created_at)
VALUES
('MCE-2026-001: Foundation Design Approval', 'COMPLIANCE', 'Approved', now() - interval '15 days'),
('CONTRACT-VILLA-SPRINGS: Master Agreement', 'CONTRACT', 'Approved', now() - interval '25 days'),
('Safety Protocol - Site Access Requirements', 'SAFETY', 'Reviewed', now() - interval '8 days'),
('Invoice INV-2026-045: Equipment Rental', 'INVOICE', 'Review', now() - interval '2 days'),
('Environmental Impact Assessment - Phase 2', 'COMPLIANCE', 'Review', now() - interval '1 day'),
('Subcontractor Insurance Certificate - ABC Corp', 'COMPLIANCE', 'Approved', now() - interval '20 days'),
('Change Order 3: Scope Modification', 'CONTRACT', 'Reviewed', now() - interval '5 days'),
('Incident Report - Minor Site Damage', 'SAFETY', 'Approved', now() - interval '10 days'),
('Monthly Progress Report - December 2025', 'INVOICE', 'Approved', now() - interval '3 days'),
('Board Approval - Project Continuation', 'COMPLIANCE', 'Review', now() - interval '4 hours')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number text NOT NULL UNIQUE,
    amount numeric(18, 2) NOT NULL,
    status text NOT NULL DEFAULT 'Pending',
    due_date timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

INSERT INTO public.invoices (invoice_number, amount, status, due_date)
VALUES
('INV-2026-001', 450000, 'Paid', now() - interval '30 days'),
('INV-2026-002', 675000, 'Paid', now() - interval '20 days'),
('INV-2026-003', 325000, 'Pending', now() + interval '5 days'),
('INV-2026-004', 890000, 'Pending', now() + interval '12 days'),
('INV-2026-005', 240000, 'Paid', now() - interval '5 days'),
('INV-2026-006', 1200000, 'Pending', now() + interval '20 days'),
('INV-2026-007', 385000, 'Overdue', now() - interval '3 days'),
('INV-2026-008', 550000, 'Paid', now() - interval '15 days'),
('INV-2026-009', 720000, 'Pending', now() + interval '8 days'),
('INV-2026-010', 480000, 'Paid', now() - interval '10 days')
ON CONFLICT (invoice_number) DO NOTHING;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public_read_documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_write_documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "public_read_invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "public_write_invoices" ON public.invoices FOR INSERT WITH CHECK (true);
