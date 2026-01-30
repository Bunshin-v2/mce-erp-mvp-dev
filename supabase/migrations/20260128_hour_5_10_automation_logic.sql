-- MCE SPRINT - HOUR 5-10: ALARM AUTOMATION & ESCALATION
-- ============================================================================

-- 1. PROCEDURE: Sweep Alarm Rules
-- ----------------------------------------------------------------------------
-- Scans projects and tenders against active rules to generate new alerts.

CREATE OR REPLACE FUNCTION sweep_alarm_rules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    r RECORD;
    entity RECORD;
    target_date TIMESTAMPTZ;
BEGIN
    FOR r IN SELECT * FROM alarm_rules WHERE is_active = true LOOP
        -- Simple logic: if condition is 'Days Before', we check if deadline is within X days
        IF r.condition_operator = 'Days Before' THEN
            target_date := now() + (r.condition_value || ' days')::interval;
            
            -- Scan Tenders
            IF r.entity_type = 'tender' THEN
                FOR entity IN 
                    SELECT id, title, deadline, owner_user_id 
                    FROM tenders 
                    WHERE deadline <= target_date AND deadline > now()
                LOOP
                    -- Create alert if not exists
                    INSERT INTO alerts (rule_id, related_entity_type, related_entity_id, title, severity, status, due_at, ack_required)
                    SELECT r.id, 'tender', entity.id, r.name || ': ' || entity.title, r.base_severity, 'PENDING_REVIEW', entity.deadline, r.ack_required
                    WHERE NOT EXISTS (
                        SELECT 1 FROM alerts 
                        WHERE related_entity_id = entity.id 
                        AND rule_id = r.id 
                        AND status = 'PENDING_REVIEW'
                    );
                END LOOP;
            
            -- Scan Projects
            ELSIF r.entity_type = 'project' THEN
                FOR entity IN 
                    SELECT id, project_name, project_completion_date_planned 
                    FROM projects_master 
                    WHERE project_completion_date_planned <= target_date AND project_completion_date_planned > now()
                LOOP
                    INSERT INTO alerts (rule_id, related_entity_type, related_entity_id, title, severity, status, due_at, ack_required)
                    SELECT r.id, 'project', entity.id, r.name || ': ' || entity.project_name, r.base_severity, 'PENDING_REVIEW', entity.project_completion_date_planned, r.ack_required
                    WHERE NOT EXISTS (
                        SELECT 1 FROM alerts 
                        WHERE related_entity_id = entity.id 
                        AND rule_id = r.id 
                        AND status = 'PENDING_REVIEW'
                    );
                END LOOP;
            END IF;
        END IF;
    END LOOP;
END;
$$;


-- 2. PROCEDURE: Process Escalations
-- ----------------------------------------------------------------------------
-- Checks for unacknowledged critical alerts and escalates them to higher tiers.

CREATE OR REPLACE FUNCTION process_escalations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    a RECORD;
    next_tier permission_tier;
BEGIN
    FOR a IN 
        SELECT id, severity, created_at, related_entity_id, related_entity_type
        FROM alerts 
        WHERE status = 'PENDING_REVIEW' 
        AND severity IN ('CRITICAL', 'CATASTROPHIC')
        AND created_at < now() - interval '4 hours' -- Escalate after 4 hours of silence
    LOOP
        -- Determine next tier or target users
        -- For MVP, we'll create a system-wide notification for L3/L4
        
        INSERT INTO notifications (title, message, severity, category, entity_type, entity_id)
        VALUES (
            'ESCALATION: ' || a.title,
            'Critical alert unacknowledged for 4+ hours. Immediate intervention required.',
            'critical',
            'system',
            a.related_entity_type,
            a.related_entity_id
        );
        
        -- Mark alert as escalated (or just log it)
        -- We could update a status or column in alerts
    END LOOP;
END;
$$;


-- 3. CRON SETUP (Requires pg_cron extension)
-- ----------------------------------------------------------------------------
-- Note: User must enable pg_cron in Supabase Dashboard -> Database -> Extensions

/*
SELECT cron.schedule('sweep-alarms-5min', '*/5 * * * *', 'SELECT sweep_alarm_rules()');
SELECT cron.schedule('process-escalations-hourly', '0 * * * *', 'SELECT process_escalations()');
*/
