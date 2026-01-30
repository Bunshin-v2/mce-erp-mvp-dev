-- Populate Project Timelines for All Projects
-- This script fills in all date fields for existing projects to enable countdown displays

UPDATE projects_master
SET
  -- Contract phase: 9-12 months ago
  CONTRACT_SIGNED_DATE = CASE
    WHEN id IS NOT NULL THEN now() - (interval '1 day' * (floor(random() * 180 + 270)))
    ELSE NULL
  END,
  -- Notice to Proceed: 2-4 weeks after contract signing
  NOTICE_TO_PROCEED_DATE = CASE
    WHEN id IS NOT NULL THEN (now() - (interval '1 day' * (floor(random() * 180 + 270)))) + (interval '1 day' * (floor(random() * 14 + 14)))
    ELSE NULL
  END,
  -- Project commencement: 3-7 days after NTP
  PROJECT_COMMENCEMENT_DATE = CASE
    WHEN id IS NOT NULL THEN (now() - (interval '1 day' * (floor(random() * 180 + 270)))) + (interval '1 day' * (floor(random() * 14 + 14))) + (interval '1 day' * (floor(random() * 4 + 3)))
    ELSE NULL
  END
WHERE PROJECT_COMPLETION_DATE_PLANNED IS NULL;

-- Update completion dates based on project status
UPDATE projects_master
SET PROJECT_COMPLETION_DATE_PLANNED =
  CASE
    -- Completed projects: dates in the past
    WHEN PROJECT_STATUS = 'Completed' THEN PROJECT_COMMENCEMENT_DATE + (interval '1 day' * (floor(random() * 180 + 300)))
    WHEN PROJECT_STATUS = 'DLP Period' THEN PROJECT_COMMENCEMENT_DATE + (interval '1 day' * (floor(random() * 180 + 300)))

    -- Active/Ongoing projects: dates in the future (3-24 months from now)
    WHEN PROJECT_STATUS IN ('Active', 'Construction Ongoing', 'Construction', 'Ongoing') THEN
      now() + (interval '1 day' * (floor(random() * 700 + 90)))

    -- Pre-award/Tender stage: sooner (60-180 days from now)
    WHEN PROJECT_STATUS IN ('Pre-Award / Tender Stage', 'Pre-Award', 'Tender Stage', 'Tender Documents', 'Tender Stage', 'Client Review', 'Awaiting Building Permit') THEN
      now() + (interval '1 day' * (floor(random() * 120 + 60)))

    -- Design stages: medium term (90-270 days)
    WHEN PROJECT_STATUS IN ('Schematic Stage (Design)', 'Concept Stage (Design)', 'Construction Ongoing') THEN
      now() + (interval '1 day' * (floor(random() * 180 + 90)))

    -- Default: 200 days from now
    ELSE now() + (interval '1 day' * 200)
  END
WHERE PROJECT_COMPLETION_DATE_PLANNED IS NULL;

-- For projects that are completed, set actual completion date close to planned
UPDATE projects_master
SET PROJECT_COMPLETION_DATE_ACTUAL = PROJECT_COMPLETION_DATE_PLANNED + (interval '1 day' * (floor(random() * 14)))
WHERE PROJECT_STATUS IN ('Completed', 'DLP Period')
AND PROJECT_COMPLETION_DATE_ACTUAL IS NULL;

-- Add COMPLETION_PERCENT column if needed (for dashboard display)
ALTER TABLE projects_master ADD COLUMN IF NOT EXISTS COMPLETION_PERCENT numeric(5,2) DEFAULT 0;

-- Update completion percentage
UPDATE projects_master
SET COMPLETION_PERCENT = CASE
  WHEN PROJECT_STATUS = 'Completed' THEN 100
  WHEN PROJECT_STATUS = 'DLP Period' THEN 100
  WHEN PROJECT_STATUS = 'Construction Ongoing' OR PROJECT_STATUS = 'Ongoing' THEN floor(random() * 40 + 50)
  WHEN PROJECT_STATUS IN ('Active', 'Construction') THEN floor(random() * 30 + 40)
  WHEN PROJECT_STATUS IN ('Schematic Stage (Design)', 'Concept Stage (Design)') THEN floor(random() * 20 + 15)
  ELSE floor(random() * 15 + 5)
END
WHERE COMPLETION_PERCENT = 0;

-- Verify the updates
SELECT
  PROJECT_NAME,
  PROJECT_STATUS,
  CONTRACT_SIGNED_DATE,
  NOTICE_TO_PROCEED_DATE,
  PROJECT_COMMENCEMENT_DATE,
  PROJECT_COMPLETION_DATE_PLANNED,
  COMPLETION_PERCENT,
  (PROJECT_COMPLETION_DATE_PLANNED - now())::text as "DAYS_REMAINING"
FROM projects_master
WHERE PROJECT_COMPLETION_DATE_PLANNED IS NOT NULL
ORDER BY PROJECT_COMPLETION_DATE_PLANNED;
