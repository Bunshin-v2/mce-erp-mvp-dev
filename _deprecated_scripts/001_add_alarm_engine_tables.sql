-- Migration: Add Alarm Engine and Notification System Tables
-- Date: 2026-01-27
-- Phase: Foundation Alignment (Phase 1)

-- =====================================================
-- ALARM RULES TABLE
-- Stores configurable alarm/notification rules
-- =====================================================
CREATE TABLE IF NOT EXISTS alarm_rules (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Trigger Configuration
    entity_type TEXT NOT NULL CHECK (entity_type IN ('tender', 'project', 'payment', 'milestone', 'document')),
    condition_field TEXT NOT NULL, -- e.g., 'deadline_at', 'due_date', 'dlp_end_date'
    condition_operator TEXT NOT NULL CHECK (condition_operator IN ('days_before', 'days_after', 'equals', 'greater_than', 'less_than')),
    condition_value INTEGER NOT NULL,
    additional_filter TEXT, -- JSON: Additional WHERE conditions
    
    -- Timing Sequence
    -- JSON array of days before/after to trigger, e.g., [14,7,5,3,2,1,0,-1]
    timing_sequence TEXT NOT NULL DEFAULT '[14,7,5,3,2,1,0,-1]',
    
    -- Notification Channels
    -- JSON array: ['in_app','email','sound','sms']
    channels TEXT NOT NULL DEFAULT '["in_app"]',
    sound_file TEXT DEFAULT 'alert-default.mp3',
    sound_volume INTEGER DEFAULT 75 CHECK (sound_volume >= 0 AND sound_volume <= 100),
    sound_repeat_count INTEGER DEFAULT 1,
    sound_repeat_interval INTEGER DEFAULT 30,
    email_frequency TEXT DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'daily', 'weekly', 'immediate_critical')),
    
    -- Recipients
    notify_owner INTEGER DEFAULT 1, -- Boolean: notify entity owner
    notify_team INTEGER DEFAULT 1,  -- Boolean: notify team members
    notify_roles TEXT DEFAULT '[]', -- JSON array of roles: ['pm','dept_head','chairman']
    additional_recipients TEXT DEFAULT '[]', -- JSON array of emails
    
    -- Severity & Escalation
    base_severity TEXT DEFAULT 'warn' CHECK (base_severity IN ('info', 'warn', 'critical')),
    escalate_to_critical_days INTEGER DEFAULT 3,
    escalation_levels TEXT DEFAULT '[]', -- JSON: [{hours: 4, role: 'pm'}, {hours: 24, role: 'dept_head'}]
    ack_required INTEGER DEFAULT 0, -- Boolean: require acknowledgment
    
    -- Message Template
    message_subject TEXT NOT NULL,
    message_body TEXT NOT NULL,
    
    -- Status
    is_active INTEGER DEFAULT 1,
    created_by_user_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_alarm_rules_entity_type ON alarm_rules(entity_type);
CREATE INDEX idx_alarm_rules_is_active ON alarm_rules(is_active);

-- =====================================================
-- NOTIFICATIONS TABLE
-- Stores individual notification instances
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    alarm_rule_id TEXT REFERENCES alarm_rules(id) ON DELETE SET NULL,
    
    -- Related Entity
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    
    -- Message
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warn', 'critical')),
    
    -- Acknowledgment
    ack_required INTEGER DEFAULT 0,
    ack_at TEXT,
    ack_by_user_id TEXT,
    
    -- Status
    read_at TEXT,
    snoozed_until TEXT,
    escalation_level INTEGER DEFAULT 0,
    escalated_at TEXT,
    
    -- Metadata
    related_entity_type TEXT,
    related_entity_id TEXT,
    metadata TEXT, -- JSON: Additional context
    
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_severity ON notifications(severity);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX idx_notifications_ack_required ON notifications(ack_required) WHERE ack_required = 1;

-- =====================================================
-- NOTIFICATION QUEUE TABLE
-- Tracks multi-channel notification delivery
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_queue (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    notification_id TEXT REFERENCES notifications(id) ON DELETE CASCADE,
    alarm_rule_id TEXT REFERENCES alarm_rules(id) ON DELETE SET NULL,
    
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'sound', 'sms', 'slack', 'teams')),
    recipient_email TEXT,
    recipient_phone TEXT,
    
    scheduled_at TEXT NOT NULL,
    sent_at TEXT,
    failed_at TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_notification_queue_scheduled ON notification_queue(scheduled_at) WHERE sent_at IS NULL;

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- User-specific notification settings
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL UNIQUE,
    
    -- Sound Preferences
    sound_enabled INTEGER DEFAULT 1,
    sound_volume INTEGER DEFAULT 75 CHECK (sound_volume >= 0 AND sound_volume <= 100),
    sound_info TEXT DEFAULT 'alert-gentle.mp3',
    sound_warn TEXT DEFAULT 'alert-urgent.mp3',
    sound_critical TEXT DEFAULT 'alert-critical.mp3',
    
    -- Email Preferences
    email_enabled INTEGER DEFAULT 1,
    email_frequency TEXT DEFAULT 'immediate_critical' CHECK (email_frequency IN ('immediate', 'daily', 'weekly', 'immediate_critical')),
    email_address TEXT,
    
    -- Quiet Hours
    quiet_hours_enabled INTEGER DEFAULT 0,
    quiet_hours_start TEXT DEFAULT '22:00',
    quiet_hours_end TEXT DEFAULT '07:00',
    quiet_hours_weekends INTEGER DEFAULT 1,
    quiet_hours_allow_critical INTEGER DEFAULT 1,
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- NOTIFICATION SNOOZES TABLE
-- Tracks snoozed notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_snoozes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    notification_id TEXT REFERENCES notifications(id) ON DELETE CASCADE,
    snoozed_by_user_id TEXT NOT NULL,
    snoozed_until TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_notification_snoozes_until ON notification_snoozes(snoozed_until);

-- =====================================================
-- ESCALATION LOG TABLE
-- Audit trail of notification escalations
-- =====================================================
CREATE TABLE IF NOT EXISTS escalation_log (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    notification_id TEXT REFERENCES notifications(id) ON DELETE CASCADE,
    from_level INTEGER NOT NULL,
    to_level INTEGER NOT NULL,
    escalated_to_user_id TEXT,
    escalated_at TEXT DEFAULT (datetime('now')),
    reason TEXT CHECK (reason IN ('no_ack', 'overdue', 'manual'))
);

CREATE INDEX idx_escalation_log_notification ON escalation_log(notification_id);

-- =====================================================
-- WORKFLOW INSTANCES TABLE
-- Tracks running workflow state machines
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_instances (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    workflow_name TEXT NOT NULL, -- e.g., 'tender-lifecycle', 'project-lifecycle'
    workflow_version INTEGER DEFAULT 1,
    
    -- Linked Entity
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    
    -- State
    current_state TEXT NOT NULL DEFAULT 'initial',
    context TEXT NOT NULL DEFAULT '{}', -- JSON: Workflow context data
    
    -- Timestamps
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    error_message TEXT,
    
    created_by_user_id TEXT
);

CREATE INDEX idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX idx_workflow_instances_state ON workflow_instances(current_state);

-- =====================================================
-- WORKFLOW EVENTS TABLE
-- Append-only log of state transitions
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_events (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    instance_id TEXT REFERENCES workflow_instances(id) ON DELETE CASCADE,
    
    from_state TEXT NOT NULL,
    to_state TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data TEXT DEFAULT '{}', -- JSON: Event payload
    
    actor_user_id TEXT,
    occurred_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_workflow_events_instance ON workflow_events(instance_id);
CREATE INDEX idx_workflow_events_occurred ON workflow_events(occurred_at);

-- =====================================================
-- DOCUMENT CHUNKS TABLE
-- For RAG (Retrieval-Augmented Generation) system
-- Embeddings will be stored in Supabase/external vector DB later
-- =====================================================
CREATE TABLE IF NOT EXISTS doc_chunks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    document_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    
    content TEXT NOT NULL,
    content_tokens INTEGER,
    
    -- Metadata
    front_matter TEXT DEFAULT '{}', -- JSON: Extracted metadata (dates, amounts, parties)
    chunk_type TEXT DEFAULT 'body' CHECK (chunk_type IN ('header', 'body', 'table', 'list', 'clause', 'appendix', 'signature')),
    section_path TEXT, -- Hierarchical path: "1. General > 1.2 Scope > 1.2.1 Design Services"
    page_numbers TEXT, -- JSON array of page numbers
    
    -- Relationships
    parent_chunk_id TEXT REFERENCES doc_chunks(id),
    
    created_at TEXT DEFAULT (datetime('now')),
    
    UNIQUE(document_id, chunk_index)
);

CREATE INDEX idx_doc_chunks_document ON doc_chunks(document_id);
CREATE INDEX idx_doc_chunks_type ON doc_chunks(chunk_type);

-- =====================================================
-- ENHANCE EXISTING PROJECTS TABLE
-- Add MCE-style fields to projects_master
-- =====================================================

-- Check if columns exist before adding (SQLite doesn't support IF NOT EXISTS for columns)
-- Run these statements individually and ignore errors if column exists

-- Project Stage (assessment, design, tender, supervision, closeout)
ALTER TABLE projects_master ADD COLUMN stage TEXT CHECK (stage IN ('assessment', 'design', 'tender', 'supervision', 'closeout'));

-- Project Manager Assignment
ALTER TABLE projects_master ADD COLUMN pm_user_id TEXT;

-- Progress Percentage (0-100)
ALTER TABLE projects_master ADD COLUMN progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100);

-- Defects Liability Period (DLP) dates
ALTER TABLE projects_master ADD COLUMN dlp_start_date TEXT;
ALTER TABLE projects_master ADD COLUMN dlp_end_date TEXT;

-- Tags (JSON array for categorization)
ALTER TABLE projects_master ADD COLUMN tags TEXT DEFAULT '[]';

-- Workflow instance tracking
ALTER TABLE projects_master ADD COLUMN workflow_instance_id TEXT REFERENCES workflow_instances(id);

-- =====================================================
-- DEFAULT ALARM RULES
-- Insert standard alarm rules for common scenarios
-- =====================================================

-- Tender Deadline Warning (14-day sequence)
INSERT INTO alarm_rules (
    name, 
    description,
    entity_type, 
    condition_field, 
    condition_operator, 
    condition_value,
    timing_sequence,
    channels,
    base_severity,
    escalate_to_critical_days,
    ack_required,
    message_subject,
    message_body,
    is_active
) VALUES (
    'Tender Deadline Countdown',
    'Multi-stage deadline warnings for tender submissions',
    'tender',
    'deadline',
    'days_before',
    14,
    '[14,7,5,3,2,1,0,-1]',
    '["in_app","email","sound"]',
    'warn',
    3,
    1,
    '[{{severity}}] Tender {{tender.reference}} deadline approaching',
    'Tender "{{tender.reference}}" deadline in {{days_remaining}} days.

Client: {{tender.client_name}}
Title: {{tender.title}}
Value: {{tender.value_amount}} {{tender.value_currency}}
Status: {{tender.status}}

Deadline: {{tender.deadline}}

[View Tender]({{tender.url}})',
    1
);

-- Payment Due Warning
INSERT INTO alarm_rules (
    name,
    description,
    entity_type,
    condition_field,
    condition_operator,
    condition_value,
    timing_sequence,
    channels,
    base_severity,
    ack_required,
    message_subject,
    message_body,
    is_active
) VALUES (
    'Payment Milestone Due',
    'Alerts for upcoming payment milestones',
    'payment',
    'due_date',
    'days_before',
    14,
    '[14,7,0,-7,-30]',
    '["in_app","email"]',
    'warn',
    0,
    'Payment Due: {{payment.milestone_name}}',
    'Payment milestone "{{payment.milestone_name}}" due {{days_remaining}} days.

Project: {{payment.project_name}}
Amount: {{payment.amount}} {{payment.currency}}
Due Date: {{payment.due_date}}

[View Project]({{payment.project_url}})',
    1
);

-- DLP Expiry Warning
INSERT INTO alarm_rules (
    name,
    description,
    entity_type,
    condition_field,
    condition_operator,
    condition_value,
    timing_sequence,
    channels,
    base_severity,
    ack_required,
    message_subject,
    message_body,
    is_active
) VALUES (
    'DLP Expiry Countdown',
    'Defects Liability Period ending notifications',
    'project',
    'dlp_end_date',
    'days_before',
    90,
    '[90,60,30,14,7,0]',
    '["in_app","email"]',
    'info',
    1,
    'DLP Ending: {{project.name}}',
    'Defects Liability Period for "{{project.name}}" ending in {{days_remaining}} days.

Project Code: {{project.code}}
Client: {{project.client_name}}
DLP Start: {{project.dlp_start_date}}
DLP End: {{project.dlp_end_date}}

Action required: Schedule final inspection and documentation review.

[View Project]({{project.url}})',
    1
);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
