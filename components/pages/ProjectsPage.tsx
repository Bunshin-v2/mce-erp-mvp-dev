import React, { useState, useMemo } from 'react';
import { Download, Plus, Building2, List, GanttChartSquare, Zap, Search, Filter } from 'lucide-react';
import { DashboardFrame } from '../governance/DashboardFrame';
import { MetricBlock } from '../governance/MetricBlock';
import { TabNav } from '../governance/TabNav';
import { GovernanceTable } from '../governance/GovernanceTable';
import { ProjectForm } from '../forms/ProjectForm';
import { safeExportToCSV } from '../../utils/exportUtils';
import { ProjectTimeline } from '../projects/ProjectTimeline';
import { GlassButton } from '../ui/GlassButton';
import { CommandPalette } from '../ui/CommandPalette';
import { DriftBadge } from '../projects/DriftBadge';
import { EmptyState } from '../ui/EmptyState';
import { RiskPulse } from '../projects/RiskPulse';
import { logger } from '../../lib/logger';
import { useToast } from '@/lib/toast-context';

import { Box, Text } from '../primitives';
import { StatusBadge } from '../ui/StatusBadge';

interface ProjectsPageProps {
  projects: any[];
  onSelectProject: (id: string) => void;
  onRefresh: () => void;
  searchQuery?: string;
  onNavigate?: (view: string) => void;
  loading?: boolean;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onSelectProject,
  onRefresh,
  onNavigate,
  loading = false
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const toast = useToast();

  const sortedProjects = useMemo(() => {
    const filtered = projects.filter(p => {
      const status = (p.project_status || p.PROJECT_STATUS || '').toUpperCase();
      let matchesTab = true;
      if (activeTab === 'ONGOING') matchesTab = status.includes('CONSTRUCTION') || status.includes('ONGOING') || status.includes('ACTIVE');
      if (activeTab === 'COMPLETED') matchesTab = status.includes('COMPLETED') || status.includes('DLP');
      if (activeTab === 'UPCOMING') matchesTab = status.includes('TENDER') || status.includes('PRE-AWARD') || status.includes('AWAITING') || status.includes('UPCOMING');
      if (!matchesTab) return false;

      if (localSearchQuery) {
        const query = localSearchQuery.toLowerCase();
        const matchesName = (p.project_name || p.PROJECT_NAME || '').toLowerCase().includes(query);
        const matchesClient = (p.client_name || p.CLIENT_NAME || '').toLowerCase().includes(query);
        const matchesCode = (p.project_code || p.PROJECT_CODE || '').toLowerCase().includes(query);
        if (!matchesName && !matchesClient && !matchesCode) return false;
      }
      return true;
    });

    logger.debug('PROJECTS_SORT_AND_FILTER', { count: filtered.length });

    return [...filtered].sort((a, b) => {
      const dateA_str = a.project_completion_date_planned || a.PROJECT_COMPLETION_DATE_PLANNED;
      const dateB_str = b.project_completion_date_planned || b.PROJECT_COMPLETION_DATE_PLANNED;
      const dateA = dateA_str ? new Date(dateA_str).getTime() : Infinity;
      const dateB = dateB_str ? new Date(dateB_str).getTime() : Infinity;
      return dateA - dateB;
    });
  }, [projects, activeTab, localSearchQuery]);

  const stats = {
    total: projects.length,
    active: projects.filter(p => (p.project_status || p.PROJECT_STATUS) === 'Active' || (p.project_status || p.PROJECT_STATUS) === 'Construction').length,
    value: projects.reduce((acc, p) => acc + (p.contract_value_excl_vat || p.CONTRACT_VALUE_EXCL_VAT || 0), 0),
    avgProgress: Math.round(projects.reduce((acc, p) => acc + (p.completion_percent || p.COMPLETION_PERCENT || 0), 0) / (projects.length || 1))
  };

  const metrics = [
    <MetricBlock key="total" label="Portfolio size" value={stats.total} status="nominal" />,
    <MetricBlock key="active" label="Construction" value={stats.active} status="nominal" />,
    <MetricBlock key="value" label="Contract Value" value={`AED ${(stats.value / 1000000).toFixed(1)}M`} status="nominal" />,
    <MetricBlock key="progress" label="Avg Saturation" value={`${stats.avgProgress}%`} trend={{ value: 5, type: 'up' }} />,
    <MetricBlock key="signals" label="Active Signals" value={projects.filter(p => (p.delivery_risk_rating || p.DELIVERY_RISK_RATING) === 'Critical').length} status="critical" />
  ];

  const columns = [
    {
      header: 'IDENTITY REGISTRY',
      width: '35%',
      accessor: (p: any) => (
        <Box className="flex items-center gap-3">
          <Box className="w-8 h-8 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5 transition-all shrink-0">
            <Building2 size={15} strokeWidth={1.5} />
          </Box>
          <Box className="min-w-0 flex flex-col gap-0.5">
            <Box className="flex items-center gap-2">
              <Text variant="gov-table" weight="bold" color="primary" className="truncate tracking-tight group-hover:text-emerald-500 transition-colors">
                {p.project_name || p.PROJECT_NAME}
              </Text>
              <RiskPulse status={p.delivery_risk_rating === 'Critical' ? 'CRITICAL' : 'STABLE'} />
            </Box>
            <Box className="flex items-center gap-2">
              <Text variant="gov-label" color="tertiary" className="uppercase opacity-60">
                {p.client_name || p.CLIENT_NAME || 'MCE INTERNAL'}
              </Text>
              <Text variant="gov-label" className="font-mono opacity-30">
                #{p.project_code || p.PROJECT_CODE || 'N/A'}
              </Text>
            </Box>
          </Box>
        </Box>
      )
    },
    {
      header: 'PREDICTIVE PULSE',
      width: '15%',
      align: 'center' as const,
      accessor: (p: any) => (
        <DriftBadge
          plannedDate={p.project_completion_date_planned || p.PROJECT_COMPLETION_DATE_PLANNED}
          status={p.project_status || p.PROJECT_STATUS}
        />
      )
    },
    {
      header: 'TEMPORAL LOCK',
      width: '15%',
      align: 'center' as const,
      accessor: (p: any) => (
        <Box className="flex flex-col items-center">
          <Text variant="gov-table" weight="bold" color="primary" className="font-mono">
            {(p.project_completion_date_planned || p.PROJECT_COMPLETION_DATE_PLANNED || p.project_start_date || p.PROJECT_START_DATE || '').split('T')[0]}
          </Text>
          <Text variant="gov-label" color="tertiary" weight="bold" className="uppercase opacity-40">
            {(p.project_status || p.PROJECT_STATUS) === 'Completed' ? 'FINALIZED' : 'LOCKED ON'}
          </Text>
        </Box>
      )
    },
    {
      header: 'SATURATION',
      width: '20%',
      accessor: (p: any) => {
        const progress = p.completion_percent || p.COMPLETION_PERCENT || 0;
        return (
          <Box className="flex flex-col gap-0.5 px-4 w-full">
            <Box className="flex justify-between items-end">
              <Text variant="gov-label" weight="bold" className="text-emerald-500">{progress}%</Text>
              <Text variant="gov-label" color="tertiary" className="uppercase opacity-40">Progress</Text>
            </Box>
            <Box className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/[0.03]">
              <div
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </Box>
          </Box>
        );
      }
    },
    {
      header: 'STATUS',
      width: '15%',
      align: 'right' as const,
      accessor: (p: any) => (
        <Box className="flex flex-col items-end gap-0.5">
          <Text variant="gov-table" weight="bold" color="primary" className="font-mono">
            AED {((p.contract_value_excl_vat || p.CONTRACT_VALUE_EXCL_VAT || 0) / 1000000).toFixed(1)}M
          </Text>
          <StatusBadge status={p.project_status || p.PROJECT_STATUS || 'Active'} />
        </Box>
      )
    }
  ];

  return (
    <DashboardFrame
      title="Global Projects Ledger"
      subtitle="Portfolio Overwatch // Sector 01"
      metrics={metrics}
      loading={loading}
      tabs={
        <div className="flex flex-col md:flex-row items-center justify-between p-[var(--gov-s2)] gap-4">
          <CommandPalette
            projects={projects}
            onNavigate={onNavigate}
            onSelectProject={onSelectProject}
          />

          <TabNav
            tabs={[
              { id: 'ALL', label: 'All Records' },
              { id: 'ONGOING', label: 'Active nodes' },
              { id: 'COMPLETED', label: 'Finalized' },
              { id: 'UPCOMING', label: 'Pipeline' }
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="category"
          />

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder="REGISTRY QUERY (⌘K)..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="bg-black/40 border border-glass rounded-lg pl-9 pr-4 py-2 text-[10px] font-mono text-zinc-400 w-48 focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-700"
              />
            </div>

            <div className="flex items-center bg-black/40 p-1 rounded-lg border border-glass">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-600'}`}>
                <List size={14} />
              </button>
              <button onClick={() => setViewMode('timeline')} className={`p-1.5 rounded transition-all ${viewMode === 'timeline' ? 'bg-white/10 text-white' : 'text-zinc-600'}`}>
                <GanttChartSquare size={14} />
              </button>
            </div>

            <button onClick={() => safeExportToCSV(sortedProjects, 'MCE_Ledger')} className="p-2 text-zinc-600 hover:text-white transition-colors">
              <Download size={16} />
            </button>

            <button
              onClick={async () => {
                try {
                  logger.info('RAG_SYNC_TRIGGERED');
                  const res = await fetch('/api/rag/ingest-all', { method: 'POST' });
                  const data = await res.json().catch(() => null);

                  if (res.status === 410) {
                    const readyRes = await fetch('/api/ai/ready').catch(() => null);
                    const ready = !!readyRes && readyRes.ok;
                    toast.info(
                      'RAG Indexing Managed Externally',
                      ready
                        ? 'AI Gateway is online; indexing runs via its worker.'
                        : 'AI Gateway not reachable; check AI_GATEWAY_URL.'
                    );
                    return;
                  }

                  if (!res.ok) {
                    const message = data?.error?.message || data?.error || 'RAG sync failed.';
                    throw new Error(message);
                  }

                  const synced = data?.details?.synced ?? data?.synced ?? 'unknown';
                  toast.success('RAG Sync Complete', `${synced} projects indexed into vault.`);
                } catch (e) {
                  logger.error('RAG_SYNC_FAILED', e as Error);
                  toast.error("RAG Sync Failed", "Intelligence Core synchronization interrupted.");
                }
              }}
              className="p-2 text-zinc-600 hover:text-emerald-500 transition-colors"
              title="Sync RAG Data"
            >
              <Zap size={16} />
            </button>

            <GlassButton onClick={() => setIsFormOpen(true)} className="px-6 py-2 rounded-lg text-[9px] font-bold italic tracking-widest">
              <Plus size={14} className="mr-2" /> Initialize node
            </GlassButton>
          </div>
        </div>
      }
    >
      {isFormOpen && <ProjectForm onClose={() => setIsFormOpen(false)} onSuccess={onRefresh} />}

      {viewMode === 'list' ? (
        <div className="flex flex-col h-full">

          <div className="px-6 py-3 border-b border-glass bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-500">{sortedProjects.length} Verified records synced</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {sortedProjects.length > 0 ? (
              <GovernanceTable
                data={sortedProjects}
                columns={columns}
                onRowClick={(p) => {
                  logger.debug('PROJECT_SELECTED', { id: p.id });
                  onSelectProject(p.id);
                }}
              />
            ) : (
              <div className="p-12">
                <EmptyState
                  icon={Building2}
                  title="No Nodes Detected"
                  description="The registry query returned zero active records. Adjust your filters or initialize a new node."
                  action={{
                    label: "Initialize Node",
                    onClick: () => setIsFormOpen(true)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6">
          <ProjectTimeline
            projectStartDate={projects.length > 0 ? projects.reduce((min, p) => new Date(p.project_start_date) < min ? new Date(p.project_start_date) : min, new Date()).toISOString().split('T')[0] : "2026-01-01"}
            projectEndDate={projects.length > 0 ? projects.reduce((max, p) => new Date(p.project_completion_date_planned) > max ? new Date(p.project_completion_date_planned) : max, new Date(0)).toISOString().split('T')[0] : "2026-12-31"}
            milestones={
              projects.flatMap(p => p.milestones?.map((m: any) => ({ ...m, status: m.status || 'Pending' })) || [])
            }
          />
        </div>
      )}
    </DashboardFrame>
  );
};

