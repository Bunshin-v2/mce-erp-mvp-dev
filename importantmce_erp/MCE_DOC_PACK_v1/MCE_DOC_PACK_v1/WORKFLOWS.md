# WORKFLOWS.md — MCE Command Center v1.0
Date: 2026-01-26

## WF-APP-001 Auth + Shell
- SignedOut: Landing at /
- SignedIn: AppShell wraps authenticated routes (sidebar + header)
Failure: auth bypass / shell not applied
Mitigation: server-side guards + route groups

## WF-TND-001 Tender Intake Wizard (Template → TOC → Tasks → Evidence)
- Create tender → upload RFQ pack → select template → choose sections → generate checklist
- Assign owners/due dates → auto-create tasks/followups → link evidence docs → coverage %
Failure: duplicate generation, missing deadline, permission denied
Runbook: idempotent generation; enforce tender.deadline_at; audit_log checks

## WF-TND-002 Tender Follow-up
- Set next_followup_at → sweep generates notifications → user acks
Failure: sweep not running, duplicates, ack not stopping escalation

## WF-PSA-001 Project Import (REAL data)
- Import projects into staging → validate → upsert to core
- Unmatched client/project codes recorded in pseudo registry
Failure: duplicate codes, date parsing, missing client
Runbook: staging error report + manual fix queue

## WF-PSA-002 Milestones & Progress
- Baseline milestones → due windows generate tasks/notifications → update statuses
Failure: status mismatch, no reminders

## WF-DOC-001 Upload + Sensitivity + Linking
- Upload → set sensitivity (4 levels) → link to project/tender/checklist
Failure: wrong sensitivity, signed URL errors

## WF-RAG-001 Ask with Evidence (Cite-or-Refuse)
- Query → filters → hybrid retrieval → answer with citations or refuse
Failure: no indexed docs; conflicting evidence
Runbook: check extraction_jobs, chunk counts, retrieval scores

## WF-REP-001 Custom Report Generation
- Select report type → set criteria → RBAC/RLS gate → run RPC → preview table → export CSV
Failure: org-scope attempted by L4; heavy query
Mitigation: enforce RBAC server-side; LIMIT + date-range required

## WF-NOTIF-001 Notification Sweep
- Compute due windows (tenders/tasks/followups/milestones) → dedupe → upsert notifications → ack stops escalation
Failure: spam/noise, missing heartbeat
Runbook: disable schedule; delete by created_at window; inspect heartbeat

## WF-RFQ-DELTA-001 RFQ Delta Gate (Phase 1.5)
- Upload RFQ pack version → fingerprint → delta flag → notify owner → re-check sections
Failure: repeated deltas; missing version links
Mitigation: version table + dedupe keys

