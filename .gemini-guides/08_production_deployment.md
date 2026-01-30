# Guide 8: Production Lock & Deployment

**Objective:** Final pre-production checklist, deployment to production environment, monitoring setup, and rollback procedures.

**Time Estimate:** 1-2 hours

**Prerequisites:**
- All Guides 1-7 completed and verified
- Production hosting account ready (Vercel, AWS, Azure, etc.)
- Supabase production project created
- GitHub/GitLab repository configured

---

## Phase 1: Pre-Deployment Verification Checklist

### Complete Checklist Before Deployment

**Run through each item and verify completion:**

```
DEPLOYMENT CHECKLIST - MCE COMMAND CENTER PRODUCTION RELEASE
Date: ___________
Deployed By: ___________

PHASE 1: GUIDES COMPLETION (Required)
☐ Guide 1: All migrations deployed and verified
☐ Guide 2: pg_cron jobs scheduled and active (3/3)
☐ Guide 3: All verification tests passed (8/8 checks)
☐ Guide 4: Resource Management fully implemented (6 tables + 4 components)
☐ Guide 5: RFQ Delta Gate API and components working
☐ Guide 6: Validation scripts executable and reporting
☐ Guide 7: Performance monitoring and error recovery active

PHASE 2: CODE QUALITY (Required)
☐ No TypeScript errors: `npm run build` succeeds
☐ No ESLint warnings: `npm run lint` (if configured)
☐ All console errors cleared when app loads
☐ No console.warn or console.error messages on startup
☐ Dead code removed (no TODO comments in production code)

PHASE 3: DATABASE HEALTH (Required)
☐ All tables exist and accessible
☐ RLS enabled on 9+ tables
☐ No orphaned records or referential integrity issues
☐ Indexes created on high-traffic tables
☐ Functions tested and working
☐ Triggers executing without errors
☐ Database backup created

PHASE 4: ENVIRONMENT VARIABLES (Critical)
☐ .env.local contains all required keys:
  ☐ NEXT_PUBLIC_SUPABASE_URL
  ☐ NEXT_PUBLIC_SUPABASE_ANON_KEY
  ☐ SUPABASE_SERVICE_ROLE_KEY
  ☐ VITE_CLERK_PUBLISHABLE_KEY (if using Clerk)
  ☐ GEMINI_API_KEY (if using Gemini)
☐ All keys valid and tested
☐ No placeholder or test values
☐ .env.local is in .gitignore

PHASE 5: SECURITY AUDIT (Critical)
☐ No API keys committed to repo: `git grep -i 'secret\|key\|password'`
☐ All database connections use service role securely
☐ CORS configured properly for production domain
☐ RLS policies prevent unauthorized access
☐ Input validation on all forms
☐ No SQL injection vulnerabilities
☐ No XSS vulnerabilities in dynamic content
☐ HTTPS enforced (no HTTP fallback)

PHASE 6: TESTING (Required)
☐ Manual test on localhost:3000:
  ☐ Dashboard loads without errors
  ☐ Can navigate all pages
  ☐ Search functionality works
  ☐ Create/update operations succeed
  ☐ Can upload/import files
  ☐ Resource management forms submit
  ☐ Delta gate alerts display correctly
☐ Mobile responsive on 375px width
☐ All forms accessible (keyboard navigation)

PHASE 7: PERFORMANCE BASELINE (Required)
☐ Lighthouse score >= 80
☐ LCP < 2.5s
☐ FID < 100ms
☐ CLS < 0.1
☐ API response time avg < 500ms

PHASE 8: MONITORING & LOGGING (Required)
☐ Sentry or equivalent error tracking configured
☐ Logging service configured
☐ Performance monitoring active
☐ Uptime monitoring set up
☐ Database query logs enabled

PHASE 9: BACKUP & RECOVERY (Critical)
☐ Supabase automated backups enabled
☐ Database backup created before deployment
☐ Rollback procedure documented
☐ Recovery time objective (RTO) defined
☐ Recovery point objective (RPO) defined

PHASE 10: DEPLOYMENT CONFIGURATION (Critical)
☐ Hosting provider configured
☐ CI/CD pipeline configured
☐ Environment variables set on host
☐ Database migration scripts ready
☐ Build process tested on host
☐ Asset serving configured (CDN if applicable)

FINAL SIGN-OFF
☐ All 80+ checklist items verified
☐ No blockers or critical issues
☐ Stakeholders notified
☐ Rollback plan reviewed
☐ Go/No-Go decision: _____________
```

**Save this checklist as** `DEPLOYMENT_CHECKLIST.md`

---

## Phase 2: Build Verification

### Step 2.1: Build for Production

Run:

```bash
npm run build
```

**Expected Output:**
```
✓ Build complete
✓ No TypeScript errors
✓ dist/ folder created with optimized assets
```

If errors occur:
- Fix TypeScript errors: `npx tsc --noEmit`
- Check for unused imports: `npm run lint`
- Rebuild: `npm run build`

### Step 2.2: Test Production Build Locally

Run:

```bash
npm run preview
```

Navigate to the URL shown (typically `http://localhost:4173`)

**Verify:**
- ✅ All pages load
- ✅ No console errors
- ✅ API calls work
- ✅ Database connection active
- ✅ Performance is good (no lag)

---

## Phase 3: Environment Setup

### Step 3.1: Create Production Environment File

On your hosting platform (Vercel, AWS, Azure, etc.), set these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
GEMINI_API_KEY=your_gemini_key
NODE_ENV=production
```

### Step 3.2: Verify Variables

Test each variable:

```bash
# For Vercel:
vercel env list

# For AWS:
aws ssm get-parameter --name /mce/SUPABASE_URL --query 'Parameter.Value'
```

---

## Phase 4: Database Production Sync

### Step 4.1: Run All Migrations on Production

On your production Supabase instance:

1. Open SQL Editor
2. Execute all migrations in order (from Guides 1-5)
3. Verify each completes successfully
4. Run verification queries from Guide 3

### Step 4.2: Verify Production Database

```sql
-- Production database health check
SELECT
  component,
  count,
  CASE
    WHEN component = 'Tables' AND count >= 13 THEN 'PASS'
    WHEN component = 'Functions' AND count >= 4 THEN 'PASS'
    WHEN component = 'Triggers' AND count >= 3 THEN 'PASS'
    ELSE 'WARN'
  END as status
FROM (
  SELECT 'Tables' as component, COUNT(*) as count
  FROM information_schema.tables WHERE table_schema = 'public'

  UNION ALL

  SELECT 'Functions' as component, COUNT(*) as count
  FROM information_schema.routines WHERE routine_schema = 'public'

  UNION ALL

  SELECT 'Triggers' as component, COUNT(*) as count
  FROM information_schema.triggers WHERE trigger_schema = 'public'
) checks;
```

---

## Phase 5: Deployment

### Step 5.1: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel deploy --prod
```

### Step 5.2: Deploy to Other Platforms

**AWS Amplify:**
```bash
amplify publish
```

**Azure Static Web Apps:**
```bash
az staticwebapp up --name mce-command-center
```

**GitHub Pages:**
```bash
npm run build
git add dist/
git commit -m "Production build"
git push
```

### Step 5.3: Verify Deployment

1. Navigate to your production URL
2. Open browser DevTools (F12)
3. Check:
   - ✅ No 404 errors
   - ✅ All API calls succeed
   - ✅ Console has no errors
   - ✅ Database loads data
   - ✅ Performance is acceptable

---

## Phase 6: Post-Deployment Monitoring

### Step 6.1: Set Up Error Tracking (Sentry)

```bash
npm install @sentry/react
```

Create file: `lib/sentry.ts`

```typescript
import * as Sentry from '@sentry/react';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    release: process.env.APP_VERSION,
  });
}
```

Update main app:

```typescript
import { initSentry } from './lib/sentry';

if (process.env.NODE_ENV === 'production') {
  initSentry();
}
```

### Step 6.2: Monitor Performance

Use Vercel Analytics:

1. Log into Vercel dashboard
2. Go to your project
3. Click **Analytics** tab
4. Enable **Web Analytics** and **Core Web Vitals**

### Step 6.3: Set Up Uptime Monitoring

Use a service like UptimeRobot or Better Stack:

1. Create account
2. Add monitor for your production URL
3. Set alert email
4. Configure SLA checks

### Step 6.4: Database Monitoring

In Supabase dashboard:

1. Go to **Performance** → **Queries**
2. Enable slow query logging
3. Set thresholds (e.g., queries > 1000ms)
4. Review weekly reports

---

## Phase 7: Smoke Tests

### Immediate Post-Deployment (Within 30 minutes)

**Run these manual tests:**

```bash
# Test 1: Dashboard loads
- Navigate to https://your-production-url.com
- Wait for dashboard to render
- Verify all widgets show data
EXPECTED: Dashboard fully functional

# Test 2: Search works
- Click search box
- Search for "test" or known project name
- Verify results display
EXPECTED: Search returns results or "no results"

# Test 3: Create operation
- Go to Documents or Projects
- Try to create a new item
- Verify success message
EXPECTED: Item created successfully

# Test 4: Database connectivity
- Open DevTools Network tab
- Perform any data operation
- Check API calls in Network tab
- Verify no 401/403/500 errors
EXPECTED: All API calls return 200/201

# Test 5: Mobile responsive
- Resize browser to 375px width
- Navigate all pages
- Test touch interactions
EXPECTED: All pages render correctly, usable on mobile

# Test 6: Error handling
- Trigger an error (e.g., malformed search)
- Verify error message is user-friendly
- Check console for detailed errors
EXPECTED: User sees helpful error, not stack trace
```

### First 24 Hours Monitoring

- Monitor error tracking dashboard (Sentry)
- Check Supabase logs for errors
- Verify database performance is acceptable
- Review performance metrics
- Monitor error rate (should be < 1%)

---

## Phase 8: Rollback Procedure

### If Critical Issue Found

**Within first hour:**

```bash
# Option 1: Immediate rollback (Vercel)
vercel rollback

# Option 2: Redeploy previous commit
git checkout HEAD~1
npm run build
vercel deploy --prod

# Option 3: Database rollback
# Contact Supabase support for point-in-time recovery
# Or restore from backup
```

**Notify stakeholders immediately:**

```
[INCIDENT] Production deployment rolled back at [TIME]
Reason: [Brief description]
Status: [Investigating / Resolved]
```

---

## Phase 9: Post-Deployment Tasks

### After Successful Deployment

**Complete these within 48 hours:**

1. **Update Documentation**
   - Document any deployment-specific configuration
   - Update README with production URL
   - Document any known issues or workarounds

2. **Verify All Features**
   - Test all 8 modules in production
   - Test user roles and permissions
   - Test edge cases and error scenarios

3. **Optimize Performance**
   - Review Core Web Vitals
   - Optimize any slow pages
   - Enable caching headers

4. **Security Audit**
   - Verify SSL certificate valid
   - Check security headers present
   - Scan for vulnerabilities: `npm audit`

5. **Documentation**
   - Document any production-specific issues
   - Update troubleshooting guide
   - Create runbook for common operations

---

## Phase 10: Long-term Maintenance

### Weekly

- Review error tracking dashboard
- Check database performance metrics
- Monitor uptime
- Review API response times

### Monthly

- Review performance trends
- Update dependencies: `npm outdated`
- Review access logs for anomalies
- Validate backup restoration works

### Quarterly

- Full security audit
- Performance optimization review
- Database optimization (ANALYZE)
- Update incident response plan

---

## Success Criteria

- ✅ Build completes without errors
- ✅ All environment variables set correctly
- ✅ Production database fully functional
- ✅ App accessible at production URL
- ✅ All smoke tests pass
- ✅ No critical errors in first 24 hours
- ✅ Monitoring active and alerting configured
- ✅ Rollback plan tested and documented

---

## Troubleshooting Production Issues

### Issue: 502 Bad Gateway

**Causes:** App crashed, cold start, database unreachable

**Solutions:**
1. Check error tracking (Sentry)
2. Verify database connection
3. Restart deployment: `vercel rollback && vercel deploy --prod`

### Issue: Slow API Responses

**Causes:** Missing indexes, N+1 queries, heavy computations

**Solutions:**
1. Enable slow query logging in Supabase
2. Add missing indexes from guide 6
3. Optimize queries: reduce field selection

### Issue: High Error Rate

**Causes:** Environment variables missing, RLS too restrictive, code bugs

**Solutions:**
1. Verify environment variables: `vercel env list`
2. Check RLS policies: "Role not found" errors indicate RLS issues
3. Review recent commits, rollback if needed

### Issue: Authentication Failures

**Causes:** Clerk keys invalid, CORS misconfigured

**Solutions:**
1. Verify CLERK_PUBLISHABLE_KEY in Supabase
2. Check CORS allowed domains
3. Verify JWT tokens valid

---

## Final Deployment Confirmation

**Record deployment details:**

```
Deployment Date: ___________
Environment: Production
Version: ___________
Deployed By: ___________
Verification Status: ✓ PASSED / ✗ FAILED
Issues Found: ___________
Resolution: ___________
Approval Sign-off: ___________
```

---

## Post-Launch Contact

**For issues after deployment:**

1. Check error tracking: Sentry dashboard
2. Review database logs: Supabase SQL Editor
3. Check deployment logs: Vercel/AWS/Azure dashboard
4. Review application logs: DevTools Console
5. Contact support with error details and timestamps

---

## Completion Checklist

**ALL 8 GUIDES COMPLETED:**

- ✅ Guide 1: Migrations deployed
- ✅ Guide 2: pg_cron configured
- ✅ Guide 3: All verifications passed
- ✅ Guide 4: Resource management implemented
- ✅ Guide 5: Delta gate operational
- ✅ Guide 6: Validation framework active
- ✅ Guide 7: Performance optimized
- ✅ Guide 8: Production deployed

---

**CONGRATULATIONS! MCE COMMAND CENTER IS NOW IN PRODUCTION.** 🎉

The application is fully deployed with all features implemented, tested, and monitored.

For questions or issues:
1. Check Sentry dashboard for errors
2. Review Supabase logs
3. Consult specific guide sections
4. Contact development team

---

**Next Reviews:**
- Day 1: Initial stability check
- Week 1: Performance and error rate review
- Month 1: Feature usage analytics and optimization opportunities
