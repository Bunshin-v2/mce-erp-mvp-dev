/**
 * ENDPOINT HEALTH PROBE RUNNER
 * Executes real HTTP requests to all registered endpoints
 * Validates latency, error rates, auth, RLS, and response schemas
 *
 * Usage:
 *   npx tsx scripts/diagnostic/run-health-probes.ts
 *   API_BASE_URL=http://localhost:3000 TEST_AUTH_TOKEN=token npx tsx scripts/diagnostic/run-health-probes.ts
 */

import {
  ENDPOINT_REGISTRY,
  getCriticalEndpoints,
  EndpointContract,
} from './endpoint-registry';
import * as fs from 'fs';
import * as path from 'path';

interface ProbeResult {
  endpoint: string;
  method: string;
  path: string;
  timestamp: string;
  latency_ms: number;
  status_code: number;
  success: boolean;
  error?: string;
  violations: string[];
  details: {
    authValidated: boolean;
    responseSchemaValid: boolean;
    latencyOK: boolean;
  };
}

interface ProbeReport {
  timestamp: string;
  environment: string;
  baseUrl: string;
  totalEndpoints: number;
  passedCount: number;
  failedCount: number;
  criticalFailures: number;
  results: ProbeResult[];
  summary: {
    status: 'PASS' | 'FAIL' | 'DEGRADED';
    message: string;
    avgLatency: number;
    p95Latency: number;
  };
}

export async function runHealthProbe(
  endpoint: EndpointContract,
  baseUrl: string,
  authToken?: string
): Promise<ProbeResult> {
  const result: ProbeResult = {
    endpoint: endpoint.name,
    method: endpoint.method,
    path: endpoint.path,
    timestamp: new Date().toISOString(),
    latency_ms: 0,
    status_code: 0,
    success: false,
    violations: [],
    details: {
      authValidated: false,
      responseSchemaValid: false,
      latencyOK: false,
    },
  };

  const startTime = performance.now();

  try {
    // 1. BUILD REQUEST URL
    let url = endpoint.path;
    if (!url.startsWith('http')) {
      url = new URL(endpoint.path, baseUrl).toString();
    }

    // Replace path parameters with dummy values for testing
    url = url
      .replace(':id', '00000000-0000-0000-0000-000000000001')
      .replace('/:id', '/00000000-0000-0000-0000-000000000001');

    // 2. BUILD HEADERS
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (endpoint.authContext === 'required' && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // 3. BUILD BODY (for mutations)
    let body: string | undefined;
    if (endpoint.method !== 'GET' && endpoint.method !== 'DELETE') {
      body = JSON.stringify(endpoint.testPayload || {});
    }

    // 4. EXECUTE REQUEST
    const response = await Promise.race([
      fetch(url, {
        method: endpoint.method,
        headers,
        body,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      ),
    ]);

    if (!(response instanceof Response)) {
      throw new Error('Invalid response');
    }

    const latency = performance.now() - startTime;
    result.latency_ms = Math.round(latency);
    result.status_code = response.status;

    // 5. VALIDATE AUTH CONTEXT
    if (endpoint.authContext === 'required' && !authToken) {
      // Should get 401 without auth
      if (response.status !== 401) {
        result.violations.push(
          `Expected 401 (Unauthorized) without token, got ${response.status}`
        );
      } else {
        result.details.authValidated = true;
      }
    } else if (authToken) {
      result.details.authValidated = true;
    }

    // 6. HANDLE ERROR RESPONSES
    if (response.status >= 500) {
      result.error = `Server Error ${response.status}`;
      result.violations.push(`HTTP ${response.status}`);
      return result;
    }

    if (response.status === 401) {
      result.violations.push('Authentication failed');
      return result;
    }

    if (response.status === 403) {
      result.violations.push('Access denied (RLS blocked)');
      return result;
    }

    // 7. VALIDATE LATENCY
    if (latency > endpoint.latency.p99) {
      result.violations.push(
        `Latency ${Math.round(latency)}ms EXCEEDS p99 budget ${endpoint.latency.p99}ms`
      );
    } else if (latency > endpoint.latency.p95) {
      result.violations.push(
        `Latency ${Math.round(latency)}ms exceeds p95 budget ${endpoint.latency.p95}ms (warning)`
      );
      result.details.latencyOK = false;
    } else {
      result.details.latencyOK = true;
    }

    // 8. VALIDATE RESPONSE SCHEMA
    if (response.ok && endpoint.responseSchema) {
      try {
        const data = await response.json();
        if (validateSchema(data, endpoint.responseSchema)) {
          result.details.responseSchemaValid = true;
        } else {
          result.violations.push('Response schema mismatch');
        }
      } catch (e) {
        result.violations.push('Failed to parse response JSON');
      }
    } else if (response.ok) {
      result.details.responseSchemaValid = true;
    }

    // 9. DETERMINE SUCCESS
    result.success =
      response.ok &&
      result.violations.length === 0 &&
      result.details.authValidated &&
      result.details.responseSchemaValid &&
      result.details.latencyOK;
  } catch (error: any) {
    result.success = false;
    result.error = error.message || 'Unknown error';
    result.violations.push(result.error);
  }

  return result;
}

function validateSchema(data: any, schema: any): boolean {
  if (!schema.type) return true;

  if (schema.type === 'array' && !Array.isArray(data)) return false;
  if (schema.type === 'object' && typeof data !== 'object') return false;
  if (schema.type === 'string' && typeof data !== 'string') return false;
  if (schema.type === 'number' && typeof data !== 'number') return false;

  if (schema.items && Array.isArray(data)) {
    for (const item of data) {
      if (!validateSchema(item, schema.items)) return false;
    }
  }

  if (schema.required && typeof data === 'object' && data !== null) {
    for (const field of schema.required) {
      if (!(field in data)) return false;
    }
  }

  return true;
}

export async function runAllHealthProbes(
  baseUrl: string,
  authToken?: string
): Promise<ProbeReport> {
  console.log(`\n${'='.repeat(80)}`);
  console.log('ENDPOINT HEALTH PROBE SUITE');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Auth: ${authToken ? 'Present' : 'Missing'}`);
  console.log(`${'='.repeat(80)}\n`);

  const results: ProbeResult[] = [];
  const latencies: number[] = [];
  let passCount = 0;
  let failCount = 0;
  let criticalFailures = 0;

  for (const endpoint of ENDPOINT_REGISTRY) {
    process.stdout.write(`Testing ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(40)}`);

    const result = await runHealthProbe(endpoint, baseUrl, authToken);
    results.push(result);
    latencies.push(result.latency_ms);

    if (result.success) {
      passCount++;
      console.log(`✅ [${result.latency_ms}ms]`);
    } else {
      failCount++;
      console.log(`❌ [${result.latency_ms}ms]`);

      if (endpoint.criticality === 'BLOCKING' || endpoint.criticality === 'CRITICAL') {
        criticalFailures++;
        console.log(`   ERROR: ${result.error}`);
        result.violations.forEach(v => console.log(`   - ${v}`));
      }
    }
  }

  // Calculate statistics
  latencies.sort((a, b) => a - b);
  const avgLatency = Math.round(
    latencies.reduce((a, b) => a + b, 0) / latencies.length
  );
  const p95Latency = Math.round(
    latencies[Math.floor(latencies.length * 0.95)] || 0
  );

  const report: ProbeReport = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    baseUrl,
    totalEndpoints: ENDPOINT_REGISTRY.length,
    passedCount: passCount,
    failedCount: failCount,
    criticalFailures,
    results,
    summary: {
      status: criticalFailures > 0 ? 'FAIL' : failCount > 0 ? 'DEGRADED' : 'PASS',
      message:
        criticalFailures > 0
          ? `${criticalFailures} critical endpoints failed`
          : failCount > 0
          ? `${failCount} non-critical endpoints failed`
          : 'All endpoints healthy',
      avgLatency,
      p95Latency,
    },
  };

  // FINAL REPORT
  console.log(`\n${'='.repeat(80)}`);
  console.log(`HEALTH PROBE SUMMARY`);
  console.log(`Status: ${report.summary.status}`);
  console.log(`Endpoints: ${passCount}/${ENDPOINT_REGISTRY.length} passed`);
  console.log(`Avg Latency: ${avgLatency}ms | p95: ${p95Latency}ms`);
  console.log(`${'='.repeat(80)}\n`);

  // Output JSON report
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `health-probe-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved: ${reportPath}\n`);

  return report;
}

// CLI EXECUTION - ES Module compatible
if (import.meta.url === `file://${String(process.argv[1] ?? '')}`) {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const authToken = process.env.TEST_AUTH_TOKEN;

  runAllHealthProbes(baseUrl, authToken)
    .then(report => {
      process.exit(report.summary.status === 'PASS' ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Probe failed:', error);
      process.exit(1);
    });
}
