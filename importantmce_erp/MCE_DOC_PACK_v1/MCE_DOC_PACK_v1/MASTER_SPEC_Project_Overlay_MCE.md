# MASTER_SPEC_Project_Overlay_MCE.md
Date: 2026-01-26
Applies on top of MASTER_SPEC_v1.0 + v2.0 modifications

## Locked Decisions
- Entities: clients/projects/tenders/documents/tasks/notifications + tender intake checklist + followups
- Roles: chairman + vice_chairman (+ super_admin, dept_head, pm, engineer, finance, viewer); keep chairman_vp compatibility
- Permission tiers: L1..L4 table-driven; dept scoping configurable later
- Currency: AED default
- RAG: hybrid retrieval (FTS/BM25-like + vector) with cite-or-refuse

## Visibility Policy
- Evaluation gates are internal-only and not shown in product UI.
- Only surfaced in the internal AI Confidence report.

## Module Map (Critical Path)
- M1 Permission schema
- M2 Shell layout + landing
- M3 Role dashboards + agent console
- M3b Reports generator + export
- M4 Tender checklist + intake wizard
- M5 Resources import (manpower)
- M6 Notifications sweep + ack + dedupe
- M8 RFQ delta gate
- M9 Proxy-Quantus validation harness (internal)

## Known Faults (must not repeat)
- Code references tables/columns not present in migrations (e.g., tasks missing)
- Column naming inconsistencies (deadline vs deadline_at; status sets)
- Auth bridging between Clerk and Supabase RLS unspecified (must verify)
- RLS incomplete for new tables (tasks/checklists/RAG/reporting)
- No explicit pseudo-data registry

