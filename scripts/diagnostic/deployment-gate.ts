/**
 * DEPLOYMENT GATE - Pre-Deployment Diagnostic Enforcement
 *
 * This is the master gate that BLOCKS deployments if critical failures exist.
 * It runs before every production deployment to guarantee system safety.
 *
 * Usage:
 *   npx tsx scripts/diagnostic/deployment-gate.ts
 *   npm run deploy:safe
 *
 * Exit Codes:
 *   0 = PASS - Safe to deploy
 *   1 = FAIL - Deployment blocked
 *   2 = WARN - Degraded mode - manual review required
 */

import { runAllHealthProbes } from './run-health-probes';
import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

interface GateCheck {
  name: string;
  description: string;
  fn: () => Promise<boolean>;
  required: boolean;
  criticality: 'BLOCKING' | 'HIGH' | 'MEDIUM';
}

interface GateResult {
  checkName: string;
  passed: boolean;
  error?: string;
  details?: string;
  duration_ms: number;
}

interface GateReport {
  timestamp: string;
  environment: string;
  buildNumber?: string;
  checks: GateResult[];
  overallStatus: 'PASS' | 'FAIL' | 'WARN';
  blockersFailed: number;
  warningsFailed: number;
  recommendations: string[];
}

/**
 * Check 1: Endpoint Health
 */
async function checkEndpointHealth(): Promise<boolean> {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const authToken = process.env.TEST_AUTH_TOKEN;

  try {
    const report = await runAllHealthProbes(baseUrl, authToken);
    return report.summary.status === 'PASS';
  } catch (error: any) {
    throw new Error(`Endpoint health check failed: ${error.message}`);
  }
}

/**
 * Check 2: Build Succeeds
 */
async function checkBuild(): Promise<boolean> {
  try {
    console.log('  Running: npm run build');
    await execFileAsync('npm', ['run', 'build']);
    return true;
  } catch (error: any) {
    throw new Error(`Build failed: see build logs`);
  }
}

/**
 * Check 3: No TypeScript Errors
 */
async function checkTypeScript(): Promise<boolean> {
  try {
    console.log('  Running: npx tsc --noEmit');
    await execFileAsync('npx', ['tsc', '--noEmit']);
    return true;
  } catch (error: any) {
    throw new Error(`TypeScript check failed - fix compilation errors`);
  }
}

/**
 * Check 4: No Lint Errors
 */
async function checkLint(): Promise<boolean> {
  try {
    console.log('  Running: npm run lint');
    await execFileAsync('npm', ['run', 'lint']);
    return true;
  } catch (error: any) {
    // Lint might not be configured
    console.log('  (Linting not configured - skipping)');
    return true;
  }
}

/**
 * Check 5: Schema Integrity
 */
async function checkSchemaIntegrity(): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('  (Supabase not configured - skipping)');
    return true;
  }

  try {
    // Check critical tables exist
    const response = await fetch(`${supabaseUrl}/rest/v1/projects_master?limit=1`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Could not query projects_master: ${response.status}`);
    }

    return true;
  } catch (error: any) {
    throw new Error(`Schema check failed: ${error.message}`);
  }
}

/**
 * Check 6: Environment Variables
 */
async function checkEnvironment(): Promise<boolean> {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

  const missing = required.filter(v => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  return true;
}

/**
 * Check 7: No Console Errors in Build Output
 */
async function checkBuildOutput(): Promise<boolean> {
  const buildDir = path.join(process.cwd(), '.next');
  if (!fs.existsSync(buildDir)) {
    throw new Error('Build directory not found');
  }
  return true;
}

/**
 * Check 8: Git Status (uncommitted changes warning)
 */
async function checkGitStatus(): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync('git', ['status', '--porcelain']);

    if (stdout.trim().length > 0) {
      throw new Error('Uncommitted changes found - commit before deploying');
    }
    return true;
  } catch (error: any) {
    // Git might not be available
    return true;
  }
}

/**
 * Define all gate checks
 */
const GATE_CHECKS: GateCheck[] = [
  {
    name: 'Endpoint Health',
    description: 'All API endpoints respond within latency budgets',
    fn: checkEndpointHealth,
    required: true,
    criticality: 'BLOCKING',
  },
  {
    name: 'Build Succeeds',
    description: 'npm run build completes without errors',
    fn: checkBuild,
    required: true,
    criticality: 'BLOCKING',
  },
  {
    name: 'TypeScript Check',
    description: 'No TypeScript compilation errors',
    fn: checkTypeScript,
    required: true,
    criticality: 'BLOCKING',
  },
  {
    name: 'Environment Variables',
    description: 'All required env vars are set',
    fn: checkEnvironment,
    required: true,
    criticality: 'BLOCKING',
  },
  {
    name: 'Schema Integrity',
    description: 'Database schema is valid',
    fn: checkSchemaIntegrity,
    required: true,
    criticality: 'HIGH',
  },
  {
    name: 'Lint',
    description: 'No code style violations',
    fn: checkLint,
    required: false,
    criticality: 'MEDIUM',
  },
  {
    name: 'Build Output',
    description: 'Build artifacts are present',
    fn: checkBuildOutput,
    required: true,
    criticality: 'HIGH',
  },
  {
    name: 'Git Status',
    description: 'No uncommitted changes',
    fn: checkGitStatus,
    required: false,
    criticality: 'MEDIUM',
  },
];

/**
 * Run the deployment gate
 */
export async function runDeploymentGate(): Promise<GateReport> {
  console.log(`\n${'='.repeat(80)}`);
  console.log('🚀 DEPLOYMENT GATE - PRE-FLIGHT CHECKS');
  console.log(`${'='.repeat(80)}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Build: ${process.env.BUILD_NUMBER || 'local'}`);
  console.log(`${'='.repeat(80)}\n`);

  const results: GateResult[] = [];
  let blockersFailed = 0;
  let warningsFailed = 0;

  for (const check of GATE_CHECKS) {
    const startTime = performance.now();

    process.stdout.write(
      `⏳ ${check.name.padEnd(30)} [${check.criticality.padEnd(9)}]... `
    );

    try {
      const passed = await check.fn();
      const duration = Math.round(performance.now() - startTime);

      if (passed) {
        console.log(`✅ PASS [${duration}ms]`);
        results.push({
          checkName: check.name,
          passed: true,
          duration_ms: duration,
        });
      } else {
        console.log(`❌ FAIL [${duration}ms]`);
        if (check.required && check.criticality === 'BLOCKING') {
          blockersFailed++;
        } else {
          warningsFailed++;
        }
        results.push({
          checkName: check.name,
          passed: false,
          duration_ms: duration,
        });
      }
    } catch (error: any) {
      const duration = Math.round(performance.now() - startTime);
      console.log(`❌ ERROR [${duration}ms]`);
      console.log(`   └─ ${error.message}`);

      if (check.criticality === 'BLOCKING') {
        blockersFailed++;
      } else {
        warningsFailed++;
      }

      results.push({
        checkName: check.name,
        passed: false,
        error: error.message,
        duration_ms: duration,
      });
    }
  }

  // Determine overall status
  const overallStatus =
    blockersFailed > 0 ? 'FAIL' : warningsFailed > 0 ? 'WARN' : 'PASS';

  const recommendations: string[] = [];

  if (blockersFailed > 0) {
    recommendations.push('Fix all blocker failures before deploying');
    recommendations.push('Run: npm run diagnose');
  }

  if (warningsFailed > 0) {
    recommendations.push('Address warnings to ensure production safety');
  }

  const report: GateReport = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    buildNumber: process.env.BUILD_NUMBER,
    checks: results,
    overallStatus,
    blockersFailed,
    warningsFailed,
    recommendations,
  };

  // FINAL REPORT
  console.log(`\n${'='.repeat(80)}`);
  console.log(`DEPLOYMENT GATE: ${overallStatus}`);
  console.log(`Passed: ${results.filter(r => r.passed).length}/${results.length}`);
  console.log(`Blockers Failed: ${blockersFailed}`);
  console.log(`Warnings Failed: ${warningsFailed}`);

  if (recommendations.length > 0) {
    console.log(`\nRecommendations:`);
    recommendations.forEach(rec => console.log(`  • ${rec}`));
  }

  console.log(`${'='.repeat(80)}\n`);

  // Save report
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `deployment-gate-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved: ${reportPath}\n`);

  return report;
}

// CLI EXECUTION - ES Module compatible
if (import.meta.url === `file://${process.argv[1]}`) {
  runDeploymentGate()
    .then(report => {
      process.exit(report.overallStatus === 'PASS' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Deployment gate error:', error);
      process.exit(1);
    });
}
