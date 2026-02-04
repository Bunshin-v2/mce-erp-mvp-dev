import React, { useState } from 'react';
import { Download, Search, Filter, FileText, ChevronRight, Zap, TrendingUp, Calendar } from 'lucide-react';
import { safeExportToCSV } from '../../utils/exportUtils';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EXECUTIVE' | 'STANDARD' | 'DEPTH' | 'AUDIT'>('EXECUTIVE');

  const reportProfiles = [
    { id: 'EXECUTIVE', label: 'EXECUTIVE_SUMMARY', icon: TrendingUp, desc: 'High-level operational health and financial pulse.' },
    { id: 'STANDARD', label: 'STANDARD_BREAKDOWN', icon: FileText, desc: 'Monthly project milestones and resource allocation.' },
    { id: 'DEPTH', label: 'DEPTH_ANALYSIS', icon: Zap, desc: 'Granular site performance and technical adherence.' },
    { id: 'AUDIT', label: 'COMPLIANCE_AUDIT', icon: Calendar, desc: 'Full traceability log and regulatory validation.' },
  ];

  return (
    <div className="page-container space-y-10 animate-fade-in pb-20">

      {/* Normalized Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3">
            <span>DATA_VAULT</span>
            <span>/</span>
            <span className="text-emerald-500">INTELLIGENCE_REPORTS</span>
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Global Intelligence Reports</h1>
        </div>

        <button
          onClick={() => safeExportToCSV([], 'MCE_Intelligence_Export')}
          className="px-8 py-3 bg-[#10b981] text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-400 transition-all"
        >
          GENERATE_GLOBAL_EXPORT
        </button>
      </div>

      {/* Profile Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {reportProfiles.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveTab(p.id as any)}
            className={`p-8 rounded-[2rem] border transition-all text-left group relative overflow-hidden ${activeTab === p.id
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-2xl'
                : 'bg-[#0a0a0c] border-white/5 hover:border-zinc-700'
              }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${activeTab === p.id ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-zinc-900 text-zinc-600 border-white/5'
              }`}>
              <p.icon size={20} />
            </div>
            <h5 className="text-[11px] font-black text-white uppercase tracking-widest">{p.label}</h5>
            <p className="text-[9px] text-zinc-600 mt-2 uppercase font-bold leading-relaxed">{p.desc}</p>
            {activeTab === p.id && (
              <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Report Registry Table */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl">
        <div className="p-8 border-b border-white/5 bg-zinc-900/10 flex justify-between items-center">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Report_Archive_Registry</h4>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
              <input placeholder="QUERY_REGISTRY..." className="bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-[10px] text-white focus:outline-none focus:border-emerald-500/30 w-64 uppercase font-bold" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 px-12 py-6 bg-black/40 border-b border-white/5 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">
          <div className="col-span-5">Document_Identity</div>
          <div className="col-span-2 text-center">Timestamp</div>
          <div className="col-span-3 text-center">Profile_Tag</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-white/5 bg-black/20 font-mono">
          {[1, 2, 3].map(i => (
            <div key={i} className="grid grid-cols-12 gap-6 px-12 py-8 items-center hover:bg-white/[0.02] cursor-pointer group transition-all">
              <div className="col-span-5 flex items-center gap-6">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-600 group-hover:text-emerald-500 transition-all"><FileText size={20} /></div>
                <div>
                  <p className="text-sm font-black text-zinc-200 uppercase tracking-tight group-hover:text-white">Q1_Ops_Strategic_Brief_00{i}.pdf</p>
                  <p className="text-[9px] text-zinc-700 mt-1 uppercase font-bold">SHA256: 0x8f2...{i}e4</p>
                </div>
              </div>
              <div className="col-span-2 text-center text-[10px] text-zinc-500 font-bold">2026-01-2{i}</div>
              <div className="col-span-3 flex justify-center">
                <span className="px-4 py-1.5 rounded-full text-[9px] font-black text-emerald-500 bg-emerald-500/5 border border-emerald-500/20 uppercase tracking-widest">{activeTab}_PROFILE</span>
              </div>
              <div className="col-span-2 text-right pr-4">
                <button className="p-2.5 bg-white/5 text-zinc-600 hover:text-white border border-white/5 rounded-xl transition-all"><Download size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
