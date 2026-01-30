# SUPABASE_DYNAMICS.md — v1.0
Date: 2026-01-26

## Postgres as System of Record
- All business entities stored in Supabase Postgres.
- Storage: Supabase Storage buckets private; access via signed URLs only.

## Migrations & Data Safety
- Numbered migrations only; no “manual prod edits”.
- Before enum/table migrations: create DB snapshot.
- Prefer forward-fix migrations (avoid destructive rollback).

## RLS Model (fail-closed)
- Enable RLS on all tables (core + new: tasks/checklists/reports/rag).
- Policies should combine:
  - role tier (L1..L4)
  - department scoping
  - entity membership (project_members/tender_members)
  - document sensitivity gates

## Scheduled Workloads
- Notification sweep: cron/edge schedule runs run_notification_sweep().
- Extraction: background workers/edge functions update extraction_jobs.

## Imports (REAL datasets)
- Staging tables first → validation → upsert to core tables.
- Any placeholder value logged to pseudo_data_registry and visible in admin QA tools.

## RAG Hybrid Retrieval
- Chunking: contract-aware (section-based if possible); preserve metadata (project/tender/client).
- Retrieval: structured filters → FTS rank → vector rank → fusion.
- Output: citations mandatory; refusal permitted and encouraged.
- No RAG answer should bypass RLS. Retrieval runs under user session.

## Reports (RLS-safe)
- Prefer SECURITY INVOKER views/RPC so RLS applies.
- Export route must re-check RBAC and must not allow reading another user’s run_id.

## Export Safety
- CSV formula injection prevention on export (prefix values starting with = + - @).

