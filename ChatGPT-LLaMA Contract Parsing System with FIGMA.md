# LLaMA Contract Parsing System

Goal + Success Metrics + Constraints
------------------------------------

**Goal:** A deterministic, auditable pipeline + open-source “plugin/service” that (1) parses tenders/contracts, (2) extracts and tags semantic metadata per section, (3) assigns reference codes to each variable, (4) stores variable-level context windows (≈200 words) plus a **15-word coded front-matter**, (5) powers a **hybrid RAG chatbot** (BM25 + vectors) integrated into your existing ERP (Supabase), and (6) triggers **HITL alerts** based on liability/threshold rules.

**Success metrics**

*   ≥95% of extracted variables have **evidence refs** (doc\_id + page/section + offsets) and pass “verifiability” gate.
*   Hybrid retrieval returns **top-5 relevant clauses** with citations in <2s on typical tenders/contracts.
*   Alerts fire correctly at **T-7/T-5/T-3/T-24h/T-12h/T-8h**, plus recurring nudges per severity, and require HITL acknowledgement.
*   No readability loss: users can open the **original section** + variable context instantly.

**Constraints**

*   Local LLaMA inference (no cloud dependency for LLM).
*   Supabase remains system-of-record (Postgres + Storage + RLS + audit trail).
*   Web browsing is unavailable in this environment; any “best plugin” claims must be validated in your repo selection step.

* * *

Checklist
---------

*    Define **taxonomy + variable dictionary** (codes, types, severity mapping, owners).
*    Implement ingestion pipeline: **parse → structure → chunk → extract JSON → context windows → embeddings → store**.
*    Implement **reference coding** + evidence links (page/offset + immutable IDs).
*    Implement **hybrid retrieval** (BM25/FTS + pgvector) + citations enforcement.
*    Implement **notification engine** + HITL UI + escalation routing.
*    Add **QA gates** (proxy-Quantus + contradiction checks + 3-iteration repair loop).
*    Package as an open-source “plugin” (tool endpoints) integrated into local chatbot UI + ERP.

* * *

Step 1 — Data model: variables, references, context windows, front-matter
-------------------------------------------------------------------------

### 1.1 Variable taxonomy (AEC tender/contract oriented)

Core families (examples; expand to your ~N variable types):

*   **Parties & scope:** employer/client, consultant, subcontractors, scope exclusions, deliverables list.
*   **Commercial:** fee, currency, payment schedule, retention %, VAT terms, milestone invoices.
*   **Time:** commencement, duration, submission deadlines, clarification windows, notice periods.
*   **Risk/Liability:** LDs, caps/limits, indemnities, insurance requirements, bonds/guarantees, warranties/DLP.
*   **Change & claims:** VO/variation procedure, claims timelines, EOT criteria, dispute resolution.
*   **Compliance (AEC):** permits responsibilities, HSE obligations, QA/QC, authority approvals, document control.

### 1.2 Reference code scheme (deterministic + sortable)

Use ULIDs for immutable IDs plus human-readable codes.

**Document ID**

*   `DOC_ULID` (primary)
*   `DOC_CODE` e.g., `RFQ-2026-0012` (human)

**Section ID**

*   `SEC_CODE` derived from structure: `S02.03` (chapter/heading index) or clause numbering `15.2.1`

**Variable code**

*   Format: `FAMILY.KEY.SUBKEY`, e.g.:
    *   `TIME.SUBMISSION.DEADLINE`
    *   `RISK.LD.DAILY_RATE`
    *   `COMM.PAYMENT.MILESTONE_1`
    *   `RISK.INSURANCE.PI_REQUIRED`

**Final reference**

*   `REF = {DOC_CODE}:{SEC_CODE}:{VAR_CODE}:{SEQ}`  
    Example: `RFQ-2026-0012:S02.03:RISK.LD.DAILY_RATE:0004`

### 1.3 “200-word context” + “15-word coded front-matter”

**Context window rule**

*   Locate best span (highest confidence mention) in normalized text.
*   Capture ~100 words before + ~100 words after (or nearest boundaries).
*   Store exact offsets: `start_char`, `end_char`, `start_token`, `end_token`.

**15-word coded front-matter (exactly 15 tokens)**  
A strict, index-friendly header that is **always 15 whitespace-separated tokens**:

1.  `DOC=RFQ-2026-0012`
2.  `SEC=S02.03`
3.  `VAR=RISK.LD.DAILY_RATE`
4.  `SEV=CRITICAL`
5.  `DUE=2026-02-10T17:00+04:00`
6.  `AMT=5000`
7.  `CUR=AED`
8.  `THR=LD`
9.  `OWN=LEGAL`
10.  `DEPT=QS`
11.  `ACT=HITL`
12.  `STA=OPEN`
13.  `EVD=Pg12Off1832`
14.  `SRC=ContractPDF`
15.  `HSH=bd91a3f2`

This front-matter becomes the **first line** of each stored “variable record” and is also stored as structured columns for filtering.

* * *

Step 2 — Systematic extraction process (SOP)
--------------------------------------------

### 2.1 Pipeline stages

1.  **Ingest**
    *   Upload file → Supabase Storage
    *   Create `ingestion_job` with checksum + uploader + project/tender ID
2.  **Parse & normalize**
    *   PDF: extract text + page mapping (+ tables)
    *   DOCX: extract paragraphs + styles + headings
    *   Normalize: fix hyphenation, whitespace, bullets; preserve page breaks
3.  **Structure reconstruction**
    *   Detect headings/clauses using:
        *   regex (e.g., `^\d+(\.\d+)*\s+`)
        *   font/size markers (DOCX)
        *   table-of-contents hints (if present)
    *   Output `sections[]` with `SEC_CODE`, `title`, `page_range`, offsets
4.  **Chunking**
    *   Primary chunk unit = **section/clause**
    *   Secondary chunk splits by token length (e.g., 600–1,000 tokens) while preserving readability
    *   Store chunk text exactly as rendered (no lossy transforms)
5.  **Variable extraction (LLM JSON)**
    *   For each chunk: ask LLaMA to emit strict JSON:
        *   variables detected
        *   confidence
        *   evidence span offsets
        *   due dates/amounts/parties
        *   suggested severity + owner dept
    *   Enforce schema validation (Zod/Pydantic). Invalid JSON → automatic repair pass.
6.  **Context window + front-matter**
    *   Build the 200-word context snippet from offsets
    *   Generate 15-token front-matter deterministically from structured fields
7.  **Embeddings + storage**
    *   Create embeddings for:
        *   chunk text
        *   variable context snippet (+ front-matter)
    *   Store in Postgres (pgvector) + FTS indexes (BM25-like)
8.  **Alert derivation**
    *   If variable maps to obligation/liability/threshold:
        *   create `alert_candidate`
        *   require HITL confirmation before activation

This aligns with your orchestrated gating approach and notification style already defined in your MI orchestration instruction set

MI-Dashboard Orchestrator CUSTO…

.

* * *

Step 3 — Storage + retrieval (Supabase-first, hybrid BM25 + vectors)
--------------------------------------------------------------------

### 3.1 Postgres tables (minimal core)

*   `docs` (metadata)
*   `doc_sections` (structure)
*   `doc_chunks` (chunk text + page/offsets + embedding + tsvector)
*   `extracted_variables` (one row per variable instance)
*   `variable_contexts` (context snippet + front-matter + embedding)
*   `alerts` + `alert_events` (HITL lifecycle)
*   `audit_log` (append-only, immutable)

### 3.2 Hybrid retrieval strategy

**Candidate generation**

*   FTS query on `doc_chunks.tsv`
*   Vector similarity on `doc_chunks.embedding` and/or `variable_contexts.embedding`

**Fusion + rerank**

*   Weighted score: `0.55*FTS + 0.45*Vector`
*   Boost if:
    *   `VAR_CODE` matches intent (e.g., query contains “liquidated damages”)
    *   same `DOC_CODE`/project scope
*   Deduplicate by `(DOC_ULID, SEC_CODE)`.

**Citations enforcement**

*   Chatbot responses must attach:
    *   `DOC_CODE`, `SEC_CODE`, `page`, and `offset/hash`
*   If no evidence: respond “insufficient evidence” + show best-matching sections.

* * *

Step 4 — Open-source chatbot integration: 2 options (local LLaMA + web chat UI)
-------------------------------------------------------------------------------

> Because web lookup is unavailable here, treat names/features as **shortlist candidates** to validate before committing.

### Option A (Recommended for fastest): “Tool-enabled local chat UI” + your RAG API

*   **Local inference:** Ollama or llama.cpp server (OpenAI-compatible endpoint)
*   **Chat UI:** Open WebUI _or_ LibreChat (both commonly used open-source UIs)
*   **Your plugin:** a separate service exposing **tool endpoints**:
    *   `POST /ingest`
    *   `POST /search`
    *   `GET /variable/{ref}`
    *   `POST /alerts/ack`
    *   `POST /alerts/create`
*   **ERP embed:** add a React chat widget pointing to the same RAG API (single brain)

**Why:** clean separation; UI can be swapped; your RAG system remains authoritative.

### Option B (More components, higher scale): Supabase + external search engines

*   **Vectors:** Qdrant
*   **Lexical/BM25:** Meilisearch/Typesense
*   **Metadata + workflow:** Supabase Postgres
*   **Chat UI:** same as Option A

**Why:** better performance at large scale, but heavier ops burden.

### Quantus-proxy (practical scoring)

*   **Option A**: Verifiability 4.6 / Implementability 4.5 / Security 4.2 / RAG readiness 4.4
*   **Option B**: Verifiability 4.6 / Implementability 3.8 / Security 4.0 / RAG readiness 4.7  
    Pick A unless you already have search infra maturity.

* * *

Step 5 — Alert engine + HITL UX (your exact timing requirements)
----------------------------------------------------------------

### 5.1 Severity model (AEC-tuned)

*   **CASUAL:** informational; no escalation; quiet popups only
*   **CRITICAL:** likely negative consequences (missed notice, missed submission, insurance expiry)
*   **CATASTROPHIC:** high financial/legal exposure (LDs, bond expiry, termination triggers, major indemnity caps)

### 5.2 Trigger schedule (default)

For any `alerts.due_at`:

*   T-7d: Email + in-app notification
*   T-5d: Email
*   T-3d: Email
*   **T-24h:** Email + **forced pop-up**
*   **T-12h:** Email + **forced pop-up**
*   **T-8h:** in-app + (WhatsApp nudge if enabled)

**Recurring nudges**

*   From **T-72h to due**: nudge every **4 hours** (critical+)
*   For **catastrophic**: optional **hourly** nudge + optional alarm sound (up to 60s) until HITL action taken

### 5.3 HITL actions (with rollback)

Buttons in popup + in Alerts panel:

*   **(A) Dismiss for now** → snooze until next scheduled nudge
*   **(B) Silence forever** → sets `muted=true` (admin can unmute)
*   **(C) Mark as done** → closes alert; requires optional 2-line note; **Undo** restores prior state

### 5.4 Routing

*   Always notify: **super admin** + **uploader**
*   Critical: add **owner dept head**
*   Catastrophic: add **management/executives** + responsible departments

UI requirements:

*   Top-right **bell icon** visible globally
*   Red badge = count of active/unacknowledged alerts
*   Alerts drawer shows severity filters + “undo” actions

* * *

Step 6 — Security guardrails (non-negotiable)
---------------------------------------------

*   **RLS everywhere** (Supabase): users only see docs/projects they’re assigned to; super admin sees all.
*   **Prompt-injection defense:** never let document text override system/tool policies; tool calls require schema-valid args.
*   **Upload safety:** file type allowlist + size limits + malware scan hook (at minimum: quarantine + manual release).
*   **Audit logging:** append-only `audit_log` entry for:
    *   ingestion, extraction, edits, alert acknowledgements, mute/unmute, deletes (ideally soft-delete only).

* * *

Step 7 — QA gates + 3-iteration repair loop (proxy-Quantus)
-----------------------------------------------------------

### Gates (minimum)

*   **G1 Parse integrity:** sections mapped to pages; offsets valid; chunk sizes within bounds.
*   **G2 Extraction integrity:** JSON schema valid; confidence thresholds; contradictions flagged.
*   **G3 Evidence:** every variable has evidence pointer; else “needs review”.
*   **G4 Alert correctness:** due date + schedule computed; routing computed; HITL required for activation.

### Repair loop (up to 3)

If any variable scores low (e.g., verifiability < 4.0):

1.  Re-run extraction with stronger constraints (must cite offsets)
2.  Expand search inside doc (keyword anchored)
3.  If still low: mark `needs_human_review=true` and suppress auto-alert activation

* * *

Step 8 — Production-ready scaffolds (DB + API + commands)
---------------------------------------------------------

### 8.1 Supabase SQL (core sketch)

```sql
-- Extensions
create extension if not exists vector;

-- Docs
create table if not exists docs (
  id uuid primary key default gen_random_uuid(),
  doc_code text not null,
  title text,
  file_path text not null,
  sha256 text not null,
  uploader_profile_id uuid not null,
  project_id uuid,
  created_at timestamptz default now()
);

create table if not exists doc_chunks (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references docs(id) on delete cascade,
  sec_code text not null,
  page_start int,
  page_end int,
  start_char int,
  end_char int,
  text_rendered text not null,
  tsv tsvector generated always as (to_tsvector('english', text_rendered)) stored,
  embedding vector(1024),
  created_at timestamptz default now()
);
create index if not exists doc_chunks_tsv_gin on doc_chunks using gin(tsv);

-- Variables
create table if not exists extracted_variables (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references docs(id) on delete cascade,
  chunk_id uuid references doc_chunks(id) on delete set null,
  ref_code text not null,
  var_code text not null,
  severity text not null check (severity in ('CASUAL','CRITICAL','CATASTROPHIC')),
  confidence numeric not null,
  due_at timestamptz,
  amount numeric,
  currency text,
  owner_dept text,
  evidence_page int,
  evidence_offset int,
  evidence_hash text,
  created_at timestamptz default now()
);

create table if not exists variable_contexts (
  id uuid primary key default gen_random_uuid(),
  variable_id uuid not null references extracted_variables(id) on delete cascade,
  front_matter_15 text not null,
  context_200_words text not null,
  embedding vector(1024),
  created_at timestamptz default now()
);

-- Alerts + HITL
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  variable_id uuid not null references extracted_variables(id) on delete cascade,
  status text not null check (status in ('PENDING_REVIEW','ACTIVE','SNOOZED','MUTED','DONE')),
  ack_required boolean not null default true,
  next_notify_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists alert_events (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references alerts(id) on delete cascade,
  actor_profile_id uuid not null,
  event_type text not null, -- DISMISS, MUTE, DONE, UNDO, NOTE
  note text,
  created_at timestamptz default now()
);
```

### 8.2 Slash commands (examples)

*   `/ingest project=MCE-PRJ-021 file=RFQ.pdf`
*   `/search q="liquidated damages cap" scope=project`
*   `/variable ref=RFQ-2026-0012:S02.03:RISK.LD.DAILY_RATE:0004`
*   `/alerts due<30d severity>=CRITICAL`
*   `/ack alert=<id> action=DONE note="Client confirmed extension; revised submission date."`

* * *

Callout (risks + rollback)
--------------------------

*   **False positives in liabilities** → mitigate with **HITL activation gate**; rollback by marking `status=PENDING_REVIEW` and disabling schedules.
*   **Notification spam** → dedupe keys + quiet hours + per-user preferences; rollback by muting ruleset and replaying only criticals.
*   **RLS misconfig** (P0) → rollback by default-deny policies and disabling doc/chat endpoints until policy tests pass.

* * *

Validation (acceptance tests)
-----------------------------

*   Upload a sample contract → confirm:
    1.  Sections + pages reconstructed
    2.  Variables created with `REF` codes
    3.  Each variable has a **200-word context** and **15-token front-matter**
    4.  Hybrid search retrieves correct clause with citation
    5.  Alert schedule produces T-7/T-3/T-24h popups and requires HITL ack
    6.  “Done” can be undone and audit log reflects both events

* * *

One next action + success signal
--------------------------------

**Next action:** Provide **one sample tender/contract** (PDF/DOCX) plus your **top 25 variable types** you care about (or say “use default AEC set”), and I will return the **final variable dictionary (codes + severity/owners)** and the **exact extraction JSON schema** (Zod + Pydantic) to lock implementation.  
**Success signal:** You confirm the variable dictionary + schema are accepted and ready to implement.

**Type next**

Today 8:34 AM •

42 chars • 6 words



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)