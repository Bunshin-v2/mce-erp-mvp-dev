-- COMPREHENSIVE RLS FIX FOR INVOICES & DOCUMENTS
-- Drop and recreate all policies to ensure they work

-- ============ INVOICES TABLE ============
-- First, disable RLS temporarily to drop old policies
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on invoices
DROP POLICY IF EXISTS "public_read_invoices" ON public.invoices;
DROP POLICY IF EXISTS "public_write_invoices" ON public.invoices;
DROP POLICY IF EXISTS "public_update_invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow read invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow update invoices" ON public.invoices;

-- Re-enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create new policies with unrestricted access
CREATE POLICY "invoices_select" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "invoices_update" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "invoices_delete" ON public.invoices FOR DELETE USING (true);

-- ============ DOCUMENTS TABLE ============
-- First, disable RLS temporarily to drop old policies
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on documents
DROP POLICY IF EXISTS "Allow read documents" ON public.documents;
DROP POLICY IF EXISTS "Allow insert documents" ON public.documents;
DROP POLICY IF EXISTS "Allow update documents" ON public.documents;
DROP POLICY IF EXISTS "documents_read" ON public.documents;
DROP POLICY IF EXISTS "documents_write" ON public.documents;
DROP POLICY IF EXISTS "public_read_documents" ON public.documents;
DROP POLICY IF EXISTS "public_write_documents" ON public.documents;

-- Re-enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create new policies with unrestricted access
CREATE POLICY "documents_select" ON public.documents FOR SELECT USING (true);
CREATE POLICY "documents_insert" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "documents_update" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "documents_delete" ON public.documents FOR DELETE USING (true);

-- ============ VERIFICATION ============
-- Test that policies are working
SELECT 'INVOICES TABLE TEST' as test_type;
SELECT COUNT(*) as total_invoices FROM public.invoices;

SELECT 'DOCUMENTS TABLE TEST' as test_type;
SELECT COUNT(*) as total_documents FROM public.documents;

SELECT 'RLS POLICIES CHECK' as test_type;
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('invoices', 'documents')
ORDER BY tablename, policyname;
