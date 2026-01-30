import { NextResponse } from 'next/server';
import { runAllHealthProbes } from '@/scripts/diagnostic/run-health-probes';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const expected = `Bearer ${process.env.CRON_SECRET || ''}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const baseUrl = process.env.API_BASE_URL || url.origin;
  const authToken = process.env.HEALTH_PROBE_AUTH_TOKEN;

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is missing; cannot store probe reports.' },
      { status: 500 }
    );
  }

  const report = await runAllHealthProbes(baseUrl, authToken);

  // Persist results (append-only) for auditability.
  const { error } = await supabaseAdmin.from('health_probe_reports').insert({
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    base_url: baseUrl,
    status: report.summary.status,
    summary: report.summary,
    report,
  });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to store health probe report', detail: error.message, report },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: 'ok', summary: report.summary });
}
