# ChatGPT Prompts for Figma Diagram Generation
 
## Recommended Model
**GPT-4o (GPT-4 Omni)** - Best for creating structured Figma-compatible diagrams due to:
- Superior spatial reasoning for layout design
- Better understanding of design system components
- More accurate SVG/vector output
- Enhanced ability to follow FigJam board conventions
 
---
 
## Prompt 1: Agentic Workflow Orchestration Diagram
 
```
Create a detailed Figma/FigJam workflow diagram for a Multi-Agent Orchestration System for MCE Command Center (Engineering Consulting ERP).
 
CONTEXT:
- Company: Morgan Consulting Engineers LLC (Architectural Design & Construction Supervision)
- System: ERP/CRM/PSA Command Center with AI-powered automation
- Tech Stack: Next.js, Supabase, Clerk Auth, Gemini 2.5 for RAG
 
DIAGRAM REQUIREMENTS:
 
1. SUPERVISOR AGENT (Central Node)
   - Color: #4F46E5 (Indigo)
   - Shape: Large hexagon
   - Label: "Supervisor Agent (Gemini 2.5 Pro)"
   - Connections to all child agents
 
2. SPECIALIZED AGENTS (Satellite Nodes)
   Create 7 agent nodes in a radial pattern:
 
   a) Contract Parser Agent
      - Color: #059669 (Green)
      - Icon: Document with magnifying glass
      - Functions: OCR, NLP extraction, clause identification
 
   b) Schema Mapper Agent
      - Color: #0891B2 (Cyan)
      - Icon: Database arrows
      - Functions: JSON transformation, validation, normalization
 
   c) Workflow Generator Agent
      - Color: #7C3AED (Purple)
      - Icon: Flowchart nodes
      - Functions: Task dependency mapping, critical path
 
   d) Compliance Monitor Agent
      - Color: #DC2626 (Red)
      - Icon: Shield with checkmark
      - Functions: Deadline tracking, obligation monitoring
 
   e) Dashboard Generator Agent
      - Color: #F59E0B (Amber)
      - Icon: Chart/graph
      - Functions: Report generation, visualization
 
   f) Risk Analyst Agent
      - Color: #EF4444 (Red-Orange)
      - Icon: Warning triangle
      - Functions: Liability scoring, exposure analysis
 
   g) QA Agent
      - Color: #10B981 (Emerald)
      - Icon: Checkmark badge
      - Functions: Data validation, anomaly detection
 
3. SHARED STATE (Bottom Layer)
   - Color: #1F2937 (Dark Gray)
   - Shape: Wide rectangle
   - Contains: Document chunks, Extracted entities, Workflow context, Alert queue
 
4. FLOW CONNECTIONS
   - Solid arrows: Data flow
   - Dashed arrows: Event triggers
   - Bidirectional: Feedback loops
 
5. LEGEND
   Include color legend and connection type key
 
OUTPUT FORMAT:
- FigJam-compatible layout
- Use Auto Layout principles
- Include component annotations
- Exportable as SVG
```
 
---
 
## Prompt 2: Event Trigger & Workflow Engine Diagram
 
```
Design a comprehensive Figma workflow diagram showing the MCE Command Center Trigger Engine with all trigger types and their processing flow.
 
TRIGGER TYPES TO VISUALIZE:
 
1. EVENT TRIGGERS (Real-time)
   Color: #3B82F6 (Blue)
   Examples:
   - Project status change → "completed"
   - Document uploaded
   - Tender status → "submitted"
   - Payment received
 
2. THRESHOLD TRIGGERS (Condition-based)
   Color: #F59E0B (Amber)
   Examples:
   - Progress > 90%
   - Risk score >= 7
   - Payment overdue amount > $50,000
   - Team utilization > 85%
 
3. TIME-BASED TRIGGERS (Cron/Scheduled)
   Color: #8B5CF6 (Violet)
   Examples:
   - Daily 9 AM: Check tender deadlines
   - Weekly Monday: Generate reports
   - Monthly 1st: Invoice reminders
   - Quarterly: Compliance review
 
4. DEADLINE TRIGGERS (Countdown-based)
   Color: #EF4444 (Red)
   Timing sequence (show as timeline):
   - 14 days before → INFO notification
   - 7 days before → WARN notification
   - 5 days before → WARN + Email
   - 3 days before → CRITICAL + Sound
   - 2 days before → CRITICAL + Escalate L1
   - 1 day before → CRITICAL + Escalate L2
   - Same day → CRITICAL + All channels
   - Overdue → CRITICAL + Escalate L3
 
5. PAYMENT DUE TRIGGERS
   Color: #10B981 (Green)
   Examples:
   - Payment milestone approaching
   - Invoice aging (30/60/90 days)
   - Retention release eligible
 
6. ACTION DUE TRIGGERS
   Color: #EC4899 (Pink)
   Examples:
   - Approval pending > 48 hours
   - Document review required
   - Response needed
 
LAYOUT STRUCTURE:
┌─────────────────────────────────────────┐
│           TRIGGER ENGINE                 │
├──────┬──────┬──────┬──────┬──────┬──────┤
│Event │Thresh│Time  │Dead  │Pay   │Action│
│      │old   │Based │line  │Due   │Due   │
└──────┴──────┴──────┴──────┴──────┴──────┘
         │         │         │
         ▼         ▼         ▼
┌─────────────────────────────────────────┐
│         WORKFLOW STATE MACHINE           │
│  (XState: States → Guards → Actions)    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         NOTIFICATION ENGINE              │
│  In-App | Email | Sound | SMS | Slack   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         ESCALATION MATRIX                │
│  L0→L1→L2→L3→L4 (time-based promotion)  │
└─────────────────────────────────────────┘
 
Include:
- Connector lines with event labels
- Processing time indicators
- Retry/failure paths
- Audit log connections
```
 
---
 
## Prompt 3: Alarm/Notification Engine UI Components
 
```
Create a Figma component library for the MCE Command Center Alarm/Notification Engine.
 
COMPONENT 1: NOTIFICATION CARD
Variants:
- Info (Blue border, light blue bg)
- Warning (Orange border, light orange bg)
- Critical (Red border, light red bg, pulsing animation indicator)
 
Structure:
┌─────────────────────────────────────────┐
│ [Icon] [Title]                    [Time]│
│        [Message body - 2 lines max]     │
│        [Entity link]                    │
│                        [Action Buttons] │
└─────────────────────────────────────────┘
 
Action Buttons: [View] [Acknowledge] [Snooze ▼]
 
COMPONENT 2: ALARM RULE EDITOR
Form fields layout:
┌─────────────────────────────────────────┐
│ ALARM RULE CONFIGURATION                │
├─────────────────────────────────────────┤
│ Rule Name: [________________]           │
│                                         │
│ TRIGGER CONDITION                       │
│ Entity: [▼ Dropdown____]                │
│ Field:  [▼ Dropdown____]                │
│ When:   [▼ Operator____] Value: [___]   │
│                                         │
│ TIMING SEQUENCE                         │
│ ☐ 14 days  ☐ 7 days  ☐ 5 days          │
│ ☐ 3 days   ☐ 2 days  ☐ 1 day           │
│ ☐ Same day ☐ Overdue                   │
│                                         │
│ NOTIFICATION CHANNELS                   │
│ ☑ In-App  ☐ Email  ☐ Sound  ☐ SMS     │
│                                         │
│ Sound: [▼ Select____] [▶ Preview]       │
│                                         │
│ RECIPIENTS                              │
│ ☑ Owner ☐ Team ☐ Manager ☐ Admin       │
│                                         │
│ SEVERITY                                │
│ ○ Info  ○ Warning  ● Critical          │
│                                         │
│ MESSAGE TEMPLATE                        │
│ ┌─────────────────────────────────────┐ │
│ │ {{tender.reference}} deadline in    │ │
│ │ {{days}} days. Client: {{client}}   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│            [Cancel]  [Test]  [Save]     │
└─────────────────────────────────────────┘
 
COMPONENT 3: NOTIFICATION CENTER PAGE
Layout:
┌─────────────────────────────────────────┐
│ NOTIFICATION CENTER         [Mark Read] │
├─────────────────────────────────────────┤
│ Filter: [All▼] [Unread▼] [Action Req▼] │
├─────────────────────────────────────────┤
│ ▼ CRITICAL (3)                          │
│   [Notification Card - Critical]        │
│   [Notification Card - Critical]        │
│   [Notification Card - Critical]        │
├─────────────────────────────────────────┤
│ ▼ WARNINGS (5)                          │
│   [Notification Card - Warning]         │
│   [Notification Card - Warning]         │
│   ...                                   │
├─────────────────────────────────────────┤
│ ▼ INFORMATION (12)                      │
│   [Notification Card - Info]            │
│   ...                                   │
└─────────────────────────────────────────┘
 
COMPONENT 4: DEADLINE COUNTDOWN WIDGET
┌─────────────────────────────────────────┐
│  ⏰ TENDER DEADLINE                     │
│                                         │
│     ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│     │ 02 │:│ 14 │:│ 32 │:│ 45 │        │
│     │DAYS│ │ HRS│ │MINS│ │SECS│        │
│     └────┘ └────┘ └────┘ └────┘        │
│                                         │
│  RFP-2024-089 | Dubai Hills Villa       │
│                                         │
│     [View Tender] [Set Reminder]        │
└─────────────────────────────────────────┘
 
Color states:
- > 7 days: Green countdown
- 3-7 days: Yellow countdown
- 1-3 days: Orange countdown
- < 1 day: Red countdown with pulse animation
 
COMPONENT 5: SOUND SELECTOR
┌─────────────────────────────────────────┐
│ SELECT ALERT SOUND                      │
├─────────────────────────────────────────┤
│ ○ alert-default.mp3        [▶]         │
│ ● alert-urgent.mp3         [▶]         │
│ ○ alert-critical.mp3       [▶]         │
│ ○ alert-gentle.mp3         [▶]         │
│ ○ alert-chime.mp3          [▶]         │
│ ○ custom-upload.mp3        [▶] [×]     │
│                                         │
│     [Upload Custom Sound]               │
└─────────────────────────────────────────┘
 
Design tokens to use:
- Font: Inter or system-ui
- Border radius: 8px
- Spacing: 4px base unit
- Shadows: sm, md, lg variants
```
 
---
 
## Prompt 4: RAG System Data Flow Diagram
 
```
Create a detailed Figma diagram showing the MCE Command Center RAG (Retrieval-Augmented Generation) system architecture.
 
PIPELINE STAGES:
 
STAGE 1: DOCUMENT INGESTION
┌─────────────────────────────────────────┐
│ UPLOAD                                   │
│ Supported: PDF, DOCX, XLSX, DWG         │
│ Max size: 10MB                          │
│ Storage: Supabase Storage bucket        │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ EXTRACTION (Gemini 2.5 Vision)          │
│ • OCR for scanned documents             │
│ • Table structure extraction            │
│ • Image/diagram processing              │
│ • Handwriting recognition               │
└─────────────────────────────────────────┘
         │
         ▼
STAGE 2: PARSING & CHUNKING
┌─────────────────────────────────────────┐
│ CONTRACT PARSER AGENT                    │
│ Extract:                                 │
│ • Parties & signatories                 │
│ • Dates (start, end, milestones)        │
│ • Payment terms & amounts               │
│ • Scope of work                         │
│ • Liabilities & warranties              │
│ • Special conditions                    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ FRONT-MATTER OPTIMIZED CHUNKING          │
│                                         │
│ Chunk structure:                        │
│ ┌─────────────────────────────────────┐ │
│ │ FRONT MATTER (metadata)             │ │
│ │ • doc_id, doc_title, doc_type       │ │
│ │ • project_code, client_name         │ │
│ │ • section_path, page_numbers        │ │
│ │ • extracted_entities                │ │
│ ├─────────────────────────────────────┤ │
│ │ CONTENT (semantic chunk)            │ │
│ │ • 500-1000 tokens                   │ │
│ │ • Preserves paragraph/clause bounds │ │
│ │ • Maintains table integrity         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Chunk types:                            │
│ • header, clause, table, appendix      │
└─────────────────────────────────────────┘
         │
         ▼
STAGE 3: EMBEDDING & INDEXING
┌─────────────────────────────────────────┐
│ EMBEDDING (text-embedding-3-large)       │
│ • 3072 dimensions                       │
│ • Batch processing (100 chunks/batch)   │
│ • Rate limiting: 3000 RPM               │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ VECTOR STORE (Supabase pgvector)        │
│ • ivfflat index (lists=100)             │
│ • Cosine similarity                     │
│ • Metadata filtering                    │
└─────────────────────────────────────────┘
         │
         ▼
STAGE 4: RETRIEVAL & GENERATION
┌─────────────────────────────────────────┐
│ HYBRID RETRIEVAL                         │
│                                         │
│ ┌─────────────┐   ┌─────────────┐       │
│ │ Vector      │ + │ Keyword     │       │
│ │ Search      │   │ Search      │       │
│ │ (semantic)  │   │ (FTS)       │       │
│ └─────────────┘   └─────────────┘       │
│         │               │               │
│         └───────┬───────┘               │
│                 ▼                       │
│         ┌─────────────┐                 │
│         │ Reranker    │                 │
│         │ (Cohere)    │                 │
│         └─────────────┘                 │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ CONTEXT ASSEMBLY                         │
│ • Include parent/sibling chunks         │
│ • Order by relevance + structure        │
│ • Max context: 32K tokens               │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ GENERATION (Gemini 2.5 Pro)              │
│ • MCE domain system prompt              │
│ • Source citation required              │
│ • Structured JSON output                │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ RESPONSE                                 │
│ • Answer with citations                 │
│ • Confidence score                      │
│ • Related documents                     │
│ • Follow-up suggestions                 │
└─────────────────────────────────────────┘
 
Color coding:
- Ingestion: Blue (#3B82F6)
- Processing: Purple (#8B5CF6)
- Storage: Green (#10B981)
- Retrieval: Orange (#F59E0B)
- Generation: Red (#EF4444)
 
Include data flow arrows with labels showing:
- Token counts
- Latency targets
- Error handling paths
```
 
---
 
## Prompt 5: Complete UI/UX Component Library
 
```
Design a comprehensive Figma UI component library for MCE Command Center.
 
SECTION 1: NAVIGATION COMPONENTS
 
1.1 Header Bar
┌─────────────────────────────────────────────────────────────┐
│ [MCE Logo] Dashboard  Projects  Tenders  Docs  Search  [🔔] [👤]│
└─────────────────────────────────────────────────────────────┘
States: Default, Active tab highlighted, Mobile collapsed
 
1.2 Sidebar Navigation
┌───────────────┐
│ QUICK ACTIONS │
│ + New Project │
│ + New Tender  │
│ + Upload Doc  │
├───────────────┤
│ FAVORITES     │
│ ★ AWL-24      │
│ ★ RFP-089     │
├───────────────┤
│ RECENT        │
│ ◷ MRH-24      │
│ ◷ Contract.pdf│
└───────────────┘
 
1.3 Breadcrumb
Home > Projects > AWL-24 > Milestones
 
SECTION 2: DATA DISPLAY COMPONENTS
 
2.1 Data Table
┌────────────────────────────────────────────────────────┐
│ [☐] Column1  │ Column2  │ Column3  │ Column4  │ Actions│
├────────────────────────────────────────────────────────┤
│ [☐] Value    │ Value    │ Badge    │ Date     │ [⋮]   │
│ [☑] Value    │ Value    │ Badge    │ Date     │ [⋮]   │
│ [☐] Value    │ Value    │ Badge    │ Date     │ [⋮]   │
├────────────────────────────────────────────────────────┤
│ Showing 1-10 of 100        [◀] 1 2 3 ... 10 [▶]       │
└────────────────────────────────────────────────────────┘
Features: Sortable headers, Row selection, Pagination
 
2.2 Status Badge
Variants:
• [🟢 Active] - Green bg, dark green text
• [🟡 On Hold] - Yellow bg, dark yellow text
• [✅ Completed] - Gray bg, checkmark icon
• [🔴 Overdue] - Red bg, white text
• [🔵 In Progress] - Blue bg, white text
 
2.3 Progress Bar
[████████████░░░░░░░░] 65%
States: 0-25% Red, 26-50% Orange, 51-75% Yellow, 76-100% Green
 
2.4 KPI Card
┌─────────────────────┐
│ 🎯 ACTIVE PROJECTS  │
│                     │
│       24            │
│    ▲ 3 this week   │
└─────────────────────┘
Variants: Positive trend (green arrow), Negative (red), Neutral (gray)
 
SECTION 3: FORM COMPONENTS
 
3.1 Text Input
┌─────────────────────────────────────────┐
│ Label                                   │
│ ┌─────────────────────────────────────┐ │
│ │ Placeholder text...                 │ │
│ └─────────────────────────────────────┘ │
│ Helper text                             │
└─────────────────────────────────────────┘
States: Default, Focused (blue ring), Error (red border + message), Disabled
 
3.2 Select Dropdown
┌─────────────────────────────────────────┐
│ Label                                   │
│ ┌─────────────────────────────────┐     │
│ │ Selected value              [▼] │     │
│ └─────────────────────────────────┘     │
│ ┌─────────────────────────────────┐     │
│ │ Option 1                        │     │
│ │ Option 2 ← (hover state)        │     │
│ │ Option 3                        │     │
│ └─────────────────────────────────┘     │
└─────────────────────────────────────────┘
 
3.3 Date Picker
┌─────────────────────────────────────────┐
│ Due Date                                │
│ ┌─────────────────────────────────┐     │
│ │ Apr 15, 2024               [📅] │     │
│ └─────────────────────────────────┘     │
│ ┌─────────────────────────────────┐     │
│ │ ◀  April 2024  ▶               │     │
│ │ Su Mo Tu We Th Fr Sa           │     │
│ │     1  2  3  4  5  6           │     │
│ │  7  8  9 10 11 12 13           │     │
│ │ 14 [15] 16 17 18 19 20         │     │
│ │ 21 22 23 24 25 26 27           │     │
│ │ 28 29 30                       │     │
│ └─────────────────────────────────┘     │
└─────────────────────────────────────────┘
 
3.4 File Upload
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │         📁                          │ │
│ │   Drag & drop files here            │ │
│ │   or click to browse                │ │
│ │                                     │ │
│ │   Supported: PDF, DOCX, XLSX, DWG   │ │
│ │   Max size: 10MB                    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Uploading:                              │
│ ┌─────────────────────────────────────┐ │
│ │ 📄 document.pdf      [████░░] 60% × │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
 
SECTION 4: BUTTON COMPONENTS
 
4.1 Button Variants
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Primary │  │Secondary│  │  Ghost  │  │ Danger  │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
Sizes: sm (28px), md (36px), lg (44px)
States: Default, Hover, Active, Disabled, Loading
 
4.2 Icon Button
┌───┐  ┌───┐  ┌───┐  ┌───┐
│ + │  │ ✏️ │  │ 🗑️ │  │ ⋮ │
└───┘  └───┘  └───┘  └───┘
 
4.3 Button Group
┌─────────────────────────────────────────┐
│ [List View] [Grid View] [Calendar View]│
└─────────────────────────────────────────┘
 
SECTION 5: FEEDBACK COMPONENTS
 
5.1 Toast Notification
┌─────────────────────────────────────────┐
│ ✅ Project created successfully      [×]│
└─────────────────────────────────────────┘
Variants: Success (green), Error (red), Warning (yellow), Info (blue)
 
5.2 Modal Dialog
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ Modal Title                      [×]│ │
│ ├─────────────────────────────────────┤ │
│ │                                     │ │
│ │ Modal content goes here...         │ │
│ │                                     │ │
│ ├─────────────────────────────────────┤ │
│ │              [Cancel] [Confirm]     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
Overlay: rgba(0,0,0,0.5)
 
5.3 Empty State
┌─────────────────────────────────────────┐
│              📋                         │
│                                         │
│        No projects found                │
│                                         │
│   Create your first project to get      │
│   started with MCE Command Center       │
│                                         │
│          [+ Create Project]             │
└─────────────────────────────────────────┘
 
SECTION 6: MCE-SPECIFIC COMPONENTS
 
6.1 Project Card (Grid View)
┌─────────────────────────────────────────┐
│ AWL-24                       [🟢 Active]│
│ Al Wasl Tower                           │
├─────────────────────────────────────────┤
│ Client: Emaar Properties                │
│ PM: Ahmed Al-Rashid                     │
│ Progress: [████████░░] 75%              │
├─────────────────────────────────────────┤
│ Next: Design Review (Apr 17)            │
│ [View] [Edit] [⋮]                       │
└─────────────────────────────────────────┘
 
6.2 Tender Countdown Card
┌─────────────────────────────────────────┐
│ ⚠️ RFP-2024-089              [🔴 Urgent]│
│ Dubai Hills Villa Complex               │
├─────────────────────────────────────────┤
│        ⏰ 2 DAYS REMAINING              │
│          Apr 15, 2024                   │
├─────────────────────────────────────────┤
│ Value: $850,000 | Status: Preparing     │
│ [View Details] [Mark Submitted]         │
└─────────────────────────────────────────┘
 
6.3 Payment Milestone Timeline
┌─────────────────────────────────────────┐
│ PAYMENT MILESTONES                      │
├─────────────────────────────────────────┤
│ ●━━━━━●━━━━━●━━━━━○━━━━━○               │
│ 5%    15%   20%   10%   25%             │
│ Mob   Prel  Final Prog  Final           │
│ ✓     ✓     ✓     ◐     ○               │
│ Paid  Paid  Paid  Due   Pending         │
└─────────────────────────────────────────┘
 
6.4 Liability Tracker Card
┌─────────────────────────────────────────┐
│ ⚠️ LIABILITY EXPIRING                   │
├─────────────────────────────────────────┤
│ Marina Heights (MRH-24)                 │
│ DLP ends in 30 days (May 12, 2024)      │
│                                         │
│ [████████████████████░░░] 85%           │
│ 10 of 12 months completed               │
│                                         │
│ [View Project] [Set Reminder]           │
└─────────────────────────────────────────┘
 
Design System Tokens:
- Primary: #4F46E5 (Indigo)
- Success: #10B981 (Emerald)
- Warning: #F59E0B (Amber)
- Danger: #EF4444 (Red)
- Info: #3B82F6 (Blue)
- Neutral: #6B7280 (Gray)
- Font: Inter, system-ui
- Border Radius: 8px (cards), 6px (inputs), 4px (badges)
- Spacing: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- Shadows: shadow-sm, shadow-md, shadow-lg
```
 
---
 
## Prompt 6: Database Entity-Relationship Diagram
 
```
Create a detailed Figma ERD (Entity-Relationship Diagram) for MCE Command Center database schema.
 
ENTITIES TO INCLUDE:
 
1. PROFILES (Identity)
   Fields: id, clerk_user_id, email, display_name, role, department, created_at
   PK: id
   Unique: clerk_user_id
 
2. CLIENTS (Master Data)
   Fields: id, name, classification, contact_email, contact_phone, notes, created_at
   PK: id
 
3. PROJECTS (Core Entity)
   Fields: id, code, name, client_id, pm_profile_id, stage, status,
           start_date, end_date, dlp_date, progress_pct, value_amount, tags
   PK: id
   FK: client_id → clients, pm_profile_id → profiles
   Unique: code
 
4. PROJECT_MEMBERS (Junction)
   Fields: project_id, profile_id, member_role, joined_at
   PK: (project_id, profile_id)
   FK: project_id → projects, profile_id → profiles
 
5. PROJECT_MILESTONES (Deliverables)
   Fields: id, project_id, title, due_date, owner_profile_id,
           status, payment_pct, notes
   PK: id
   FK: project_id → projects, owner_profile_id → profiles
 
6. TENDERS (Opportunities)
   Fields: id, reference, title, client_id, project_id, deadline_at,
           status, value_amount, value_currency, owner_profile_id,
           next_followup_at, notes
   PK: id
   FK: client_id → clients, project_id → projects, owner_profile_id → profiles
 
7. TENDER_MEMBERS (Junction)
   Fields: tender_id, profile_id, role, assigned_at
   PK: (tender_id, profile_id)
   FK: tender_id → tenders, profile_id → profiles
 
8. TENDER_COMMS_EVENTS (Append-only Log)
   Fields: id, tender_id, actor_profile_id, occurred_at,
           channel, outcome, notes
   PK: id
   FK: tender_id → tenders, actor_profile_id → profiles
   Note: IMMUTABLE (no updates/deletes)
 
9. DOCUMENTS (File Metadata)
   Fields: id, title, doc_type, sensitivity, project_id, tender_id,
           storage_bucket, storage_path, mime_type, size_bytes,
           uploaded_by_profile_id, version_group_id, version_number, created_at
   PK: id
   FK: project_id → projects, tender_id → tenders, uploaded_by_profile_id → profiles
   Constraint: project_id XOR tender_id (at least one required)
 
10. DOC_CHUNKS (RAG Segments)
    Fields: id, document_id, chunk_index, content, content_tokens,
            embedding, front_matter, chunk_type, parent_chunk_id, created_at
    PK: id
    FK: document_id → documents, parent_chunk_id → doc_chunks
    Index: embedding (ivfflat vector_cosine_ops)
 
11. EXTRACTION_JOBS (AI Processing Queue)
    Fields: id, document_id, job_type, status, started_at, finished_at,
            result_json, error_message
    PK: id
    FK: document_id → documents
 
12. NOTIFICATIONS (User Alerts)
    Fields: id, recipient_profile_id, severity, type, message,
            entity_type, entity_id, ack_required, acked_at,
            acked_by_profile_id, read_at, created_at
    PK: id
    FK: recipient_profile_id → profiles, acked_by_profile_id → profiles
 
13. WORKFLOW_DEFINITIONS (Versioned Schemas)
    Fields: id, name, version, description, trigger_type, trigger_config,
            state_machine, is_active, created_by_profile_id, created_at
    PK: id
    FK: created_by_profile_id → profiles
    Unique: (name, version)
 
14. WORKFLOW_INSTANCES (Running Executions)
    Fields: id, definition_id, entity_type, entity_id, current_state,
            context, started_at, completed_at, error_message
    PK: id
    FK: definition_id → workflow_definitions
 
15. WORKFLOW_EVENTS (State Transitions)
    Fields: id, instance_id, from_state, to_state, event_type,
            event_data, occurred_at, actor_profile_id
    PK: id
    FK: instance_id → workflow_instances, actor_profile_id → profiles
    Note: APPEND-ONLY
 
16. ALARM_RULES (Notification Triggers)
    Fields: id, name, entity_type, condition_field, condition_operator,
            condition_value, notification_template, severity, sound_file,
            recipients_role, is_active, created_at
    PK: id
 
17. AUDIT_LOG (Immutable Trail)
    Fields: id, actor_profile_id, action, entity_type, entity_id,
            occurred_at, metadata
    PK: id
    FK: actor_profile_id → profiles
    Note: IMMUTABLE (no updates/deletes)
 
DIAGRAM LAYOUT:
- Use crow's foot notation
- Group related entities
- Show cardinality (1:1, 1:N, M:N)
- Color code by module:
  - Identity/Auth: Purple
  - Projects: Blue
  - Tenders: Orange
  - Documents/RAG: Green
  - Workflows: Yellow
  - Audit: Gray
```
 
---
 
## Usage Instructions
 
1. Copy the desired prompt
2. Open ChatGPT (GPT-4o recommended)
3. Paste the prompt
4. Request SVG or structured output for Figma import
5. Use Figma's "Paste" or "Import" features
6. Adjust colors and styling as needed
 
For FigJam boards, request "FigJam compatible sticky notes and connectors" in your prompt.
 