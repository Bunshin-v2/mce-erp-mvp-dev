# MCE Command Center - Master Specification v2.0
 
## Executive Summary
 
**MCE Command Center** is an enterprise-grade ERP/CRM/PSA system designed for Morgan Consulting Engineers LLC (MCE), an Architectural Design & Construction Supervision Consultant Engineering services company. This specification defines a production-ready, multi-agent orchestration platform with deterministic workflows, advanced RAG capabilities, and comprehensive liability monitoring.
 
---
 
## Table of Contents
 
1. [Tech Stack](#tech-stack)
2. [Core Modules](#core-modules)
3. [Database Schema](#database-schema)
4. [Workflow Engine](#workflow-engine)
5. [Alarm/Notification Engine](#alarmnotification-engine)
6. [RAG System Architecture](#rag-system-architecture)
7. [Multi-Agent Orchestration](#multi-agent-orchestration)
8. [UI/UX Component Specifications](#uiux-component-specifications)
9. [Security & OWASP Compliance](#security--owasp-compliance)
10. [RBAC Permissions Matrix](#rbac-permissions-matrix)
11. [API Specifications](#api-specifications)
12. [Deployment & Operations](#deployment--operations)
 
---
 
## Tech Stack
 
### Core Platform
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15+ (App Router) | Server-side rendering, React 19 |
| **Language** | TypeScript 5.x | Type-safe development |
| **Database** | Supabase (PostgreSQL 15+) | ACID transactions, RLS, JSONB |
| **Auth** | Clerk | Identity, SSO, MFA, org management |
| **Storage** | Supabase Storage | S3-compatible document storage |
| **Styling** | Tailwind CSS + shadcn/ui | Consistent design system |
| **Deployment** | Vercel | Edge functions, automatic scaling |
 
### AI/RAG Stack
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **LLM Primary** | Gemini 2.5 Pro | Document extraction, reasoning |
| **LLM Fallback** | Claude 3.5 Sonnet | Complex analysis backup |
| **Embeddings** | text-embedding-3-large | 3072-dim semantic vectors |
| **Vector Store** | Supabase pgvector | Native Postgres integration |
| **Chunking** | LangChain RecursiveCharacter | Front-matter optimized |
| **Orchestration** | LangGraph | Multi-agent state machines |
 
### Workflow & Real-time
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Workflow Engine** | XState v5 | Deterministic state machines |
| **Real-time** | Supabase Realtime | WebSocket subscriptions |
| **Scheduling** | pg_cron + Supabase Edge | Time-based triggers |
| **Queue** | Supabase pg_net | Async job processing |
 
---
 
## Core Modules
 
### 1. Project Management Module
```
┌─────────────────────────────────────────────────────────────┐
│                    PROJECT LIFECYCLE                        │
├─────────────────────────────────────────────────────────────┤
│  AWARD → DESIGN → SUPERVISION → DLP → CLOSURE              │
│    │        │          │          │        │                │
│    ▼        ▼          ▼          ▼        ▼                │
│ Contract  Prelim    Foundation  Warranty  Final             │
│ Signing   Design    Supervision Period    Report            │
└─────────────────────────────────────────────────────────────┘
```
 
**Entities:**
- Projects (master record)
- Project Phases (award, design, supervision, dlp, closed)
- Milestones (deliverables within phases)
- Project Members (team assignments)
- Project Documents (versioned files)
 
### 2. Client/CRM Module
```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT JOURNEY                            │
├─────────────────────────────────────────────────────────────┤
│  PROSPECT → TENDER → NEGOTIATION → CLIENT → REPEAT          │
│      │         │          │           │         │            │
│      ▼         ▼          ▼           ▼         ▼            │
│   Initial   Bid Prep   Contract    Delivery   Loyalty       │
│   Contact   Submit     Review      Execution  Program       │
└─────────────────────────────────────────────────────────────┘
```
 
**Entities:**
- Clients (master data)
- Contacts (individuals at client orgs)
- Interactions (calls, meetings, emails)
- Opportunities (potential projects)
 
### 3. Tender/Bid Management Module
```
┌─────────────────────────────────────────────────────────────┐
│                    TENDER WORKFLOW                           │
├─────────────────────────────────────────────────────────────┤
│  NEW → REVIEW → PREPARE → SUBMIT → AWAIT → AWARDED/LOST    │
│   │      │        │         │        │          │            │
│   ▼      ▼        ▼         ▼        ▼          ▼            │
│ Ingest  Assess  Compile   Send    Track     Convert         │
│ RFP     Go/NoGo  Docs     Bid     Status    to Project      │
└─────────────────────────────────────────────────────────────┘
```
 
**Entities:**
- Tenders (bid records)
- Tender Requirements (checklist items)
- Tender Documents (RFP, response docs)
- Tender Communications (interaction log)
- Tender Team (assigned personnel)
 
### 4. Contract/Financial Module
```
┌─────────────────────────────────────────────────────────────┐
│                  PAYMENT MILESTONE FLOW                      │
├─────────────────────────────────────────────────────────────┤
│  MOBILIZATION(5%) → DESIGN(35%) → SUPERVISION(35%) → FINAL(25%)│
│        │                │              │               │      │
│        ▼                ▼              ▼               ▼      │
│    Contract          Prelim(15%)   Progress(10%x2)  Retention │
│    Signed            Final(20%)    Substantial(10%)  Release  │
└─────────────────────────────────────────────────────────────┘
```
 
**Entities:**
- Contracts (master agreement)
- Payment Milestones (scheduled payments)
- Invoices (generated from milestones)
- Payment Receipts (actual payments)
 
### 5. Document Management Module
```
┌─────────────────────────────────────────────────────────────┐
│                  DOCUMENT LIFECYCLE                          │
├─────────────────────────────────────────────────────────────┤
│  UPLOAD → EXTRACT → CHUNK → EMBED → INDEX → RETRIEVE        │
│     │        │        │       │       │         │            │
│     ▼        ▼        ▼       ▼       ▼         ▼            │
│  Storage  Gemini   Front-   Vector  Search   RAG Query       │
│  Bucket   2.5 OCR  matter   Store   Index    Response        │
└─────────────────────────────────────────────────────────────┘
```
 
**Entities:**
- Documents (metadata records)
- Document Versions (version history)
- Document Chunks (RAG segments)
- Extraction Jobs (AI processing queue)
 
### 6. Liability Tracking Module
```
┌─────────────────────────────────────────────────────────────┐
│                  LIABILITY TIMELINE                          │
├─────────────────────────────────────────────────────────────┤
│  PROJECT START → COMPLETION → DLP START → DLP END           │
│       │              │            │           │              │
│       ▼              ▼            ▼           ▼              │
│   Professional    Substantial   Defects    Warranty         │
│   Insurance       Completion    Period     Release          │
│   (Active)        Certificate   (12-24mo)  (Clear)          │
└─────────────────────────────────────────────────────────────┘
```
 
**Entities:**
- Liability Periods (warranty tracking)
- Insurance Policies (PI, PL coverage)
- Risk Registers (identified risks)
- Compliance Items (regulatory requirements)
 
---
 
## Database Schema
 
### Enhanced Entity-Relationship Diagram
 
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │────<│project_members│>────│   projects   │
│              │     └──────────────┘     │              │
│ clerk_user_id│                          │ code, name   │
│ role         │     ┌──────────────┐     │ stage        │
│ department   │────<│tender_members │>────│ pm_profile_id│
└──────────────┘     └──────────────┘     └──────┬───────┘
       │                                         │
       │                                         │
       ▼                                         ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   tenders    │────>│   clients    │<────│ project_     │
│              │     │              │     │ milestones   │
│ deadline_at  │     │ name         │     │ due_date     │
│ status       │     │ classification│    │ status       │
│ owner_id     │     └──────────────┘     │ payment_pct  │
└──────┬───────┘                          └──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│tender_comms  │     │  documents   │────>│ doc_chunks   │
│              │     │              │     │              │
│ channel      │     │ storage_path │     │ embedding    │
│ outcome      │     │ sensitivity  │     │ content      │
│ occurred_at  │     │ version_num  │     │ metadata     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ audit_log    │     │extraction_   │     │notifications │
│              │     │jobs          │     │              │
│ action       │     │ status       │     │ severity     │
│ entity_type  │     │ result_json  │     │ ack_required │
│ metadata     │     │ error_msg    │     │ escalated_at │
└──────────────┘     └──────────────┘     └──────────────┘
```
 
### New Tables for Workflow Engine
 
```sql
-- Workflow Definitions (versioned JSON schemas)
CREATE TABLE workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  trigger_type trigger_type NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  state_machine JSONB NOT NULL, -- XState machine definition
  is_active BOOLEAN DEFAULT true,
  created_by_profile_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, version)
);
 
-- Workflow Instances (running executions)
CREATE TABLE workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id UUID REFERENCES workflow_definitions(id),
  entity_type audit_entity NOT NULL,
  entity_id UUID NOT NULL,
  current_state TEXT NOT NULL DEFAULT 'initial',
  context JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_by_profile_id UUID REFERENCES profiles(id)
);
 
-- Workflow Event Log (append-only state transitions)
CREATE TABLE workflow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES workflow_instances(id),
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT now(),
  actor_profile_id UUID REFERENCES profiles(id)
);
 
-- Scheduled Triggers (cron-based)
CREATE TABLE scheduled_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_definition_id UUID REFERENCES workflow_definitions(id),
  cron_expression TEXT NOT NULL,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
 
-- Alarm Rules (notification triggers)
CREATE TABLE alarm_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  entity_type audit_entity NOT NULL,
  condition_field TEXT NOT NULL, -- e.g., 'deadline_at', 'due_date'
  condition_operator TEXT NOT NULL, -- 'days_before', 'days_after', 'equals'
  condition_value INTEGER NOT NULL, -- e.g., 14, 7, 3, 1
  notification_template TEXT NOT NULL,
  severity notification_severity DEFAULT 'warn',
  sound_file TEXT, -- optional custom sound
  recipients_role profile_role[], -- roles to notify
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
 
-- Trigger Type Enum
CREATE TYPE trigger_type AS ENUM (
  'event',           -- On entity state change
  'threshold',       -- When value crosses limit
  'time_based',      -- Cron schedule
  'deadline',        -- Before/after due date
  'payment_due',     -- Payment milestone approaching
  'action_due'       -- Required action pending
);
```
 
### RAG-Specific Tables
 
```sql
-- Document Chunks with Embeddings
CREATE TABLE doc_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_tokens INTEGER,
  embedding vector(3072), -- OpenAI text-embedding-3-large
  front_matter JSONB DEFAULT '{}', -- Extracted metadata
  chunk_type TEXT DEFAULT 'body', -- 'header', 'body', 'table', 'list'
  parent_chunk_id UUID REFERENCES doc_chunks(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
 
-- Vector similarity index
CREATE INDEX idx_doc_chunks_embedding
  ON doc_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
 
-- RAG Query Log (for evaluation)
CREATE TABLE rag_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  query_embedding vector(3072),
  retrieved_chunk_ids UUID[],
  relevance_scores FLOAT[],
  llm_response TEXT,
  response_tokens INTEGER,
  latency_ms INTEGER,
  user_feedback INTEGER, -- 1-5 rating
  queried_by_profile_id UUID REFERENCES profiles(id),
  queried_at TIMESTAMPTZ DEFAULT now()
);
```
 
---
 
## Workflow Engine
 
### Trigger Types
 
| Trigger Type | Description | Example |
|-------------|-------------|---------|
| **Event** | Fires on entity state change | Project status → 'completed' |
| **Threshold** | Fires when value crosses limit | Progress > 90% |
| **Time-Based** | Cron-scheduled execution | Every Monday 9 AM |
| **Deadline** | Relative to due date | 14 days before tender deadline |
| **Payment Due** | Payment milestone approaching | 7 days before payment due |
| **Action Due** | Required action pending | Approval needed within 3 days |
 
### Default Alarm Timing Schedule
 
```
DEADLINE COUNTDOWN SEQUENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Day -14  │ INFO    │ "Tender deadline in 2 weeks"
Day -7   │ WARN    │ "Tender deadline in 1 week"
Day -5   │ WARN    │ "Tender deadline in 5 days"
Day -3   │ CRITICAL│ "Tender deadline in 3 days" + Sound
Day -2   │ CRITICAL│ "Tender deadline in 2 days" + Sound
Day -1   │ CRITICAL│ "Tender deadline TOMORROW" + Sound + Email
Day 0    │ CRITICAL│ "Tender deadline TODAY" + Sound + Email + Escalate
Day +1   │ CRITICAL│ "Tender OVERDUE by 1 day" + Escalate to Manager
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
 
### Workflow State Machine Example
 
```typescript
// Tender Submission Workflow
const tenderWorkflow = {
  id: 'tender-submission',
  version: 1,
  initial: 'new',
  context: {
    tenderId: null,
    deadline: null,
    assignedTeam: [],
    documents: [],
    approvals: []
  },
  states: {
    new: {
      on: {
        ASSIGN_TEAM: { target: 'in_review', actions: 'notifyTeam' },
        REJECT: { target: 'declined', actions: 'logDecision' }
      }
    },
    in_review: {
      on: {
        START_PREPARATION: { target: 'preparing', guard: 'hasTeamAssigned' },
        REJECT: { target: 'declined' }
      }
    },
    preparing: {
      on: {
        SUBMIT_FOR_APPROVAL: { target: 'pending_approval', guard: 'hasRequiredDocs' },
        REQUEST_EXTENSION: { target: 'awaiting_extension' }
      }
    },
    pending_approval: {
      on: {
        APPROVE: { target: 'approved', guard: 'hasManagerApproval' },
        REQUEST_CHANGES: { target: 'preparing' }
      }
    },
    approved: {
      on: {
        SUBMIT: { target: 'submitted', actions: 'recordSubmission' }
      }
    },
    submitted: {
      on: {
        AWARD: { target: 'awarded', actions: 'createProject' },
        LOSE: { target: 'lost', actions: 'logLessonsLearned' }
      }
    },
    awarded: { type: 'final' },
    lost: { type: 'final' },
    declined: { type: 'final' }
  }
};
```
 
---
 
## Alarm/Notification Engine
 
### Notification Channels
 
| Channel | Trigger Condition | Configuration |
|---------|------------------|---------------|
| **In-App Popup** | All notifications | Always enabled |
| **Sound Alert** | severity >= 'warn' | Customizable sound files |
| **Email** | severity = 'critical' OR user preference | SMTP/Resend integration |
| **SMS** | Escalation only | Twilio integration |
| **Slack/Teams** | Organization preference | Webhook integration |
 
### Alarm Rule Configuration UI
 
```
┌─────────────────────────────────────────────────────────────┐
│                    ALARM RULE EDITOR                        │
├─────────────────────────────────────────────────────────────┤
│ Rule Name: [Tender Deadline Warning____________]            │
│                                                             │
│ Entity Type: [▼ Tender_______]  Field: [▼ deadline_at___]  │
│                                                             │
│ Trigger When: [▼ Days Before_] Value: [14]                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ TIMING SEQUENCE (check all that apply)                  ││
│ │ ☑ 14 days  ☑ 7 days  ☑ 5 days  ☑ 3 days               ││
│ │ ☑ 2 days   ☑ 1 day   ☑ Same day ☑ Overdue             ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Notification Options:                                       │
│ ☑ In-App Popup    ☑ Sound Alert    ☐ Email    ☐ SMS       │
│                                                             │
│ Sound: [▼ alert-urgent.mp3___] [▶ Preview]                 │
│                                                             │
│ Recipients:                                                 │
│ ☑ Tender Owner  ☑ Tender Team  ☐ Department Head          │
│ ☐ All Admins    ☐ Custom: [____________________________]  │
│                                                             │
│ Message Template:                                           │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Tender "{{tender.reference}}" deadline in {{days}} days ││
│ │ Client: {{tender.client.name}}                          ││
│ │ Value: {{tender.value_amount}} {{tender.value_currency}}││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Severity: ○ Info  ● Warning  ○ Critical                    │
│                                                             │
│ [Cancel]                              [Save Rule] [Test]   │
└─────────────────────────────────────────────────────────────┘
```
 
### Escalation Matrix
 
```
ESCALATION LEVELS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Level 0  │ Assigned User      │ Immediate notification
Level 1  │ Team Lead/PM       │ After 4 hours no ack
Level 2  │ Department Head    │ After 24 hours no ack
Level 3  │ Chairman/VP        │ After 48 hours no ack
Level 4  │ Super Admin        │ After 72 hours no ack
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
 
---
 
## RAG System Architecture
 
### Document Processing Pipeline
 
```
┌─────────────────────────────────────────────────────────────┐
│                 DOCUMENT INGESTION PIPELINE                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  UPLOAD  │───>│  EXTRACT │───>│  PARSE   │              │
│  │          │    │  (OCR)   │    │  (NLP)   │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │              │               │                      │
│       ▼              ▼               ▼                      │
│  Storage      Gemini 2.5      Contract Parser              │
│  Bucket       Vision API      Agent                         │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  CHUNK   │───>│  EMBED   │───>│  INDEX   │              │
│  │          │    │          │    │          │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │              │               │                      │
│       ▼              ▼               ▼                      │
│  Front-matter   text-embed-    pgvector                    │
│  Optimized      3-large        ivfflat                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
 
### Front-Matter Optimized Chunking
 
```typescript
interface ChunkMetadata {
  // Document-level front matter
  documentId: string;
  documentTitle: string;
  documentType: 'contract' | 'tender' | 'drawing' | 'report' | 'correspondence';
  projectCode?: string;
  clientName?: string;
 
  // Chunk-level metadata
  chunkIndex: number;
  chunkType: 'header' | 'clause' | 'table' | 'appendix' | 'signature';
  sectionPath: string[]; // ["1. General", "1.2 Scope", "1.2.1 Design Services"]
  pageNumbers: number[];
 
  // Semantic enrichment
  entities: {
    dates: string[];
    amounts: { value: number; currency: string }[];
    parties: string[];
    references: string[];
  };
 
  // Relationship context
  parentChunkId?: string;
  siblingChunkIds: string[];
  referencedChunkIds: string[];
}
```
 
### RAG Query Flow
 
```
USER QUERY: "What are the payment terms for Al Wasl Tower project?"
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. QUERY UNDERSTANDING (Gemini 2.5)                         │
│    - Extract entities: project="Al Wasl Tower"              │
│    - Identify intent: payment_terms_lookup                  │
│    - Generate search queries                                │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. HYBRID RETRIEVAL                                         │
│    - Vector search: embed query, cosine similarity          │
│    - Keyword search: FTS on project name                    │
│    - Metadata filter: project_code = 'AWT-2024'            │
│    - Rerank top-k results                                   │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CONTEXT ASSEMBLY                                         │
│    - Retrieve parent/sibling chunks                         │
│    - Include front-matter metadata                          │
│    - Order by relevance + document structure                │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. RESPONSE GENERATION (Gemini 2.5)                         │
│    - System prompt: MCE domain expert                       │
│    - Include source citations                               │
│    - Format as structured response                          │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
RESPONSE: "The Al Wasl Tower project (AWT-2024) has the following
payment terms per Contract Section 4.2:
- Mobilization: 5% upon contract signing
- Design: 35% (15% preliminary, 20% final)
- Supervision: 35% (progress payments)
- Final: 25% upon substantial completion
 
Source: [AWT-2024-Contract.pdf, Page 12-14]"
```
 
---
 
## Multi-Agent Orchestration
 
### Agent Roles
 
| Agent | Responsibility | Capabilities |
|-------|---------------|--------------|
| **Contract Parser** | Extract contract data | OCR, NLP, entity extraction |
| **Schema Mapper** | Convert to system format | JSON transformation, validation |
| **Workflow Generator** | Create task dependencies | Critical path analysis |
| **Compliance Monitor** | Track deadlines/obligations | Rule evaluation, alerting |
| **Dashboard Generator** | Produce reports | Chart generation, PDF export |
| **Risk Analyst** | Identify liability exposure | Risk scoring, trend analysis |
| **QA Agent** | Validate data integrity | Schema validation, anomaly detection |
| **Communication Agent** | Draft correspondence | Template population, review |
 
### Agent Orchestration Flow
 
```
┌─────────────────────────────────────────────────────────────┐
│              MULTI-AGENT ORCHESTRATION                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐                                            │
│  │ SUPERVISOR  │ ◄─── Gemini 2.5 Pro                        │
│  │   AGENT     │      (Orchestration decisions)             │
│  └──────┬──────┘                                            │
│         │                                                   │
│         ├──────────┬──────────┬──────────┬─────────┐       │
│         ▼          ▼          ▼          ▼         ▼       │
│  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐┌──────────┐
│  │ Contract ││ Schema   ││ Workflow ││Compliance││  Risk    │
│  │ Parser   ││ Mapper   ││Generator ││ Monitor  ││ Analyst  │
│  └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘
│       │           │           │           │           │     │
│       ▼           ▼           ▼           ▼           ▼     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    SHARED STATE                         ││
│  │  - Document chunks    - Extracted entities              ││
│  │  - Workflow context   - Alert queue                     ││
│  │  - Risk assessments   - Compliance status               ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
 
---
 
*Continued in SPEC_PART2.md...*