-- Fix: Add missing timeline columns if they don't exist
-- Run this BEFORE populating timelines

-- Step 1: Add missing date columns
ALTER TABLE projects_master
ADD COLUMN IF NOT EXISTS PROJECT_COMPLETION_DATE_PLANNED timestamptz;

ALTER TABLE projects_master
ADD COLUMN IF NOT EXISTS PROJECT_COMPLETION_DATE_ACTUAL timestamptz;

ALTER TABLE projects_master
ADD COLUMN IF NOT EXISTS CONTRACT_SIGNED_DATE timestamptz;

ALTER TABLE projects_master
ADD COLUMN IF NOT EXISTS NOTICE_TO_PROCEED_DATE timestamptz;

ALTER TABLE projects_master
ADD COLUMN IF NOT EXISTS PROJECT_COMMENCEMENT_DATE timestamptz;

ALTER TABLE projects_master
ADD COLUMN IF NOT EXISTS COMPLETION_PERCENT numeric(5,2) DEFAULT 0;

-- Step 2: Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects_master'
AND column_name IN ('PROJECT_COMPLETION_DATE_PLANNED', 'CONTRACT_SIGNED_DATE', 'NOTICE_TO_PROCEED_DATE', 'PROJECT_COMMENCEMENT_DATE', 'COMPLETION_PERCENT')
ORDER BY ordinal_position;
