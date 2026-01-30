# Step 2: Enable pg_cron & Schedule Jobs

The automated alarm engine relies on the `pg_cron` extension to scan for deadlines.

### 1. Enable Extension
In the Supabase SQL Editor, run:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### 2. Schedule the Automation Sweeps
Run the following SQL to schedule the background jobs:

```sql
-- 1. Scan for upcoming deadlines every 5 minutes
SELECT cron.schedule(
  'sweep-alarms-5min', 
  '*/5 * * * *', 
  'SELECT sweep_alarm_rules()'
);

-- 2. Process critical escalations every hour
SELECT cron.schedule(
  'process-escalations-hourly', 
  '0 * * * *', 
  'SELECT process_escalations()'
);
```

### 3. Verify Cron Jobs
You can check if the jobs are active by running:
```sql
SELECT * FROM cron.job;
```

---
Proceed to [Step 3: Verify Deployment](./03_verify_deployment.md)