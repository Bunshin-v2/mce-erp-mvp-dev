import React, { useState } from 'react';
import { Plus, Search, TrendingUp, Target, LayoutGrid, List } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { MetricBlock } from '../governance/MetricBlock';
import { DashboardFrame } from '../governance/DashboardFrame';
import { GovernanceTable } from '../governance/GovernanceTable';
import { TenderForm } from '../forms/TenderForm';
import { TenderKanban } from '../tenders/TenderKanban';
import { TenderIntakeWizard } from '../tenders/TenderIntakeWizard';
import { GlassButton } from '../ui/GlassButton';
import { EmptyState } from '../ui/EmptyState';
import { logger } from '../../lib/logger';
import { useToast } from '@/lib/toast-context';
import { Box, Text } from '../primitives';
import { cn } from '@/lib/utils';

interface TendersPageProps {
  tenders: any[];
  onRefresh: () => void;
  onSelectTender: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: string) => void;
  onNavigate?: (view: any) => void;
  loading?: boolean;
}

export const TendersPage: React.FC<TendersPageProps> = ({
  tenders,
  onRefresh,
  onSelectTender,
  onUpdateStatus,
  onNavigate,
  loading = false
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [newTender, setNewTender] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const toast = useToast();

  const totalValue = tenders.reduce((sum, t) => sum + (Number(String(t.value || "0").replace(/[^0-9.-]+/g, "")) || 0), 0);
  const winRate = tenders.length > 0 ? Math.round((tenders.filter(t => t.probability === 'High').length / tenders.length) * 100) : 0;

  const filteredTenders = tenders.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const metrics = [
    <MetricBlock key="nodes" label="Active Nodes" value={tenders.length} />,
    <MetricBlock key="integrity" label="Pipeline Integrity" value={`AED ${(totalValue / 1000000).toFixed(1)}M`} status="nominal" />,
    <MetricBlock key="saturation" label="Win Saturation" value={`${winRate}%`} status={winRate > 60 ? 'nominal' : 'warning'} />
  ];

  const columns = [
    {
      header: 'REF_ID',
      accessor: (item: any) => (
        <Text variant="gov-label" color="tertiary">
          #{item.id.slice(0, 4)}
        </Text>
      ),
      className: 'w-[80px]'
    },
    {
      header: 'OPPORTUNITY_NODE',
      accessor: (item: any) => (
        <Box className="flex items-center gap-4">
          <Box className={cn(
            "w-8 h-8 flex items-center justify-center transition-all shrink-0",
            item.probability === 'High' ? 'text-emerald-500' : 'text-amber-500'
          )}>
            <Target size={14} strokeWidth={1.5} />
          </Box>
          <Box className="flex flex-col gap-1">
            <Text className="text-white font-bold truncate text-[12px]">{item.title}</Text>
            <Text variant="gov-label" color="tertiary" className="truncate text-[9px]">{item.client || 'MCE_INTERNAL'}</Text>
          </Box>
        </Box>
      )
    },
    {
      header: 'EXECUTION_STATUS',
      accessor: (item: any) => (
        <Box className="flex justify-center">
          <Badge variant={item.status === 'Active' ? 'success' : 'outline'} className="text-[9px] px-3 py-1 font-bold tracking-widest">
            {item.status}
          </Badge>
        </Box>
      ),
      align: 'center' as const
    },
    {
      header: 'SUBMISSION',
      accessor: (item: any) => (
        <Text variant="gov-metric" color="tertiary">
          {item.submissionDate}
        </Text>
      ),
      align: 'center' as const
    },
    {
      header: 'REGISTRY_VALUE',
      accessor: (item: any) => (
        <Box className="flex flex-col items-end">
          <Text variant="gov-metric" className="text-white text-[14px]">
            {item.value}
          </Text>
          <Text variant="gov-label" className={cn("mt-1", item.probability === 'High' ? 'text-emerald-500' : 'text-amber-500')}>
            {item.probability} PROB
          </Text>
        </Box>
      ),
      align: 'right' as const
    }
  ];

  const tabs = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center bg-black p-1 rounded-xl border border-glass shadow-inner">
        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}><List size={16} /></button>
        <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}><LayoutGrid size={16} /></button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder="QUERY_PIPELINE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900/40 border border-glass rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-mono text-zinc-300 w-64 focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-zinc-600 tracking-widest shadow-inner"
          />
        </div>
        <GlassButton onClick={() => setIsFormOpen(true)} className="font-bold italic text-[10px] px-8 py-2.5 rounded-xl tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <Plus size={16} className="mr-2" strokeWidth={3} /> INITIALIZE_NODE
        </GlassButton>
      </div>
    </div>
  );

  return (
    <DashboardFrame
      title="Opportunity Ledger"
      subtitle="Growth Pipeline // Sector 02"
      metrics={metrics}
      tabs={tabs}
      loading={loading}
    >
      {isFormOpen && (
        <TenderForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={(tender) => {
            logger.info('TENDER_INITIALIZED', { id: tender?.id });
            toast.success("Tender Initialized", "New opportunity node added to registry.");
            if (tender) {
              setNewTender(tender);
              setIsFormOpen(false);
              setIsWizardOpen(true);
            }
            onRefresh();
          }}
        />
      )}

      {isWizardOpen && newTender && (
        <TenderIntakeWizard
          tenderId={newTender.id}
          tenderTitle={newTender.title}
          clientName={newTender.client}
          onComplete={() => {
            logger.info('WIZARD_COMPLETE', { id: newTender.id });
            toast.success("Intelligence Mapped", "Tender documentation extracted and synced.");
            setIsWizardOpen(false);
            onSelectTender(newTender.id);
          }}
          onCancel={() => setIsWizardOpen(false)}
        />
      )}

      {viewMode === 'list' ? (
        <div className="animate-in fade-in duration-500">
          {filteredTenders.length > 0 ? (
            <GovernanceTable
              data={filteredTenders}
              columns={columns}
              onRowClick={(item: any) => {
                logger.debug('TENDER_SELECTED', { id: item.id });
                onSelectTender(item.id);
              }}
              statusField="status"
              auditLogField="last_action"
              urgencyField="is_urgent"
            />
          ) : (
            <div className="p-12">
              <EmptyState
                icon={Target}
                title="Pipeline Quiescent"
                description="No active opportunity nodes detected in this quadrant. Initialize a new node to begin capture."
                action={{
                  label: "Initialize Node",
                  onClick: () => setIsFormOpen(true)
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <TenderKanban
            tenders={filteredTenders}
            onSelectTender={onSelectTender}
            onUpdateStatus={(id, status) => {
              logger.info('TENDER_STATUS_UPDATE', { id, status });
              toast.info("Status Transition", `Tender ${id.slice(0, 4)} moved to ${status}`);
              onUpdateStatus?.(id, status);
            }}
          />
        </div>
      )}
    </DashboardFrame>
  );
};
