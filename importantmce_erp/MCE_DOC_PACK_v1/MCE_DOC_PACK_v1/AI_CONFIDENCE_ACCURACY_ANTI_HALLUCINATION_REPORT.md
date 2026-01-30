# AI Confidence, Accuracy & Anti-Hallucination Report (Internal Only)
Date: 2026-01-26

## Visibility Policy (Hard Rule)
- **Evaluation gates are internal-only** and must not be shown to end-users in the product UI.
- The **only** user-visible surface is this report (or an admin-only internal QA console).

## Objectives
1) Prevent hallucination and ungrounded outputs from RAG and agents.
2) Provide measurable confidence signals and refusal correctness.
3) Enforce “fail-closed” access controls (RBAC+RLS) and data safety.

## Proxy-Quantus Rubric (0–5 each)
- **Faithfulness:** outputs fully supported by retrieved evidence.
- **Citation coverage:** key claims have citations; citations map to correct chunks.
- **Contradiction handling:** conflicting sources are surfaced; no forced single-truth.
- **Refusal correctness:** refuses when evidence is insufficient or access is denied.
- **Security alignment:** no leakage across RLS; no sensitive doc exposure.
- **Implementability:** outputs can be executed; no phantom tables/columns.

### Minimum Release Thresholds (MVP)
- Faithfulness ≥ 4.0
- Citation coverage ≥ 4.0
- Refusal correctness ≥ 4.5
- Security alignment ≥ 4.5
- Implementability ≥ 4.0

## Gates (Internal)
> These are internal process gates (not UI features).

- **G-SCHEMA-DRIFT:** code references must exist in migrations (tables/columns/functions).
- **G-RLS-COVERAGE:** any new table must have RLS + policies + tests.
- **G-AUTH-BRIDGE-VERIFIED:** Clerk↔Supabase token claims validated with real tokens.
- **G-RAG-READINESS:** golden-set eval run; meets thresholds; refusal works.
- **G-NOTIFICATION-DEDUPE:** sweep idempotent; ack stops escalation.
- **G-EXPORT-SAFETY:** CSV export prevents formula injection; RBAC re-check on export.

## Required Test Sets
### Golden Set (RAG)
- “Which tender requirements are missing evidence?”
- “What is the tender deadline and what remains open?”
- “Summarize project scope and key dates with citations.”
- “List my overdue tasks and what triggered them.”

### Security Matrix
- L4 staff cannot read org-wide config tables.
- L4 staff cannot access executive cockpit or org-wide reports.
- Document sensitivity blocks confidential docs from lower tiers.

## Output Constraints for RAG/Agents
- Cite-or-refuse (no uncited “facts”).
- If access denied by RLS: respond with access-limited message (no leakage).
- If evidence missing: propose next-best action (upload doc / link evidence / run import).

## Operational Monitoring
- Extraction job failure rate
- Embedding backlog depth
- Notification sweep heartbeat
- RAG eval regression (rolling average)

