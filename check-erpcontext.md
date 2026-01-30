# MCE Command Center 2026 - Full ERP Context Snapshot

**Generated:** 2026-01-30
**Branch:** main
**Status:** Active development - Oswald Bold Italic typography migration in progress

---

## Executive Summary

**MCE Command Center 2026** is an enterprise-grade ERP application designed to exceed SAP S/4HANA, Oracle Fusion, and ServiceNow in clarity, governance, and cognitive efficiency. Built as a **Next.js 16 + React 19 + TypeScript** full-stack application with a **Supabase PostgreSQL backend** and **Google Gemini AI integration** for intelligent document processing and RAG capabilities.

**Design Philosophy:** Inevitable, calm, and authoritative - not trendy. Every page must breathe ESPN scoreboard meets F1 telemetry energy through Oswald Bold Italic condensed typography.

---

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19.2.3, TypeScript 5.8, Next.js 16.1.5, Tailwind CSS 4.1 |
| **State** | React hooks, React Query (@tanstack/react-query 5.90) |
| **Styling** | Tailwind utility classes, CSS variables (tokens-2026.css) |
| **Icons** | Lucide React 0.562 |
| **Charts** | Recharts 3.7 |
| **Animation** | Framer Motion 12.29, CSS keyframes |
| **Auth** | Clerk (optional, with demo fallback) |
| **Database** | Supabase PostgreSQL, real-time PostgRES |
| **Backend** | Next.js API routes, FastAPI (optional Python AI service) |
| **AI** | Google Gemini (@google/generative-ai 0.24), LangChain, pgvector |
| **Utilities** | date-fns 4.1, clsx 2.1, cmdk 1.1, zod 4.3, papaparse 5.5 |
| **Rate Limiting** | Upstash Redis + Ratelimit |
| **Webhooks** | Svix |

---

## Project Structure

```
nexus-construct-erp/
├── app/                          # Next.js App Router
│   ├── api/                      # 23+ backend API routes
│   │   ├── admin/                # Admin (logs, validation)
│   │   ├── ai/                   # AI integration (chat, health, retrieve, ready, version)
│   │   ├── alarm-rules/          # Alert rule management ([id] + list)
│   │   ├── auth/                 # Webhook handlers (Clerk)
│   │   ├── chat/                 # Chat + retrieve
│   │   ├── cron/                 # Scheduled health checks
│   │   ├── documents/            # Document CRUD + processing ([id]/embed, review, status, acknowledge, detect-delta, extract-requirements)
│   │   ├── health/               # System health endpoint
│   │   ├── notification-preferences/ # User notification prefs
│   │   ├── notifications/        # System alerts & acks ([id]/ack, snooze)
│   │   ├── projects/             # Project management ([id] + list)
│   │   ├── rag/                  # RAG ingest/sync/ingest-all
│   │   ├── resources/            # Resource allocation & team members
│   │   ├── search/               # Full-text search
│   │   ├── tenders/              # Tender management, export ([id] + list)
│   │   └── redact/               # Document redaction
│   ├── admin/                    # Admin pages (health, rag)
│   ├── layout.tsx                # Root layout ("Morgan ERP - Financial Command")
│   ├── page.tsx                  # Entry point (renders App.tsx)
│   └── providers.tsx             # Clerk, QueryClient, StyleProvider
├── components/                   # 124 React components
│   ├── ui/                       # 25 reusable UI primitives
│   │   ├── Button.tsx, GlassButton.tsx, RippleButton.tsx
│   │   ├── Card.tsx, GlassCard.tsx, GlassPanel.tsx
│   │   ├── Badge.tsx, StatusBadge.tsx
│   │   ├── Typography.tsx
│   │   ├── GlassInput.tsx
│   │   ├── Toast.tsx
│   │   ├── CommandPalette.tsx (Cmd+K search)
│   │   ├── MetricDisplay.tsx, FinancialMetricCard.tsx
│   │   ├── AnimatedCounter.tsx, Sparkline.tsx
│   │   ├── TiltCard.tsx (3D hover)
│   │   ├── ShimmerSkeleton.tsx, SkeletonLoader.tsx
│   │   ├── FlashUpdate.tsx
│   │   ├── PageHeader.tsx
│   │   ├── ErrorBoundary.tsx, EmptyState.tsx
│   │   └── (more...)
│   ├── dashboard/                # 26 dashboard modules
│   │   ├── ProjectList.tsx, TenderList.tsx
│   │   ├── TendersModule.tsx, ProjectsModule.tsx
│   │   ├── DocumentsModule.tsx
│   │   ├── NotificationsModule.tsx, NotificationsPanel.tsx, NotificationsAcksPanel.tsx
│   │   ├── RiskHeatmap.tsx, RiskHeatmapV2.tsx
│   │   ├── UnifiedRiskCommand.tsx
│   │   ├── SignalMatrix.tsx
│   │   ├── SystemStatusConsole.tsx, SystemHealthStrip.tsx
│   │   ├── DeadlineList.tsx, DeadlineQueueList.tsx, QueueCard.tsx
│   │   ├── ProjectionPulse.tsx
│   │   ├── PortfolioVelocityChart.tsx, StrategicVolumeChart.tsx
│   │   ├── OperationalLedger.tsx
│   │   ├── LiabilityTracker.tsx
│   │   ├── DailyBriefingCard.tsx
│   │   └── TendersDueSoonPanel.tsx
│   ├── pages/                    # 20 full-page components
│   │   ├── ExecutiveCockpit.tsx (C-suite KPIs)
│   │   ├── ValidationDashboard.tsx
│   │   ├── AgentConsole.tsx (audit trail)
│   │   ├── ProjectsPage.tsx, TendersPage.tsx, DocumentsPage.tsx
│   │   ├── FinancialsPage.tsx, ResourcesPage.tsx, ReportsPage.tsx
│   │   ├── FieldOperationsPage.tsx, LiabilityDashboard.tsx
│   │   ├── NotificationsPage.tsx, CalendarPage.tsx
│   │   ├── TasksPage.tsx, PersonalTasksPage.tsx
│   │   ├── SettingsPage.tsx, IntegrationsPage.tsx, ProfilePage.tsx
│   │   └── RedactionPage.tsx
│   ├── layout/                   # Layout components
│   │   ├── AppShell.tsx
│   │   └── DashboardLayout.tsx
│   ├── projects/ProjectDetail.tsx
│   ├── tenders/TenderDetail.tsx
│   ├── documents/                # Document components
│   ├── forms/                    # ProjectForm, TenderForm, InvoiceForm, TimesheetForm
│   ├── ai/                       # AI-related components
│   ├── auth/                     # RouteGuard, etc.
│   ├── notifications/            # Notification components
│   ├── governance/               # GovernanceTable, etc.
│   ├── admin/                    # Admin components
│   ├── Sidebar.tsx               # Main navigation (current)
│   ├── Sidebar-2026.tsx          # Reference implementation (180px optimized)
│   ├── Header.tsx                # Top header bar
│   ├── ChatAssistant.tsx         # AI chat widget (Gemini)
│   ├── ChatWidget.tsx            # Alternative chat
│   ├── MetricTile.tsx            # KPI metric display
│   ├── StyleTuner.tsx            # CSS variable editor (dev tool)
│   └── Watermark.tsx             # Application watermark
├── hooks/                        # 13 custom React hooks
│   ├── useDashboardData.ts       # CENTRAL data management hub
│   ├── useDashboardLogic.ts      # Dashboard state
│   ├── useExecutiveData.ts       # Executive metrics
│   ├── useSupabase.ts            # Supabase client wrapper
│   ├── useResourceData.ts        # Resource data
│   ├── usePreferences.ts         # User preferences
│   ├── useLocalCache.ts          # Local caching
│   ├── useUserTier.ts            # Permission tier
│   ├── useFieldData.ts           # Field operations
│   ├── useLiabilityData.ts       # Liability data
│   ├── useFlashAnimation.ts      # Animation hooks
│   ├── useReports.ts             # Report generation
│   └── useWidgetLayoutState.ts   # Widget layout persistence
├── lib/                          # 18 utilities & services
│   ├── ai/                       # AI integration
│   │   ├── gemini.ts             # Google Gemini API wrapper
│   │   ├── embeddings.ts         # Vector embeddings
│   │   ├── rag-ingest.ts         # RAG pipeline ingestion
│   │   ├── assistant-context.ts  # AI context management
│   │   └── knowledge-scope.ts    # RAG knowledge scope
│   ├── rag/chunking.ts           # Document chunking
│   ├── supabase/
│   │   ├── supabase.ts           # Client-side Supabase
│   │   └── server.ts             # Server-side Supabase
│   ├── ai-gateway/proxy.ts       # AI proxy layer
│   ├── logger.ts                 # Structured logging
│   ├── utils.ts                  # General utilities
│   ├── queryClient.ts            # React Query setup
│   ├── rate-limit.ts             # Rate limiting (Upstash)
│   ├── auth-safe.ts              # Auth utilities
│   ├── toast-context.tsx         # Toast notifications
│   ├── StyleSystem.tsx           # Style provider & system
│   ├── risk-intelligence.ts      # Risk scoring engine
│   └── validation/rag.ts         # RAG validation
├── utils/                        # 9 application utilities
│   ├── agent.ts                  # Agent automation (HITL workflow)
│   ├── workflow.ts               # Workflow state management
│   ├── rag.ts                    # RAG helpers
│   ├── notifications.ts          # Notification utilities
│   ├── exportUtils.ts            # CSV export
│   ├── reportGenerator.ts        # Report generation
│   ├── scoring.ts                # Scoring algorithms
│   ├── error-recovery.ts         # Error handling
│   └── performance-monitor.ts    # Performance monitoring
├── types.ts                      # TypeScript type definitions
├── styles/
│   ├── tokens-2026.css           # DESIGN TOKENS (SINGLE SOURCE OF TRUTH)
│   └── design-system-2026.css    # Apple-grade minimalism CSS
├── supabase/
│   ├── 00_consolidated_schema_clean.sql  # Master DB schema
│   └── migrations/               # Incremental migrations
├── ai_service/                   # Python FastAPI backend (optional)
│   ├── main.py                   # Server (/health, /chat, /ready, /version, /scope)
│   ├── agents/
│   │   ├── rag_agent.py          # Vector DB + semantic search
│   │   └── sql_agent.py          # SQL query agent
│   └── Dockerfile
├── scripts/                      # 30+ automation scripts
│   ├── health/                   # unified-health-check.ts
│   ├── diagnostic/               # run-health-probes.ts, deployment-gate.ts
│   ├── rag/                      # ingest-prompts.ts, ingest-financial.ts
│   ├── clean-start.cjs
│   ├── validate-schema-drift.ts
│   ├── validate-rls-coverage.ts
│   └── audit-styles.ts
├── index.css                     # Global CSS entry point
├── tailwind.config.ts            # Tailwind configuration
├── App.tsx                       # Main app component (22+ routes)
├── next.config.mjs               # Next.js config (reactStrictMode: true)
├── tsconfig.json                 # TypeScript (ES2022, react-jsx, @/* alias)
├── package.json                  # Dependencies & scripts
├── .env.example                  # Environment template
├── CLAUDE.md                     # AI governance instructions (PRIMARY)
├── ENTERPRISE_DESIGN_SYSTEM_2026.md  # Full design doctrine
├── .gemini-guides/               # Deployment & operational docs
└── .vercel/                      # Vercel deployment config
```

---

## Data Architecture

### Central Data Hook: `useDashboardData()`

The hub for all dashboard data. Manages:

- **Real-time Subscriptions** via Supabase PostgRES on: `documents`, `notifications`, `projects_master`, `tenders`, `agent_activity`, `audit_logs`
- **KPI Computation**: Enterprise Projects count, Contract Value sum, Upcoming Bids value, Active Alerts count
- **System Signals**: `hasBacklog` (docs pending > 10), `stagnantProjects` (no updates > 7 days), `complianceIssues` (missing scans), `systemStatus` ("Optimal" / "Congested")
- **Status Aggregation**: Document status distribution for charts

### Database Schema (Supabase PostgreSQL)

**Extensions:** `uuid-ossp`, `pgvector`

**Core Tables:**

| Table | Purpose |
|-------|---------|
| `projects_master` | Enterprise project registry (project_code, client_name, contract_value_excl_vat, delivery_risk_rating) |
| `documents` | Document workflow (title, category, status, reviewed_at, project_id) |
| `notifications` | System alerts (message, severity, read_at, ack_at) |
| `tenders` | Bidding/procurement (title, client, value, probability, submission_deadline) |
| `agent_activity` | Audit trail (agent_name, action POST/PATCH, document_id) |
| `audit_logs` | User/system actions (user_id, action_type, table_name, record_id) |
| `profiles` | User metadata (clerk_user_id, tier, email, preferences) |
| `tasks` | Task management (title, status, assigned_to, due_date) |
| `incidents` | Issue tracking (title, severity, status, reporter_id) |
| `resources` | Team members (name, role, tier, allocation_percent) |
| `financial_ledger` | GL entries (project_id, amount, account_code) |
| `alarm_rules` | Alert rules (condition, threshold, severity) |

**Enum Types:**
```
document_category: COMPLIANCE | CONTRACT | INVOICE | SAFETY
document_status:   Review | Reviewed | Approved | Rejected
project_status:    Active | Paused | Completed
agent_action_type: POST | PATCH | UPDATE | DELETE
permission_tier:   L1 | L2 | L3 | L4
```

**Features:** Row-Level Security (RLS), RBAC helpers (`get_user_role()`, `get_user_tier()`), pgvector embeddings.

---

## Routing Map (22+ Routes)

| Category | Routes |
|----------|--------|
| **Dashboard** | `dashboard` (home), `executive` (C-suite), `validation`, `agent-console` |
| **Business** | `projects`, `tenders`, `documents`, `financials`, `resources`, `reports` |
| **Support** | `tasks`, `calendar`, `notifications`, `field-operations`, `liability` |
| **Admin** | `integrations`, `settings`, `profile`, `alarm-rules`, `redaction` |

---

## Design System & Typography

### Current State: Oswald Bold Italic Migration

**Font DNA:** Oswald Bold Italic = condensed, vertical, aggressive, sports-broadcast authority. ESPN scoreboard meets F1 telemetry.

**Google Fonts Import (index.css line 1):**
```css
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```
Note: Oswald has no native italic axis on Google Fonts. CSS `font-style: italic` produces oblique rendering.

**Font Family Tokens (tokens-2026.css):**
```css
--font-sans: 'Oswald', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
--font-decorative: 'Oswald', var(--font-sans);
--font-ui: var(--font-decorative);
--font-heading: var(--font-decorative);
```

**Tailwind Font Families (tailwind.config.ts):**
```ts
fontFamily: {
  sans: ['Oswald', 'system-ui', 'sans-serif'],
  heading: ['Oswald', 'system-ui', 'sans-serif'],
  mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
  decorative: ['Oswald', 'sans-serif'],
}
```

**Font Size Scale (9 standard sizes only):**
```
11px (xs/captions) | 12px (sm/labels) | 13px (base/body) | 14px (md/subheadings)
16px (lg/sections) | 18px (xl/major)  | 20px (2xl/page)  | 28px (3xl/titles) | 32px (4xl/hero)
```

**Font Weights:** All set to 700 for "Cockpit DNA" (body inherits bold italic globally).

**Oswald Personality Rules:**
- **Headers (h1, h2):** ALL CAPS, tight tracking (-0.01em), large condensed
- **Metric numbers:** Large (24-32px), right-aligned currency, Oswald makes big numbers punchy
- **Labels/captions:** Uppercase, wide tracking (0.1-0.15em), 10-11px
- **Table headers:** Uppercase, 11px, tracking-widest, bottom border only
- **Body text:** 13px bold italic, line-height 1.5+ for readability
- **Sidebar nav:** Uppercase, 12-13px, tight tracking. Condensed width fits 180px sidebar
- **Buttons:** Uppercase, tracking-wide
- **Badges/Status:** Uppercase, 10px, extra-wide tracking (0.15-0.2em)

**Global Bold Italic Enforcement (index.css):**
```css
body {
  font-family: var(--font-ui);
  font-weight: 700;
  font-style: italic;
  letter-spacing: -0.01em;
}
*, *::before, *::after {
  font-weight: inherit;
  font-style: inherit;
}
```

### Governance Color System (Reserved Meaning)

| Color | Token | Hex | Meaning |
|-------|-------|-----|---------|
| Red/Rose | `--color-critical` | #be185d | Critical/Error ONLY |
| Amber | `--color-warning` | #b45309 | Warning ONLY |
| Green | `--color-success` | #059669 | Success/Healthy ONLY |
| Blue | `--color-info` | #2563eb | Info/In-Progress ONLY |
| Zinc | `--color-neutral` | #71717a | Secondary/Disabled |

### Background System

```css
--bg-base:    #050505   /* Primary background - neutral charcoal */
--bg-surface: #0a0a0a   /* Elevated surfaces */
--bg-hover:   #121212   /* Hover state */
--bg-active:  #18181b   /* Active/selected */
--bg-input:   #080808   /* Input fields */
```

### Spacing Scale (4px base unit)

```
2px | 4px | 8px | 12px | 16px (standard) | 20px | 24px (sections) | 32px (containers) | 40px
```

### Transitions (4 options only)

```
150ms fast (hover) | 200ms standard (state change) | 300ms moderate (visibility) | 400ms smooth (panels)
```

### Border Radius (3 sizes only)

```
6px sm (inputs) | 8px md (buttons) | 12px lg (cards)
```

---

## Component Typography Patterns

All components enforce `font-bold italic` globally. Key patterns found across 124 components:

**Governance Variants (via Typography.tsx):**
- `variant="gov-hero"` - 32px, tight tracking, bold (KPI values)
- `variant="gov-title"` - 18px, tight tracking, bold (page headings)
- `variant="gov-header"` - 14px, tight tracking, bold (column headers)
- `variant="gov-body"` - 13px, normal tracking, bold (body text)
- `variant="gov-label"` - 11px, wide tracking, bold (labels, captions)
- `variant="gov-metric"` - 13px, tight tracking, bold (data values)
- `variant="gov-table"` - 12px, tight tracking, bold (table cells)

**Font Stacks Used:**
- `font-mono` - JetBrains Mono for numeric values, timestamps, codes
- `font-sans` / `font-heading` / `font-decorative` - All resolve to Oswald

**Common className Patterns:**
- `text-[13px] font-bold italic text-zinc-200` (titles/data)
- `text-xs font-bold italic` (labels, small text)
- `text-2xl font-bold italic text-white tabular-nums` (large metrics)
- `tracking-[0.2em]` / `tracking-wider` / `tracking-widest` (letter spacing)
- `uppercase` (headers, labels, status text)
- `font-mono font-bold italic` (numeric/code values)

**Custom Typography Classes:**
- `type-personality`, `type-hero`, `type-caption`, `type-title` (SignalMatrix)
- `text-metric-finance`, `text-section-header` (custom semantic)

---

## Environment Configuration

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=<supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>

# Optional (demo mode if missing)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk_key>

# AI Integration
GEMINI_API_KEY=<gemini_key>
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBED_MODEL=text-embedding-004
GEMINI_EMBED_DIMENSION=1536
```

---

## Quick Start Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server on localhost:3000
npm run build            # Production build
npm start                # Start production server
npm run health           # System diagnostics
npm run diagnose         # Health probes
npm run audit:styles     # Design token audit
npm run validate:schema  # DB schema check
npm run rag:ingest       # RAG knowledge base setup
npm run rag:status       # RAG system status
```

---

## Recent Git History

```
9e226ed Fix TypeScript error: wrap TiltCard with div for hover state management
5f4ea99 Implement premium visual enhancements for MCE dashboard
05aaa91 Add comprehensive systems governance strategy & implementation status
b032e88 Apply critical design governance fixes Phase 1
89fe950 Implement enterprise design governance and typography standards
dbc6cd9 Fix: Use real Clerk configuration without fallback
8c014ad Fix: Use fallback Clerk key for demo mode
c8e41ea Fix: Disable static prerendering at root level
915209d Fix: Move Clerk to client-side with graceful fallback
219a952 Fix: Always wrap with ClerkProvider to prevent initialization errors
42599e4 Fix: Disable static prerendering for home page
e14e5a9 Fix: Mark home page as client component to avoid SSR issues
266b7e9 Fix: Prevent localStorage access during server-side rendering
c56f542 Fix: Enable app rendering without Clerk configuration
cd8fcc5 Simplify page.tsx - remove Suspense wrapper
```

**Trends:** Design governance enforcement, premium visual enhancements, SSR/Clerk fixes, TypeScript error resolution.

---

## In-Progress Work

### Oswald Bold Italic Typography Migration

**Completed:**
- [x] Google Fonts import fixed in `index.css` (removed non-existent italic axis params)
- [x] All component font-weights unified to `font-bold italic`
- [x] CSS tokens weight system set to 700 across all weight levels
- [x] Body and global elements: `font-weight: 700; font-style: italic; letter-spacing: -0.01em`
- [x] `*, *::before, *::after` inherit font-weight and font-style

**Pending:**
- [ ] `tokens-2026.css` font-family variables update to Oswald (edit encountered error, needs retry)
- [ ] `tailwind.config.ts` fontFamily mappings update to Oswald
- [ ] Verification: `npm run dev` and visual render check

### Files Modified This Session
- `index.css` line 1 - Google Fonts import corrected (removed `ital` axis)

### Files Pending Modification
- `styles/tokens-2026.css` lines 72-78 - Font family variables (Inter/Space Grotesk -> Oswald)
- `tailwind.config.ts` lines 106-111 - Font family mappings

---

## Governance Rules (Non-Negotiable)

1. **NO HARDCODED VALUES** - All styling via CSS variable tokens
2. **RESERVED COLOR MEANING** - Red=critical, amber=warning, green=success, blue=info
3. **TYPOGRAPHY CONSISTENCY** - Sentence case default (except status labels), 9 standard sizes, 4 weights
4. **SPACING** - 4px multiples only, minimum 16px between data rows, 24px sections
5. **TRANSITIONS** - 150ms/200ms/300ms/400ms only, never exceed 400ms
6. **TABLES** - Bottom borders only, monospace numbers right-aligned, row height >= 56px
7. **NO RAW DIVS** - Use primitives (Box, Text, Button, Card, Stack, Grid)
8. **BORDER RADIUS** - 6px/8px/12px only, no rounded-2xl or larger
9. **NO FONT-BLACK** - Max weight is 700 (bold), no 800/900
10. **NO PURE BLACK/WHITE** - Use charcoal (#050505) and off-white (#f5f5f7)

---

## Key Statistics

| Metric | Value |
|--------|-------|
| React Components | 124 |
| API Endpoints | 23+ |
| Custom Hooks | 13 |
| Database Tables | 15+ |
| Design Tokens | 100+ |
| CSS Variables | 100+ |
| Routes | 22+ |
| Npm Dependencies | 25 |
| Dev Dependencies | 10 |
| Font Sizes (Standard) | 9 |
| Spacing Values | 10 |
| Animation Keyframes | 4 |
| Pages | 20 |
| Dashboard Modules | 26 |
| UI Primitives | 25 |

---

## Critical Notes for Context Recovery

1. **NO DEPLOYMENT** until user confirms visual changes look good
2. **Design DNA:** Oswald Bold Italic everywhere - sports-broadcast authority
3. Oswald has NO native italic on Google Fonts - CSS oblique rendering is used
4. `font-mono` (JetBrains Mono) is exempt from Oswald - used for numbers, timestamps, code
5. Build was passing as of last commit (9e226ed)
6. All modifications are reversible via git
7. The design token file (`styles/tokens-2026.css`) is the SINGLE SOURCE OF TRUTH
8. `CLAUDE.md` contains the governance framework - read it first for any new work
