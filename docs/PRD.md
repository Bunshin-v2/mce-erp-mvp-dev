# Product Requirements Document (PRD)
**Project:** Morgan Command Center (Nexus ERP)
**Version:** 2.4.0 (Production Ready)
**Date:** January 24, 2026

## 1. Executive Summary
The MCE Command Center is a comprehensive Enterprise Resource Planning (ERP) system tailored for Morgan Consulting Engineers. It unifies Project Management, Tendering, Financials, and Resource Planning into a single "Dark Glass" executive dashboard.

## 2. Core Modules
### 2.1 Executive Cockpit (L3+)
- **Purpose:** High-level strategic oversight.
- **Features:** Risk Heatmap, Financial Flash Reports, Portfolio Health.
- **Access:** Restricted to Chairman, Vice Chairman, Super Admin.

### 2.2 Tender Intake & Tracking
- **Purpose:** Standardize the bidding process.
- **Features:** Intake Wizard (Template -> TOC), Win Probability AI, Delta Gate (Document Change Detection).

### 2.3 Project Operations
- **Purpose:** Delivery management.
- **Features:** Enterprise Grid (Sortable), Gantt View (Planned), Progress Tracking (Verified).

### 2.4 Resource Management
- **Purpose:** Optimization of staff utilization.
- **Features:** Manpower Heatmap, Demand Forecasting, Timesheet Approval.

## 3. Security & Compliance
- **Authentication:** Clerk (Third-Party Provider) with Google/Outlook SSO support.
- **Authorization:** 4-Tier RBAC (L1 Staff -> L4 Admin) enforced via Supabase RLS.
- **Audit Trail:** Immutable logs for every CREATE/UPDATE/DELETE action.

## 4. Technical Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Recharts.
- **Backend:** Supabase (PostgreSQL 15), Edge Functions.
- **Design System:** "Morgan Dark Glass" (Charcoal #444444, Neon Accents, Plus Jakarta Sans).
