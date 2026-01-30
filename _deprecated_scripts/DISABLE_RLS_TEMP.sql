-- TEMPORARY SOLUTION: Disable RLS for development
-- Use ONLY if policies won't work - re-enable before production

ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_master DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_activity DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('invoices', 'documents', 'projects_master', 'tenders', 'alerts', 'agent_activity', 'audit_logs')
ORDER BY tablename;
