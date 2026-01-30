-- Diagnostic: Find the actual column name for status in projects_master
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects_master' 
AND column_name ILIKE '%status%';
