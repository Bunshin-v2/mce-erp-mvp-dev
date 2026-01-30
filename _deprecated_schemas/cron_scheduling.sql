
-- SQL commands for scheduling automated tasks using Supabase's pg_cron extension.
-- NOTE: pg_cron must be enabled in your Supabase project settings first.

-- 1. Schedule process_deadline_triggers: Checks for upcoming deadlines every 5 minutes.
SELECT cron.schedule(
    'process_deadlines_5min',
    '*/5 * * * *',
    'SELECT process_deadline_triggers()'
);

-- 2. Schedule process_escalations: Checks for unacknowledged critical alerts every 15 minutes.
SELECT cron.schedule(
    'process_escalations_15min',
    '*/15 * * * *',
    'SELECT process_escalations()'
);

-- 3. Schedule send_daily_digest: Sends the daily digest notification every day at 09:00 AM UTC.
SELECT cron.schedule(
    'send_daily_digest_0900',
    '0 9 * * *',
    'SELECT send_daily_digest()'
);

-- OPTIONAL: Commands to unschedule tasks
-- SELECT cron.unschedule('process_deadlines_5min');
-- SELECT cron.unschedule('process_escalations_15min');
-- SELECT cron.unschedule('send_daily_digest_0900');
