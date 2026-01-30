# GEMINI IMPLEMENTATION BRIEFING
**Date:** 2026-01-29
**Status:** Ready for Parallel Execution
**Coordinator:** Claude Code (Haiku 4.5)

---

## EXECUTIVE SUMMARY

You are responsible for **generating 8 comprehensive implementation guides + complete documentation updates** while Claude Code handles the UI/code implementation in parallel.

**Your Timeline:** 5 weeks (same as Claude Code, working in parallel)
**Your Output:** 11 markdown files in `.gemini-guides/` + documentation updates
**Your Coordination:** Minimal - your work is independent from Claude Code's phases

---

## YOUR WORK ASSIGNMENT

### PRIMARY DELIVERABLES: 8 Implementation Guides

These guides are **production-ready, copy-paste documentation** for executing the system implementation. Each must be complete, actionable, and require no additional coding.

#### Guide 1: Deploy Migration Files (`.gemini-guides/01_deploy_migrations.md`)

**Purpose:** Step-by-step instructions for applying database migrations to production Supabase

**Content Required:**
1. **Pre-Deployment Checklist** (copy-paste format)
   - All required checks before applying migrations
   - Environment verification steps

2. **Supabase SQL Editor Access Instructions**
   - Screenshots or step-by-step navigation
   - Where to find SQL editor in Supabase dashboard

3. **Migration File Contents** (ready to copy-paste)
   - File: `supabase/migrations/20260128_hour_0_4_rbac_alarm_setup.sql`
   - File: `supabase/migrations/20260128_hour_5_10_automation_logic.sql`
   - File: `supabase/migrations/20260128_hour_16_19_tender_workflow.sql`
   - Include full SQL (find in project's `supabase/migrations/` directory)

4. **Execution Order & Timing**
   - Run migration 1 first
   - Wait 2 minutes
   - Run migration 2
   - Wait 2 minutes
   - Run migration 3

5. **Expected Output Messages**
   - What success looks like for each migration
   - Example success messages to expect

6. **Error Troubleshooting Matrix**
   - Common errors and solutions
   - E.g., "Error: permission denied" → Solution: Check user role
   - E.g., "Error: table already exists" → Solution: Already applied, skip

**Reference Files in Codebase:**
- `supabase/schema.sql` - Consolidated schema reference
- `SCHEMA_CONSOLIDATION_GUIDE.md` - Schema documentation

**Estimated Length:** 8-12 KB

---

#### Guide 2: Enable pg_cron (`​.gemini-guides/02_enable_pgcron.md`)

**Purpose:** Enable Postgres cron extension and schedule automation jobs

**Content Required:**

1. **Extension Enablement Instructions**
   - Supabase Dashboard navigation path
   - "Database → Extensions → Search 'pg_cron'"
   - Screenshots recommended
   - One-click enable button location

2. **Cron Job SQL Commands** (copy-paste ready)
   - Job 1: `SELECT cron.schedule(...);` for health checks (every 5 minutes)
   - Job 2: `SELECT cron.schedule(...);` for compliance scans (hourly)
   - Job 3: `SELECT cron.schedule(...);` for schema drift detection (daily 2 AM)
   - Complete SQL with no placeholders

3. **Schedule Verification Queries**
   - `SELECT * FROM cron.job;` - View all scheduled jobs
   - Expected output showing 3 jobs with schedules

4. **Job Monitoring Instructions**
   - How to check if jobs ran successfully
   - `SELECT * FROM cron.job_run_details;` for logs
   - Interpreting job status (success/failure)

5. **Disabling Jobs** (if needed)
   - How to temporarily disable a job
   - How to delete a job

**Reference Files:**
- `CLAUDE.md` - Mentions pg_cron architecture
- `supabase/migrations/` - Contains cron job definitions

**Estimated Length:** 4-6 KB

---

#### Guide 3: Verification Testing (`​.gemini-guides/03_verify_deployment.md`)

**Purpose:** Comprehensive testing suite to confirm all systems operational

**Content Required:**

1. **Table Existence Checks**
   - Query to verify each critical table exists
   - Expected row counts for seeded data
   - Example: `SELECT COUNT(*) FROM projects_master;`

2. **Row Count Verification**
   - Pre-deployment baseline counts
   - Post-deployment validation
   - Check against `SCHEMA_CONSOLIDATION_GUIDE.md` for expected seeded data

3. **Procedure Execution Tests**
   - List all stored procedures in system
   - Test each one with sample execution
   - Expected output for each

4. **Health Dashboard Access**
   - URL to `/api/health` endpoint
   - Expected JSON response structure
   - What "healthy" looks like

5. **Success Criteria Checklist** (copy-paste format)
   - [ ] All 12 tables exist
   - [ ] All RLS policies enabled
   - [ ] 3 cron jobs scheduled
   - [ ] Health endpoint responds 200 OK
   - [ ] No errors in browser console
   - etc. (10-12 items)

6. **Troubleshooting Section**
   - "Migration shows as applied but table doesn't exist" → Solution
   - "Cron job shows failed" → Debug steps
   - "Health endpoint returns 500" → Diagnostics

**Reference Files:**
- `SCHEMA_CONSOLIDATION_GUIDE.md` - Table structure reference
- `supabase/schema.sql` - Expected schema

**Estimated Length:** 6-8 KB

---

#### Guide 4: Resource Management System (`​.gemini-guides/04_resource_management.md`)

**Purpose:** Complete implementation guide for employee resource allocation system

**Content Required:**

1. **Database Schema Section**
   - Complete SQL CREATE TABLE statements
   - Tables to include:
     - `team_members` - Employee records
     - `resource_pools` - Skill groupings
     - `resource_allocations` - Project assignments
     - `manpower_plans` - CSV import storage
     - `utilization_metrics` - Calculated aggregates
   - Include column definitions, types, constraints
   - Include RLS policies for each table
   - Sample seed data (INSERT statements)

2. **UI Components Code** (complete, production-ready)
   - `ResourcesPage.tsx` - Main entry point with tabs
   - `ResourceGrid.tsx` - Filterable table component
   - `AllocationPanel.tsx` - Drag-drop assignment interface
   - `UtilizationChart.tsx` - Recharts heatmap visualization
   - `ManpowerImporter.tsx` - CSV parser with Papa Parse
   - Each component:
     - Full TypeScript code
     - All imports
     - PropTypes
     - Error handling
     - Loading states

3. **Data Hooks Code**
   - `useResourceData.ts` - Fetch and real-time subscriptions
   - `useResourceAllocation.ts` - Assignment logic
   - Complete implementations with Supabase queries

4. **Step-by-Step Implementation Order**
   - Numbered steps 1-8
   - Each step is actionable and testable
   - Example:
     1. Create migration file with table definitions
     2. Run migration in Supabase
     3. Seed sample data
     4. Create TypeScript types in `types.ts`
     5. etc.

5. **Integration Points**
   - Add route to `Sidebar.tsx`
   - Update navigation
   - Add to page imports

6. **Testing Instructions**
   - Load sample data
   - Verify table shows employees
   - Test drag-drop allocation
   - Check utilization chart

**Reference Files:**
- `components/pages/ProjectsPage.tsx` - Pattern for page structure
- `hooks/useDashboardData.ts` - Supabase real-time pattern
- `types.ts` - TypeScript interface examples

**Estimated Length:** 20-25 KB

---

#### Guide 5: RFQ Delta Gate (`​.gemini-guides/05_rfq_delta_gate.md`)

**Purpose:** Detect document changes and flag requirement differences

**Content Required:**

1. **API Endpoint Code** (complete, production-ready)
   - File: `app/api/documents/[id]/hash-requirements/route.ts`
   - Full Next.js API route implementation
   - Logic:
     - Extract requirements from document
     - Generate SHA256 hash
     - Query previous version hash
     - Generate diff if changed
   - Include error handling
   - Include all imports

2. **Delta Detection Algorithm**
   - Explanation of how to compare hashes
   - How to generate diffs
   - Libraries needed: `crypto`, `diff` package
   - Sample diff output

3. **UI Component Code** (complete)
   - `components/documents/DeltaGateAlert.tsx`
   - Displays at top of document detail view
   - Side-by-side diff viewer
   - Change summary with impact labels
   - "Acknowledge & Proceed" button
   - Full TypeScript with all imports

4. **Database Schema Additions**
   - `document_versions` table - Store hash history
   - `document_acknowledgments` table - Track approvals
   - Complete CREATE TABLE statements
   - RLS policies

5. **Integration Steps**
   - Hook into `DocumentDetail.tsx`
   - Check for delta on document load
   - Store acknowledgment when user proceeds
   - Example code showing where to add checks

6. **Testing Instructions**
   - Upload document with requirements
   - Modify requirements
   - Upload new version
   - Verify delta detection triggers
   - Test acknowledgment workflow

**Reference Files:**
- `components/documents/DocumentDetail.tsx` - Integration point
- `lib/supabase.ts` - Database client usage

**Estimated Length:** 15-18 KB

---

#### Guide 6: Validation Framework (`​.gemini-guides/06_validation_framework.md`)

**Purpose:** Automated schema drift and RLS coverage detection

**Content Required:**

1. **Schema Drift Script** (complete, production-ready)
   - File: `scripts/validate-schema-drift.ts`
   - Full TypeScript implementation
   - Connects to Supabase
   - Queries `information_schema`
   - Compares against source of truth (consolidated schema)
   - Generates drift report
   - Checks:
     - Missing tables
     - Missing columns
     - Type mismatches
     - Missing indices
     - Constraint violations
   - Output format: JSON report with severity levels

2. **RLS Coverage Script** (complete)
   - File: `scripts/validate-rls-coverage.ts`
   - Full TypeScript implementation
   - Queries `pg_policies`
   - Identifies tables without RLS enabled
   - Checks for overly permissive policies
   - Generates coverage percentage report
   - Output: JSON with table-by-table coverage

3. **Validation Dashboard Component** (complete code)
   - `components/pages/admin/ValidationDashboard.tsx`
   - Real-time validation status
   - Schema drift indicator with % complete
   - RLS coverage gauge
   - Data integrity scores
   - One-click re-validation button
   - Full TypeScript with all imports

4. **Integration Instructions**
   - Add scripts to `package.json`
   - Add routes to Sidebar (admin only, L3+ tier)
   - Schedule periodic runs (daily via pg_cron)
   - Alert integration (Slack notification on drift detected)

5. **Alert & Notification System**
   - When drift detected: Create alert in `alerts` table
   - Trigger notification to L3+ users
   - Example: "Schema drift detected: Missing column 'audit_trail' in projects_master"

6. **Troubleshooting**
   - "Script hangs" → Add timeout logic
   - "False positives on drift" → Whitelist temporary changes
   - "RLS coverage shows 0%" → Check if RLS actually enabled

**Reference Files:**
- `supabase/schema.sql` - Source of truth schema
- `SCHEMA_CONSOLIDATION_GUIDE.md` - Schema documentation
- `types.ts` - RBAC tier definitions

**Estimated Length:** 18-22 KB

---

#### Guide 7: Performance Optimization (`​.gemini-guides/07_performance_polish.md`)

**Purpose:** Caching, monitoring, and error recovery patterns

**Content Required:**

1. **Caching Strategy Section**

   A. **Supabase Query Caching**
   - Which tables to enable caching on
   - Configuration instructions
   - Dashboard navigation path
   - TTL recommendations for each table

   B. **React Query Integration** (complete code)
   - `npm install @tanstack/react-query`
   - `QueryClientProvider` setup in `App.tsx`
   - Update `useDashboardData` hook with `useQuery`
   - Complete implementation with stale-while-revalidate
   - Cache invalidation strategies

   C. **Service Worker** (complete code)
   - `public/service-worker.js` - Full implementation
   - Register in `App.tsx`
   - Offline fallback logic
   - Cache static assets
   - Network-first vs cache-first strategies

2. **Performance Monitoring** (complete code)
   - `utils/performance-monitor.ts` - Full utility
   - Web Vitals integration
   - Performance marks on critical paths
   - Example: `performance.mark('dashboard-render-start')`
   - Automated baseline reporting
   - Export to CSV for trend analysis

3. **Error Recovery Patterns** (complete code examples)
   - Exponential backoff retry logic
   - Code snippet with full implementation
   - Graceful degradation for Gemini API
   - Fallback when API fails
   - Offline mode with localStorage fallback
   - User-friendly error messages (replace technical errors)
   - Example: "Document service temporarily unavailable. Retry?" instead of "500 Internal Server Error"

4. **Lighthouse Optimization**
   - Checklist of optimizations
   - Expected Lighthouse scores
   - Load time targets

5. **Bundle Size Analysis**
   - Tools to use: `webpack-bundle-analyzer`
   - Setup instructions
   - Expected bundle size baseline
   - Optimization techniques

6. **Database Query Optimization**
   - Common slow queries and how to fix them
   - Index recommendations
   - Query plan analysis

**Reference Files:**
- `hooks/useDashboardData.ts` - Hook to optimize
- `utils/agent.ts` - Error handling examples
- `package.json` - Dependencies

**Estimated Length:** 16-20 KB

---

#### Guide 8: Production Deployment (`​.gemini-guides/08_production_deployment.md`)

**Purpose:** Final deployment gate and go-live procedures

**Content Required:**

1. **Pre-Deployment Master Checklist** (copy-paste format)
   ```markdown
   - [ ] All 7 previous guides completed
   - [ ] All migrations applied and verified
   - [ ] No TypeScript errors (npm run build succeeds)
   - [ ] No console errors in browser DevTools
   - [ ] All 8 modules tested manually
   - [ ] Performance baseline established (npm run health)
   - [ ] Database backup created
   - [ ] Rollback plan documented
   - [ ] Stakeholders notified
   - [ ] On-call engineer assigned
   - [ ] Monitoring alerts configured
   - [ ] Logging aggregation setup (Sentry)
   ```
   (Expand to 15-20 items)

2. **6-Phase Deployment Steps**

   **Phase 1: Local Validation (30 min)**
   - Final build verification: `npm run build`
   - TypeScript check: `npm run type-check`
   - Run health checks: `npm run health`
   - Expected: All pass

   **Phase 2: Staging Deployment (45 min)**
   - Deploy to staging environment
   - Run smoke tests
   - Check all endpoints respond
   - Verify real-time subscriptions work
   - Load testing (if applicable)

   **Phase 3: Production Deployment (30 min)**
   - Environment variable audit (verify all set)
   - Supabase production sync
   - DNS/domain configuration
   - SSL certificate verification
   - Deployment via Vercel (or your platform)

   **Phase 4: Post-Deployment Validation (30 min)**
   - Health check endpoints
   - Agent functionality tests
   - Real-time data updates
   - RLS enforcement verification
   - Monitor error rates (should be near 0%)

   **Phase 5: Monitoring Setup (20 min)**
   - Sentry integration (error tracking)
   - LogRocket setup (session replay)
   - Alert thresholds configured
   - On-call notification channels active

   **Phase 6: Stakeholder Communication (10 min)**
   - Notify team deployment complete
   - Share monitoring dashboard
   - Document go-live time

3. **Rollback Procedures** (if something goes wrong)
   - Database restoration from backup
   - Code revert commands
   - Service restart procedures
   - How to notify stakeholders of rollback

4. **Post-Deployment Monitoring** (24 hours)
   - Key metrics to watch
   - Error rate threshold (alert if > 1%)
   - Latency threshold (alert if p95 > 2s)
   - Database connection issues
   - RLS policy failures

5. **Success Criteria**
   - ✅ All endpoints respond < 1 second p95
   - ✅ Error rate < 0.1%
   - ✅ 0 unhandled RLS violations
   - ✅ Real-time subscriptions active
   - ✅ All agent functions operational
   - ✅ User feedback positive

6. **Common Issues & Solutions**
   - "Deployment succeeds but site shows 500" → Check env vars
   - "Real-time subscriptions not working" → Check Supabase connection
   - "Some users report slow load" → Check database query performance
   - "RLS blocking authorized users" → Verify RLS policies

**Reference Files:**
- `CLAUDE.md` - System architecture
- `supabase/schema.sql` - Database structure
- `.env.example` - Required environment variables

**Estimated Length:** 10-14 KB

---

### SECONDARY DELIVERABLES: Documentation Updates

#### Update 1: CLAUDE.md (`CLAUDE.md`)

**Current State:** 65% complete (documentation lags implementation)

**Updates Required:**

1. **Reports Module Section** (NEW)
   - What: Intelligence reporting system
   - 4 report profiles (Executive Summary, Standard Breakdown, Depth Analysis, Compliance Audit)
   - 3 data sources (Projects, Tenders, Financials)
   - Features (pivoting, hierarchy, CSV export with formula injection protection)
   - Code example showing how to generate a report
   - CSV security patterns

2. **Complete Page Inventory** (EXPAND)
   - Current: 8 pages documented
   - Missing: ResourcesPage, ValidationDashboard, LiabilityDashboard, PersonalTasksPage, RedactionPage, FieldOperationsPage, CalendarPage, ProfilePage
   - Add description, purpose, components used, data sources for each

3. **Dashboard Components Inventory** (NEW)
   - List all 12 core components (after consolidation)
   - For each: Description, data source, interactions
   - Why each component exists

4. **Data Hooks Reference** (NEW)
   - Document all 10 hooks
   - `useDashboardData` - General purpose
   - `useReports` - Reports system
   - `useExecutiveData` - Executive cockpit
   - `useDashboardLogic` - Business logic
   - etc.
   - For each hook: Parameters, return type, example usage

5. **AI Copilot Architecture** (NEW)
   - What: Floating intelligence panel
   - Powered by: Gemini API
   - Features: Natural language queries, contextual suggestions, proactive alerts
   - Integration: `AICommandCenter.tsx`, `CommandPalette.tsx`
   - Example: "What projects are behind schedule?" → Returns specific projects

6. **Governance Components** (NEW)
   - `DashboardFrame.tsx` - Executive wrapper
   - `MetricBlock.tsx` - Governance KPI
   - `TabNav.tsx` - Tab navigation
   - Design language: Minimalist, Apple-grade

7. **Updated Executive Cockpit Architecture**
   - Current in docs: Flash Report, Financial Health, Risk Heatmap, AI Chat
   - Reality: 3-tab navigation, Daily Briefing (AI-generated), Portfolio Velocity charts, Strategic Volume, AI Insights chat
   - Reconcile documentation with actual implementation

8. **Design System 2026** (NEW SECTION)
   - Color palette (18 CSS variables)
   - Typography hierarchy
   - Spacing system
   - Animation/easing standards
   - Glassmorphism patterns
   - Example: "Use `--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);` for interactive elements"

9. **Signals Object Specification** (NEW)
   - What signals dashboard displays
   - `hasBacklog` - Documents pending > 10
   - `stagnantProjects` - No updates > 7 days
   - `complianceIssues` - Missing scans
   - `systemStatus` - Optimal or Congested
   - `riskDistribution` - Critical/high/nominal/stable breakdown
   - `poBreaches` - Purchase order violations

10. **Component Organization Tree** (NEW)
    - Visual hierarchy of component relationships
    - Example:
      ```
      App
      ├── DashboardLayout
      │   ├── KPI Metrics Band
      │   │   └── MetricTile × 4
      │   └── Command Grid
      │       ├── ProjectList
      │       ├── TenderList
      │       └── UnifiedRiskCommand
      ```

**Estimated Length Added:** 15-20 KB

---

#### Update 2: Create `docs/AI_COPILOT_GUIDE.md` (NEW FILE)

**Purpose:** Complete reference for AI Copilot system

**Content:**
1. **Overview** - What AI Copilot does
2. **Architecture** - How it's implemented
3. **Usage Patterns** - How users interact with it
4. **Gemini API Integration** - Specific configuration
5. **Context Binding** - How it understands current dashboard state
6. **Command Palette** - ⌘K shortcuts and quick actions
7. **Smart Notifications** - How intelligent alerts work
8. **Training Examples** - Common queries and responses
9. **Limitations** - What it can and can't do
10. **Troubleshooting** - Common issues

**Estimated Length:** 6-8 KB

---

#### Update 3: Create `docs/REPORTS_SYSTEM.md` (NEW FILE)

**Purpose:** Complete Reports documentation (currently 0% documented)

**Content:**
1. **Overview** - What Reports module does
2. **4 Report Profiles** - Detailed specs
3. **3 Data Sources** - How data flows
4. **Features** - Pivoting, hierarchy, search, export
5. **Security** - CSV formula injection prevention
6. **Code Examples** - How to generate reports programmatically
7. **API Endpoints** - Report generation endpoints
8. **Performance** - Caching and optimization
9. **Permissions** - RBAC tier access
10. **Customization** - Adding new report types

**Estimated Length:** 8-10 KB

---

#### Update 4: Create `docs/DESIGN_SYSTEM_2026.md` (NEW FILE)

**Purpose:** Design standards for 2026 aesthetic

**Content:**
1. **Color Palette** - All 18 CSS variables with hex values
2. **Typography** - Font hierarchy, sizes, weights
3. **Spacing System** - Consistent gap and padding values
4. **Shadows & Depth** - Glassmorphism, blur, elevation
5. **Animation Standards** - Easing functions, duration guidelines
6. **Component Patterns** - Reusable design patterns
7. **Accessibility** - WCAG AA compliance standards
8. **Responsive Design** - Breakpoint definitions
9. **Dark Mode** - Dark palette (if applicable)
10. **Examples** - Visual code examples for each pattern

**Estimated Length:** 10-12 KB

---

#### Update 5: Create `.gemini-guides/README.md` (MASTER INDEX)

**Purpose:** Overview and navigation for all 8 guides

**Content:**
1. **Purpose Statement** - Why these guides exist
2. **Quick Start** - Where to begin
3. **Execution Timeline** - Gantt chart or visual timeline
4. **Guide Index** (table format)
   | Guide | Purpose | Prerequisites | Time |
   |-------|---------|---------------|------|
   | Guide 1 | Deploy migrations | None | 15 min |
   | Guide 2 | Enable pg_cron | Guide 1 | 10 min |
   | etc. |

5. **Dependency Graph** - Which guides block which
6. **File Locations** - Where all generated code goes
7. **Verification Checklist** - How to confirm success
8. **Rollback Procedures** - What to do if something fails
9. **Support** - Who to contact for issues
10. **Glossary** - Technical terms defined

**Estimated Length:** 4-6 KB

---

## WORK ORGANIZATION

### Timeline (Parallel to Claude Code)

**Week 1-2 (Phase 1: Visual Refinement)**
- Start: Guides 1-3 (Deployment, pg_cron, Verification)
- These are independent and foundational

**Week 2-3 (Phase 2: Component Consolidation)**
- Continue: Guides 4-5 (Resource Management, RFQ Delta)
- Start: CLAUDE.md update (Reports section + Pages inventory)

**Week 3-4 (Phase 3: AI Integration)**
- Continue: Guides 6-7 (Validation, Performance)
- Continue: CLAUDE.md update (Hooks, AI Copilot, Governance)
- Create: `docs/AI_COPILOT_GUIDE.md`

**Week 4 (Phase 4: Executive Cockpit)**
- Create: Guide 8 (Production Deployment)
- Update: CLAUDE.md (Design System 2026, Signals, Tree)
- Create: `docs/REPORTS_SYSTEM.md`
- Create: `docs/DESIGN_SYSTEM_2026.md`

**Week 5 (Final Polish)**
- Create: `.gemini-guides/README.md` (master index)
- Review all documents for completeness
- Update any references or cross-links

---

## QUALITY STANDARDS FOR YOUR OUTPUT

**Every guide must have:**
- ✅ Complete, copy-paste ready code (NO placeholders like `[YOUR_VALUE]`)
- ✅ Exact file paths with directory structure
- ✅ Numbered, actionable steps
- ✅ Expected output at each step
- ✅ Verification commands to test success
- ✅ Troubleshooting section with 3-5 common errors + solutions
- ✅ Time estimate for each section
- ✅ All dependencies clearly marked
- ✅ No "figure it out" or vague instructions

**Every documentation file must have:**
- ✅ Clear purpose statement
- ✅ Organized sections with headers
- ✅ Code examples where applicable
- ✅ Links to related files/guides
- ✅ Glossary for technical terms
- ✅ At least one visual diagram (ASCII or description)

---

## CONTEXT & REFERENCES

**Key Files in Codebase (for reference while writing):**
- `supabase/schema.sql` - Database structure (for Schema guide)
- `CLAUDE.md` - Current documentation (update this)
- `SCHEMA_CONSOLIDATION_GUIDE.md` - Schema docs (reference)
- `WIREFRAME_DOCUMENT.md` - UI wireframes (for Executive Cockpit guide)
- `components/pages/ProjectsPage.tsx` - Component pattern (reference)
- `hooks/useDashboardData.ts` - Hook pattern (reference)
- `utils/agent.ts` - Agent implementation (reference)
- `.env.example` - Required environment variables (for deployment guide)

**Architecture to Reference:**
- Supabase PostgreSQL backend with real-time subscriptions
- React + TypeScript frontend
- Clerk authentication (optional, demo mode supported)
- Gemini API for AI features
- Next.js API routes for backend logic

---

## DELIVERABLES CHECKLIST

**Guides (8 files):**
- [ ] `.gemini-guides/01_deploy_migrations.md` (8-12 KB)
- [ ] `.gemini-guides/02_enable_pgcron.md` (4-6 KB)
- [ ] `.gemini-guides/03_verify_deployment.md` (6-8 KB)
- [ ] `.gemini-guides/04_resource_management.md` (20-25 KB)
- [ ] `.gemini-guides/05_rfq_delta_gate.md` (15-18 KB)
- [ ] `.gemini-guides/06_validation_framework.md` (18-22 KB)
- [ ] `.gemini-guides/07_performance_polish.md` (16-20 KB)
- [ ] `.gemini-guides/08_production_deployment.md` (10-14 KB)

**Documentation (5 updates + 1 new):**
- [ ] `CLAUDE.md` - Update with 10 new sections (15-20 KB added)
- [ ] `docs/AI_COPILOT_GUIDE.md` - NEW (6-8 KB)
- [ ] `docs/REPORTS_SYSTEM.md` - NEW (8-10 KB)
- [ ] `docs/DESIGN_SYSTEM_2026.md` - NEW (10-12 KB)
- [ ] `.gemini-guides/README.md` - NEW (4-6 KB)

**Total Output:** 150-200 KB of production-ready documentation

---

## COORDINATION WITH CLAUDE CODE

**Claude Code will:**
- Start Phase 1 (Visual Refinement) immediately
- Commit code changes every 2-3 days
- Test each component as it's built
- Notify you of any architectural changes

**You should:**
- Reference Claude Code's commits to stay synchronized
- Use final, production code from Claude Code's branch
- Include code examples from `main` branch in your guides
- Don't wait - guides can be mostly complete before code is final

**Sync Points:**
- After Phase 1 → You update CLAUDE.md with design system
- After Phase 3 → You create AI Copilot guide and docs update
- After Phase 4 → You finalize deployment guide with real values
- After Phase 5 → You create master README

---

## START SEQUENCE

1. **You receive this briefing** ← YOU ARE HERE
2. **Claude Code commits to `feature/2026-redesign` branch**
3. **You start generating Guides 1-3** (independent work)
4. **Claude Code starts Phase 1** (in parallel)
5. **After 2 weeks → Both report progress**
6. **Continue parallel execution through week 5**
7. **Final sync → Claude Code merges to main + You update master README**

---

## SUCCESS CRITERIA

**For You:**
- All 8 guides complete, copy-paste ready, no placeholder text
- All documentation updated and consistent
- Zero broken links or references
- All code examples match final Claude Code commits
- Verified by running through at least 2-3 guides end-to-end

**For Project:**
- Guides enable anyone (not just engineers) to deploy changes
- Documentation matches implementation 100%
- Design system followed consistently
- Total project ready for production deployment

---

## READY TO START? 🚀

Once Claude Code begins Phase 1, you're good to go!

**Your first task:** Generate Guide 1 (`01_deploy_migrations.md`) covering migration deployment

**Reference:** Look at `supabase/migrations/` directory and `SCHEMA_CONSOLIDATION_GUIDE.md` for context

Good luck! This is a crucial piece of the project. Your documentation will enable others to successfully implement and maintain this system. 💪

---

**Questions?** Ask Claude Code - this briefing is your complete specification.
**Need clarification?** Each guide has specific content requirements and reference files listed.
**Stuck?** The "Troubleshooting" section in each guide provides guidance.

