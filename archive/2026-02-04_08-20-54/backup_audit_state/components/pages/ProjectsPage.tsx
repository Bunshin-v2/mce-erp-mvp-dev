import React, { useState } from 'react';
import { Download, Plus, Search, Filter, MoreHorizontal, Building2, MapPin, Zap } from 'lucide-react';
import { GlassPanel } from '../ui/GlassPanel';
import { GlassButton } from '../ui/GlassButton';
import { ProjectForm } from '../forms/ProjectForm';
import { safeExportToCSV } from '../../utils/exportUtils';

interface ProjectsPageProps {
  projects: any[];
  onSelectProject: (id: string) => void;
  onRefresh: () => void;
  onNavigate?: (view: string) => void;
  searchQuery?: string;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, onSelectProject, onRefresh, onNavigate, searchQuery = '' }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ONGOING' | 'COMPLETED' | 'UPCOMING'>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterClient, setFilterClient] = useState('');
  const [filterMinValue, setFilterMinValue] = useState(0);

  const uniqueClients = Array.from(new Set(projects.map(p => p.client_name))).filter(Boolean).sort();

  const filteredProjects = projects.filter(p => {
    const status = p.project_status?.toUpperCase() || '';
    let matchesTab = true;
    if (activeTab === 'ONGOING') matchesTab = status.includes('CONSTRUCTION') || status.includes('ONGOING') || status.includes('ACTIVE');
    if (activeTab === 'COMPLETED') matchesTab = status.includes('COMPLETED') || status.includes('DLP');
    if (activeTab === 'UPCOMING') matchesTab = status.includes('TENDER') || status.includes('PRE-AWARD') || status.includes('AWAITING');
    if (!matchesTab) return false;
    if (filterClient && p.client_name !== filterClient) return false;
    if (filterMinValue > 0 && (p.contract_value_excl_vat || 0) < filterMinValue) return false;
    return true;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const dateA = a.project_completion_date_planned ? new Date(a.project_completion_date_planned).getTime() : Infinity;
    const dateB = b.project_completion_date_planned ? new Date(b.project_completion_date_planned).getTime() : Infinity;
    return dateA - dateB;
  });

  return (
    <div className="page-container space-y-10 animate-fade-in pb-20">
      {isFormOpen && <ProjectForm onClose={() => setIsFormOpen(false)} onSuccess={onRefresh} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3">
            <span className="cursor-pointer hover:text-white transition-colors" onClick={() => onNavigate?.('dashboard')}>COMMAND_CENTER</span>
            <span>/</span>
            <span className="text-emerald-500">PROJECT_PORTFOLIO</span>
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Global Projects Ledger</h1>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => safeExportToCSV(sortedProjects, 'MCE_Ledger')} className="px-6 py-2.5 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all flex items-center gap-2 font-mono">
            <Download size={14} /> EXPORT_LEDGER
          </button>
          <GlassButton onClick={() => setIsFormOpen(true)} className="font-black text-[10px] px-8 py-2.5 rounded-xl uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <Plus size={16} className="mr-2" strokeWidth={3} /> INITIALIZE_NODE
          </GlassButton>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-black p-1.5 rounded-xl border border-white/5 w-fit shadow-inner">
        {['ALL', 'ONGOING', 'COMPLETED', 'UPCOMING'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2 text-[9px] font-black rounded-lg transition-all uppercase tracking-[0.2em] ${activeTab === tab ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-300'}`}>{tab}</button>
        ))}
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/10">
          <div className="flex items-center gap-3 px-2">
            <Zap size={14} className="text-emerald-500 animate-pulse" />
            <p className="text-[10px] text-zinc-500 font-mono font-black uppercase tracking-widest">{sortedProjects.length} RECORDS_SYNCHRONIZED</p>
          </div>
          <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center px-6 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${showFilter ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-black border-white/5 text-zinc-600 hover:text-white'}`}>
            <Filter size={14} className="mr-2" /> ADVANCED_QUERY
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6 px-12 py-6 bg-black/40 border-b border-white/5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
          <div className="col-span-5">Identity_Registry</div>
          <div className="col-span-2 text-center">Temporal_Lock</div>
          <div className="col-span-3">Saturation_Status</div>
          <div className="col-span-2 text-right">Aggregate_Value</div>
        </div>

        <div className="divide-y divide-white/5 max-h-[700px] overflow-y-auto custom-scrollbar bg-black/20">
          {sortedProjects.map((p) => {
            const daysLeft = p.project_completion_date_planned ? Math.ceil((new Date(p.project_completion_date_planned).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
            return (
              <div key={p.id} onClick={() => onSelectProject(p.id)} className="group grid grid-cols-12 gap-6 px-12 py-10 hover:bg-white/[0.02] cursor-pointer items-center relative transition-all border-b border-white/[0.03] last:border-0">
                <div className="absolute left-0 inset-y-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_20px_#10b981]"></div>

                <div className="col-span-5 flex items-center space-x-8">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-600 group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-all shadow-inner"><Building2 size={24} strokeWidth={1.5} /></div>
                  <div className="min-w-0 flex flex-col gap-2">
                    <h4 className="text-lg font-black text-zinc-100 truncate tracking-tight uppercase leading-none">{p.project_name}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{p.client_name || 'MCE_INTERNAL'}</span>
                      <div className="w-1 h-1 rounded-full bg-zinc-800"></div>
                      <span className="text-[9px] font-mono font-bold text-zinc-700 bg-white/5 px-2 rounded-sm border border-white/5">CODE_{p.project_code || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  <div className="inline-flex flex-col items-center">
                    <span className={`text-xl font-black tracking-tighter font-mono ${daysLeft !== null && daysLeft < 30 ? 'text-rose-500 animate-pulse' : 'text-zinc-300'}`}>
                      {daysLeft !== null ? `${daysLeft}D` : '--'}
                    </span>
                    <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest mt-1">Remaining</p>
                  </div>
                </div>

                <div className="col-span-3 px-6">
                  <div className="flex justify-between items-end mb-3 font-mono text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <span>Progress</span>
                    <span className="text-white">{p.completion_percent || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative shadow-inner">
                    <div className="absolute inset-y-0 left-0 bg-emerald-500 shadow-[0_0_15px_#10b981] transition-all duration-[2500ms] ease-out" style={{ width: `${p.completion_percent || 0}%` }} />
                  </div>
                </div>

                <div className="col-span-2 text-right pr-6 font-mono">
                  <div className="flex items-baseline justify-end gap-2">
                    <span className="text-[10px] font-black text-zinc-700">AED</span>
                    <div className="text-2xl font-black text-white tracking-tighter">
                      {p.contract_value_excl_vat ? (p.contract_value_excl_vat / 1000000).toFixed(1) + 'M' : '0.0M'}
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-3 py-1 rounded-full border ${p.project_status?.includes('Construction') ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'text-zinc-600 bg-black border-white/5'}`}>
                    {p.project_status || 'ACTIVE_NODE'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};