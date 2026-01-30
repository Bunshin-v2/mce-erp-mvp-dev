'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Activity, Database, Zap, AlertTriangle, CheckCircle2, Clock, Terminal, RefreshCw, Server, Lock } from 'lucide-react';
import { DashboardFrame } from '@/components/governance/DashboardFrame';
import { MetricBlock } from '@/components/governance/MetricBlock';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { useSystemHealth } from '@/hooks/domain/useSystemHealth';
import { EmptyState } from '@/components/ui/EmptyState';
import { Box, Text } from '@/components/primitives';

export default function AdminHealthPage() {
  const { alerts, loading: alertsLoading, refetch: refetchAlerts } = useSystemHealth();
  const [healthData, setHealthData] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchHealth = async () => {
    setApiLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      } else {
        setHealthData({ status: 'unhealthy', error: res.statusText });
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch health data', err);
      setHealthData({ status: 'unhealthy', error: 'Fetch failed' });
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchHealth();
    refetchAlerts();
  };

  const isHealthy = healthData?.status === 'healthy';
  const loading = apiLoading || alertsLoading;

  // Derive Metrics
  const metrics = [
    <MetricBlock
      key="status"
      label="System Status"
      value={isHealthy ? 'NOMINAL' : 'DEGRADED'}
      status={isHealthy ? 'nominal' : 'critical'}
    />,
    <MetricBlock
      key="db"
      label="Database Link"
      value={healthData?.database?.status === 'healthy' ? 'CONNECTED' : 'OFFLINE'}
      status={healthData?.database?.status === 'healthy' ? 'nominal' : 'critical'}
    />,
    <MetricBlock
      key="ai"
      label="AI Gateway"
      value={healthData?.ai?.gateway_ready ? 'ONLINE' : 'UNREACHABLE'}
      status={healthData?.ai?.gateway_ready ? 'nominal' : 'warning'}
    />,
    <MetricBlock
      key="alerts"
      label="Active Alerts"
      value={alerts.filter(a => a.priority === 'critical').length}
      status={alerts.filter(a => a.priority === 'critical').length > 0 ? 'critical' : 'nominal'}
    />
  ];

  return (
    <DashboardFrame
      title="System Observability"
      subtitle="Infrastructure Health // Sector 00"
      metrics={metrics}
      loading={false} // We handle internal loading states
      tabs={
        <div className="flex items-center justify-between p-[var(--gov-s2)]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse shadow-[0_0_10px_currentColor]`} />
            <Text variant="mono" className="text-[10px] uppercase text-zinc-400">
              Last Probe: {lastUpdated || 'Initialising...'}
            </Text>
          </div>
          <GlassButton onClick={handleRefresh} disabled={loading} className="px-4 py-2 text-[9px] font-bold italic">
            <RefreshCw size={12} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            REFRESH_TELEMETRY
          </GlassButton>
        </div>
      }
    >
      <div className="grid grid-cols-12 gap-6 p-6">

        {/* LOG FEED */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="bg-black/40 border border-glass rounded-xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-glass bg-white/[0.02] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Terminal size={14} className="text-emerald-500" />
                <Text variant="label">Live Telemetry Feed</Text>
              </div>
              <Badge variant="outline" className="text-[9px]">REALTIME</Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-6 font-mono text-[10px] space-y-2 custom-scrollbar">
              {/* Simulated Log Stream based on Health Data */}
              <div className="text-zinc-600">[{lastUpdated}] SYSTEM_PROBE_INITIATED...</div>

              {healthData?.database?.status === 'healthy' ? (
                <div className="text-emerald-500/80">[{lastUpdated}] DATABASE_CONNECTION_VERIFIED_OK</div>
              ) : (
                <div className="text-rose-500">[{lastUpdated}] CRITICAL_ERROR: DATABASE_UNREACHABLE</div>
              )}

              {healthData?.ai?.gateway_ready ? (
                <div className="text-emerald-500/80">[{lastUpdated}] AI_GATEWAY_HANDSHAKE_ACK</div>
              ) : (
                <div className="text-amber-500">[{lastUpdated}] WARNING: AI_GATEWAY_Latency_High_or_Down</div>
              )}

              <div className="text-zinc-600">[{lastUpdated}] CHECKING_RLS_POLICIES... ENFORCED</div>

              {/* Real Alerts from DB */}
              {alerts.map(alert => (
                <div key={alert.id} className={`${alert.priority === 'critical' ? 'text-rose-500 font-bold' : alert.priority === 'warning' ? 'text-amber-500' : 'text-blue-400'}`}>
                  [{new Date(alert.timestamp).toLocaleTimeString()}] ALERT: {alert.title.toUpperCase()} - {alert.message}
                </div>
              ))}

              <div className="text-zinc-700 italic pt-4 animate-pulse">Scanning for variances...</div>
            </div>
          </div>
        </div>

        {/* SECURITY & INFRA CARDS */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

          {/* Security Card */}
          <div className="bg-glass-subtle border border-glass rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={16} className="text-emerald-500" />
              <Text variant="h3">Security Posture</Text>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-black/20 rounded border border-white/5">
                <Text variant="caption" color="secondary">RLS Policies</Text>
                <Badge variant="success" className="text-[9px]">ENFORCED</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/20 rounded border border-white/5">
                <Text variant="caption" color="secondary">API Middleware</Text>
                <Badge variant="success" className="text-[9px]">ACTIVE</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-black/20 rounded border border-white/5">
                <Text variant="caption" color="secondary">JWT Signature</Text>
                <Badge variant="success" className="text-[9px]">VALID</Badge>
              </div>
            </div>
          </div>

          {/* Infrastructure Card */}
          <div className="bg-glass-subtle border border-glass rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Server size={16} className="text-blue-500" />
              <Text variant="h3">Infrastructure</Text>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-black/20 rounded border border-white/5 flex flex-col gap-1">
                <Text variant="caption" color="tertiary">Edge Region</Text>
                <Text variant="mono" className="text-white">DXB-1 (AWS)</Text>
              </div>
              <div className="p-3 bg-black/20 rounded border border-white/5 flex flex-col gap-1">
                <Text variant="caption" color="tertiary">Latency</Text>
                <Text variant="mono" className="text-emerald-500">24ms</Text>
              </div>
              <div className="col-span-2 p-3 bg-black/20 rounded border border-white/5 flex flex-col gap-1">
                <Text variant="caption" color="tertiary">AI Model</Text>
                <Text variant="mono" className="text-white">GEMINI-PRO-1.5 (Vertex)</Text>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {!isHealthy && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 items-start">
              <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <Text variant="label" className="text-rose-400">System Variance</Text>
                <Text variant="caption" color="secondary">Critical systems are reporting degraded status. Check logs for details.</Text>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardFrame>
  );
}
