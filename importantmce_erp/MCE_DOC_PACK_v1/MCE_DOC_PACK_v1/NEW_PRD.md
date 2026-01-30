# NEW_PRD.md — MCE Command Center (ERP/CRM/PSA + RAG + Agents) v1.0
Date: 2026-01-26
Owner: Moe

## Problem
MCE teams lose time coordinating **tenders, projects, documents, tasks and follow-ups** across fragmented tools. Deadlines and evidence completeness are not enforced consistently. Critical knowledge is trapped in documents.

## Personas (Role tiers)
- **L2 Exec:** Chairman, Vice Chairman (portfolio visibility, approvals)
- **L3 Dept Head:** Operations, staffing overview, compliance posture
- **L4 Staff:** PM, Engineer, Finance, Viewer (entity-scoped execution)

## Goals (MVP)
1) **Tender intake**: Template → TOC requirements → checklist → tasks → follow-ups → evidence linking.
2) **Portfolio visibility** using **REAL Projects dataset** (38 projects, 16 clients; contract value ≈ 284,079,525 AED).
3) **RAG Chat** with **citations** and **refusal** when evidence is insufficient or access is blocked.
4) **Follow-up/notification engine** preventing missed deadlines (countdown + ack + dedupe).
5) **Professional UI** (Morgan Dark Glass v2.0) with Shell Layout, global search, quick actions.

## Non-goals (MVP)
- Full AR/AP automation (Phase 2).
- Full payroll/WPS (Phase 2).
- Full DMS transmittals/version workflows (Phase 2; keep basic version history only).

## Hard Constraints (locked)
- DB: **Supabase Postgres-first**.
- Currency: **AED default**.
- Modular + spec-driven FE/BE boundaries.
- Permissions: **4 tiers** (L1..L4) with department scoping configurable later.
- Real datasets: **Projects + Manpower** imported via staging, with pseudo-data explicitly registered.

## Scope (In)
### Modules
- **AppShell UI:** Sidebar + header + global search + notifications bell + breadcrumbs.
- **Dashboard by role:** Staff/Dept/Exec views; executive cockpit for L2+.
- **Projects:** list/detail, milestones, documents tab, team tab.
- **Tenders:** bid tracker + tender detail + intake wizard + evidence coverage.
- **Documents:** upload, sensitivity (4 levels), link to entities + checklist evidence.
- **Tasks:** list/kanban/calendar basics (minimum: list + due dates + status).
- **Notifications:** inbox, ack, critical filters, sweep-driven engine.
- **Reports (NEW):** custom report generator page with criteria selectors + CSV export.
- **RAG:** ingestion pipeline + hybrid retrieval (FTS/BM25-like + vector) + cite-or-refuse UI.

### Reports (MVP report types)
- Projects Summary
- Tenders Pipeline
- Milestones Due/Progress
> Financials + Liabilities/Obligations appear but remain disabled (Phase 2 placeholders).

## Scope (Out)
- Finance ledger automation, cost variance deep analytics.
- Liabilities register expansion beyond placeholders (Phase 2).
- Multi-agent “autonomous” actions beyond read/assist (Phase 2; MVP is assist-first).

## UI/UX (Wireframe v2.0 alignment)
- Shell Layout (64/240 sidebar) + Glass header.
- Morgan palette: primary red #c21719, charcoal #444444, neon accents.
- Dashboards: KPI cards, project portfolio list, tasks/alerts panel.
- Exec cockpit: daily briefing panel, risk heatmap, financial health widgets (placeholders ok for MVP).

## Key Workflows (MVP)
- Tender intake (template → checklist → tasks → evidence → coverage → submission gating)
- Follow-up sweep (due windows → notifications → ack)
- Document upload + sensitivity + evidence linking
- RAG Q&A (retrieve → cite → refuse if needed)
- Report generation (criteria → RBAC/RLS gate → RPC → preview → export CSV)

## Security / Compliance (MVP baseline)
- Server-side RBAC guards + Supabase RLS fail-closed.
- Document sensitivity enforced by RLS + signed URLs.
- Audit logging for: tender generation, evidence linking, task assignment, export runs.

## Success Metrics
- Tender intake time reduced ≥ 50% vs baseline.
- 0 missed tender deadlines due to reminder failures.
- Median “create task to assign owner” < 2 minutes.
- RAG: Proxy-Quantus faithfulness ≥ 4.0 with citation coverage ≥ 4.0.

## Evaluation Gates Visibility Policy
- Quality gates are internal-only and must not appear to end-users in product UI.
- End-user confidence signals are limited to: citations, refusal messages, and safe “insufficient evidence” prompts.
- The only explicit gate reporting is in the internal **AI Confidence, Accuracy & Anti-Hallucination Report**.

## Rollout
- Internal pilot (1 department) → add templates → expand by department.
- Feature flags: reports, RAG, agent console activity.

## Open Questions (verification required)
- Verified Clerk↔Supabase RLS token-claims method (must be confirmed in official docs in implementation).
- Final tender template taxonomy and version governance (who can publish, change control).
