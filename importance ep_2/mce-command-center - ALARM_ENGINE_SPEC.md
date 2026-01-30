# MCE Command Center - Alarm/Notification Engine Specification
 
## Overview
 
The Alarm/Notification Engine is a critical component that ensures MCE staff never miss important deadlines, liabilities, or action items. It provides customizable, multi-channel alerts with escalation capabilities.
 
---
 
## Architecture
 
```
┌─────────────────────────────────────────────────────────────┐
│                    ALARM ENGINE CORE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   TRIGGER   │───>│  EVALUATOR  │───>│  DISPATCHER │     │
│  │   SCANNER   │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│        │                  │                  │              │
│        ▼                  ▼                  ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  pg_cron    │    │  Rule       │    │  Channel    │     │
│  │  Scheduler  │    │  Engine     │    │  Router     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ESCALATION CONTROLLER                   │   │
│  │  L0 → L1 → L2 → L3 → L4 (time-based promotion)      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
 
---
 
## Trigger Types & Default Timing
 
### 1. Tender Deadline Triggers
 
| Days Before | Severity | Channels | Escalation |
|-------------|----------|----------|------------|
| 14 days | INFO | In-App | None |
| 7 days | WARN | In-App, Email | None |
| 5 days | WARN | In-App, Email | None |
| 3 days | CRITICAL | In-App, Email, Sound | L0 (Owner) |
| 2 days | CRITICAL | In-App, Email, Sound | L1 (PM) |
| 1 day | CRITICAL | All channels | L2 (Dept Head) |
| Same day | CRITICAL | All channels | L3 (VP) |
| Overdue | CRITICAL | All + SMS | L4 (Super Admin) |
 
### 2. Payment Due Triggers
 
| Timing | Severity | Action |
|--------|----------|--------|
| 14 days before | INFO | Prepare invoice |
| 7 days before | WARN | Send reminder to client |
| Due date | CRITICAL | Follow up required |
| 7 days overdue | CRITICAL | Escalate to finance |
| 30 days overdue | CRITICAL | Escalate to management |
| 60 days overdue | CRITICAL | Legal review trigger |
 
### 3. Liability/DLP Triggers
 
| Timing | Severity | Action |
|--------|----------|--------|
| 90 days before end | INFO | Review preparation |
| 60 days before end | WARN | Inspection scheduling |
| 30 days before end | CRITICAL | Final inspection |
| 14 days before end | CRITICAL | Documentation review |
| 7 days before end | CRITICAL | Closure preparation |
| End date | CRITICAL | Certificate release |
 
### 4. Milestone Due Triggers
 
| Timing | Severity | Action |
|--------|----------|--------|
| 7 days before | INFO | Progress check |
| 3 days before | WARN | Status update required |
| 1 day before | CRITICAL | Completion required |
| Overdue | CRITICAL | Escalation |
 
---
 
## Notification Channels
 
### Channel Configuration
 
```typescript
interface NotificationChannel {
  id: string;
  name: string;
  type: 'in_app' | 'email' | 'sound' | 'sms' | 'slack' | 'teams';
  config: ChannelConfig;
  isEnabled: boolean;
  severityThreshold: 'info' | 'warn' | 'critical';
}
 
// In-App Notification
interface InAppConfig {
  showBadge: boolean;
  autoHideAfter: number; // seconds, 0 = never
  position: 'top-right' | 'bottom-right' | 'center';
}
 
// Email Configuration
interface EmailConfig {
  smtpProvider: 'resend' | 'sendgrid' | 'ses';
  fromAddress: string;
  replyTo: string;
  templateId: string;
}
 
// Sound Alert Configuration
interface SoundConfig {
  defaultSound: string;
  volume: number; // 0-100
  repeatCount: number;
  repeatInterval: number; // seconds
}
 
// SMS Configuration
interface SMSConfig {
  provider: 'twilio' | 'messagebird';
  fromNumber: string;
  maxPerDay: number;
}
```
 
### Sound Alert Files
 
| Sound Name | Use Case | File |
|------------|----------|------|
| alert-default | Standard notifications | `alert-default.mp3` |
| alert-gentle | Info severity | `alert-gentle.mp3` |
| alert-chime | Success/completion | `alert-chime.mp3` |
| alert-urgent | Warning severity | `alert-urgent.mp3` |
| alert-critical | Critical severity | `alert-critical.mp3` |
| alert-overdue | Overdue items | `alert-overdue.mp3` |
 
---
 
## UI Components
 
### 1. Notification Bell (Header)
 
```
┌───────────────────────────────────────────────────────┐
│                                           🔔          │
│                                           [3]         │
│                                            ▼          │
│                              ┌────────────────────────┤
│                              │ NOTIFICATIONS          │
│                              ├────────────────────────┤
│                              │ 🔴 Tender deadline 2d  │
│                              │ 🟠 Payment due today   │
│                              │ 🟡 Milestone reminder  │
│                              ├────────────────────────┤
│                              │ [View All] [Mark Read] │
│                              └────────────────────────┘
└───────────────────────────────────────────────────────┘
```
 
### 2. Notification List Item
 
```
┌─────────────────────────────────────────────────────────────┐
│ ┌───┐                                                       │
│ │ ⚠️ │  Tender "RFP-2024-089" deadline approaching          │
│ └───┘  Due: April 15, 2024 (2 days remaining)              │
│        Client: Emaar Properties                             │
│        Owner: Ahmed Al-Rashid                               │
│                                                             │
│        [View Tender]  [Acknowledge]  [Snooze ▼]            │
│                                                             │
│        Received: 10 minutes ago                             │
└─────────────────────────────────────────────────────────────┘
```
 
### 3. Alarm Rule Editor (Full Form)
 
```
┌─────────────────────────────────────────────────────────────┐
│ ALARM RULE CONFIGURATION                               [×]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ GENERAL SETTINGS                                        │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Rule Name:                                              │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Tender Deadline Warning                             │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Description:                                            │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Notify team when tender deadline is approaching     │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Status: [● Active] [○ Inactive]                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ TRIGGER CONDITION                                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Entity Type:        Field:                              │ │
│ │ ┌─────────────┐     ┌─────────────────────────────────┐ │ │
│ │ │ Tender    ▼│     │ deadline_at                   ▼│ │ │
│ │ └─────────────┘     └─────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Condition:          Value:                              │ │
│ │ ┌─────────────┐     ┌─────────────────────────────────┐ │ │
│ │ │ Days Before▼│     │ 14                              │ │ │
│ │ └─────────────┘     └─────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Additional Filters:                                     │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ status != 'submitted' AND status != 'awarded'       │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ TIMING SEQUENCE                                         │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Select when to trigger notifications:                   │ │
│ │                                                         │ │
│ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │ │
│ │ │☑ 14d│ │☑ 7d │ │☑ 5d │ │☑ 3d │ │☑ 2d │ │☑ 1d │       │ │
│ │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       │ │
│ │                                                         │ │
│ │ ┌───────────┐ ┌───────────┐                            │ │
│ │ │☑ Same Day │ │☑ Overdue  │                            │ │
│ │ └───────────┘ └───────────┘                            │ │
│ │                                                         │ │
│ │ Custom timing: ┌─────┐ days ○ before ○ after           │ │
│ │                └─────┘                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ NOTIFICATION CHANNELS                                   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ ☑ In-App Popup    (Always enabled)                     │ │
│ │                                                         │ │
│ │ ☑ Sound Alert                                          │ │
│ │   Sound: ┌────────────────────────────┐ ┌────┐         │ │
│ │          │ alert-urgent.mp3         ▼│ │ ▶ │         │ │
│ │          └────────────────────────────┘ └────┘         │ │
│ │   Volume: ──────────●────── 75%                        │ │
│ │   Repeat: ┌─────┐ times every ┌─────┐ seconds         │ │
│ │           │  3  │             │ 30  │                  │ │
│ │           └─────┘             └─────┘                  │ │
│ │                                                         │ │
│ │ ☑ Email Notification                                   │ │
│ │   ○ Immediate  ● Daily Digest  ○ Weekly Summary        │ │
│ │                                                         │ │
│ │ ☐ SMS (Critical only)                                  │ │
│ │                                                         │ │
│ │ ☐ Slack/Teams Webhook                                  │ │
│ │   Webhook URL: ┌─────────────────────────────────────┐ │ │
│ │                │ https://hooks.slack.com/...         │ │ │
│ │                └─────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ RECIPIENTS                                              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ☑ Entity Owner (tender/project owner)                  │ │
│ │ ☑ Entity Team Members                                  │ │
│ │ ☐ Department Head                                      │ │
│ │ ☐ Project Manager                                      │ │
│ │ ☐ Finance Team                                         │ │
│ │ ☐ All Admins                                           │ │
│ │                                                         │ │
│ │ Additional Recipients:                                  │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ + Add email or select user...                       │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SEVERITY & ESCALATION                                   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Base Severity:                                          │ │
│ │ ○ Info (ℹ️)  ● Warning (⚠️)  ○ Critical (🔴)            │ │
│ │                                                         │ │
│ │ Auto-escalate severity based on timing:                 │ │
│ │ ☑ Upgrade to Critical when ≤ 3 days remaining          │ │
│ │ ☑ Upgrade to Critical when overdue                     │ │
│ │                                                         │ │
│ │ Acknowledgment Required:                                │ │
│ │ ○ None  ● Critical Only  ○ All Notifications           │ │
│ │                                                         │ │
│ │ Escalation if not acknowledged:                         │ │
│ │ ☑ After ┌─────┐ hours, escalate to: ┌────────────────┐ │ │
│ │         │  4  │                      │ Team Lead    ▼│ │ │
│ │         └─────┘                      └────────────────┘ │ │
│ │ ☑ After ┌─────┐ hours, escalate to: ┌────────────────┐ │ │
│ │         │ 24  │                      │ Dept Head    ▼│ │ │
│ │         └─────┘                      └────────────────┘ │ │
│ │ ☑ After ┌─────┐ hours, escalate to: ┌────────────────┐ │ │
│ │         │ 48  │                      │ Chairman/VP  ▼│ │ │
│ │         └─────┘                      └────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ MESSAGE TEMPLATE                                        │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Subject:                                                │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ [{{severity}}] Tender {{tender.reference}} deadline │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Body:                                                   │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ Tender "{{tender.reference}}" deadline in           │ │ │
│ │ │ {{days_remaining}} days.                            │ │ │
│ │ │                                                     │ │ │
│ │ │ Client: {{tender.client.name}}                      │ │ │
│ │ │ Title: {{tender.title}}                             │ │ │
│ │ │ Value: {{tender.value_amount|currency}}             │ │ │
│ │ │ Status: {{tender.status}}                           │ │ │
│ │ │                                                     │ │ │
│ │ │ Deadline: {{tender.deadline_at|date}}               │ │ │
│ │ │                                                     │ │ │
│ │ │ [View Tender]({{tender.url}})                       │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Available variables: [Show Reference ▼]                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  [Cancel]              [Test Rule]        [Save Rule]   │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
 
### 4. Notification Center Page
 
```
┌─────────────────────────────────────────────────────────────┐
│ NOTIFICATION CENTER                                         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Filters:                                                │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│ │ │ All Types ▼│ │ All Sev.  ▼│ │ Action Required   ▼│ │ │
│ │ └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│ │                                                         │ │
│ │ Date Range: ┌──────────────┐ to ┌──────────────┐       │ │
│ │             │ Apr 01, 2024 │    │ Apr 15, 2024 │       │ │
│ │             └──────────────┘    └──────────────┘       │ │
│ │                                                         │ │
│ │ [Mark All Read]  [Clear Acknowledged]  [Export]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 CRITICAL - REQUIRES ACKNOWLEDGMENT (3)               │ │
│ │ ▼                                                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ ⚠️ TENDER DEADLINE IN 2 DAYS                        │ │ │
│ │ │    RFP-2024-089 - Dubai Hills Villa Complex         │ │ │
│ │ │    Due: Apr 15, 2024 | Value: $850,000              │ │ │
│ │ │    Owner: Ahmed Al-Rashid                           │ │ │
│ │ │                                                     │ │ │
│ │ │    [View Tender]  [Acknowledge]  [Snooze 1hr ▼]     │ │ │
│ │ │                                         10 min ago  │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 💰 PAYMENT OVERDUE                                  │ │ │
│ │ │    Al Wasl Tower - Progress Payment #2              │ │ │
│ │ │    Due: Apr 10, 2024 | Amount: $120,000             │ │ │
│ │ │    Days Overdue: 3                                  │ │ │
│ │ │                                                     │ │ │
│ │ │    [View Project]  [Acknowledge]  [Snooze 1hr ▼]    │ │ │
│ │ │                                          2 hrs ago  │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🟡 WARNINGS (5)                                         │ │
│ │ ▼                                                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ ⏰ DLP Expiring in 30 Days                          │ │ │
│ │ │    Marina Heights (MRH-24)                          │ │ │
│ │ │    Expires: May 12, 2024                            │ │ │
│ │ │                                                     │ │ │
│ │ │    [View Project]  [Mark Read]                      │ │ │
│ │ │                                         Yesterday   │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │ ... (4 more)                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ℹ️ INFORMATION (12)                                     │ │
│ │ ▶ (collapsed)                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Page: [1] [2] [3] ... [Next ▶]                             │
└─────────────────────────────────────────────────────────────┘
```
 
### 5. Snooze Dropdown
 
```
┌─────────────────────────────────────────┐
│ Snooze Notification                     │
├─────────────────────────────────────────┤
│ ○ 15 minutes                            │
│ ○ 30 minutes                            │
│ ● 1 hour                                │
│ ○ 2 hours                               │
│ ○ 4 hours                               │
│ ○ Tomorrow 9 AM                         │
│ ○ Custom...                             │
├─────────────────────────────────────────┤
│ [Cancel]                    [Snooze]    │
└─────────────────────────────────────────┘
```
 
### 6. Alarm Settings Panel
 
```
┌─────────────────────────────────────────────────────────────┐
│ ALARM SETTINGS                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SOUND PREFERENCES                                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ☑ Enable sound alerts                                  │ │
│ │                                                         │ │
│ │ Master Volume: ──────────●────── 75%                   │ │
│ │                                                         │ │
│ │ Sound for Info:     ┌──────────────────────┐ ┌───┐     │ │
│ │                     │ alert-gentle.mp3   ▼│ │ ▶ │     │ │
│ │                     └──────────────────────┘ └───┘     │ │
│ │ Sound for Warning:  ┌──────────────────────┐ ┌───┐     │ │
│ │                     │ alert-urgent.mp3   ▼│ │ ▶ │     │ │
│ │                     └──────────────────────┘ └───┘     │ │
│ │ Sound for Critical: ┌──────────────────────┐ ┌───┐     │ │
│ │                     │ alert-critical.mp3 ▼│ │ ▶ │     │ │
│ │                     └──────────────────────┘ └───┘     │ │
│ │                                                         │ │
│ │ [Upload Custom Sound]                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ EMAIL PREFERENCES                                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ☑ Receive email notifications                          │ │
│ │                                                         │ │
│ │ Email Frequency:                                        │ │
│ │ ○ Immediate (all notifications)                        │ │
│ │ ● Immediate for Critical, Daily digest for others      │ │
│ │ ○ Daily digest only (9 AM)                             │ │
│ │ ○ Weekly summary (Monday 9 AM)                         │ │
│ │                                                         │ │
│ │ Email Address: ┌─────────────────────────────────────┐ │ │
│ │                │ ahmed@mce.ae                        │ │ │
│ │                └─────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ QUIET HOURS                                             │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ☑ Enable quiet hours (suppress non-critical)           │ │
│ │                                                         │ │
│ │ From: ┌────────┐  To: ┌────────┐                       │ │
│ │       │ 10 PM ▼│      │  7 AM ▼│                       │ │
│ │       └────────┘      └────────┘                       │ │
│ │                                                         │ │
│ │ ☑ Include weekends                                     │ │
│ │ ☐ Always allow Critical notifications                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                                          [Save Preferences] │
└─────────────────────────────────────────────────────────────┘
```
 
---
 
## Database Schema
 
```sql
-- Alarm Rules Table
CREATE TABLE alarm_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  entity_type audit_entity NOT NULL,
  condition_field TEXT NOT NULL,
  condition_operator TEXT NOT NULL, -- 'days_before', 'days_after', 'equals', 'greater_than', 'less_than'
  condition_value INTEGER NOT NULL,
  additional_filter JSONB DEFAULT '{}', -- Additional WHERE conditions
 
  -- Timing
  timing_sequence INTEGER[] DEFAULT ARRAY[14, 7, 5, 3, 2, 1, 0, -1], -- Days before deadline
 
  -- Channels
  channels TEXT[] DEFAULT ARRAY['in_app'],
  sound_file TEXT,
  sound_volume INTEGER DEFAULT 75,
  sound_repeat_count INTEGER DEFAULT 1,
  sound_repeat_interval INTEGER DEFAULT 30,
  email_frequency TEXT DEFAULT 'immediate', -- 'immediate', 'daily', 'weekly'
 
  -- Recipients
  notify_owner BOOLEAN DEFAULT true,
  notify_team BOOLEAN DEFAULT true,
  notify_roles profile_role[] DEFAULT '{}',
  additional_recipients TEXT[] DEFAULT '{}',
 
  -- Severity & Escalation
  base_severity notification_severity DEFAULT 'warn',
  escalate_to_critical_days INTEGER DEFAULT 3,
  escalation_levels JSONB DEFAULT '[]', -- [{hours: 4, role: 'pm'}, {hours: 24, role: 'dept_head'}]
  ack_required BOOLEAN DEFAULT false,
 
  -- Template
  message_subject TEXT NOT NULL,
  message_body TEXT NOT NULL,
 
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_by_profile_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
 
-- Notification Queue (pending delivery)
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alarm_rule_id UUID REFERENCES alarm_rules(id),
  notification_id UUID REFERENCES notifications(id),
  channel TEXT NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
 
-- User Notification Preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) UNIQUE,
 
  -- Sound
  sound_enabled BOOLEAN DEFAULT true,
  sound_volume INTEGER DEFAULT 75,
  sound_info TEXT DEFAULT 'alert-gentle.mp3',
  sound_warn TEXT DEFAULT 'alert-urgent.mp3',
  sound_critical TEXT DEFAULT 'alert-critical.mp3',
 
  -- Email
  email_enabled BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'immediate_critical',
  email_address TEXT,
 
  -- Quiet Hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  quiet_hours_weekends BOOLEAN DEFAULT true,
  quiet_hours_allow_critical BOOLEAN DEFAULT true,
 
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
 
-- Snooze Records
CREATE TABLE notification_snoozes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id),
  snoozed_by_profile_id UUID REFERENCES profiles(id),
  snoozed_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
 
-- Escalation Log
CREATE TABLE escalation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id),
  from_level INTEGER NOT NULL,
  to_level INTEGER NOT NULL,
  escalated_to_profile_id UUID REFERENCES profiles(id),
  escalated_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT -- 'no_ack', 'overdue', 'manual'
);
```
 
---
 
## API Endpoints
 
```typescript
// Alarm Rules
GET    /api/alarm-rules              // List all rules
POST   /api/alarm-rules              // Create rule
GET    /api/alarm-rules/:id          // Get rule details
PATCH  /api/alarm-rules/:id          // Update rule
DELETE /api/alarm-rules/:id          // Delete rule
POST   /api/alarm-rules/:id/test     // Test rule (send test notification)
 
// Notifications
GET    /api/notifications            // List user's notifications
POST   /api/notifications/:id/ack    // Acknowledge notification
POST   /api/notifications/:id/read   // Mark as read
POST   /api/notifications/:id/snooze // Snooze notification
GET    /api/notifications/count      // Get unread/critical counts
 
// Preferences
GET    /api/notification-preferences      // Get user preferences
PATCH  /api/notification-preferences      // Update preferences
POST   /api/notification-preferences/test // Test sound/email
```
 
---
 
## Cron Jobs (pg_cron)
 
```sql
-- Run every 5 minutes: Check for deadline-based triggers
SELECT cron.schedule('deadline-scanner', '*/5 * * * *', $$
  SELECT process_deadline_triggers();
$$);
 
-- Run every hour: Process escalations
SELECT cron.schedule('escalation-processor', '0 * * * *', $$
  SELECT process_escalations();
$$);
 
-- Run daily at 9 AM: Send daily digest emails
SELECT cron.schedule('daily-digest', '0 9 * * *', $$
  SELECT send_daily_digest();
$$);
 
-- Run every minute: Process notification queue
SELECT cron.schedule('notification-sender', '* * * * *', $$
  SELECT process_notification_queue();
$$);
```
 
---
 
## Integration Points
 
### Workflow Engine Integration
- Alarm rules can trigger workflow transitions
- Workflow actions can create notifications
- Escalations can trigger approval workflows
 
### RAG System Integration
- Search notifications by content
- AI-generated notification summaries
- Context-aware snooze suggestions
 
### Audit Log Integration
- All notification actions logged
- Escalation history tracked
- Acknowledgment audit trail