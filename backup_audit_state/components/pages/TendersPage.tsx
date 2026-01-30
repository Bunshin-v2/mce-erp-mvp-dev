import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, ChevronRight, TrendingUp, DollarSign, Target, Zap, LayoutGrid, List } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { TenderForm } from '../forms/TenderForm';
import { TenderKanban } from '../tenders/TenderKanban';
import { TenderIntakeWizard } from '../tenders/TenderIntakeWizard';
import { GlassButton } from '../ui/GlassButton';

interface TendersPageProps {
  tenders: any[];
  onRefresh: () => void;
  onSelectTender: (id: string) => void;
  onNavigate?: (view: string) => void;
}

export const TendersPage: React.FC<TendersPageProps> = ({ tenders, onRefresh, onSelectTender, onNavigate }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [newTender, setNewTender] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const totalValue = tenders.reduce((sum, t) => sum + (Number(t.value) || 0), 0);
  const winRate = tenders.length > 0 ? Math.round((tenders.filter(t => t.probability === 'High').length / tenders.length) * 100) : 0;

  const filteredTenders = tenders.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container space-y-10 animate-fade-in pb-20">
      {isFormOpen && (
        <TenderForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={(tender) => {
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
            setIsWizardOpen(false);
            onSelectTender(newTender.id);
          }}
          onCancel={() => setIsWizardOpen(false)}
        />
      )}

      {/* Normalized Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3">
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => onNavigate?.('dashboard')}>COMMAND_CENTER</span>
            <span>/</span>
            <span className="text-[#00dc82]">GROWTH_PIPELINE</span>
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight italic">Opportunity Ledger</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-black p-1 rounded-xl border border-white/5 mr-2 shadow-inner">
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}><List size={16} /></button>
            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}><LayoutGrid size={16} /></button>
          </div>
          <GlassButton onClick={() => setIsFormOpen(true)} className="font-bold text-[10px] px-8 py-2.5 rounded-xl uppercase tracking-[0.2em]">
            <Plus size={16} className="mr-2" strokeWidth={3} /> INITIALIZE_NODE
          </GlassButton>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-10 flex flex-wrap items-center justify-between gap-12 shadow-3xl">
        <div className="flex items-center gap-16 font-mono">
          <div><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Active_Nodes</p><p className="text-3xl font-bold text-white tracking-tighter">{tenders.length}</p></div>
          <div className="w-px h-12 bg-white/5"></div>
          <div><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Pipeline_Integrity</p><p className="text-3xl font-bold text-emerald-500 tracking-tighter">AED {(totalValue / 1000000).toFixed(1)}M</p></div>
          <div className="w-px h-12 bg-white/5"></div>
          <div><p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Win_Saturation</p><p className="text-3xl font-bold text-blue-500 tracking-tighter">{winRate}%</p></div>
        </div>
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
          <Zap size={12} className="text-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-[0.2em]">Registry Stream Synchronized</span>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl">
          <div className="grid grid-cols-12 px-10 py-6 border-b border-white/5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] bg-black/40">
            <div className="col-span-5">Opportunity_Node</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-right">Metric_Value</div>
            <div className="col-span-2 text-right">Confidence</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y divide-white/5 bg-black/20">
            {filteredTenders.map((tender) => (
              <div key={tender.id} onClick={() => onSelectTender(tender.id)} className="grid grid-cols-12 px-10 py-8 items-center hover:bg-white/[0.02] transition-all cursor-pointer group relative overflow-hidden border-b border-white/[0.03] last:border-0">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="col-span-5 flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${tender.probability === 'High' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/5 border-amber-500/20 text-amber-500'}`}>
                    <Target size={20} />
                  </div>
                  <div>
                    {/* FIXED: CLEAN SHARP FONT */}
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{tender.title}</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1 tracking-widest">{tender.client}</p>
                  </div>
                </div>
                <div className="col-span-2 flex justify-center">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${tender.status === 'ACTIVE' || tender.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-black text-zinc-600 border-white/5'}`}>{tender.status}</span>
                </div>
                <div className="col-span-2 text-right">
                  {/* FIXED: CLEAN MONO VALUE */}
                  <p className="text-lg font-bold text-white font-mono tracking-tighter leading-none">AED {(Number(tender.value) || 0).toLocaleString()}</p>
                  <p className="text-[8px] text-zinc-700 font-bold uppercase mt-2 tracking-widest">Fixed Registry Value</p>
                </div>
                <div className="col-span-2 text-right">
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${tender.probability === 'High' ? 'text-emerald-400' : 'text-amber-400'}`}>{tender.probability}</span>
                    <div className="w-24 bg-white/5 h-1 rounded-full overflow-hidden shadow-inner"><div className={`h-full transition-all duration-[2000ms] ${tender.probability === 'High' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: tender.probability === 'High' ? '85%' : '50%' }} /></div>
                  </div>
                </div>
                <div className="col-span-1 flex justify-end pr-4 text-zinc-800 group-hover:text-emerald-500 transition-colors"><ChevronRight size={20} /></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <TenderKanban tenders={filteredTenders} onSelectTender={onSelectTender} />
      )}
    </div>
  );
};