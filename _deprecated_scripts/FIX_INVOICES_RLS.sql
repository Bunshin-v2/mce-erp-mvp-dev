-- FIX: Add RLS Policies to Invoices Table
-- Note: Postgres (and Supabase) does NOT support `CREATE POLICY IF NOT EXISTS`.
-- We drop policies if present, then recreate them.

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe if missing)
DROP POLICY IF EXISTS public_read_invoices ON public.invoices;
DROP POLICY IF EXISTS public_write_invoices ON public.invoices;
DROP POLICY IF EXISTS public_update_invoices ON public.invoices;

-- TEMPORARY OPEN POLICIES (for rendering verification)
CREATE POLICY public_read_invoices
  ON public.invoices
  FOR SELECT
  USING (true);

CREATE POLICY public_write_invoices
  ON public.invoices
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY public_update_invoices
  ON public.invoices
  FOR UPDATE
  USING (true);

-- Verify the data is in the table
SELECT COUNT(*) as invoice_count FROM public.invoices;
