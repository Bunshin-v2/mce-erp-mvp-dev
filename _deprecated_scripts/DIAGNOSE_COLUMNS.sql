-- Diagnostic: Check what columns actually exist in projects_master table

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'projects_master'
ORDER BY ordinal_position;
