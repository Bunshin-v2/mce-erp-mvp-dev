# MCE Command Center - Master Specification v2.0 (Part 2)
 
## UI/UX Component Specifications
 
### Page Architecture
 
```
┌─────────────────────────────────────────────────────────────┐
│                      APP SHELL                              │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    HEADER BAR                           │ │
│ │  [Logo] [Dashboard] [Projects] [Tenders] [Docs] [Search]│ │
│ │                              [Notifications🔔] [User👤] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌───────┐ ┌───────────────────────────────────────────────┐ │
│ │       │ │                                               │ │
│ │ SIDE  │ │              MAIN CONTENT                     │ │
│ │ NAV   │ │                                               │ │
│ │       │ │                                               │ │
│ │ Quick │ │                                               │ │
│ │ Links │ │                                               │ │
│ │       │ │                                               │ │
│ └───────┘ └───────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ FOOTER: © MCE 2024 | Help | Settings | Version         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
 
### Dashboard Page (`/dashboard`)
 
```
┌─────────────────────────────────────────────────────────────┐
│                     MCE COMMAND CENTER                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ 🎯 ACTIVE       │ │ ⚠️ TENDERS DUE   │ │ 💰 PAYMENTS     │ │
│ │    PROJECTS     │ │    THIS WEEK    │ │    PENDING      │ │
│ │                 │ │                 │ │                 │ │
│ │      24         │ │       5         │ │   $1.2M         │ │
│ │   ▲ 3 new       │ │   🔴 2 urgent   │ │   ▲ 15%         │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ ⏰ LIABILITY    │ │ 📋 MILESTONES   │ │ 📊 WIN RATE     │ │
│ │    EXPIRING     │ │    THIS MONTH   │ │    (YTD)        │ │
│ │                 │ │                 │ │                 │ │
│ │       3         │ │      12         │ │      42%        │ │
│ │   DLP ending    │ │   ▲ 8 on track │ │   ▲ 5%          │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │              CRITICAL NOTIFICATIONS                    │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ 🔴 Tender "RFP-2024-089" deadline in 2 days    [ACK]  │   │
│ │ 🟠 Payment milestone overdue: Al Wasl Tower    [VIEW] │   │
│ │ 🟡 DLP expiring: Marina Heights (30 days)      [VIEW] │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌───────────────────────┐ ┌─────────────────────────────┐   │
│ │   UPCOMING DEADLINES  │ │     PROJECT PROGRESS        │   │
│ ├───────────────────────┤ ├─────────────────────────────┤   │
│ │ Today                 │ │ ████████████░░░░ 75% AWL-24 │   │
│ │ • Submit RFP-089      │ │ ██████████░░░░░░ 62% MRH-24 │   │
│ │ Tomorrow              │ │ ████████░░░░░░░░ 50% DFC-24 │   │
│ │ • Payment due AWL-24  │ │ ██████░░░░░░░░░░ 38% PKV-24 │   │
│ │ This Week             │ │ ████░░░░░░░░░░░░ 25% NEW-24 │   │
│ │ • Design review MRH   │ │                             │   │
│ └───────────────────────┘ └─────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
 
### Projects List Page (`/projects`)
 
```
┌─────────────────────────────────────────────────────────────┐
│ PROJECTS                                    [+ New] [Export]│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search projects...              [Filter ▼] [Sort ▼] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ CODE    │ NAME           │ CLIENT     │ PM    │ STATUS  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ AWL-24  │ Al Wasl Tower  │ Emaar      │ Ahmed │ 🟢 Active│ │
│ │ MRH-24  │ Marina Heights │ Nakheel    │ Sara  │ 🟢 Active│ │
│ │ DFC-23  │ Dubai Festival │ Al Futtaim │ Omar  │ 🟡 Hold  │ │
│ │ PKV-24  │ Park View      │ Meraas     │ Ahmed │ 🟢 Active│ │
│ │ BWT-23  │ Business Tower │ DIFC       │ Sara  │ ✅ Done  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Showing 5 of 24 projects          [◀ Prev] Page 1 [Next ▶] │
└─────────────────────────────────────────────────────────────┘
```
 
### Project Detail Page (`/projects/[id]`)
 
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Projects                                          │
│                                                             │
│ AL WASL TOWER (AWL-24)                        [Edit] [⋮]   │
│ Client: Emaar Properties | PM: Ahmed Al-Rashid              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│ │ STATUS       │ │ PROGRESS     │ │ VALUE        │          │
│ │ 🟢 Active    │ │ ████████░ 75%│ │ $2.4M        │          │
│ └──────────────┘ └──────────────┘ └──────────────┘          │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ TABS: [Overview] [Milestones] [Documents] [Team] [Log] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                    MILESTONES                           │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ✅ Preliminary Design      │ 15%  │ Mar 15, 2024  │ Done │ │
│ │ ✅ Client Approval         │  -   │ Mar 30, 2024  │ Done │ │
│ │ 🔄 Detailed Design         │ 20%  │ Apr 30, 2024  │ WIP  │ │
│ │ ⏳ Design Submission       │  -   │ May 15, 2024  │ Next │ │
│ │ ⏳ Supervision Start       │ 35%  │ Jun 01, 2024  │ -    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                  RECENT DOCUMENTS                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 📄 AWL-Contract-v2.pdf      │ Contract  │ Apr 02 │ [↓]  │ │
│ │ 📄 AWL-Preliminary.dwg      │ Drawing   │ Mar 28 │ [↓]  │ │
│ │ 📄 AWL-Scope-Rev1.docx      │ Scope     │ Mar 15 │ [↓]  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
 
### Tender List Page (`/tenders`)
 
```
┌─────────────────────────────────────────────────────────────┐
│ TENDER TRACKER                              [+ New Tender]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Filter: [All ▼] [This Week ▼] [My Tenders ▼]           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 URGENT (Due in 3 days or less)                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ RFP-2024-089 │ Dubai Hills Villa │ ⏰ 2 days │ [VIEW]   │ │
│ │ RFP-2024-091 │ JBR Apartment     │ ⏰ 3 days │ [VIEW]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🟡 UPCOMING (Due this week)                             │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ RFP-2024-085 │ Creek Tower Ext   │ ⏰ 5 days │ [VIEW]   │ │
│ │ RFP-2024-087 │ Palm West Hotel   │ ⏰ 7 days │ [VIEW]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📋 ALL TENDERS                                          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ REF        │ TITLE          │ DEADLINE │ STATUS │ OWNER │ │
│ │ RFP-089    │ Dubai Hills    │ Apr 15   │ Prep   │ Ahmed │ │
│ │ RFP-091    │ JBR Apartment  │ Apr 16   │ Review │ Sara  │ │
│ │ RFP-085    │ Creek Tower    │ Apr 18   │ Draft  │ Omar  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
 
### Tender Detail Page (`/tenders/[id]`)
 
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Tenders                                           │
│                                                             │
│ RFP-2024-089: DUBAI HILLS VILLA COMPLEX      [Edit] [⋮]    │
│ Client: Emaar | Deadline: Apr 15, 2024                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐    │
│ │ ⏰ DEADLINE    │ │ 💰 VALUE       │ │ 📊 STATUS      │    │
│ │   2 DAYS       │ │   $850K        │ │   Preparing    │    │
│ │   Apr 15, 2024 │ │   (estimated)  │ │   🟡           │    │
│ └────────────────┘ └────────────────┘ └────────────────┘    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ TABS: [Details] [Requirements] [Documents] [Comms] [Team]│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              COMMUNICATION LOG                 [+ Add]  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Apr 10 │ 📧 Email │ Clarification request sent  │ Ahmed │ │
│ │ Apr 08 │ 📞 Call  │ Initial discussion          │ Sara  │ │
│ │ Apr 05 │ 📧 Email │ RFP received                │ System│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │              SUBMISSION CHECKLIST                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ✅ Company profile                                      │ │
│ │ ✅ Technical proposal                                   │ │
│ │ 🔄 Financial proposal (in progress)                     │ │
│ │ ⏳ CVs of key personnel                                 │ │
│ │ ⏳ Similar project references                           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
 
### Document Library Page (`/documents`)
 
```
┌─────────────────────────────────────────────────────────────┐
│ DOCUMENT LIBRARY                                [+ Upload]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search documents...                                  │ │
│ │                                                         │ │
│ │ Type: [All ▼]  Project: [All ▼]  Date: [Any ▼]         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ DOCUMENT         │ TYPE      │ PROJECT  │ DATE   │ ACT  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 📄 Contract-v2   │ Contract  │ AWL-24   │ Apr 02 │ [↓]  │ │
│ │ 📄 Tender-Resp   │ Proposal  │ RFP-089  │ Apr 10 │ [↓]  │ │
│ │ 📐 Floor-Plan    │ Drawing   │ MRH-24   │ Apr 01 │ [↓]  │ │
│ │ 📊 Progress-Rpt  │ Report    │ DFC-23   │ Mar 30 │ [↓]  │ │
│ │ 📄 Variation-01  │ Variation │ AWL-24   │ Mar 28 │ [↓]  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                  UPLOAD DOCUMENT                        │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │         Drag and drop files here                    │ │ │
│ │ │              or click to browse                     │ │ │
│ │ │         Supported: PDF, DOCX, XLSX, DWG             │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Title: [____________________]                           │ │
│ │ Type:  [▼ Select type______]                           │ │
│ │ Link:  ○ Project [▼______]  ○ Tender [▼______]         │ │
│ │ Sensitivity: ○ Normal  ○ Confidential  ○ Restricted    │ │
│ │                                                         │ │
│ │                                    [Cancel] [Upload]   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
 
### Notification Center (`/notifications`)
 
```
┌─────────────────────────────────────────────────────────────┐
│ NOTIFICATION CENTER                    [Mark All Read] [⚙️] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Filter: [All ▼] [Unread ▼] [Requires Action ▼]         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 CRITICAL - REQUIRES ACKNOWLEDGMENT                   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ⚠️ Tender "RFP-089" deadline in 2 days                  │ │
│ │    Due: Apr 15, 2024 | Owner: Ahmed                     │ │
│ │    [View Tender] [Acknowledge]                          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ⚠️ Payment milestone overdue: Al Wasl Tower             │ │
│ │    Due: Apr 10, 2024 | Amount: $120,000                 │ │
│ │    [View Project] [Acknowledge]                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🟡 WARNINGS                                             │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ ⏰ DLP expiring in 30 days: Marina Heights (MRH-24)     │ │
│ │    Expiry: May 12, 2024                    [View] [✓]   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 📋 Milestone due this week: Design Review (AWL-24)      │ │
│ │    Due: Apr 17, 2024                       [View] [✓]   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ℹ️ INFORMATION                                          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 📄 New document uploaded: Contract-v2.pdf (AWL-24)      │ │
│ │    Uploaded by: Sara | Apr 11, 2024        [View] [✓]   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
 
---
 
## Security & OWASP Compliance
 
### OWASP Top 10 2025 Mitigation
 
| Risk | Mitigation | Implementation |
|------|-----------|----------------|
| **A01: Broken Access Control** | RLS + RBAC | Supabase RLS policies on all tables |
| **A02: Cryptographic Failures** | TLS + Encryption | Vercel HTTPS, Supabase encrypted storage |
| **A03: Injection** | Parameterized queries | Supabase client + Zod validation |
| **A04: Insecure Design** | Threat modeling | Security evaluator agent |
| **A05: Security Misconfiguration** | Secure defaults | RLS enabled by default, no public writes |
| **A06: Vulnerable Components** | Dependency scanning | npm audit + Dependabot |
| **A07: Auth Failures** | Clerk MFA | Session management + token rotation |
| **A08: Data Integrity** | Append-only logs | Immutable audit_log table |
| **A09: Logging Failures** | Structured logging | Request IDs + audit trail |
| **A10: SSRF** | URL validation | Allowlist external domains |
 
### Security Architecture
 
```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Layer 1: EDGE (Vercel)                              │   │
│  │ • WAF rules        • Rate limiting                  │   │
│  │ • DDoS protection  • Geographic restrictions        │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Layer 2: AUTHENTICATION (Clerk)                     │   │
│  │ • JWT tokens       • MFA enforcement                │   │
│  │ • Session mgmt     • SSO integration                │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Layer 3: AUTHORIZATION (Next.js Middleware)         │   │
│  │ • Route protection  • Role validation               │   │
│  │ • Feature flags     • Org membership check          │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Layer 4: DATA ACCESS (Supabase RLS)                 │   │
│  │ • Row-level security  • Column-level permissions    │   │
│  │ • Policy evaluation   • Audit logging               │   │
│  └─────────────────────────────────────────────────────┘   │
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Layer 5: STORAGE (Supabase Storage)                 │   │
│  │ • Signed URLs      • Access policies                │   │
│  │ • Virus scanning   • Encryption at rest             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
 
---
 
## RBAC Permissions Matrix
 
### Role Hierarchy
 
```
┌─────────────────────────────────────────────────────────────┐
│                    ROLE HIERARCHY                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌────────────────┐                             │
│              │  SUPER_ADMIN   │ ◄─── Full system access     │
│              └───────┬────────┘                             │
│                      │                                      │
│              ┌───────┴────────┐                             │
│              │  CHAIRMAN_VP   │ ◄─── Executive oversight    │
│              └───────┬────────┘                             │
│                      │                                      │
│         ┌────────────┼────────────┐                         │
│         ▼            ▼            ▼                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ DEPT_HEAD  │ │  FINANCE   │ │     PM     │              │
│  └─────┬──────┘ └────────────┘ └─────┬──────┘              │
│        │                              │                     │
│        ▼                              ▼                     │
│  ┌────────────┐                ┌────────────┐              │
│  │  ENGINEER  │                │   VIEWER   │              │
│  └────────────┘                └────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
 
### Permissions by Entity
 
| Entity | super_admin | chairman_vp | dept_head | pm | engineer | finance | viewer |
|--------|-------------|-------------|-----------|-----|----------|---------|--------|
| **Projects** |
| Create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Read All | ✅ | ✅ | ✅ | Own/Team | Team | ✅ | Team |
| Update | ✅ | ✅ | ✅ | Own | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Tenders** |
| Create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Read All | ✅ | ✅ | ✅ | Own/Team | Team | ✅ | ❌ |
| Update | ✅ | ✅ | ✅ | Own | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Documents** |
| Upload | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Download | ✅ | ✅ | ✅ | Team | Team | ✅ | Team |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Payments** |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| View All | ✅ | ✅ | Dept | Own | ❌ | ✅ | ❌ |
| Approve | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Users** |
| Manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Audit Log** |
| View | ✅ | ✅ | Own Dept | Own | Own | Own | ❌ |
| Export | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
 
---
 
## API Specifications
 
### REST Endpoints
 
```
BASE URL: /api/v1
 
PROJECTS
  GET    /projects              List projects (RLS filtered)
  POST   /projects              Create project
  GET    /projects/:id          Get project detail
  PATCH  /projects/:id          Update project
  DELETE /projects/:id          Delete project (admin only)
  GET    /projects/:id/export   Export project data
 
TENDERS
  GET    /tenders               List tenders (RLS filtered)
  POST   /tenders               Create tender
  GET    /tenders/:id           Get tender detail
  PATCH  /tenders/:id           Update tender
  POST   /tenders/:id/comms     Add communication event
 
DOCUMENTS
  POST   /documents/prepare     Get signed upload URL
  GET    /documents/:id/download Get signed download URL
  GET    /documents             List documents (RLS filtered)
 
NOTIFICATIONS
  GET    /notifications         List notifications
  POST   /notifications/:id/ack Acknowledge notification
 
SEARCH
  GET    /search?q=             Full-text search
  POST   /search/rag            RAG-powered semantic search
 
WORKFLOWS
  GET    /workflows             List workflow definitions
  POST   /workflows/:id/trigger Trigger workflow instance
  GET    /workflows/instances   List running instances
```
 
### Server Action Signatures
 
```typescript
// Projects
async function createProject(data: CreateProjectInput): Promise<Project>
async function updateProject(id: string, data: UpdateProjectInput): Promise<Project>
async function deleteProject(id: string): Promise<void>
 
// Tenders
async function createTender(data: CreateTenderInput): Promise<Tender>
async function updateTender(id: string, data: UpdateTenderInput): Promise<Tender>
async function addTenderComms(tenderId: string, data: CommsInput): Promise<TenderComm>
 
// Documents
async function prepareDocumentUpload(data: PrepareUploadInput): Promise<SignedUrl>
async function createSignedDownload(documentId: string): Promise<SignedUrl>
 
// Notifications
async function acknowledgeNotification(id: string): Promise<Notification>
 
// Workflows
async function triggerWorkflow(definitionId: string, entityId: string): Promise<WorkflowInstance>
```
 
---
 
## Deployment & Operations
 
### Environment Configuration
 
```bash
# .env.local.example
 
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
 
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJxxx  # Anon key (RLS enforced)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx # Admin key (server only)
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
 
# AI/RAG Configuration
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx  # For embeddings
 
# Application
NEXT_PUBLIC_APP_URL=https://mce-command.vercel.app
NODE_ENV=production
```
 
### CI/CD Pipeline
 
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
 
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
 
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
 
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
 
  deploy-preview:
    needs: [lint-and-test, security-scan]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
 
  deploy-production:
    needs: [lint-and-test, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```
 
### Smoke Test Checklist
 
```
POST-DEPLOY VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] Landing page loads (/)
[ ] Sign-in redirects to Clerk (/sign-in)
[ ] Dashboard accessible after auth (/dashboard)
[ ] Projects CRUD operations work
[ ] Tenders CRUD operations work
[ ] Document upload completes
[ ] Document download works
[ ] Search returns results
[ ] Notifications appear
[ ] Notification acknowledgment works
[ ] RLS blocks unauthorized access
[ ] Audit log records operations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
 
---
 
*End of Part 2. See CHATGPT_FIGMA_PROMPTS.md for Figma diagram generation prompts.*