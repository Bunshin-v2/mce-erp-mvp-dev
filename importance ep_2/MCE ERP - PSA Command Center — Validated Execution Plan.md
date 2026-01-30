# MCE ERP/PSA Command Center — Validated Execution Plan

**Version:** 2.0 (Validated & Enhanced)  
**Date:** January 18, 2026  
**Classification:** Internal — Strategic Execution  
**Owner:** Moe (Compliance Manager, Strategic Ops)

---

## EXECUTIVE VALIDATION SUMMARY

### ✅ Architecture Validation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Stack Selection (Next.js + Clerk + Supabase) | ✅ VALIDATED | Aligns with "safe-by-default, upgradeable" principle |
| RLS-First Security Model | ✅ CRITICAL | Must implement Day-1, not later |
| Data Model (22 MongoDB → Supabase Postgres) | ⚠️ REFINEMENT | Migrate to Supabase Postgres for RLS compatibility |
| UI/UX Design (6 mockups reviewed) | ✅ VALIDATED | Dashboard, Projects, Tenders, Documents views complete |
| Workflow Engine | ✅ VALIDATED | Temporal.io patterns are production-ready |
| Agent Mesh (15-agent orchestration) | ⏸️ PHASE 2 | Focus Day-1 on core CRUD, defer AI orchestration |

### Critical Decision: Stack Confirmation

Based on your documents, the **recommended stack** is:

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: Next.js 14+ (App Router) + TypeScript + Tailwind    │
│  AUTH: Clerk (JWT claims → Supabase RLS)                       │
│  DATABASE: Supabase Postgres (with RLS Day-1)                  │
│  STORAGE: Supabase Storage (signed URLs for secure docs)       │
│  DEPLOYMENT: Vercel (with async patterns for long jobs)        │
│  UI COMPONENTS: shadcn/ui                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## PART 1: DAY-1 MVP SCOPE (Validated)

### P0 Features — Non-Negotiable for Launch

Based on your `Requirements_Checklist` and workflow documents:

#### 1. Tender Tracker
- **CRUD Operations:** Create, Read, Update, Delete tenders
- **Fields:** Client, Ref, Title, Deadline, Owner, Value, Status, Currency
- **Countdown Logic:** T-14 / T-7 / T-3 / T-1 / Day-of thresholds
- **Follow-up Scheduler:** `next_followup_at` field with UI controls
- **Comms Log:** `tender_comms_events` table for traceability

#### 2. Project Tracker
- **CRUD Operations:** Full project lifecycle
- **Fields:** Code, Name, PM, Stage, Dates, Progress %, Tags, Status
- **Milestones Panel:** Next 10 milestones with T-x countdown
- **Document Linking:** Per-project document associations

#### 3. Document Management
- **Upload to Supabase Storage:** Signed URLs (time-limited access)
- **Metadata Tracking:** Type, Sensitivity, Linked Entity
- **Per-Project Folder Scaffolding:** Auto-create folder structure

#### 4. Notifications & Acknowledgements
- **In-App Alerts:** Critical/Warning/Info levels
- **Acknowledgement Workflow:** `ack_required`, `ack_at`, `ack_by`
- **Escalation Flags:** Visual indicators for unacked critical items

#### 5. Security/RBAC (Day-1 Minimal)
- **Roles:** Super Admin, Chairman/VP, Dept Head, PM, Engineer, Finance, Viewer
- **RLS Policies:** Enforced at database layer from Day-1
- **Clerk JWT Integration:** Role claims passed to Supabase

#### 6. Search & Export
- **Global Search:** Projects, Tenders, Documents
- **CSV Export:** Projects list, Tenders list

---

## PART 2: DATABASE SCHEMA (Supabase Postgres + RLS)

### Core Tables for Day-1

```sql
-- =====================================================
-- MCE ERP/PSA: Day-1 Schema with RLS
-- =====================================================

-- Enable RLS on all tables
ALTER DATABASE postgres SET "app.jwt_claim_role" = 'viewer';

-- ORGANIZATIONS (Clients)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('client', 'vendor', 'consultant')),
    contacts JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    client_org_id UUID REFERENCES organizations(id),
    pm_user_id TEXT NOT NULL, -- Clerk user ID
    stage TEXT CHECK (stage IN ('assessment', 'design', 'tender', 'supervision', 'closeout')),
    status TEXT CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')) DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    dlp_end_date DATE,
    progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- PROJECT MILESTONES
CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    achieved_date DATE,
    status TEXT CHECK (status IN ('pending', 'achieved', 'missed')) DEFAULT 'pending',
    owner_user_id TEXT NOT NULL, -- Clerk user ID
    evidence_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TENDERS
CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref TEXT UNIQUE NOT NULL,
    title TEXT,
    client_org_id UUID REFERENCES organizations(id),
    project_id UUID REFERENCES projects(id),
    deadline TIMESTAMPTZ NOT NULL,
    value_amount DECIMAL(15,2),
    value_currency TEXT DEFAULT 'AED',
    status TEXT CHECK (status IN ('new', 'active', 'drafting', 'in_review', 'submitted', 'won', 'lost', 'cancelled')) DEFAULT 'new',
    owner_user_id TEXT NOT NULL, -- Clerk user ID
    next_followup_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- TENDER COMMUNICATIONS LOG
CREATE TABLE tender_comms_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    event_type TEXT CHECK (event_type IN ('email', 'call', 'meeting', 'site_visit', 'other')),
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    with_party TEXT,
    outcome TEXT,
    notes TEXT,
    event_at TIMESTAMPTZ DEFAULT now(),
    logged_by_user_id TEXT NOT NULL, -- Clerk user ID
    created_at TIMESTAMPTZ DEFAULT now()
);

-- DOCUMENTS
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    doc_type TEXT CHECK (doc_type IN ('tender_pack', 'contract', 'proposal', 'loa', 'drawing', 'submittal', 'rfi', 'ncr', 'wir', 'mom', 'other')),
    file_path TEXT NOT NULL, -- Supabase Storage path
    file_size_bytes BIGINT,
    mime_type TEXT,
    sensitivity TEXT CHECK (sensitivity IN ('public', 'internal', 'confidential', 'restricted')) DEFAULT 'internal',
    linked_project_id UUID REFERENCES projects(id),
    linked_tender_id UUID REFERENCES tenders(id),
    uploaded_by_user_id TEXT NOT NULL, -- Clerk user ID
    version_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    message TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    related_entity_type TEXT,
    related_entity_id UUID,
    ack_required BOOLEAN DEFAULT FALSE,
    ack_at TIMESTAMPTZ,
    ack_by_user_id TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AUDIT LOG (Immutable)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id TEXT NOT NULL, -- Clerk user ID
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    changes JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- USER PROFILES (synced from Clerk)
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY, -- Clerk user ID
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('super_admin', 'chairman', 'vp', 'dept_head', 'pm', 'engineer', 'finance', 'viewer')) DEFAULT 'viewer',
    department TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_comms_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claims', true)::json->>'role',
        'viewer'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's ID
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('request.jwt.claims', true)::json->>'sub';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROJECTS: All authenticated users can view, PM+ can edit
CREATE POLICY "projects_select" ON projects FOR SELECT USING (TRUE);
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (
    get_user_role() IN ('super_admin', 'chairman', 'vp', 'dept_head', 'pm')
);
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (
    get_user_role() IN ('super_admin', 'chairman', 'vp', 'dept_head', 'pm')
    OR pm_user_id = get_user_id()
);
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (
    get_user_role() IN ('super_admin', 'chairman')
);

-- TENDERS: Similar pattern
CREATE POLICY "tenders_select" ON tenders FOR SELECT USING (TRUE);
CREATE POLICY "tenders_insert" ON tenders FOR INSERT WITH CHECK (
    get_user_role() IN ('super_admin', 'chairman', 'vp', 'dept_head', 'pm')
);
CREATE POLICY "tenders_update" ON tenders FOR UPDATE USING (
    get_user_role() IN ('super_admin', 'chairman', 'vp', 'dept_head', 'pm')
    OR owner_user_id = get_user_id()
);

-- NOTIFICATIONS: Users can only see their own
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (
    user_id = get_user_id()
);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (
    user_id = get_user_id()
);

-- AUDIT LOG: Read-only for admins, append-only for system
CREATE POLICY "audit_log_select" ON audit_log FOR SELECT USING (
    get_user_role() IN ('super_admin', 'chairman')
);
CREATE POLICY "audit_log_insert" ON audit_log FOR INSERT WITH CHECK (TRUE);

-- DOCUMENTS: Based on linked entity access + sensitivity
CREATE POLICY "documents_select" ON documents FOR SELECT USING (
    sensitivity IN ('public', 'internal')
    OR get_user_role() IN ('super_admin', 'chairman', 'vp', 'dept_head')
    OR uploaded_by_user_id = get_user_id()
);
```

---

## PART 3: DASHBOARD SPECIFICATIONS (From Mockups)

### Dashboard View (Image 3 - Main Dashboard)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MCE COMMAND CENTER                                    🔔 + New    John S  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────────┐   │
│  │ Due 14d │ │ Due 7d  │ │ Due 3d  │ │ Due     │ │ Critical Unacked    │   │
│  │   12    │ │    6    │ │    2    │ │ Today 4 │ │         2           │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────┐ ┌────────────────────────────────┐   │
│  │ TENDERS DUE SOON                 │ │ UPCOMING MILESTONES (Next 10)  │   │
│  │ [14d] [7d] [3d] [Today]          │ │                                │   │
│  │ ┌───────────────────────────┐    │ │ ○ Foundation complete MCE-010  │   │
│  │ │ TND-2026-011 | In Review  │    │ │ ○ HVAC approval    MCE-014     │   │
│  │ │ Al Noor Mall | Sara [T-3] │    │ │ ○ Client follow-up TND-02-11   │   │
│  │ └───────────────────────────┘    │ │                                │   │
│  └──────────────────────────────────┘ └────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────┐ ┌────────────────────────────────┐   │
│  │ FOLLOW-UPS DUE                   │ │ NOTIFICATIONS & ACKS           │   │
│  │ TND-2026-011 | Last: 2026-18    │ │ ● Critical: Deadline missed    │   │
│  │ [Log Outcome] [Reschedule]       │ │   TND-2026-003 | 1h ago        │   │
│  │ Project Alpha | Last: 2026-15   │ │ ● Warning: Budget variance     │   │
│  │ [Log Outcome] [Reschedule]       │ │   [Acknowledge] | 3h ago       │   │
│  └──────────────────────────────────┘ └────────────────────────────────┘   │
│                                                                              │
│  [Audit trail enabled]                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Dashboard Actions (Day-1)

| Button | Action | Endpoint |
|--------|--------|----------|
| + New Tender | Opens tender creation modal | `POST /api/tenders` |
| + New Project | Opens project creation modal | `POST /api/projects` |
| Upload Document | Opens file upload dialog | `POST /api/documents/upload` |
| Log Outcome | Logs comms event | `POST /api/tender-comms` |
| Reschedule | Updates follow-up date | `PATCH /api/tenders/:id` |
| Acknowledge | Marks notification acked | `PATCH /api/notifications/:id/ack` |
| Mark Complete | Completes milestone | `PATCH /api/milestones/:id` |

---

## PART 4: API ROUTES SPECIFICATION

### Next.js App Router API Structure

```
app/
├── api/
│   ├── auth/
│   │   └── webhook/
│   │       └── route.ts          # Clerk webhook → sync user_profiles
│   │
│   ├── projects/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts          # GET, PATCH, DELETE
│   │       └── milestones/
│   │           └── route.ts      # GET, POST milestones
│   │
│   ├── tenders/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts          # GET, PATCH, DELETE
│   │       └── comms/
│   │           └── route.ts      # GET, POST comms events
│   │
│   ├── documents/
│   │   ├── route.ts              # GET (list), POST metadata
│   │   ├── upload/
│   │   │   └── route.ts          # POST → Supabase Storage
│   │   └── [id]/
│   │       ├── route.ts          # GET, PATCH, DELETE
│   │       └── signed-url/
│   │           └── route.ts      # GET → generate signed URL
│   │
│   ├── notifications/
│   │   ├── route.ts              # GET (user's notifications)
│   │   └── [id]/
│   │       ├── route.ts          # GET, PATCH
│   │       └── ack/
│   │           └── route.ts      # POST → acknowledge
│   │
│   ├── organizations/
│   │   ├── route.ts              # GET, POST
│   │   └── [id]/
│   │       └── route.ts          # GET, PATCH, DELETE
│   │
│   └── search/
│       └── route.ts              # GET → global search
```

### Example API Implementation

```typescript
// app/api/tenders/route.ts
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  // Base query
  let query = supabase
    .from('tenders')
    .select(`
      *,
      client:organizations(id, name),
      project:projects(id, code, name)
    `)
    .order('deadline', { ascending: true })

  // Filter by status
  const status = searchParams.get('status')
  if (status) query = query.eq('status', status)

  // Filter by deadline threshold
  const dueIn = searchParams.get('due_in_days')
  if (dueIn) {
    const threshold = new Date()
    threshold.setDate(threshold.getDate() + parseInt(dueIn))
    query = query.lte('deadline', threshold.toISOString())
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tenders: data })
}

export async function POST(request: Request) {
  const { userId, sessionClaims } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('tenders')
    .insert({
      ...body,
      owner_user_id: userId,
      status: 'new'
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log audit event
  await supabase.from('audit_log').insert({
    actor_user_id: userId,
    action: 'CREATE',
    entity_type: 'tender',
    entity_id: data.id,
    changes: body
  })

  return NextResponse.json({ tender: data }, { status: 201 })
}
```

---

## PART 5: EXECUTION TIMELINE

### Week 1: Foundation

| Day | Deliverables |
|-----|--------------|
| Day 1-2 | Project setup: Next.js + Clerk + Supabase integration |
| Day 2-3 | Database schema: Run migration, verify RLS policies |
| Day 3-4 | Auth flow: Clerk webhook → user_profiles sync |
| Day 4-5 | Core API routes: Projects CRUD + Tenders CRUD |

### Week 2: Features

| Day | Deliverables |
|-----|--------------|
| Day 6-7 | Dashboard UI: KPI tiles, Tenders Due Soon, Follow-ups |
| Day 7-8 | Document upload: Supabase Storage + signed URLs |
| Day 8-9 | Notifications: In-app alerts + acknowledgement flow |
| Day 9-10 | Milestones panel + comms log |

### Week 3: Polish & Deploy

| Day | Deliverables |
|-----|--------------|
| Day 11-12 | Global search + CSV export |
| Day 12-13 | Role-based UI filtering |
| Day 13-14 | Vercel deployment + domain setup |
| Day 14 | User acceptance testing |

---

## PART 6: VERCEL DEPLOYMENT CONSTRAINTS

### Critical: Async Pattern for Tender Pack Processing

Your acceptance criteria specifies **<5 minutes for tender pack extraction**. Vercel has function timeout limits:

| Plan | Timeout |
|------|---------|
| Hobby | 10 seconds |
| Pro | 60 seconds |
| Enterprise | 900 seconds |

**Solution: Implement async job pattern from Day-1**

```typescript
// 1. Trigger extraction job (fast, returns immediately)
// app/api/tenders/[id]/extract/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  // Create extraction job record
  const { data: job } = await supabase
    .from('extraction_jobs')
    .insert({
      tender_id: params.id,
      status: 'pending'
    })
    .select()
    .single()

  // Trigger background process (e.g., via Supabase Edge Function or external worker)
  // This returns immediately
  await fetch(`${process.env.WORKER_URL}/extract`, {
    method: 'POST',
    body: JSON.stringify({ job_id: job.id, tender_id: params.id })
  })

  return NextResponse.json({ job_id: job.id, status: 'processing' })
}

// 2. Poll for status
// app/api/jobs/[id]/status/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('extraction_jobs')
    .select('*')
    .eq('id', params.id)
    .single()

  return NextResponse.json(data)
}
```

---

## PART 7: IMMEDIATE NEXT ACTIONS

### Action 1: Initialize Repository (Do Now)

```bash
# Create Next.js project with recommended settings
npx create-next-app@latest mce-command-center \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd mce-command-center

# Install dependencies
npm install @clerk/nextjs @supabase/supabase-js @supabase/ssr
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react clsx tailwind-merge
npm install date-fns zod react-hook-form

# Create Supabase project (via dashboard or CLI)
npx supabase init
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Action 2: Configure Environment

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

### Action 3: Run Database Migration

Copy the SQL schema from Part 2 above and execute in Supabase SQL Editor.

---

## PART 8: VALIDATION CHECKLIST

### Pre-Launch Gates

- [ ] **Security:** RLS enabled on ALL tables
- [ ] **Security:** No public write access to any table
- [ ] **Auth:** Clerk JWT claims include user role
- [ ] **Auth:** Supabase `auth.jwt()` policies verified
- [ ] **Data:** All required fields have validation
- [ ] **UX:** Countdown thresholds (T-14/7/3/1) display correctly
- [ ] **UX:** Critical notifications require acknowledgement
- [ ] **Audit:** All CRUD operations write to audit_log
- [ ] **Storage:** Documents use signed URLs (not public)
- [ ] **Export:** CSV export works for Projects and Tenders

---

## APPENDIX A: Component Library Reference

Use shadcn/ui components for consistency with your mockups:

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog dropdown-menu input table badge
npx shadcn@latest add tabs avatar separator command toast
```

---

## APPENDIX B: Type Definitions

```typescript
// types/database.ts
export type TenderStatus = 'new' | 'active' | 'drafting' | 'in_review' | 'submitted' | 'won' | 'lost' | 'cancelled'
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectStage = 'assessment' | 'design' | 'tender' | 'supervision' | 'closeout'
export type Sensitivity = 'public' | 'internal' | 'confidential' | 'restricted'
export type UserRole = 'super_admin' | 'chairman' | 'vp' | 'dept_head' | 'pm' | 'engineer' | 'finance' | 'viewer'

export interface Tender {
  id: string
  ref: string
  title: string | null
  client_org_id: string | null
  project_id: string | null
  deadline: string
  value_amount: number | null
  value_currency: string
  status: TenderStatus
  owner_user_id: string
  next_followup_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  code: string
  name: string
  client_org_id: string | null
  pm_user_id: string
  stage: ProjectStage
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  dlp_end_date: string | null
  progress_pct: number
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  related_entity_type: string | null
  related_entity_id: string | null
  ack_required: boolean
  ack_at: string | null
  ack_by_user_id: string | null
  read_at: string | null
  created_at: string
}
```

---

**END OF VALIDATED EXECUTION PLAN**

*This document synthesizes: System Architecture Blueprint v1.0, Expanded MVP Document Taxonomy, Two Realistic Workflows spec, Revised Template Recommendation, and 6 UI mockup screens.*
