# GAP_ANALYSIS_AND_FAULT_PREVENTION.md — v1.0 (Deepened)
Date: 2026-01-26

## A) Recurring Faults (from partial projects) and “Never Again” Controls

### 1) Schema/Code Drift (P0)
Symptom: app references tables/columns absent in migrations (e.g., tasks missing).
Prevention:
- CI: schema compile + code query grep + migration lint
- Release block if drift detected

### 2) Naming Divergence (P0)
Symptom: deadline vs deadline_at; status enums mismatch.
Prevention:
- Canonical column naming rules + compatibility views (only if needed)
- Avoid dual columns; if unavoidable, create adapter view

### 3) Auth Bridge Unverified (P0)
Symptom: Clerk token used incorrectly as Supabase auth token.
Prevention:
- Implement verified bridge; test with real tokens; fail-closed

### 4) RLS Coverage Gaps (P0)
Symptom: new tables missing RLS/policies → leakage or lockouts.
Prevention:
- “RLS coverage gate”: no table merges without RLS + tests

### 5) Pseudo-Data Without Registry (P1)
Symptom: placeholders silently pollute dashboards.
Prevention:
- pseudo_data_registry table + UI banners + cleanup backlog

### 6) Notification Spam / Dedupe Fail (P1)
Symptom: repeated alerts; ack doesn’t stop escalation.
Prevention:
- dedupe_key unique index; acked_at stops escalation; heartbeat monitoring

### 7) Export Leakage (P1)
Symptom: report exports allow data outside scope.
Prevention:
- export route RBAC re-check; re-run RPC under user session; no service role.

## B) Missing Elements (MVP Readiness)
- Employee guides (role-based) + quickstart
- Runbooks (migrations, backups, cron, incidents)
- Import pipeline UI for staging errors
- RAG golden-set eval harness + regression report
- Internal QA dashboard for extraction health + sweep heartbeat

## C) Recommended Actions (Ranked)
P0:
- Canonical schema + migration completeness
- Verified auth bridge + RLS integration tests
- Add missing tables referenced by UI (tasks/checklists/reports)
P1:
- Reports page with export safety
- Tender intake idempotency + evidence coverage KPI
- Notification dedupe + ack semantics
P2:
- Observability (errors + jobs + sweeps)
- Admin governance for templates + permissions

