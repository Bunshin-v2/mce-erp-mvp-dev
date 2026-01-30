# CORRECTION PROMPT FOR GEMINI AI

**Context:** Your 24-hour sprint produced valuable work, but included 40% redundant/duplicate code. This prompt will guide you to clean up the migrations while preserving the genuinely new features.

---

## 🎯 TASK: Remove Duplicates, Keep New Features

Your sprint deliverables are in these files:
1. `supabase/migrations/20260128_hour_0_4_rbac_alarm_setup.sql`
2. `supabase/migrations/20260128_hour_5_10_automation_logic.sql`
3. `supabase/migrations/20260128_hour_16_19_tender_workflow.sql`
4. `supabase/migrations/20260128_hour_19_21_document_management.sql`

**Problem:** Some sections duplicate code that already exists in `supabase/00_consolidated_schema_clean.sql` (the production schema). Running duplicate code is harmless but wasteful.

**Goal:** Edit the migration files to remove ONLY the duplicate sections, keeping all genuinely new work.

---

## ✅ WHAT TO KEEP (60% - Genuinely New Work)

### Keep #1: Alarm Engine Tables (Migration 1)
**File:** `20260128_hour_0_4_rbac_alarm_setup.sql` (lines 40-79)

```sql
-- KEEP THIS SECTION - These tables are NEW
CREATE TABLE IF NOT EXISTS alarm_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  entity_type text NOT NULL,
  condition_field text NOT NULL,
  condition_operator text NOT NULL,
  condition_value text NOT NULL,
  base_severity text NOT NULL,
  ack_required boolean DEFAULT true,
  channels text[] DEFAULT ARRAY['in_app'],
  is_active boolean DEFAULT true,
  timing_sequence text[] DEFAULT ARRAY['T-14', 'T-7', 'T-3', 'T-1', 'T-0'],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  sound_enabled boolean DEFAULT true,
  sound_volume integer DEFAULT 75,
  email_enabled boolean DEFAULT true,
  email_frequency text DEFAULT 'immediate_critical',
  quiet_hours_enabled boolean DEFAULT false,
  quiet_hours_start time DEFAULT '22:00',
  quiet_hours_end time DEFAULT '07:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_snoozes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  snoozed_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Why Keep:** These tables were stuck in `_deprecated_schemas/` and never migrated. This is critical new work.

---

### Keep #2: Automation Procedures (Migration 2)
**File:** `20260128_hour_5_10_automation_logic.sql` (entire file)

```sql
-- KEEP ENTIRE FILE - These procedures are NEW
CREATE OR REPLACE FUNCTION sweep_alarm_rules() ...
CREATE OR REPLACE FUNCTION process_escalations() ...
```

**Why Keep:** Brand new automation logic. High value feature.

---

### Keep #3: Tender Comms Log (Migration 3)
**File:** `20260128_hour_16_19_tender_workflow.sql` (entire file)

```sql
-- KEEP ENTIRE FILE - This table and field are NEW
ALTER TABLE tenders ADD COLUMN IF NOT EXISTS next_followup_at timestamptz;

CREATE TABLE IF NOT EXISTS tender_comms_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  notes text,
  event_at timestamptz NOT NULL DEFAULT now(),
  logged_by_user_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Why Keep:** New feature for tender workflow tracking.

---

### Keep #4: Enhanced RLS Policies (Migration 1)
**File:** `20260128_hour_0_4_rbac_alarm_setup.sql` (lines 97-167)

```sql
-- KEEP THIS SECTION - These are IMPROVEMENTS to existing policies
DROP POLICY IF EXISTS "Allow public all" ON projects_master;
CREATE POLICY "Everyone can read projects" ON projects_master FOR SELECT USING (true);
CREATE POLICY "L3+ can edit projects" ON projects_master FOR ALL
    USING (get_user_tier() IN ('L3', 'L4'))
    WITH CHECK (get_user_tier() IN ('L3', 'L4'));

-- ... (all the other policy updates)
```

**Why Keep:** Security improvements - replaces permissive policies with tier-based access.

---

### Keep #5: Health Dashboard Files
**Files:**
- `app/api/health/route.ts` (enhanced version)
- `app/admin/health/page.tsx` (new file)

**Why Keep:** New observability feature.

---

## ❌ WHAT TO REMOVE (40% - Duplicates)

### Remove #1: RBAC Helper Functions (Migration 1)
**File:** `20260128_hour_0_4_rbac_alarm_setup.sql` (lines 8-28)

```sql
-- DELETE THIS SECTION - Already exists in production schema
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::json->>'user_role',
    current_setting('request.jwt.claims', true)::json->>'https://clerk.com/user_role',
    'staff'
  );
$$;

CREATE OR REPLACE FUNCTION get_user_id()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id'
  );
$$;

CREATE OR REPLACE FUNCTION get_user_tier()
RETURNS permission_tier
LANGUAGE sql STABLE
AS $$
  SELECT tier FROM profiles WHERE clerk_user_id = get_user_id() LIMIT 1;
$$;
```

**Why Remove:** These functions ALREADY exist in `supabase/00_consolidated_schema_clean.sql` (lines 50-78). They're identical - no need to recreate.

**Verification:**
```bash
# Check if they exist in production schema:
grep -n "get_user_role\|get_user_id\|get_user_tier" supabase/00_consolidated_schema_clean.sql
# Should return matches at lines 50, 61, 73
```

---

### Remove #2: Document Version Fields (Migration 4)
**File:** `20260128_hour_19_21_document_management.sql`

```sql
-- DELETE THIS SECTION - Fields already exist
ALTER TABLE documents ADD COLUMN IF NOT EXISTS version_number integer DEFAULT 1;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS parent_document_id uuid REFERENCES documents(id) ON DELETE SET NULL;
```

**Why Remove:** These fields ALREADY exist in production schema (line 290-291). The `ALTER TABLE ADD COLUMN IF NOT EXISTS` will silently skip, but it's wasteful to include.

**Verification:**
```bash
# Check if they exist in production schema:
grep -n "version_number\|parent_document_id" supabase/00_consolidated_schema_clean.sql
# Should return matches at lines 290-291
```

---

### Remove #3: Sensitivity Level Field (Migration 1)
**File:** `20260128_hour_0_4_rbac_alarm_setup.sql` (line 115)

```sql
-- DELETE THIS LINE - Field already exists
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sensitivity_level permission_tier DEFAULT 'L1';
```

**Why Remove:** This field ALREADY exists in production schema (line 294). Harmless but redundant.

**Verification:**
```bash
# Check if it exists:
grep -n "sensitivity_level" supabase/00_consolidated_schema_clean.sql
# Should return match at line 294
```

---

## 🛠️ STEP-BY-STEP CORRECTION INSTRUCTIONS

### Step 1: Edit Migration File #1
**File:** `supabase/migrations/20260128_hour_0_4_rbac_alarm_setup.sql`

**Actions:**
1. ✅ **KEEP:** Lines 1-7 (header comments)
2. ❌ **DELETE:** Lines 8-28 (RBAC helper functions - duplicates)
3. ✅ **KEEP:** Lines 29-79 (alarm engine tables - NEW)
4. ✅ **KEEP:** Lines 80-167 (RLS policies - improvements)
5. ❌ **DELETE:** Line 115 only (`ALTER TABLE documents ADD COLUMN IF NOT EXISTS sensitivity_level`)
6. ✅ **KEEP:** Lines 168-178 (realtime subscriptions)

**Expected Result:** File goes from ~178 lines → ~140 lines

---

### Step 2: Keep Migration File #2 (No Changes)
**File:** `supabase/migrations/20260128_hour_5_10_automation_logic.sql`

**Actions:**
- ✅ **KEEP ENTIRE FILE** - All content is new and valuable

**Reason:** Automation procedures are genuinely new work

---

### Step 3: Keep Migration File #3 (No Changes)
**File:** `supabase/migrations/20260128_hour_16_19_tender_workflow.sql`

**Actions:**
- ✅ **KEEP ENTIRE FILE** - All content is new and valuable

**Reason:** Tender comms log is genuinely new work

---

### Step 4: Delete Migration File #4 (Entirely Redundant)
**File:** `supabase/migrations/20260128_hour_19_21_document_management.sql`

**Actions:**
- ❌ **DELETE ENTIRE FILE** - All content is duplicate

**Reason:**
- `version_number` already exists (line 290 in production)
- `parent_document_id` already exists (line 291 in production)
- No new work in this file

**Alternative:** If you want to keep the file for documentation, replace contents with:
```sql
-- MCE SPRINT - HOUR 19-21: DOCUMENT MANAGEMENT
-- ============================================================================
-- NOTE: Document versioning fields (version_number, parent_document_id)
-- already exist in production schema (00_consolidated_schema_clean.sql lines 290-291).
-- No migration needed.
```

---

### Step 5: Verify Health Dashboard Files (No Changes)
**Files:**
- `app/api/health/route.ts`
- `app/admin/health/page.tsx`

**Actions:**
- ✅ **KEEP BOTH FILES** - These are new features

**Note:** There's a minor bug in `app/admin/health/page.tsx`:
- Line 183 has `import { RefreshCw } from 'lucide-react';` at the bottom
- Should be moved to top with other imports (line 4)

---

## 📋 VERIFICATION CHECKLIST

After making corrections, verify:

- [ ] **Migration 1:** RBAC functions removed (lines 8-28 deleted)
- [ ] **Migration 1:** `sensitivity_level` line removed (line 115 deleted)
- [ ] **Migration 1:** Alarm tables still present (lines 40-79 intact)
- [ ] **Migration 1:** RLS policies still present (lines 97-167 intact)
- [ ] **Migration 2:** Entire file unchanged (automation procedures)
- [ ] **Migration 3:** Entire file unchanged (tender comms)
- [ ] **Migration 4:** Entire file deleted OR replaced with comment-only version
- [ ] **Health API:** `app/api/health/route.ts` unchanged
- [ ] **Health Page:** `app/admin/health/page.tsx` - move import to top

---

## 🎯 EXPECTED FINAL STATE

**After Corrections:**

**Migration File 1:** `20260128_hour_0_4_rbac_alarm_setup.sql`
```sql
-- MCE SPRINT - HOUR 0-4: RBAC & ALARM ENGINE SETUP
-- ============================================================================

-- 1. ALARM ENGINE TABLES
-- ----------------------------------------------------------------------------

-- Update existing alerts table if needed
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS rule_id uuid REFERENCES alarm_rules(id) ON DELETE SET NULL;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS related_entity_type text;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS related_entity_id uuid;

-- Alarm Rules (System automation triggers)
CREATE TABLE IF NOT EXISTS alarm_rules (
  ... [KEEP FULL DEFINITION]
);

-- User Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  ... [KEEP FULL DEFINITION]
);

-- Snooze Records
CREATE TABLE IF NOT EXISTS notification_snoozes (
  ... [KEEP FULL DEFINITION]
);


-- 2. ROW-LEVEL SECURITY
-- ----------------------------------------------------------------------------

ALTER TABLE alarm_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_snoozes ENABLE ROW LEVEL SECURITY;

-- 1. Projects Master Policies
DROP POLICY IF EXISTS "Allow public all" ON projects_master;
CREATE POLICY "Everyone can read projects" ON projects_master FOR SELECT USING (true);
CREATE POLICY "L3+ can edit projects" ON projects_master FOR ALL
    USING (get_user_tier() IN ('L3', 'L4'))
    WITH CHECK (get_user_tier() IN ('L3', 'L4'));

-- [KEEP ALL OTHER POLICY UPDATES]

-- 3. REALTIME SUBSCRIPTIONS
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE alarm_rules;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
```

**Migration File 2:** `20260128_hour_5_10_automation_logic.sql` (unchanged)

**Migration File 3:** `20260128_hour_16_19_tender_workflow.sql` (unchanged)

**Migration File 4:** `20260128_hour_19_21_document_management.sql` (DELETED or comment-only)

---

## 🚀 FINAL DEPLOYMENT INSTRUCTIONS

After making corrections:

1. **Apply Corrected Migrations in Supabase SQL Editor:**
   ```sql
   -- Run in this order:
   1. 20260128_hour_0_4_rbac_alarm_setup.sql (corrected version)
   2. 20260128_hour_5_10_automation_logic.sql (unchanged)
   3. 20260128_hour_16_19_tender_workflow.sql (unchanged)
   4. Skip migration #4 (deleted)
   ```

2. **Enable pg_cron Extension:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_cron;

   -- Schedule automated jobs:
   SELECT cron.schedule('sweep-alarms-5min', '*/5 * * * *', 'SELECT sweep_alarm_rules()');
   SELECT cron.schedule('process-escalations-hourly', '0 * * * *', 'SELECT process_escalations()');
   ```

3. **Test New Features:**
   ```sql
   -- Test alarm sweep
   SELECT sweep_alarm_rules();

   -- Verify tables exist
   SELECT * FROM alarm_rules LIMIT 1;
   SELECT * FROM tender_comms_events LIMIT 1;
   ```

4. **Access Health Dashboard:**
   - Navigate to `/admin/health` in browser
   - Should show system status, database connectivity, critical alerts

---

## 📊 SUMMARY OF CORRECTIONS

| Item | Status | Action |
|------|--------|--------|
| RBAC Functions (get_user_role, get_user_id, get_user_tier) | DUPLICATE | ❌ REMOVE |
| Document version_number field | DUPLICATE | ❌ REMOVE |
| Document parent_document_id field | DUPLICATE | ❌ REMOVE |
| Document sensitivity_level field | DUPLICATE | ❌ REMOVE |
| Alarm engine tables | NEW | ✅ KEEP |
| Automation procedures | NEW | ✅ KEEP |
| Tender comms log | NEW | ✅ KEEP |
| RLS policy improvements | NEW | ✅ KEEP |
| Health dashboard | NEW | ✅ KEEP |

**Total Duplicates Removed:** ~50 lines
**Total New Work Retained:** ~250 lines
**Net Value:** 80% of claimed work preserved

---

## ✅ SUCCESS CRITERIA

After corrections, verify:

1. ✅ No duplicate function definitions
2. ✅ No duplicate column additions
3. ✅ All new tables present (alarm_rules, notification_preferences, notification_snoozes, tender_comms_events)
4. ✅ All new procedures present (sweep_alarm_rules, process_escalations)
5. ✅ All RLS policy improvements intact
6. ✅ Health dashboard functional
7. ✅ Migrations run without errors in test environment

---

**END OF CORRECTION PROMPT**

---

## 🎯 QUICK ACTION SUMMARY FOR GEMINI

**TL;DR - Do This:**

1. Edit `20260128_hour_0_4_rbac_alarm_setup.sql`:
   - Delete lines 8-28 (RBAC functions)
   - Delete line 115 (sensitivity_level column)
   - Keep everything else

2. Keep `20260128_hour_5_10_automation_logic.sql` unchanged

3. Keep `20260128_hour_16_19_tender_workflow.sql` unchanged

4. Delete `20260128_hour_19_21_document_management.sql` entirely

5. Fix `app/admin/health/page.tsx`:
   - Move line 183 import to top with other imports

6. Test deployment in staging Supabase instance

**Result:** Clean migrations with 100% new work, 0% redundancy.
