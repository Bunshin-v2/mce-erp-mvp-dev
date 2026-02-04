-- SEED DOCUMENTS TABLE
INSERT INTO public.documents (title, category, status, created_at, reviewed_at) VALUES
    ('MCE-2026-001: Foundation Design Approval', 'COMPLIANCE', 'Approved', now() - interval '15 days', now() - interval '10 days'),
    ('CONTRACT-VILLA-SPRINGS: Master Agreement', 'CONTRACT', 'Approved', now() - interval '25 days', now() - interval '18 days'),
    ('Safety Protocol - Site Access Requirements', 'SAFETY', 'Reviewed', now() - interval '8 days', now() - interval '5 days'),
    ('Invoice INV-2026-045: Equipment Rental', 'INVOICE', 'Review', now() - interval '2 days', null),
    ('Environmental Impact Assessment - Phase 2', 'COMPLIANCE', 'Review', now() - interval '1 day', null),
    ('Subcontractor Insurance Certificate - ABC Corp', 'COMPLIANCE', 'Approved', now() - interval '20 days', now() - interval '12 days'),
    ('Change Order 3: Scope Modification', 'CONTRACT', 'Reviewed', now() - interval '5 days', now() - interval '2 days'),
    ('Incident Report - Minor Site Damage', 'SAFETY', 'Approved', now() - interval '10 days', now() - interval '7 days'),
    ('Monthly Progress Report - December 2025', 'INVOICE', 'Approved', now() - interval '3 days', now() - interval '1 day'),
    ('Board Approval - Project Continuation', 'COMPLIANCE', 'Review', now() - interval '4 hours', null)
ON CONFLICT DO NOTHING;

-- CREATE & SEED INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number text NOT NULL UNIQUE,
    amount numeric(18, 2) NOT NULL,
    status text NOT NULL DEFAULT 'Pending',
    due_date timestamptz NOT NULL,
    project_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

INSERT INTO public.invoices (invoice_number, amount, status, due_date, created_at) VALUES
    ('INV-2026-001', 450000, 'Paid', now() - interval '30 days', now() - interval '40 days'),
    ('INV-2026-002', 675000, 'Paid', now() - interval '20 days', now() - interval '35 days'),
    ('INV-2026-003', 325000, 'Pending', now() + interval '5 days', now() - interval '10 days'),
    ('INV-2026-004', 890000, 'Pending', now() + interval '12 days', now() - interval '5 days'),
    ('INV-2026-005', 240000, 'Paid', now() - interval '5 days', now() - interval '25 days'),
    ('INV-2026-006', 1200000, 'Pending', now() + interval '20 days', now() - interval '2 days'),
    ('INV-2026-007', 385000, 'Overdue', now() - interval '3 days', now() - interval '35 days'),
    ('INV-2026-008', 550000, 'Paid', now() - interval '15 days', now() - interval '30 days'),
    ('INV-2026-009', 720000, 'Pending', now() + interval '8 days', now() - interval '7 days'),
    ('INV-2026-010', 480000, 'Paid', now() - interval '10 days', now() - interval '28 days')
ON CONFLICT DO NOTHING;

-- ENABLE RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
DROP POLICY IF EXISTS "Allow read documents" ON public.documents;
DROP POLICY IF EXISTS "Allow read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow insert documents" ON public.documents;
DROP POLICY IF EXISTS "Allow insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow update documents" ON public.documents;
DROP POLICY IF EXISTS "Allow update invoices" ON public.invoices;

CREATE POLICY "Allow read documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow read invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow insert documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update documents" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "Allow update invoices" ON public.invoices FOR UPDATE USING (true);
