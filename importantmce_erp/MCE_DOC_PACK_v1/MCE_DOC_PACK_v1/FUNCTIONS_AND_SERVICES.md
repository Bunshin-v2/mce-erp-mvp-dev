# FUNCTIONS_AND_SERVICES.md — v1.0
Date: 2026-01-26

## Frontend Modules (UI surfaces)
- AppShell: SidebarNav, GlobalHeader, Breadcrumbs, GlobalSearch, QuickActions, NotificationsBell
- Dashboards: widgets by role (ExecCockpitSummary, MyTasks, TenderCountdown, MilestonesDue, Alerts)
- Projects: ProjectList, ProjectDetailTabs(Overview/Docs/Team/Milestones)
- Tenders: TenderList(Kanban/List), TenderDetail, IntakeWizard, ChecklistTree, CoverageBar
- Documents: DocumentExplorer, UploadModal, SensitivityPicker, EvidenceLinker
- Reports: ReportBuilder, PreviewTable, ExportButton, SavedTemplates(optional)
- AI: ChatPanel (RAG), AgentConsole (status/activity)
- Settings: profile + org config stubs

## Backend Service Layer (server actions/route handlers)
- ClientsService: CRUD clients
- ProjectsService: CRUD + import staging→core + membership
- MilestonesService: baseline, status updates, upcoming due queries
- TendersService: CRUD + deadline windows + state transitions
- TenderIntakeService: generate checklist from template; idempotent; task/followup creation
- DocumentsService: signed URL issuance; metadata; entity linking; extraction enqueue
- ExtractionService: extraction_jobs orchestration; retries; partial resume
- RagService: hybrid retrieval; evidence map; cite-or-refuse response
- TasksService: create/assign/status; task_events
- FollowupsService: schedule followups; sweep inputs
- NotificationsService: list/ack; sweep runner; dedupe/escalation
- ReportsService: report RPC runner; export route handler; template saving
- AdminService: manage templates, departments, permissions (internal/admin-only)

## DB RPC / Views (preferred for stability)
- run_notification_sweep(now_ts)
- generate_tender_checklist(tender_id, template_id, included_nodes, assignments)
- v_tender_checklist_coverage
- report_projects_summary(params)
- report_tenders_pipeline(params)
- report_milestones_due(params)
- rag_retrieve(query, filters) → (chunk_id, score, source)

