import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Define expected schema
const EXPECTED_SCHEMA = {
  tables: {
    projects_master: {
      columns: [
        'id', 'project_name', 'project_code', 'client_name',
        'contract_value_excl_vat', 'project_commencement_date',
        'project_completion_date_planned', 'dlp_end_date',
        'delivery_risk_rating', 'flag_for_ceo_attention',
        'completion_percent', 'compliance_status', 'created_at', 'updated_at'
      ]
    },
    documents: {
      columns: [
        'id', 'title', 'category', 'status', 'project_id',
        'created_at', 'updated_at', 'reviewed_at'
      ]
    },
    notifications: {
      columns: [
        'id', 'message', 'severity', 'created_at', 'read_at', 'ack_at'
      ]
    },
    tenders: {
      columns: [
        'id', 'title', 'client', 'status', 'value',
        'probability', 'created_at', 'submission_deadline'
      ]
    },
    team_members: {
      columns: [
        'id', 'name', 'email', 'role', 'department',
        'skills', 'availability_start', 'availability_end',
        'utilization_target_percent', 'billable', 'cost_per_hour',
        'created_at', 'updated_at', 'is_active'
      ]
    },
    resource_allocations: {
      columns: [
        'id', 'team_member_id', 'project_id', 'allocation_percent',
        'start_date', 'end_date', 'role_in_project', 'status',
        'created_at', 'updated_at', 'created_by'
      ]
    },
    audit_logs: {
      columns: [
        'id', 'actor_id', 'action', 'entity_type', 'entity_id',
        'diff', 'created_at'
      ]
    }
  },
  functions: [
    'get_user_role',
    'get_user_tier',
    'match_documents_hybrid',
    'calculate_team_utilization',
    'sweep_alarm_rules',
    'process_escalations'
  ]
};

interface ValidationResult {
  component: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  details: string[];
  severity: 'INFO' | 'WARNING' | 'ERROR';
}

const results: ValidationResult[] = [];

async function validateTables(): Promise<void> {
  console.log('Validating tables...');

  try {
    // Direct query to information_schema
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      results.push({
        component: 'Tables',
        status: 'FAIL',
        details: [`Failed to fetch tables: ${error.message}`],
        severity: 'ERROR'
      });
      return;
    }

    const existingTables = new Set(
      (tables || []).map((t: any) => t.table_name)
    );

    const details: string[] = [];
    let status: 'PASS' | 'WARN' | 'FAIL' = 'PASS';

    // Check for missing tables
    Object.keys(EXPECTED_SCHEMA.tables).forEach((tableName) => {
      if (!existingTables.has(tableName)) {
        details.push(`✗ Missing table: ${tableName}`);
        status = 'FAIL';
      } else {
        details.push(`✓ Table exists: ${tableName}`);
      }
    });

    results.push({
      component: 'Tables',
      status,
      details,
      severity: status === 'FAIL' ? 'ERROR' : 'INFO'
    });
  } catch (err: any) {
    results.push({
      component: 'Tables',
      status: 'FAIL',
      details: [`Error validating tables: ${err.message}`],
      severity: 'ERROR'
    });
  }
}

async function validateFunctions(): Promise<void> {
  console.log('Validating functions...');

  try {
    const { data: functions, error } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .eq('routine_type', 'FUNCTION');

    if (error) {
      results.push({
        component: 'Functions',
        status: 'WARN',
        details: [`Could not fully validate functions: ${error.message}`],
        severity: 'WARNING'
      });
      return;
    }

    const existingFunctions = new Set(
      (functions || []).map((f: any) => f.routine_name)
    );

    const details: string[] = [];
    let status: 'PASS' | 'WARN' | 'FAIL' = 'PASS';

    EXPECTED_SCHEMA.functions.forEach((funcName) => {
      if (!existingFunctions.has(funcName)) {
        details.push(`✗ Missing function: ${funcName}`);
        status = 'FAIL';
      } else {
        details.push(`✓ Function exists: ${funcName}`);
      }
    });

    results.push({
      component: 'Functions',
      status,
      details,
      severity: status === 'FAIL' ? 'ERROR' : 'INFO'
    });
  } catch (err: any) {
    results.push({
      component: 'Functions',
      status: 'WARN',
      details: [`Error validating functions: ${err.message}`],
      severity: 'WARNING'
    });
  }
}

function generateReport(): string {
  let report = '\n╔════════════════════════════════════════════════════════════╗\n';
  report += '║           SCHEMA DRIFT VALIDATION REPORT                   ║\n';
  report += '╚════════════════════════════════════════════════════════════╝\n\n';

  const summary = {
    PASS: results.filter(r => r.status === 'PASS').length,
    WARN: results.filter(r => r.status === 'WARN').length,
    FAIL: results.filter(r => r.status === 'FAIL').length
  };

  report += `Summary: ${summary.PASS} PASS | ${summary.WARN} WARN | ${summary.FAIL} FAIL\n\n`;

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✓' : result.status === 'WARN' ? '⚠' : '✗';
    report += `${icon} ${result.component} [${result.status}]\n`;
    result.details.forEach((detail) => {
      report += `  ${detail}\n`;
    });
    report += '\n';
  });

  const hasCritical = results.some(r => r.severity === 'ERROR');
  report += hasCritical ? '⚠  CRITICAL ISSUES FOUND\n' : '✓ All validations passed\n';

  return report;
}

async function main(): Promise<void> {
  console.log('Starting schema validation...\n');

  await validateTables();
  await validateFunctions();

  const report = generateReport();
  console.log(report);

  // Save to file
  const fs = await import('fs').then(m => m.promises);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-') ;
  await fs.writeFile(
    path.join(process.cwd(), `schema-validation-${timestamp}.txt`),
    report
  );

  const hasCritical = results.some(r => r.severity === 'ERROR');
  process.exit(hasCritical ? 1 : 0);
}

main().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});
