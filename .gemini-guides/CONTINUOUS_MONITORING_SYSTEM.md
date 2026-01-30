# CONTINUOUS MONITORING SYSTEM - 24/7 Health Enforcement

**Status:** Design Specification
**Date:** 2026-01-29
**Purpose:** Define WHO checks system health 24/7 and WHAT happens when failures occur

---

## PROBLEM STATEMENT

**Current State (Pre-Deployment Only):**
```
Developer commits code
    ↓
npm run diagnose:gate runs (checks pass ✅)
    ↓
Deploy to production
    ↓
System runs for 8 hours
    ↓
Silent failure at 3 AM (no one watching)
    ↓
Users discover bug at 9 AM
```

**Desired State (Continuous Monitoring):**
```
System running in production
    ↓
Continuous probes every 5 minutes (24/7)
    ↓
Latency spike detected at 3 AM
    ↓
Alert sent immediately
    ↓
Remediation triggered automatically (or escalated to on-call)
    ↓
Issue resolved before users notice
```

---

## ARCHITECTURE: WHO CHECKS WHAT, WHEN

### Layer 1: Continuous Probes (Every 5 Minutes)

**WHO:** External monitoring service
**WHAT:** Hit all critical endpoints with real requests
**WHERE:** Runs outside your application (Vercel, AWS Lambda, or external monitoring service)
**WHEN:** Every 5 minutes, 24/7

```
Monitoring Service (Vercel Cron, AWS Lambda, or Datadog)
    ↓
Makes HTTP requests to all 24 endpoints
    ↓
Compares latency against budget
    ↓
Validates response schema
    ↓
Checks error rates
    ↓
Reports results to central store
```

### Layer 2: Database Health Checks (Hourly)

**WHO:** pg_cron (Supabase scheduler)
**WHAT:** Schema drift, RLS gaps, data integrity
**WHERE:** Runs inside database
**WHEN:** Every hour, 24/7

```
pg_cron jobs
    ├─ sweep_alarm_rules()          [hourly]
    ├─ validate_schema_drift()      [daily 2 AM]
    ├─ validate_rls_coverage()      [daily 3 AM]
    └─ check_data_corruption()      [every 30 min]
```

### Layer 3: Application Monitoring (Continuous)

**WHO:** Structured logging (logger.ts)
**WHAT:** Every API call, error, and anomaly
**WHERE:** Runs inside your application
**WHEN:** Real-time, every request

```
Every API call
    ↓
logger.ts records:
  - Endpoint
  - Status code
  - Latency
  - User tier
  - Error (if any)
    ↓
Exported to monitoring service (Vercel Analytics, Sentry, Datadog)
```

### Layer 4: Alerting & Escalation (Threshold-Based)

**WHO:** Alert engine
**WHAT:** Sends notifications when thresholds exceeded
**WHERE:** Runs in your notification service
**WHEN:** Within 60 seconds of failure detection

```
Metric crosses threshold
    ├─ INFO (< 0.5% error rate)    → Log only
    ├─ WARNING (0.5-2% error)      → Slack notification
    ├─ CRITICAL (> 2% error)       → Page on-call engineer
    └─ CATASTROPHIC                → Automatic rollback + page manager
```

---

## IMPLEMENTATION: CONTINUOUS PROBE SERVICE

### Option 1: Vercel Cron (Recommended for Vercel Users)

Create file: `app/api/cron/health-check/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { runAllHealthProbes } from '@/scripts/diagnostic/run-health-probes';

export async function GET(request: Request) {
  // Verify this is a Vercel cron call (security)
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const authToken = process.env.TEST_AUTH_TOKEN;

  try {
    // Run all health probes
    const report = await runAllHealthProbes(baseUrl, authToken);

    // Store results in database
    await storeHealthReport(report);

    // Check for critical failures
    if (report.summary.status === 'FAIL' && report.summary.criticalFailures > 0) {
      // Trigger alert
      await triggerAlert({
        severity: 'CRITICAL',
        message: `${report.summary.criticalFailures} critical endpoints failed`,
        report,
      });
    }

    return NextResponse.json({
      status: 'ok',
      probeStatus: report.summary.status,
      endpointsHealthy: report.passedCount,
      endpointsFailed: report.failedCount,
    });
  } catch (error: any) {
    await triggerAlert({
      severity: 'CRITICAL',
      message: 'Health probe execution failed',
      error: error.message,
    });

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Configure cron in vercel.json
// {
//   "crons": [{
//     "path": "/api/cron/health-check",
//     "schedule": "*/5 * * * *"
//   }]
// }
```

### Option 2: AWS Lambda + CloudWatch

```python
# lambda_function.py
import json
import requests
import boto3
from datetime import datetime

cloudwatch = boto3.client('cloudwatch')

def lambda_handler(event, context):
    """Run health probes every 5 minutes"""

    # Call your health probe endpoint
    response = requests.get(
        f"{os.environ['API_BASE_URL']}/api/health",
        headers={'Authorization': f"Bearer {os.environ['TEST_AUTH_TOKEN']}"}
    )

    data = response.json()

    # Publish metrics to CloudWatch
    cloudwatch.put_metric_data(
        Namespace='ERP-Health',
        MetricData=[
            {
                'MetricName': 'EndpointLatency',
                'Value': data.get('latency_ms', 0),
                'Unit': 'Milliseconds',
                'Timestamp': datetime.utcnow(),
            },
            {
                'MetricName': 'DatabaseStatus',
                'Value': 1 if data['database']['status'] == 'healthy' else 0,
                'Unit': 'None',
                'Timestamp': datetime.utcnow(),
            }
        ]
    )

    # Check for failures
    if data['status'] != 'healthy':
        send_alert({
            'severity': 'CRITICAL',
            'message': f"System degraded: {data['status']}",
            'details': data
        })

    return {
        'statusCode': 200,
        'body': json.dumps({'status': 'ok'})
    }

# CloudFormation: Schedule this Lambda every 5 minutes
```

### Option 3: External Service (Datadog, New Relic, Sentry)

```bash
# Install monitoring agent
npm install dd-trace  # or @sentry/nextjs

# Datadog setup in environment
DATADOG_ENABLED=true
DATADOG_SITE=datadoghq.com
DATADOG_API_KEY=xxx
```

---

## ALERT ESCALATION MATRIX

### Severity Levels & Responses

```
┌──────────────────────────────────────────────────────────────┐
│ INFO (Response Time < 100ms, Error Rate < 0.1%)              │
├──────────────────────────────────────────────────────────────┤
│ Action: Log to metrics only                                   │
│ Escalation: None                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ WARNING (Response Time 100-500ms, Error Rate 0.1-1%)          │
├──────────────────────────────────────────────────────────────┤
│ Action: Send to #infrastructure Slack                        │
│ Escalation: None (automated observation)                     │
│ Example: "⚠️  Endpoint latency p95 is 450ms (budget: 300ms)" │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ CRITICAL (Response Time > 1000ms, Error Rate > 2%)            │
├──────────────────────────────────────────────────────────────┤
│ Action: Page on-call engineer + Slack                        │
│ Escalation: 1 (On-call engineer)                             │
│ Timeout: 15 minutes before escalating to manager             │
│ Example: "🚨 CRITICAL: 5% of requests failing, p99 2500ms"   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ CATASTROPHIC (Database down, RLS bypass, Data corruption)    │
├──────────────────────────────────────────────────────────────┤
│ Action: Page on-call manager + CEO                           │
│ Escalation: 2 (Manager) + Automatic remediation              │
│ Timeout: Immediate, no waiting                               │
│ Automatic Actions:                                           │
│   1. Rollback to previous version                            │
│   2. Switch to read-only mode                                │
│   3. Disable write endpoints                                 │
│   4. Notify all stakeholders                                 │
│ Example: "🛑 CATASTROPHIC: Database corrupted, rolling back" │
└──────────────────────────────────────────────────────────────┘
```

---

## DATABASE MONITORING (pg_cron Jobs)

### What Runs 24/7 Inside Supabase

```sql
-- Job 1: Check for data corruption (every 30 minutes)
SELECT cron.schedule(
  'check-data-corruption-30min',
  '*/30 * * * *',
  $$
  SELECT check_for_corruption();
  $$
);

-- Job 2: Monitor alert escalations (every hour)
SELECT cron.schedule(
  'escalate-unacked-alerts-hourly',
  '0 * * * *',
  $$
  SELECT process_escalations();
  $$
);

-- Job 3: Schema drift check (daily at 2 AM)
SELECT cron.schedule(
  'detect-schema-drift-daily',
  '0 2 * * *',
  $$
  SELECT detect_schema_drift();
  $$
);

-- Job 4: RLS coverage audit (daily at 3 AM)
SELECT cron.schedule(
  'audit-rls-coverage-daily',
  '0 3 * * *',
  $$
  SELECT validate_rls_coverage();
  $$
);
```

### Functions That Run

```sql
CREATE OR REPLACE FUNCTION check_for_corruption()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check for duplicate IDs in projects_master
  IF EXISTS (
    SELECT 1 FROM projects_master
    GROUP BY id HAVING count(*) > 1
  ) THEN
    INSERT INTO diagnostic_alerts (severity, message)
    VALUES ('CATASTROPHIC', 'Data corruption detected: duplicate IDs in projects_master');
  END IF;

  -- Check for orphaned records
  IF EXISTS (
    SELECT 1 FROM documents
    WHERE project_id NOT IN (SELECT id FROM projects_master)
  ) THEN
    INSERT INTO diagnostic_alerts (severity, message)
    VALUES ('HIGH', 'Orphaned documents detected - referential integrity issue');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION process_escalations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Find unacknowledged critical alerts older than 4 hours
  UPDATE alerts
  SET escalation_level = escalation_level + 1
  WHERE status = 'PENDING_REVIEW'
  AND severity IN ('CRITICAL', 'CATASTROPHIC')
  AND created_at < now() - interval '4 hours'
  AND escalation_level < 2;

  -- Insert escalation alert for on-call manager
  INSERT INTO notifications (
    title,
    message,
    severity,
    target_user_role
  ) SELECT
    'ESCALATION: Unacknowledged critical alert',
    'Alert from ' || created_at || ': ' || title,
    'CRITICAL',
    'L4'
  FROM alerts
  WHERE escalation_level = 2;
END;
$$;
```

---

## APPLICATION LOGGING (Real-Time)

### Every Request Gets Logged

```typescript
// middleware.ts - Log every API call
import { logger } from '@/lib/logger';

export async function middleware(request: Request) {
  const startTime = performance.now();

  const response = await NextResponse.next();

  const latency = performance.now() - startTime;

  logger.info('API_REQUEST', {
    method: request.method,
    path: request.nextUrl.pathname,
    status: response.status,
    latency_ms: Math.round(latency),
    user_id: request.headers.get('x-user-id'),
    timestamp: new Date().toISOString(),
  });

  // If latency exceeds threshold, log as warning
  if (latency > 1000) {
    logger.warn('SLOW_ENDPOINT', {
      path: request.nextUrl.pathname,
      latency_ms: Math.round(latency),
      threshold_ms: 1000,
    });
  }

  return response;
}
```

### Logs Export to Monitoring Service

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';
import { Datadog } from 'dd-trace';

export function initializeMonitoring() {
  // Sentry for error tracking
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });

  // Datadog for metrics
  if (process.env.DATADOG_ENABLED) {
    const tracer = Datadog.init();
    tracer.use('http', {
      service: 'erp-api',
      headers: {
        sample_rate: 1.0,
      },
    });
  }
}

export function captureException(error: Error, context?: any) {
  // Sends to Sentry automatically
  Sentry.captureException(error, { extra: context });

  // Also log locally
  logger.error('EXCEPTION', { error: error.message, context });
}
```

---

## DASHBOARD: Real-Time Status Display

### API Endpoint: Current System Health

```typescript
// app/api/admin/monitoring/status/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // Get latest health probe results
  const { data: latestProbe } = await supabase
    .from('diagnostic_logs')
    .select('*')
    .eq('job_name', 'endpoint_probe')
    .order('executed_at', { ascending: false })
    .limit(1)
    .single();

  // Get recent alerts
  const { data: recentAlerts } = await supabase
    .from('diagnostic_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get latency metrics
  const { data: latencyMetrics } = await supabase
    .from('latency_metrics')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(288); // 24 hours at 5-min intervals

  return NextResponse.json({
    currentStatus: {
      health: latestProbe?.details || 'unknown',
      timestamp: latestProbe?.executed_at,
      nextProbe: new Date(Date.now() + 5 * 60 * 1000),
    },
    recentAlerts: recentAlerts || [],
    latencyTrend: latencyMetrics || [],
    uptime: calculateUptime(latencyMetrics),
  });
}

function calculateUptime(metrics: any[]): string {
  if (!metrics || metrics.length === 0) return 'N/A';
  const healthy = metrics.filter(m => m.avg_ms < 500).length;
  return `${((healthy / metrics.length) * 100).toFixed(2)}%`;
}
```

### React Component: Live Dashboard

```typescript
// components/admin/MonitoringDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

export default function MonitoringDashboard() {
  const [status, setStatus] = useState<any>(null);
  const [refreshIn, setRefreshIn] = useState(300);

  useEffect(() => {
    async function fetchStatus() {
      const res = await fetch('/api/admin/monitoring/status');
      const data = await res.json();
      setStatus(data);
      setRefreshIn(300); // Reset 5-minute countdown
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (!status) return <div>Loading...</div>;

  return (
    <div className="space-y-8 p-8">
      {/* Current Status */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-emerald-900 p-6 rounded-lg border border-emerald-500">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-400" size={24} />
            <div>
              <p className="text-sm text-emerald-300">Status</p>
              <p className="text-2xl font-bold text-white">Healthy</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-900 p-6 rounded-lg border border-blue-500">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-blue-400" size={24} />
            <div>
              <p className="text-sm text-blue-300">Uptime (24h)</p>
              <p className="text-2xl font-bold text-white">{status.uptime}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-500">
          <div className="flex items-center gap-3">
            <Activity className="text-zinc-400" size={24} />
            <div>
              <p className="text-sm text-zinc-300">Next Probe</p>
              <p className="text-2xl font-bold text-white">{refreshIn}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
        <h2 className="text-lg font-bold text-white mb-4">Recent Alerts</h2>
        <div className="space-y-2">
          {status.recentAlerts.map((alert: any, i: number) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-900 border border-red-500'
                  : 'bg-yellow-900 border border-yellow-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-white">{alert.message}</p>
                <span className="text-xs text-gray-300">
                  {new Date(alert.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latency Trend */}
      <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-700">
        <h2 className="text-lg font-bold text-white mb-4">Latency Trend (24h)</h2>
        <div className="h-48 bg-black/40 rounded-lg flex items-end gap-1 p-4">
          {status.latencyTrend.map((metric: any, i: number) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${
                metric.avg_ms < 200
                  ? 'bg-emerald-500'
                  : metric.avg_ms < 500
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ height: `${(metric.avg_ms / 1000) * 100}%` }}
              title={`${metric.avg_ms}ms`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## WHO RESPONDS TO FAILURES?

### Automated Response (No Human Needed)

```
Failure detected
    ↓
Severity = WARNING or INFO
    ↓
Automatic response:
  - Log to metrics
  - Update dashboard
  - Notify #infrastructure
  - No human intervention needed
```

### Human Response (On-Call Engineer)

```
Failure detected
    ↓
Severity = CRITICAL
    ↓
Automatic response:
  - Page on-call engineer (PagerDuty, OpsGenie)
  - Send Slack alert
  - Create incident ticket
    ↓
On-call engineer receives notification (SMS + app)
    ↓
Engineer acknowledges within 15 minutes
    ↓
Engineer investigates and fixes
    ↓
If not acknowledged in 15 min → escalate to manager
```

### Autonomous Remediation (System Self-Heals)

```
Failure detected
    ↓
Severity = CATASTROPHIC
    ↓
Automatic response:
  1. Trigger automatic rollback
     git revert HEAD
     npm run build
     npm run deploy:rollback

  2. Switch to read-only mode (if applicable)
     UPDATE system_config SET mode = 'read_only'

  3. Disable write endpoints
     All POST/PATCH/DELETE return 503 Service Unavailable

  4. Notify all stakeholders
     - CEO
     - VP of Eng
     - Customers via status page
     - on-call manager (page immediately)
    ↓
Automatic rollback completes
    ↓
System re-probed to verify recovery
    ↓
If recovered: Alert status = RESOLVED
    ↓
If still failing: Page manager for manual intervention
```

---

## ON-CALL ESCALATION POLICY

### Level 1: On-Call Engineer (First Response)

```
Alert severity: CRITICAL
Time limit: 15 minutes to acknowledge
Response: Investigate and fix
Typical actions:
  - Check logs
  - Restart service
  - Increase database connections
  - Scale up resources
```

### Level 2: On-Call Manager (If L1 Doesn't Respond)

```
If L1 doesn't acknowledge in 15 min:
  - Page on-call manager
  - Manager pages L1 again
  - Or takes over investigation

Time limit: 5 minutes to respond
Typical actions:
  - Override L1, take control
  - Trigger rollback
  - Open war room on Slack/Zoom
```

### Level 3: VP Engineering (Catastrophic Failures)

```
If catastrophic or multiple critical:
  - Page VP immediately
  - Declare SEV-1 incident
  - Open war room
  - Post-mortem after resolution

Never wait for escalation timing
```

---

## PUTTING IT ALL TOGETHER

### The Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│ DEPLOYMENT                                                   │
│  npm run diagnose:gate ✅ PASS                               │
└──────────────────────────┬──────────────────────────────────┘

                           ↓ Deploy to production

┌─────────────────────────────────────────────────────────────┐
│ PRODUCTION RUNNING 24/7                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Every 5 minutes (Vercel Cron / AWS Lambda)        │
│  └─ Run all endpoint probes                                  │
│  └─ Check latency, error rate, auth, RLS                    │
│  └─ Store results in database                               │
│  └─ Trigger alerts if thresholds exceeded                   │
│                                                              │
│  Layer 2: Every request (Application logging)               │
│  └─ Log latency, status code, errors                        │
│  └─ Export to Sentry / Datadog                              │
│  └─ Update real-time metrics                                │
│                                                              │
│  Layer 3: Hourly (pg_cron jobs)                             │
│  └─ Detect schema drift                                     │
│  └─ Audit RLS coverage                                      │
│  └─ Check for data corruption                               │
│  └─ Escalate unacknowledged alerts                          │
│                                                              │
│  Layer 4: Always (Alert Engine)                             │
│  └─ Compare metrics to thresholds                           │
│  └─ Send notifications (INFO/WARNING/CRITICAL)              │
│  └─ Page on-call if CRITICAL                                │
│  └─ Trigger auto-remediation if CATASTROPHIC                │
│                                                              │
└─────────────────────────────────────────────────────────────┘

                    ↓ Failure detected

            ┌───────┬───────┬──────────┐
            ↓       ↓       ↓          ↓
          INFO   WARNING CRITICAL  CATASTROPHIC
            │       │       │          │
          Log    Slack   Page L1   Auto-rollback
                             │      + Page Manager
                             │
                        (15 min ACK timeout)
                             ↓
                   (Not acknowledged?)
                             ↓
                        Page Manager
```

---

## MONITORING INFRASTRUCTURE SUMMARY

| Component | Who | What | When | Action |
|-----------|-----|------|------|--------|
| **Endpoint Probes** | Vercel/Lambda | Real HTTP requests | Every 5 min | Log, Alert |
| **App Logging** | Application | All requests/errors | Real-time | Export to Sentry |
| **Database Jobs** | pg_cron | Schema, RLS, data | Hourly/Daily | Detect drift |
| **Alert Engine** | Alert service | Threshold comparison | Real-time | Notify, escalate |
| **Dashboards** | Web UI | Live status | Always available | View/investigate |
| **On-Call** | Human engineers | Respond to alerts | On demand | Fix issues |

---

**STATUS: Ready to implement**

Each layer is independent and can be rolled out separately:
1. Start with Vercel Cron endpoint probes
2. Add application logging (Sentry)
3. Set up pg_cron jobs
4. Configure on-call escalation (PagerDuty)
5. Build monitoring dashboard
6. Add automatic remediation

