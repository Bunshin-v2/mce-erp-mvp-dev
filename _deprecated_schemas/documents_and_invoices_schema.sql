-- COMPLETE SCHEMA FOR DOCUMENTS & INVOICES TABLES
-- Required for DocumentsPage and FinancialsPage to function

-- 1. CREATE DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    category text NOT NULL DEFAULT 'CONTRACT', -- COMPLIANCE, CONTRACT, INVOICE, SAFETY
    status text NOT NULL DEFAULT 'Review', -- Review, Reviewed, Approved, Rejected
    storage_path text,
    version integer DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    reviewed_at timestamptz,
    type text, -- Legacy field for backward compatibility
    project_id uuid
);

-- 2. CREATE INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number text NOT NULL UNIQUE,
    amount numeric(18, 2) NOT NULL,
    status text NOT NULL DEFAULT 'Pending', -- Pending, Paid, Overdue
    due_date timestamptz NOT NULL,
    project_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. SEED TEST DATA - DOCUMENTS
INSERT INTO public.documents (title, category, status, created_at, reviewed_at, type) VALUES
    ('MCE-2026-001: Foundation Design Approval', 'COMPLIANCE', 'Approved', now() - interval '15 days', now() - interval '10 days', 'COMPLIANCE'),
    ('CONTRACT-VILLA-SPRINGS: Master Agreement', 'CONTRACT', 'Approved', now() - interval '25 days', now() - interval '18 days', 'CONTRACT'),
    ('Safety Protocol - Site Access Requirements', 'SAFETY', 'Reviewed', now() - interval '8 days', now() - interval '5 days', 'SAFETY'),
    ('Invoice INV-2026-045: Equipment Rental', 'INVOICE', 'Review', now() - interval '2 days', null, 'INVOICE'),
    ('Environmental Impact Assessment - Phase 2', 'COMPLIANCE', 'Review', now() - interval '1 day', null, 'COMPLIANCE'),
    ('Subcontractor Insurance Certificate - ABC Corp', 'COMPLIANCE', 'Approved', now() - interval '20 days', now() - interval '12 days', 'COMPLIANCE'),
    ('Change Order 3: Scope Modification', 'CONTRACT', 'Reviewed', now() - interval '5 days', now() - interval '2 days', 'CONTRACT'),
    ('Incident Report - Minor Site Damage', 'SAFETY', 'Approved', now() - interval '10 days', now() - interval '7 days', 'SAFETY'),
    ('Monthly Progress Report - December 2025', 'INVOICE', 'Approved', now() - interval '3 days', now() - interval '1 day', 'INVOICE'),
    ('Board Approval - Project Continuation', 'COMPLIANCE', 'Review', now() - interval '4 hours', null, 'COMPLIANCE')
ON CONFLICT DO NOTHING;

-- 4. SEED TEST DATA - INVOICES
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

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- 6. ENABLE RLS (Row Level Security)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES - DOCUMENTS (Allow all authenticated users to read)
CREATE POLICY "Allow read documents" ON public.documents
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert documents" ON public.documents
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update documents" ON public.documents
FOR UPDATE TO authenticated USING (true);

-- 8. RLS POLICIES - INVOICES (Allow all authenticated users to read)
CREATE POLICY "Allow read invoices" ON public.invoices
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert invoices" ON public.invoices
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update invoices" ON public.invoices
FOR UPDATE TO authenticated USING (true);
