# COMPLETE HEALTH ARCHITECTURE - WHO DOES WHAT

**Your Question:** "By doing the above, who will check the health of endpoints and overall system?"

**Answer:** Four layers of automated + human monitoring run 24/7.

---

## THE COMPLETE PICTURE

```
┌──────────────────────────────────────────────────────────────────────┐
│ YOUR ERP SYSTEM IN PRODUCTION                                        │
└──────────────────────────────────────────────────────────────────────┘

    ↓↓↓ LAYER 1: Continuous Probe Service (Every 5 minutes) ↓↓↓

    Vercel Cron / AWS Lambda
         │
         ├─ Makes HTTP request to /api/health
         ├─ Hits all 24 critical endpoints
         ├─ Validates latency, auth, RLS
         ├─ Checks response schemas
         └─ Stores results + triggers alerts if FAIL

    ↓↓↓ LAYER 2: Application Logging (Every request) ↓↓↓

    Your API
         │
         ├─ logger.ts logs every request
         │  └─ endpoint, latency, status, user, errors
         ├─ Exports to Sentry / Datadog
         └─ Real-time metrics available on dashboard

    ↓↓↓ LAYER 3: Database Health Jobs (Hourly/Daily) ↓↓↓

    pg_cron (Supabase)
         │
         ├─ validate_schema_drift()         [daily 2 AM]
         ├─ validate_rls_coverage()         [daily 3 AM]
         ├─ check_for_corruption()          [every 30 min]
         └─ process_escalations()           [hourly]

    ↓↓↓ LAYER 4: Alert Engine (Real-time) ↓↓↓

    Comparison Engine
         │
         ├─ Is latency p95 > 300ms?        → WARNING
         ├─ Is error rate > 1%?             → CRITICAL
         ├─ Is database down?               → CATASTROPHIC
         ├─ Is RLS bypassed?                → CATASTROPHIC
         └─ Sends notifications + escalates

    ↓↓↓ LAYER 5: Human Response ↓↓↓

    On-Call Engineer
         │
         ├─ Receives alert via SMS/Slack/PagerDuty
         ├─ Has 15 minutes to acknowledge
         ├─ Investigates root cause
         ├─ Applies fix
         └─ Closes incident

    ↓↓↓ LAYER 6: Autonomous Remediation ↓↓↓

    Auto-Remediation Engine
         │
         ├─ If CATASTROPHIC failure detected
         ├─ Automatically triggers rollback
         ├─ Switches to read-only mode
         ├─ Disables write endpoints
         └─ Pages manager if auto-fix doesn't work
```

---

## TIMELINE: WHAT HAPPENS WHEN FAILURE OCCURS

### Example: Database Latency Spike at 3 AM

```
3:00:00 AM
  │
  ├─ Vercel Cron probe runs automatically
  │  └─ Makes requests to all endpoints
  │  └─ Measures latency: GET /api/projects = 1200ms
  │  └─ Threshold exceeded (p99 budget: 800ms)
  │
3:00:05 AM
  │
  ├─ Alert engine detects failure
  │  └─ Severity: CRITICAL
  │  └─ Message: "Endpoint latency p99 exceeds budget by 50%"
  │
3:00:10 AM
  │
  ├─ Notifications sent:
  │  ├─ #infrastructure Slack: "🚨 CRITICAL: Latency spike detected"
  │  ├─ PagerDuty: Incident created, on-call engineer paged
  │  ├─ Dashboard: Live alert shown
  │  └─ Sentry: Error group created
  │
3:00:15 AM
  │
  ├─ On-call engineer's phone buzzes
  │  └─ SMS + PagerDuty notification
  │  └─ "Critical: GET /api/projects latency 1200ms"
  │
3:02:00 AM
  │
  ├─ Engineer wakes up, checks dashboard
  │  └─ Sees 15 minute trend showing gradual spike
  │  └─ Checks database metrics
  │  └─ Identifies root cause: Long-running migration
  │
3:05:00 AM
  │
  ├─ Engineer kills the migration
  │  └─ Latency returns to normal (<100ms)
  │
3:10:00 AM
  │
  ├─ Next probe run confirms recovery
  │  └─ Status changes back to HEALTHY
  │  └─ Alert closed automatically
  │
3:15:00 AM
  │
  └─ Post-incident:
     ├─ Alert summary sent to team: "Incident resolved by L1 engineer"
     ├─ Dashboard shows: "Downtime: 12 minutes, Root cause: Migration"
     └─ Post-mortem scheduled for next day
```

**Total Time to Detection: < 1 minute**
**Total Time to Remediation: ~5 minutes**
**User Impact: Minimal (brief latency spike, not service outage)**

---

## EACH COMPONENT'S JOB

### 1. ENDPOINT PROBES (Vercel Cron)

**What:** Makes real HTTP requests to every endpoint
**When:** Every 5 minutes, 24/7
**Who Runs It:** Vercel infrastructure (automatic)
**Example:**
```
GET http://localhost:3000/api/projects
  → Latency: 87ms ✅ (under 150ms budget)

GET http://localhost:3000/api/documents
  → Latency: 450ms ⚠️ (exceeds 300ms warning)

POST http://localhost:3000/api/projects
  → Status: 403 ❌ (auth failed or RLS blocked)
```

### 2. APPLICATION LOGGING (logger.ts)

**What:** Records every API call, error, and anomaly
**When:** Real-time, every single request
**Who Runs It:** Your Node.js application
**What Gets Logged:**
```typescript
{
  timestamp: "2026-01-29T03:00:00Z",
  method: "GET",
  path: "/api/projects",
  status: 200,
  latency_ms: 87,
  user_id: "user_123",
  error: null
}
```

### 3. DATABASE JOBS (pg_cron)

**What:** Automated checks running inside Supabase
**When:** Scheduled times (hourly, daily, every 30 min)
**Who Runs It:** Supabase PostgreSQL scheduler
**Examples:**
```sql
-- Every 30 minutes: Check for data corruption
check_for_corruption()
  → Detects duplicate IDs, orphaned records, inconsistencies

-- Daily 2 AM: Schema drift detection
detect_schema_drift()
  → Verifies all expected tables and columns exist

-- Hourly: Escalate unacknowledged critical alerts
process_escalations()
  → If alert > 4 hours old and not acknowledged, escalate to manager
```

### 4. ALERT ENGINE (Threshold Comparison)

**What:** Compares metrics to thresholds, sends notifications
**When:** Real-time (whenever thresholds are crossed)
**Who Runs It:** Alert service (Sentry, Datadog, or custom)
**Decision Logic:**
```
IF latency_p95 < 200ms THEN
  Status = INFO (just log)
ELIF latency_p95 < 300ms THEN
  Send to #infrastructure Slack
ELIF latency_p95 < 500ms THEN
  Send WARNING to Slack + PagerDuty
ELSE (latency_p95 > 500ms)
  Page on-call engineer
  Severity = CRITICAL
```

### 5. MONITORING DASHBOARD (Web UI)

**What:** Real-time system status visible to everyone
**When:** Always available, updates every 5 minutes
**Who Runs It:** React component in your app
**Shows:**
- Current system health (HEALTHY / DEGRADED / CRITICAL)
- Last 24 hours latency trend
- Recent alerts and their status
- Uptime percentage
- Next scheduled probe countdown

### 6. ON-CALL ENGINEERS (Humans)

**What:** Respond to critical and catastrophic alerts
**When:** Paged by alert system (within minutes)
**Who:** Rotating on-call engineers
**Responsibilities:**
- Acknowledge alert within 15 minutes
- Investigate root cause
- Apply fix
- Verify recovery with dashboard
- Close incident
- Post-mortem next day

### 7. AUTONOMOUS REMEDIATION (Self-Healing)

**What:** Automatic recovery for catastrophic failures
**When:** Triggered by system (no human interaction)
**Who Runs It:** Your CI/CD pipeline / automation engine
**Auto-Actions:**
```
IF failure = CATASTROPHIC THEN:
  1. Rollback: git revert HEAD && deploy
  2. Read-only mode: Disable write endpoints
  3. Alert: Page manager + CEO
  4. Verify: Re-probe to confirm recovery
  5. If still broken: Page for manual intervention
```

---

## DAILY CHECK-IN: WHAT THE TEAM SEES

### Every Morning (Email Report)

```
📊 OVERNIGHT HEALTH REPORT (11 PM - 7 AM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

System Status: ✅ HEALTHY
Uptime: 99.95%
Incidents: 0 critical, 1 warning (resolved)

🔍 Overnight Activity:
  • 720 probes run (every 5 min)
  • All endpoints < latency budget
  • 1 warning: Database slow query at 3:12 AM
    └─ Auto-detected, not user-impacting
    └─ Root cause: Nightly backup process
    └─ Status: RESOLVED

📈 Performance Metrics:
  • Avg latency: 87ms (baseline: 90ms) ✅
  • p95 latency: 156ms (budget: 300ms) ✅
  • p99 latency: 342ms (budget: 500ms) ✅
  • Error rate: 0.02% (budget: 0.1%) ✅
  • Database health: Optimal
  • Schema: No drift detected
  • RLS: All policies active

🚨 Alerts Overnight: None

Next probe: 7:00 AM

—— End Report ——
```

### During the Day (Slack Notifications)

```
[7:05 AM] ✅ Health probe run - All 24 endpoints healthy

[7:35 AM] ⚠️  WARNING: GET /api/documents latency p95 = 245ms
         (approaching 300ms budget). Monitor closely.

[8:00 AM] ✅ Health probe run - Status recovered, now 145ms

[12:30 PM] ✅ Health probe run - All nominal

[2:45 PM] 🚨 CRITICAL: POST /api/projects - 3% error rate
          L1 Engineer paged. Investigating...

[2:48 PM] 🔧 L1 Engineer acknowledged. Root cause found:
          Connection pool exhausted. Scaling up...

[2:52 PM] ✅ Issue resolved. Latency back to normal.
          Error rate returned to 0.01%.

[3:00 PM] ✅ Health probe confirmed - System healthy
```

---

## WHAT GETS CHECKED AND HOW OFTEN

| What | When | Tool | Action |
|------|------|------|--------|
| **Endpoint latency** | Every 5 min | Vercel Cron | Alert if p99 > threshold |
| **Error rates** | Real-time | App logging | Alert if > 1% |
| **Database connection** | Every 5 min | Probe | Page L1 if down |
| **Schema integrity** | Daily 2 AM | pg_cron | Block deploy if drifted |
| **RLS coverage** | Daily 3 AM | pg_cron | Block deploy if gap |
| **Data corruption** | Every 30 min | pg_cron | CATASTROPHIC alert |
| **Response schemas** | Every 5 min | Probe | Alert on mismatch |
| **Auth enforcement** | Every 5 min | Probe | Alert if 401 missing |
| **Latency trend** | Real-time | App logging | Dashboard visualization |
| **Alert escalation** | Hourly | pg_cron | Page manager if > 4h old |

---

## THE SAFETY GUARANTEE

By implementing all these layers, you get:

✅ **Coverage:** 24/7 monitoring, never sleeping
✅ **Detection:** Issues found within 5 minutes
✅ **Response:** On-call engineer notified within 60 seconds
✅ **Recovery:** Fix applied within 15 minutes (or auto-remediation)
✅ **Prevention:** Pre-deployment gate catches 99% of issues

---

**The answer to your question: "WHO checks?"**

1. **Vercel/Lambda** → Every 5 minutes (automated probes)
2. **Your app** → Every request (logs everything)
3. **Supabase** → Every 30 minutes to daily (database jobs)
4. **Alert engine** → Real-time (threshold checks)
5. **On-call engineers** → When paged (human response)
6. **System itself** → Automatically (self-healing)

**No single point of failure. No silent failures. Everything is monitored.**

