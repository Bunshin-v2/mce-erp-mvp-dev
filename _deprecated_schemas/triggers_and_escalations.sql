
-- This function handles proactive notifications for various deadlines.
CREATE OR REPLACE FUNCTION process_deadline_triggers()
RETURNS void AS $$
DECLARE
    tender_rec RECORD;
    milestone_rec RECORD;
    invoice_rec RECORD;
    project_rec RECORD;
    default_user_id TEXT := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- 1. Process Tender Deadlines
    FOR tender_rec IN SELECT * FROM tenders WHERE status NOT IN ('submitted', 'won', 'lost', 'cancelled') LOOP
        IF tender_rec.deadline BETWEEN now() + interval '13 days' AND now() + interval '14 days' THEN
            IF NOT EXISTS (SELECT 1 FROM notifications WHERE related_entity_id = tender_rec.id AND message LIKE '%14 days%') THEN
                INSERT INTO notifications (user_id, message, severity, related_entity_type, related_entity_id) VALUES (COALESCE(tender_rec.owner_user_id, default_user_id), 'Tender "' || tender_rec.ref || '" deadline is in 14 days.', 'info', 'tender', tender_rec.id);
            END IF;
        END IF;
    END LOOP;

    -- 2. Process Project Milestone Deadlines
    FOR milestone_rec IN SELECT m.*, p.name as project_name FROM project_milestones m JOIN projects p ON m.project_id = p.id WHERE m.status = 'pending' LOOP
        IF milestone_rec.due_date = now()::date + 7 THEN
            IF NOT EXISTS (SELECT 1 FROM notifications WHERE related_entity_id = milestone_rec.id AND message LIKE '%7 days%') THEN
                INSERT INTO notifications (user_id, message, severity, related_entity_type, related_entity_id) VALUES (COALESCE(milestone_rec.owner_user_id, default_user_id), 'Milestone "' || milestone_rec.title || '" is due in 7 days.', 'info', 'milestone', milestone_rec.id);
            END IF;
        END IF;
    END LOOP;
    
    -- 3. Process Invoice Due Dates
    FOR invoice_rec IN SELECT * FROM invoices WHERE status IN ('sent', 'overdue') LOOP
        IF invoice_rec.due_date = now()::date + 7 THEN
            IF NOT EXISTS (SELECT 1 FROM notifications WHERE related_entity_id = invoice_rec.id AND message LIKE '%Invoice%due in 7 days%') THEN
                INSERT INTO notifications (user_id, message, severity, related_entity_type, related_entity_id) VALUES (default_user_id, 'Invoice ' || invoice_rec.invoice_number || ' is due in 7 days.', 'warning', 'invoice', invoice_rec.id);
            END IF;
        END IF;
    END LOOP;

    -- 4. Process DLP End Dates
    FOR project_rec IN SELECT * FROM projects WHERE dlp_end_date IS NOT NULL LOOP
        IF project_rec.dlp_end_date = now()::date + 30 THEN
            IF NOT EXISTS (SELECT 1 FROM notifications WHERE related_entity_id = project_rec.id AND message LIKE '%DLP%in 30 days%') THEN
                INSERT INTO notifications (user_id, message, severity, related_entity_type, related_entity_id) VALUES (default_user_id, 'DLP for project ' || project_rec.name || ' ends in 30 days.', 'warning', 'project', project_rec.id);
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- This function escalates unacknowledged critical alerts.
CREATE OR REPLACE FUNCTION process_escalations()
RETURNS void AS $$
DECLARE
    unacked_notification RECORD;
    manager_user_id TEXT := '11111111-1111-1111-1111-111111111111'; -- L1 Manager
    director_user_id TEXT := '22222222-2222-2222-2222-222222222222'; -- L2 Director
    new_notification_id UUID;
BEGIN
    FOR unacked_notification IN SELECT * FROM notifications WHERE ack_required = true AND ack_at IS NULL AND severity = 'critical' LOOP
        -- Level 1 Escalation: After 4 hours
        IF unacked_notification.created_at < now() - interval '4 hours' THEN
            IF NOT EXISTS (SELECT 1 FROM escalation_log WHERE original_notification_id = unacked_notification.id AND escalation_level = 'L1') THEN
                INSERT INTO notifications (user_id, message, severity, related_entity_type, related_entity_id, ack_required)
                VALUES (manager_user_id, '[ESCALATION L1] ' || unacked_notification.message, 'critical', 'notification', unacked_notification.id, true)
                RETURNING id INTO new_notification_id;

                INSERT INTO escalation_log (original_notification_id, escalated_notification_id, escalation_level, escalated_from_user_id, escalated_to_user_id)
                VALUES (unacked_notification.id, new_notification_id, 'L1', unacked_notification.user_id, manager_user_id);
            END IF;
        END IF;

        -- Level 2 Escalation: After 24 hours
        IF unacked_notification.created_at < now() - interval '24 hours' THEN
             IF NOT EXISTS (SELECT 1 FROM escalation_log WHERE original_notification_id = unacked_notification.id AND escalation_level = 'L2') THEN
                INSERT INTO notifications (user_id, message, severity, related_entity_type, related_entity_id, ack_required)
                VALUES (director_user_id, '[ESCALATION L2] ' || unacked_notification.message, 'critical', 'notification', unacked_notification.id, true)
                RETURNING id INTO new_notification_id;

                INSERT INTO escalation_log (original_notification_id, escalated_notification_id, escalation_level, escalated_from_user_id, escalated_to_user_id)
                VALUES (unacked_notification.id, new_notification_id, 'L2', unacked_notification.user_id, director_user_id);
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- This function creates a daily summary notification for users.
CREATE OR REPLACE FUNCTION send_daily_digest()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    notification_count INT;
BEGIN
    FOR user_record IN SELECT DISTINCT user_id FROM notifications WHERE read_at IS NULL LOOP
        SELECT count(*) INTO notification_count FROM notifications WHERE user_id = user_record.user_id AND read_at IS NULL AND created_at >= now() - interval '24 hours';
        IF notification_count > 0 THEN
            INSERT INTO notifications (user_id, message, severity, ack_required)
            VALUES (user_record.user_id, 'Daily Digest: You have ' || notification_count || ' unread notification(s).', 'info', false);
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
