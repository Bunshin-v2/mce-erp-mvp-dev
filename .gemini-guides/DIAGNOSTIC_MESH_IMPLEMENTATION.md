# PRODUCTION DIAGNOSTIC MESH - IMPLEMENTATION GUIDE

**Status:** Ready for Integration
**Date:** 2026-01-29
**Scope:** Complete diagnostic framework for zero-tolerance failure detection

---

## WHAT WAS DELIVERED

### Core Components Created

1. **PRODUCTION_DIAGNOSTIC_MESH.md** - Complete architectural specification
2. **scripts/diagnostic/endpoint-registry.ts** - Master endpoint inventory
3. **scripts/diagnostic/run-health-probes.ts** - Real endpoint prober
4. **scripts/diagnostic/deployment-gate.ts** - Pre-deployment enforcement gate

### Key Design Principles

✅ **Zero Tolerance for Silent Failure** - Every error is detected
✅ **Deterministic & Auditable** - Reproducible results, machine-readable reports
✅ **Enforcement Over Observation** - Blocks unsafe deployments automatically
✅ **Actionable Alerts** - Every failure maps to root cause + remediation

---

## QUICK START (5 minutes)

### 1. Add Scripts to package.json

```json
{
  "scripts": {
    "diagnose": "tsx scripts/diagnostic/run-health-probes.ts",
    "diagnose:gate": "tsx scripts/diagnostic/deployment-gate.ts",
    "diagnose:full": "npm run diagnose && npm run diagnose:gate"
  }
}
```

### 2. Set Environment Variables

```bash
# .env.local
API_BASE_URL=http://localhost:3000
TEST_AUTH_TOKEN=your_test_token_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Run Health Probes

```bash
# Test all endpoints
npm run diagnose

# Run full pre-deployment gate
npm run diagnose:gate
```

### 4. Expected Output

```
================================================================================
ENDPOINT HEALTH PROBE SUITE
Base URL: http://localhost:3000
Auth: Present
================================================================================

Testing GET    /api/health                          ✅ [23ms]
Testing GET    /api/projects                        ✅ [87ms]
Testing GET    /api/projects/:id                    ✅ [105ms]
Testing POST   /api/projects                        ❌ [1250ms]
   ERROR: Latency 1250ms EXCEEDS p99 budget 1500ms
   - Response schema mismatch

================================================================================
HEALTH PROBE SUMMARY
Status: DEGRADED
Endpoints: 10/12 passed
Avg Latency: 156ms | p95: 342ms
================================================================================

Report saved: ./reports/health-probe-1706469600000.json
```

---

## WHAT EACH SCRIPT DOES

### endpoint-registry.ts - Endpoint Catalog

**Purpose:** Define the "contract" each API endpoint must fulfill

**Includes:**
- URL path and HTTP method
- Latency budgets (p50, p95, p99)
- Error rate ceiling (e.g., 0.1%)
- Auth requirements (none/required/optional)
- RLS requirements (boolean)
- Response schema for validation
- Criticality level (BLOCKING/CRITICAL/HIGH/MEDIUM)

**Example Entry:**
```typescript
{
  name: 'List Projects',
  method: 'GET',
  path: '/api/projects',
  latency: { p50: 50, p95: 150, p99: 500 },  // milliseconds
  errorRate: 0.001,  // 0.1% acceptable
  authContext: 'required',
  requiredRLS: true,
  criticality: 'CRITICAL',
}
```

**How to Use:**
1. Every new endpoint gets a registry entry
2. Latency budgets are set based on production SLOs
3. During testing, endpoints are validated against these contracts

---

### run-health-probes.ts - Real Endpoint Testing

**Purpose:** Execute actual HTTP requests to verify endpoint health

**What It Does:**
1. Fetches all endpoints from registry
2. Makes real HTTP calls (not mocks)
3. Validates:
   - ✅ Latency is within budget
   - ✅ Response status is correct
   - ✅ Response schema matches expectation
   - ✅ Authentication works correctly
   - ✅ RLS is not bypassed
4. Generates JSON report with failures

**Output:**
```json
{
  "timestamp": "2026-01-29T15:30:00Z",
  "environment": "development",
  "totalEndpoints": 24,
  "passedCount": 23,
  "failedCount": 1,
  "criticalFailures": 0,
  "summary": {
    "status": "DEGRADED",
    "message": "1 non-critical endpoint failed",
    "avgLatency": 156,
    "p95Latency": 342
  },
  "results": [
    {
      "endpoint": "List Projects",
      "method": "GET",
      "path": "/api/projects",
      "latency_ms": 87,
      "success": true,
      "violations": []
    }
  ]
}
```

**Usage:**
```bash
# Basic run
npm run diagnose

# Custom URL and auth
API_BASE_URL=https://api.production.com TEST_AUTH_TOKEN=token npm run diagnose

# Parse the JSON report
cat reports/health-probe-*.json | jq '.summary'
```

---

### deployment-gate.ts - Pre-Deployment Enforcement

**Purpose:** Master gate that BLOCKS deployments if system is unsafe

**Runs 8 Critical Checks:**

| Check | Purpose | Blocks |
|-------|---------|--------|
| Endpoint Health | All endpoints respond correctly | Yes |
| Build Succeeds | `npm run build` completes | Yes |
| TypeScript Check | No TS compilation errors | Yes |
| Environment Vars | All required env vars set | Yes |
| Schema Integrity | Database tables exist | Yes |
| Lint | Code style passes (optional) | No |
| Build Output | Build artifacts exist | Yes |
| Git Status | No uncommitted changes | No |

**Output:**
```
================================================================================
🚀 DEPLOYMENT GATE - PRE-FLIGHT CHECKS
================================================================================
Environment: production
Build: ci-12345

⏳ Endpoint Health          [BLOCKING ]... ✅ PASS [4200ms]
⏳ Build Succeeds           [BLOCKING ]... ✅ PASS [8500ms]
⏳ TypeScript Check         [BLOCKING ]... ✅ PASS [2300ms]
⏳ Environment Variables    [BLOCKING ]... ✅ PASS [50ms]
⏳ Schema Integrity         [HIGH     ]... ✅ PASS [800ms]
⏳ Lint                     [MEDIUM   ]... ⚠️  SKIP
⏳ Build Output             [HIGH     ]... ✅ PASS [200ms]
⏳ Git Status               [MEDIUM   ]... ✅ PASS [300ms]

================================================================================
DEPLOYMENT GATE: PASS
Passed: 8/8
Blockers Failed: 0
Warnings Failed: 0
================================================================================

Report saved: ./reports/deployment-gate-1706469600000.json
```

**Exit Codes:**
- `0` = PASS - Safe to deploy
- `1` = FAIL - Deployment blocked
- `2` = WARN - Manual review required

**Usage:**
```bash
# Run pre-deployment checks
npm run diagnose:gate

# In CI/CD pipeline
npm run diagnose:gate || exit 1
npm run build
npm run deploy
```

---

## FAILURE THRESHOLDS & STOP CONDITIONS

### Latency Thresholds

```
p50  < 100ms   → ✅ PASS
p50  100-200ms → ⚠️  WARNING
p50  > 200ms   → ❌ FAIL

p95  < 300ms   → ✅ PASS
p95  300-500ms → ⚠️  WARNING
p95  > 500ms   → ❌ FAIL

p99  < 1000ms  → ✅ PASS
p99  1000-2000ms → ⚠️  WARNING
p99  > 2000ms  → ❌ FAIL (BLOCKS DEPLOY)
```

### Error Rate Thresholds

```
0.0-0.1%  → ✅ PASS
0.1-1.0%  → ⚠️  WARNING
> 1.0%    → ❌ FAIL (BLOCKS DEPLOY)
```

### CRITICAL STOP CONDITIONS

These immediately halt the deployment:

```
🛑 ANY Critical Endpoint Fails (status != 200)
   → Blocks user access
   → Remediation: Rollback to previous version

🛑 ANY latency p99 > 3000ms
   → User experience degradation
   → Remediation: Investigate bottleneck, scale horizontally

🛑 Schema Integrity Check Fails
   → Database tables missing or corrupted
   → Remediation: Restore from backup

🛑 RLS Bypass Detected
   → Security vulnerability
   → Remediation: IMMEDIATE security lockdown

🛑 Build Fails
   → Application cannot start
   → Remediation: Fix build errors, re-run gate

🛑 > 2 Endpoints Failed
   → System-wide degradation
   → Remediation: Investigate cascading failures
```

---

## INTEGRATION INTO CI/CD

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy with Diagnostic Gate

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Run Diagnostic Gate
        env:
          API_BASE_URL: ${{ secrets.API_BASE_URL }}
          TEST_AUTH_TOKEN: ${{ secrets.TEST_AUTH_TOKEN }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: npm run diagnose:gate

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### GitLab CI Example

```yaml
# .gitlab-ci.yml
stages:
  - diagnose
  - build
  - deploy

diagnostic_gate:
  stage: diagnose
  script:
    - npm install
    - npm run diagnose:gate
  artifacts:
    paths:
      - reports/
    expire_in: 30 days
  only:
    - main

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - .next/
  only:
    - main

deploy:
  stage: deploy
  script:
    - npm run deploy
  only:
    - main
  needs:
    - diagnostic_gate
    - build
```

---

## MONITORING & ALERTING

### Where Reports Are Stored

```
./reports/
  ├── health-probe-1706469600000.json
  ├── health-probe-1706473200000.json
  ├── deployment-gate-1706469900000.json
  └── ...
```

### Parsing Reports

```bash
# Get summary of last probe
cat reports/health-probe-*.json | jq '.' | tail -1 | jq '.summary'

# Find failed endpoints
cat reports/health-probe-*.json | jq '.results[] | select(.success == false)'

# Get average latency over time
for f in reports/health-probe-*.json; do
  cat $f | jq '.summary.avgLatency'
done | awk '{sum+=$1; count++} END {print "Avg: " sum/count}'
```

### Alert Integration

```bash
# Send alert if gate fails
npm run diagnose:gate || slack_notify "Deployment gate failed"

# Send alert if latency exceeds threshold
LATEST=$(ls -t reports/health-probe-*.json | head -1)
P95=$(cat $LATEST | jq '.summary.p95Latency')
if [ $P95 -gt 500 ]; then
  send_alert "Latency p95 is ${P95}ms (threshold: 500ms)"
fi
```

---

## LOCAL DEVELOPMENT WORKFLOW

### Before Every Commit

```bash
# Quick health check
npm run diagnose

# Full pre-deployment check
npm run diagnose:gate
```

### Before Pushing to Main

```bash
# Full diagnostic suite
npm run diagnose:full

# Review reports
cat reports/health-probe-*.json | jq '.summary'
```

### Adding a New Endpoint

1. **Create the endpoint** in your API route
2. **Add to endpoint-registry.ts**:
   ```typescript
   {
     name: 'My New Endpoint',
     method: 'GET',
     path: '/api/my-endpoint',
     latency: { p50: 50, p95: 150, p99: 500 },
     errorRate: 0.001,
     authContext: 'required',
     requiredRLS: true,
     criticality: 'HIGH',
   }
   ```
3. **Test it**: `npm run diagnose`
4. **Commit once it passes**

---

## COMMON FAILURE SCENARIOS & FIXES

### Scenario 1: Endpoint Timeout (latency > p99)

```
❌ Get Project Detail [1250ms]
   Latency 1250ms EXCEEDS p99 budget 800ms
```

**Root Cause:** Slow database query or heavy computation

**Fix:**
1. Profile the endpoint: `npm run profile`
2. Add database index: `CREATE INDEX idx_projects_id ON projects_master(id);`
3. Optimize query or add caching
4. Re-run: `npm run diagnose`

### Scenario 2: RLS Policy Missing

```
❌ List Documents [403]
   Access denied (RLS blocked)
```

**Root Cause:** Document table missing RLS policy for authenticated users

**Fix:**
1. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'documents';
   ```
2. Add missing policy:
   ```sql
   CREATE POLICY read_documents ON documents
   FOR SELECT USING (auth.uid() IS NOT NULL);
   ```
3. Re-test: `npm run diagnose`

### Scenario 3: Build Fails in Gate

```
❌ Build Succeeds [ERROR]
   Build failed: see build logs
```

**Root Cause:** TypeScript or build error

**Fix:**
1. Check build errors: `npm run build`
2. Fix TypeScript errors: `npx tsc --noEmit`
3. Re-run gate: `npm run diagnose:gate`

### Scenario 4: Response Schema Mismatch

```
❌ List Projects [200]
   Response schema mismatch
```

**Root Cause:** API returning unexpected fields

**Fix:**
1. Check actual response: `curl http://localhost:3000/api/projects | jq`
2. Update endpoint-registry.ts with correct schema
3. Re-test: `npm run diagnose`

---

## MAINTAINING THE DIAGNOSTIC MESH

### Weekly Tasks

- [ ] Review health probe reports
- [ ] Check for trending latency increases
- [ ] Verify no new endpoints missing from registry

### Monthly Tasks

- [ ] Review failure patterns
- [ ] Adjust latency budgets based on actual performance
- [ ] Update RLS policies if needed

### Per Release

- [ ] Add new endpoints to registry
- [ ] Update latency budgets if behavior changed
- [ ] Run full `npm run diagnose:full` before merge
- [ ] Run `npm run diagnose:gate` before deploy

---

## NEXT STEPS

1. **Integrate scripts** into your CI/CD pipeline
2. **Set alerts** based on report metrics
3. **Monitor latency trends** over time
4. **Document your endpoints** in registry
5. **Run gate before every production deploy**

---

## SUCCESS METRICS

Your diagnostic mesh is working when:

✅ **100% of deployments pass the gate**
✅ **All endpoints maintain latency budgets**
✅ **0 undetected schema drifts**
✅ **0 privilege escalations**
✅ **Reports are generated and reviewed**
✅ **Alerts trigger on threshold violations**

---

**Document Version:** 1.0
**Last Updated:** 2026-01-29
**Status:** Production Ready
