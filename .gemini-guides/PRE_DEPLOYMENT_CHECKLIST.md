# PRODUCTION DIAGNOSTIC MESH - DEPLOYMENT CHECKLIST

**Before every production deployment, execute this checklist in order.**

---

## PHASE 1: LOCAL VALIDATION (10 minutes)

- [ ] Pull latest code: `git pull origin main`
- [ ] Install dependencies: `npm install`
- [ ] Run type check: `npx tsc --noEmit`
- [ ] Run linter: `npm run lint` (if configured)
- [ ] Run health probes: `npm run diagnose`
  - Expected output: `Status: PASS` or `Status: DEGRADED`
  - If FAIL: **STOP** - Do not proceed to next phase

### What to Look For

```
✅ PASS
  - All endpoints tested
  - No latency violations
  - Response schemas match

❌ FAIL
  - Any BLOCKING criticality endpoint fails
  - p99 latency > 2000ms on critical endpoints
  - Authentication issues
  - Schema mismatches

🚫 IMMEDIATE STOP TRIGGER
  - Response: "CRITICAL ENDPOINT FAILED"
  - Cannot proceed to deployment
```

---

## PHASE 2: DEPLOYMENT GATE (15 minutes)

- [ ] Set environment variables:
  ```bash
  export API_BASE_URL=http://localhost:3000
  export TEST_AUTH_TOKEN=your_token
  export SUPABASE_URL=your_url
  export SUPABASE_ANON_KEY=your_key
  ```

- [ ] Run pre-deployment gate: `npm run diagnose:gate`
  - Expected: All checks PASS
  - If any BLOCKING check fails: **STOP**

- [ ] Review gate report:
  ```bash
  cat reports/deployment-gate-*.json | jq '.summary'
  ```

- [ ] Verify build succeeds: `npm run build`
  - Expected: Build completes, `.next/` directory exists
  - Check for 0 TypeScript errors

### Critical Failures That Block Deployment

```
❌ Endpoint Health           → Some endpoint failing
❌ Build Succeeds            → Build compilation error
❌ TypeScript Check          → Type errors exist
❌ Environment Variables     → Missing required env vars
❌ Schema Integrity          → Database connection failure
❌ Build Output              → Build artifacts missing

Any of these = DO NOT DEPLOY
```

---

## PHASE 3: PRE-PRODUCTION VERIFICATION (5 minutes)

### Database Integrity

```bash
# Check schema is intact
curl -X GET https://your-api.com/api/health \
  -H "Authorization: Bearer $TEST_AUTH_TOKEN" | jq '.database'

# Expected: { "status": "healthy" }
```

### Endpoint Sample Validation

```bash
# Test a sample critical endpoint
curl -X GET https://your-api.com/api/projects \
  -H "Authorization: Bearer $TEST_AUTH_TOKEN" | jq '.[] | .id' | head -5

# Expected: 5 project IDs returned without error
```

### Security Spot Check

```bash
# Verify RLS is enforced (no token = 401)
curl -X GET https://your-api.com/api/projects

# Expected: HTTP 401 Unauthorized
```

---

## PHASE 4: DEPLOYMENT EXECUTION (varies)

Once all checks pass:

- [ ] Trigger deployment:
  ```bash
  npm run deploy  # or your deployment command
  ```

- [ ] Monitor deployment:
  ```bash
  npm run deploy:logs  # or similar
  ```

- [ ] Expected: Deployment completes, no errors

---

## PHASE 5: POST-DEPLOYMENT VALIDATION (10 minutes)

### Smoke Tests

```bash
# Test production health endpoint
curl -X GET https://your-production-api.com/api/health | jq '.'

# Expected: All components showing "healthy"
{
  "status": "healthy",
  "timestamp": "2026-01-29T16:00:00Z",
  "database": { "status": "healthy" },
  "ai": { "gemini_key": true },
  "alarms": { "pending_critical": 0 }
}
```

### Critical Endpoint Tests

```bash
# Test authentication still works
curl -X GET https://your-api.com/api/projects \
  -H "Authorization: Bearer $(your_auth_command)" | jq '.[0].id'

# Test data integrity
curl -X GET https://your-api.com/api/documents | jq '.length'

# Test RLS still blocks unauthorized access
curl -X GET https://your-api.com/api/projects
# Expected: HTTP 401
```

### Verify No Regressions

```bash
# Run full diagnostic suite on production
API_BASE_URL=https://your-api.com TEST_AUTH_TOKEN=$PROD_TOKEN npm run diagnose

# Expected: Status PASS, all endpoints healthy
```

- [ ] No 5xx errors in first 5 minutes
- [ ] No spike in latency
- [ ] No authentication failures
- [ ] No data corruption errors

---

## PHASE 6: SIGN-OFF

### Release Checklist

- [ ] All smoke tests passed
- [ ] No critical errors in logs
- [ ] Performance is nominal
- [ ] RLS enforcement verified
- [ ] Data integrity confirmed

### Document Results

Create a release note:

```markdown
# Production Deployment - 2026-01-29

## Pre-Deployment Checks
- Diagnostic Gate: ✅ PASS
- Endpoint Health: ✅ PASS
- Build Succeeds: ✅ PASS
- Schema Integrity: ✅ PASS

## Post-Deployment Validation
- Health Check: ✅ PASS
- Smoke Tests: ✅ PASS
- Regression Tests: ✅ PASS
- Performance: ✅ NOMINAL

## Signed Off By
- Engineer: [your name]
- Time: [timestamp]
```

---

## ROLLBACK PROCEDURE

If ANY critical issue occurs post-deployment:

### Immediate Response (< 5 minutes)

```bash
# 1. Stop receiving traffic (if applicable)
# 2. Check error rate
curl https://your-api.com/api/health | jq '.monitoring.recent_errors'

# 3. If > 10 errors/minute: ROLLBACK
git revert HEAD  # or use your deployment tool
npm run deploy   # Re-deploy previous version

# 4. Verify rollback succeeded
npm run diagnose  # Full suite again
```

### Post-Rollback Investigation

```bash
# 1. Check what was deployed
git log --oneline -5

# 2. Review the failing commit
git diff HEAD~1 HEAD

# 3. Identify the breaking change
# 4. Fix locally: npm run diagnose
# 5. Only re-deploy once gate passes
```

---

## FAILURE SCENARIOS

### Scenario A: Endpoint Latency Exceeds Budget

```
❌ Get Project Detail [1500ms]
   Latency EXCEEDS p99 budget 800ms
```

**Action:**
1. Do NOT deploy
2. Investigate query performance
3. Add database index or optimize code
4. Re-run: `npm run diagnose`
5. Deploy only after PASS

### Scenario B: RLS Policy Missing

```
❌ List Documents [403]
   Access denied (RLS blocked)
```

**Action:**
1. Do NOT deploy
2. Check database: `SELECT * FROM pg_policies WHERE tablename = 'documents';`
3. Add missing policy in migration
4. Run: `npm run diagnose`
5. Deploy only after PASS

### Scenario C: Build Fails

```
❌ Build Succeeds [ERROR]
   Build failed: see build logs
```

**Action:**
1. Do NOT deploy
2. Fix TypeScript/build errors locally
3. Run: `npm run build`
4. Verify: `npm run diagnose:gate`
5. Deploy only after PASS

### Scenario D: Database Connection Lost

```
❌ Schema Integrity [ERROR]
   Could not query projects_master
```

**Action:**
1. Verify Supabase is running
2. Check environment variables set correctly
3. Test connection: `curl $SUPABASE_URL`
4. Retry: `npm run diagnose:gate`

---

## EMERGENCY CONTACTS

If deployment fails and you cannot resolve:

**On-Call Engineer:** [contact info]
**SRE Team Slack:** #infrastructure
**Escalation:** Page on-call manager

---

## GATE PASS CRITERIA

✅ Deployment can proceed ONLY if ALL of these are true:

```
Endpoint Health:     ✅ PASS
Build Succeeds:      ✅ PASS
TypeScript Check:    ✅ PASS
Environment Vars:    ✅ PASS
Schema Integrity:    ✅ PASS
Build Output:        ✅ PASS
```

❌ If ANY check fails, **DO NOT DEPLOY**

---

## QUICK REFERENCE

```bash
# Before committing
npm run diagnose

# Before deploying to main
npm run diagnose:gate

# After deployment
curl https://your-api.com/api/health | jq '.'

# Check logs
tail -f ./reports/deployment-gate-*.json
```

---

**Print this checklist and keep it visible during deployments.**

---

**Document Version:** 1.0
**Last Updated:** 2026-01-29
**Status:** Active - Use for all production deployments
