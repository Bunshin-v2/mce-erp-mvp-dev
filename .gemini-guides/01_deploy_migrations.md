# Step 1: Deploy SQL Migrations

To activate the security hardening, alarm engine, and workflow automation, follow these steps:

### 1. Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://app.supabase.com).
2. Select your project.
3. Click on the **SQL Editor** icon in the left sidebar.

### 2. Execute Migrations in Order
Copy and paste the contents of these files into the editor and click **Run** for each one:

| Order | File | Purpose |
|---|---|---|
| **1** | `supabase/migrations/20260128_hour_0_4_rbac_alarm_setup.sql` | 🔐 Security & Alarm Tables |
| **2** | `supabase/migrations/20260128_hour_5_10_automation_logic.sql` | 🚨 Automation Logic |
| **3** | `supabase/migrations/20260128_hour_16_19_tender_workflow.sql` | 📋 Tender Workflow |

### 3. Verify Tables
Check the **Table Editor** to ensure these new tables exist:
- `alarm_rules`
- `notification_preferences`
- `notification_snoozes`
- `tender_comms_events`

---
Proceed to [Step 2: Enable pg_cron](./02_enable_pgcron.md)