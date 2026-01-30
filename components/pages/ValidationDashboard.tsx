'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Shield,
  Activity,
  Terminal,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { GlassButton } from '../ui/GlassButton';
import { DashboardFrame } from '../governance/DashboardFrame';
import { MetricBlock } from '../governance/MetricBlock';

interface ValidationResult {
  component: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
  details?: string[];
}

export const ValidationDashboard: React.FC = () => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<string | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      // Simulate validation results
      await new Promise(r => setTimeout(r, 1500));
      
      const results: ValidationResult[] = [
        {
          component: 'Database Schema',
          status: 'PASS',
          message: 'Structural alignment verified across 12 core tables.',
          details: [
            '✓ projects_master table (14 columns)',
            '✓ documents table (12 columns)',
            '✓ team_members table (15 columns)'
          ]
        },
        {
          component: 'RLS Coverage',
          status: 'PASS',
          message: 'Neural access control active on 100% of sensitive vectors.',
          details: [
            '✓ Tier-based document access enforced',
            '✓ PM-level project editing restricted',
            '✓ System-wide audit log protection'
          ]
        },
        {
          component: 'Automation Functions',
          status: 'PASS',
          message: '6 strategic procedures loaded and calibrated.',
          details: [
            '✓ sweep_alarm_rules()',
            '✓ process_escalations()',
            '✓ match_documents_hybrid()'
          ]
        },
        {
          component: 'Temporal Pulse',
          status: 'WARN',
          message: 'Drift detection active, but latency detected in cron execution.',
          details: [
            '✓ T-Minus timing sequence active',
            '⚠ Last sweep executed 12m ago (Target: 5m)',
            '✓ Escalation logic waiting for triggers'
          ]
        },
        {
          component: 'Neural Stability',
          status: 'PASS',
          message: 'Vector dimensions locked at 1536. Zero mismatches.',
          details: [
            '✓ Gemini text-embedding-004 link OK',
            '✓ ivfflat indexing verified',
            '✓ Hybrid search weights calibrated'
          ]
        }
      ];

      setValidationResults(results);
      setLastValidation(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  const statusCounts = {
    pass: validationResults.filter(r => r.status === 'PASS').length,
    warn: validationResults.filter(r => r.status === 'WARN').length,
    fail: validationResults.filter(r => r.status === 'FAIL').length,
  };

  const overallStatus =
    statusCounts.fail > 0 ? 'FAIL' : statusCounts.warn > 0 ? 'WARN' : 'PASS';

  const metrics = [
    <MetricBlock key="tables" label="Registry Nodes" value="12/12" status="nominal" />,
    <MetricBlock key="rls" label="Policy Coverage" value="100%" status="nominal" />,
    <MetricBlock key="funcs" label="Active Logic" value="6/6" status="nominal" />,
    <MetricBlock key="health" label="System Health" value={overallStatus} status={overallStatus === 'PASS' ? 'nominal' : 'warning'} />
  ];

  return (
    <DashboardFrame
      title="Validation Command"
      subtitle="Integrity Overwatch // Sector 09"
      metrics={metrics}
      loading={isValidating}
    >
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold italic text-white tracking-widest flex items-center gap-2">
              <Shield size={16} className="text-emerald-500" /> Integrity Assessment
            </h2>
            <p className="text-[10px] font-mono text-zinc-500">Last sweep: {lastValidation || 'NEVER'}</p>
          </div>
          
          <GlassButton onClick={runValidation} disabled={isValidating} className="px-6 py-2 text-[9px]">
            <RefreshCw size={14} className={`mr-2 ${isValidating ? 'animate-spin' : ''}`} />
            Run Full Validation
          </GlassButton>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {validationResults.map((result, idx) => (
            <Card key={idx} variant="outlined" padding="none">
              <div className="flex">
                <div className={`w-1.5 shrink-0 ${
                  result.status === 'PASS' ? 'bg-emerald-500' :
                  result.status === 'WARN' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold italic text-white tracking-[0.2em]">{result.component}</h3>
                    <Badge variant={result.status === 'PASS' ? 'success' : result.status === 'WARN' ? 'warning' : 'danger'}>
                      {result.status}
                    </Badge>
                  </div>
                  
                  <p className="text-[11px] font-mono text-zinc-400 mb-4">{result.message}</p>
                  
                  {result.details && (
                    <div className="space-y-1 bg-black/20 p-3 rounded-lg border border-glass">
                      {result.details.map((detail, i) => (
                        <div key={i} className="text-[9px] font-mono text-zinc-600 flex items-center gap-2">
                          <span className="text-emerald-500/50">•</span>
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card variant="matte" padding="md" className="border-emerald-500/10">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold italic text-white tracking-widest mb-2">Neural Recommendations</h3>
              <ul className="space-y-2">
                <li className="text-[10px] text-zinc-500 font-bold italic flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  System identified optimal RLS coverage. Deployment risk: <span className="text-emerald-500">LOW</span>
                </li>
                <li className="text-[10px] text-zinc-500 font-bold italic flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-500" />
                  Consider secondary indexing on <span className="text-zinc-300">notifications.created_at</span> for ledger velocity.
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardFrame>
  );
};

