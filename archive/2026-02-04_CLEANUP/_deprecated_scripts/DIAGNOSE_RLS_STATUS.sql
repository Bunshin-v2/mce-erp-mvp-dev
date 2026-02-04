-- DIAGNOSE_RLS_STATUS.sql
-- Run this in Supabase SQL Editor to definitively prove RLS status.

SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled 
FROM pg_tables 
WHERE tablename = 'projects_master';

SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    roles, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'projects_master';
