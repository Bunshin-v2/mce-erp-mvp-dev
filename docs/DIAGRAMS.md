# SYSTEM ARCHITECTURE & WORKFLOW DIAGRAMS
Date: 2026-01-27
Status: v2.0 Production Baselined

## 1. System High-Level Architecture
```mermaid
graph TD
    User[End User / Executive] --> Clerk[Clerk Auth]
    Clerk --> Vite[Vite React App]
    Vite --> Supabase[Supabase / PostgreSQL]
    
    subgraph "Data Storage"
        Supabase --> Tables[Relational Tables]
        Supabase --> Vector[pgvector Embeddings]
        Supabase --> Storage[Signed Document Storage]
    end

    subgraph "AI Logic"
        Vite --> RAG[Hybrid Search RPC]
        RAG --> OpenAI[OpenAI / Gemini API]
    end
```

## 2. Tender Intake & Checklist Workflow (Idempotent)
```mermaid
sequenceDiagram
    participant U as User
    participant W as Intake Wizard
    participant DB as Supabase (PostgreSQL)
    
    U->>W: Select Template (RFP / D&B)
    W->>DB: rpc.generate_tender_checklist(tender_id, template)
    Note over DB: Check if requirements exist (Idempotency)
    DB->>DB: Insert Requirement Nodes
    DB-->>W: Success
    W-->>U: Transition to Checklist Tracker
    
    U->>W: Click 'Link Doc'
    W->>DB: Fetch available Documents
    DB-->>W: Document List
    U->>W: Select Doc
    W->>DB: update tender_requirements (link doc_id, status='completed')
    DB-->>W: Updated Record
    W-->>U: Update Saturation %
```

## 3. Financial Iron Dome (Over-billing Defense)
```mermaid
graph LR
    INV[New Invoice] --> TRG{Iron Dome Trigger}
    TRG -->|Check| PO[Purchase Order Balance]
    
    PO -->|Balance >= Invoice| ALLOW[Allow Insert & Deduct Balance]
    PO -->|Balance < Invoice| BLOCK[Raise Exception: Iron Dome Block]
    
    ALLOW --> DB[(Database)]
    BLOCK --> ERR[UI Alert: Over-billing Detected]
```

## 4. RAG Hybrid Retrieval Pipeline
```mermaid
flowchart LR
    Q[User Query] --> EMB[Vector Embedding]
    Q --> FTS[Full Text Search Query]
    
    subgraph "Supabase RPC"
        EMB --> MATCH[match_documents_hybrid]
        FTS --> MATCH
        MATCH --> SCORE[Combine: 0.7 Vector + 0.3 Keyword]
    end
    
    SCORE --> CIT[Cite-or-Refuse Check]
    CIT -->|Score > 0.1| RES[Cited Answer]
    CIT -->|Score < 0.1| REF[Refusal: No Evidence]
```

## 5. Security & Permission Tiers (RBAC)
| Tier | Role Name | Capability |
| :--- | :--- | :--- |
| **L4** | Super Admin | System Settings, User Management, Global Audit |
| **L3** | Chairman / VP | Executive Cockpit, Reports, Agent Insights |
| **L2** | Dept Head / PM | Project Management, Tender Intake, Financials |
| **L1** | Staff / Engineer | Tasks, Document Viewing, Site Logs |
