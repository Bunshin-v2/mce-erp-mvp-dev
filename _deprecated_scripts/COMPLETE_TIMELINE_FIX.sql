-- COMPLETE TIMELINE & DATA FIX
-- This script ensures all columns exist and populates them with realistic data

-- 1. Ensure all columns exist
ALTER TABLE projects_master ADD COLUMN IF NOT EXISTS PROJECT_COMPLETION_DATE_PLANNED timestamptz;
ALTER TABLE projects_master ADD COLUMN IF NOT EXISTS PROJECT_COMPLETION_DATE_ACTUAL timestamptz;
ALTER TABLE projects_master ADD COLUMN IF NOT EXISTS CONTRACT_SIGNED_DATE timestamptz;
ALTER TABLE projects_master ADD COLUMN IF NOT EXISTS NOTICE_TO_PROCEED_DATE timestamptz;
ALTER TABLE projects_master ADD COLUMN IF NOT EXISTS PROJECT_COMMENCEMENT_DATE timestamptz;
ALTER TABLE projects_master ADD COLUMN IF NOT EXISTS COMPLETION_PERCENT numeric(5,2) DEFAULT 0;
ALTER TABLE projects_master ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Populate basic timeline dates for all projects
UPDATE projects_master
SET
  CONTRACT_SIGNED_DATE = now() - (interval '1 day' * (floor(random() * 180 + 270))),
  NOTICE_TO_PROCEED_DATE = now() - (interval '1 day' * (floor(random() * 180 + 200))),
  PROJECT_COMMENCEMENT_DATE = now() - (interval '1 day' * (floor(random() * 180 + 190)))
WHERE CONTRACT_SIGNED_DATE IS NULL;

-- 3. Set Completion Dates based on Status
UPDATE projects_master
SET PROJECT_COMPLETION_DATE_PLANNED =
  CASE
    WHEN PROJECT_STATUS IN ('Completed', 'DLP Period') THEN now() - (interval '1 day' * (floor(random() * 60 + 30)))
    WHEN PROJECT_STATUS IN ('Active', 'Construction Ongoing', 'Construction', 'Ongoing') THEN now() + (interval '1 day' * (floor(random() * 400 + 30)))
    WHEN PROJECT_STATUS LIKE '%Tender%' OR PROJECT_STATUS LIKE '%Award%' THEN now() + (interval '1 day' * (floor(random() * 90 + 30)))
    ELSE now() + (interval '1 day' * 180)
  END
WHERE PROJECT_COMPLETION_DATE_PLANNED IS NULL;

-- 4. Update Completion Percent if 0
UPDATE projects_master
SET COMPLETION_PERCENT =
  CASE
    WHEN PROJECT_STATUS IN ('Completed', 'DLP Period') THEN 100
    WHEN PROJECT_STATUS IN ('Active', 'Construction Ongoing', 'Construction', 'Ongoing') THEN floor(random() * 40 + 50)
    ELSE floor(random() * 20 + 5)
  END
WHERE COMPLETION_PERCENT = 0 OR COMPLETION_PERCENT IS NULL;

-- 5. Verification
SELECT PROJECT_NAME, PROJECT_STATUS, PROJECT_COMPLETION_DATE_PLANNED, COMPLETION_PERCENT
FROM projects_master
LIMIT 10;
