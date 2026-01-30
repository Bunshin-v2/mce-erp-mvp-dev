# DIAGRAMS.md — Mermaid Sources (paste into FigJam/Mermaid)
Date: 2026-01-26

## Reports Workflow
Figma export (already generated): https://www.figma.com/online-whiteboard/create-diagram/ba36e12f-adf9-45f2-b0bb-dc577ca7e26b?utm_source=chatgpt&utm_content=edit_in_figjam&oai_id=v1%2FEBTRyOxMvJfuyDkkkBc4MAkq89jjzT3DxO5Kz19rlg44L6NHSOr01B&request_id=d1eb33da-bd8b-4dd9-98ba-a96b74cc0463
```mermaid
flowchart TD
  A[User opens Reports page] --> B[Select Report Type]
  B --> B1[Projects Summary]
  B --> B2[Tenders Pipeline]
  B --> B3[Milestones Due]
  B --> B4[Liabilities/Obligations - Phase 2]
  B --> B5[Financials - Phase 2]

  A --> C[Select Criteria]
  C --> C1[Scope: Org / Dept / Membership]
  C --> C2[Entity: Project / Tender / All]
  C --> C3[Date Range]
  C --> C4[Status Filters]
  C --> C5[Owner or Department]
  C --> C6[Columns and Sections]

  C --> D{RBAC and RLS Gate}
  D -->|Allowed| E[Run Report RPC]
  D -->|Denied| D1[Show Access Block and Request Access]

  E --> F[Server validates params and applies LIMIT]
  F --> G[Query via RLS-safe views or RPC]
  G --> H[Return rows plus meta]
  H --> I[Preview Table]
  I --> J[Export CSV]
  I --> K[Save Template optional]

  J --> L[Export route handler]
  L --> M[CSV download]

  K --> N[report_definitions table]
  H --> O[Write report_runs log]

```

## Tender Intake Wizard
```mermaid
flowchart TD
  A[Create Tender] --> B[Upload RFQ Pack]
  B --> C[Select Checklist Template]
  C --> D[Select Included Sections]
  D --> E[Generate TOC + Required Docs]
  E --> F[Assign Owners + Due Dates]
  F --> G[Auto-create Tasks + Followups]
  G --> H[Link Evidence Docs to Requirements]
  H --> I[Coverage % + Missing Evidence]
  I --> J{Ready to Submit?}
  J -->|No| H
  J -->|Yes| K[Mark Submitted]

```

## RAG Hybrid Retrieval
```mermaid
flowchart LR
  U[User Question] --> Q[Query Normalizer]
  Q --> F1[Structured Filters (project/tender/client/sensitivity)]
  Q --> BM25[FTS/BM25-like Search]
  Q --> VEC[Vector Search (pgvector)]
  F1 --> BM25
  F1 --> VEC
  BM25 --> FUSION[Score Fusion + Diversification]
  VEC --> FUSION
  FUSION --> TOPK[Top-K Chunks + Evidence Map]
  TOPK --> GEN[Answer Composer]
  GEN -->|Cite| OUT[Response with citations]
  GEN -->|Insufficient evidence| REFUSE[Refusal + next-best actions]

```

## Notifications Sweep
```mermaid
flowchart TD
  T[Trigger Sources] --> S[Notification Sweep]
  T --> T1[Tender deadline windows]
  T --> T2[Task due windows]
  T --> T3[Followup due next_followup_at]
  T --> T4[Milestone due windows]

  S --> DEDUPE[Compute dedupe_key per recipient/entity/window]
  DEDUPE --> UPSERT[Insert notifications ON CONFLICT DO NOTHING]
  UPSERT --> INBOX[User Inbox UI]
  INBOX --> ACK[Acknowledge]
  ACK --> STOP[Stop escalation for dedupe group]
  UPSERT --> ESC[Escalation rules (optional)]

```

## RBAC + RLS Enforcement
```mermaid
flowchart TD
  U[User] --> Clerk[Clerk AuthN]
  Clerk --> App[Next.js Server Components / Route Handlers]
  App --> RBAC{Server RBAC guard}
  RBAC -->|Denied| Deny[403 or redirect]
  RBAC -->|Allowed| SB[Supabase client (user session)]
  SB --> RLS{Supabase RLS}
  RLS -->|Permit| Rows[Rows returned]
  RLS -->|Block| Block[Empty/Denied]
  Rows --> UI[Render UI]
  Block --> UI2[Render access-limited state]

```
