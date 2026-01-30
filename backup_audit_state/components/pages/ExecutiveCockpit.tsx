import React from 'react';
import {
   TrendingUp,
   AlertTriangle,
   Activity,
   DollarSign,
   Briefcase,
   Clock,
   ChevronRight,
   ShieldCheck,
   Zap,
   Target,
   Search,
   Bell
} from 'lucide-react';

interface CockpitProps {
   projects: any[];
   tenders: any[];
   kpis: any;
   chartData: any[];
   onNavigate?: (view: string) => void;
   onSelectProject?: (id: string) => void;
}

export const ExecutiveCockpit: React.FC<CockpitProps> = ({ projects, tenders, kpis, onNavigate, onSelectProject }) => {
   const safeProjects = projects || [];

   const stats = {
      active: safeProjects.length,
      value: safeProjects.reduce((acc, p) => acc + (Number(p.contract_value_excl_vat) || 0), 0),
      bids: tenders.length,
      critical: safeProjects.filter(p => p.delivery_risk_rating === 'Critical').length
   };

   return (
      <div className="page-container space-y-8 animate-fade-in pb-20">

         {/* 1. TOP SYSTEM BAR */}
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-white/5 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">MCE_SYSTEM_STATUS</span>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 ml-2">ACTIVE</span>
               </div>
               <div className="px-4 py-2 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center gap-3">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">REACH</span>
                  <div className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                     <div className="w-3/4 h-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>
                  </div>
                  <button className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">AUDIT</button>
               </div>
            </div>
            <div className="flex items-center gap-4 text-zinc-600">
               <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Pulse T-Minus 20s</span>
            </div>
         </div>

         {/* 2. KPI HUD (EXACT SCREENSHOT MATCH) */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
               { label: 'ACTIVE_PROJECTS', val: stats.active, sub: 'UNIVERSE_SYNCHRONIZED', icon: Briefcase, color: 'emerald' },
               { label: 'PORTFOLIO_VALUE', val: `AED ${(stats.value / 1000000).toFixed(1)}M`, sub: 'AGGREGATE_CONTRACT_VALUE', icon: DollarSign, color: 'emerald', highlight: 'LEDGER_VERIFIED' },
               { label: 'ACTIVE_BIDS', val: stats.bids, sub: 'OPEN_TENDERS', icon: Target, color: 'emerald', highlight: 'SLA_COMPLIANT' },
               { label: 'CRITICAL_HAZARDS', val: stats.critical, sub: 'OPERATIONAL_TRIGGERS', icon: AlertTriangle, color: 'rose', highlight: 'DIRECT_ACTION' },
            ].map((kpi, i) => (
               <div key={i} className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-8 relative group overflow-hidden shadow-2xl">
                  <div className="flex justify-between items-start mb-10">
                     {kpi.highlight && (
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border ${kpi.color === 'rose' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'}`}>
                           {kpi.highlight}
                        </span>
                     )}
                     <kpi.icon size={18} className="text-zinc-800" />
                  </div>
                  <h3 className="text-4xl font-black text-white font-mono tracking-tighter mb-2">{kpi.val}</h3>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">{kpi.sub}</p>
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${kpi.color === 'rose' ? 'bg-rose-500 shadow-[0_0_15px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'} opacity-20`}></div>
               </div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 3. MAIN LEDGER SWEEP */}
            <div className="lg:col-span-2 space-y-4">
               <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Operational_Flow</h4>
                  <div className="flex bg-black p-1 rounded-lg border border-white/5">
                     {['ONGOING', 'COMPLETED', 'UPCOMING'].map(t => (
                        <button key={t} className={`px-4 py-1 text-[8px] font-black rounded-md transition-all ${t === 'ONGOING' ? 'bg-zinc-800 text-white' : 'text-zinc-600'}`}>{t}</button>
                     ))}
                  </div>
               </div>
               <div className="bg-[#0a0a0c] border border-white/5 rounded-[2rem] overflow-hidden shadow-3xl">
                  <div className="grid grid-cols-12 px-10 py-4 bg-black/40 border-b border-white/5 text-[8px] font-black text-zinc-700 uppercase tracking-widest">
                     <div className="col-span-6">Project_Identity</div>
                     <div className="col-span-2 text-center">Countdown</div>
                     <div className="col-span-2 text-center">Execution</div>
                     <div className="col-span-2 text-right">Value</div>
                  </div>
                  <div className="divide-y divide-white/5">
                     {safeProjects.slice(0, 4).map(p => (
                        <div key={p.id} onClick={() => onSelectProject?.(p.id)} className="grid grid-cols-12 px-10 py-8 items-center hover:bg-white/[0.01] transition-all group cursor-pointer">
                           <div className="col-span-6 flex items-center gap-4">
                              <div className="w-1 h-6 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all"></div>
                              <div>
                                 <p className="text-sm font-black text-zinc-200 uppercase tracking-tight italic group-hover:text-white transition-colors">{p.project_name}</p>
                                 <p className="text-[8px] text-zinc-600 uppercase font-bold mt-1 tracking-widest">{p.client_name}</p>
                              </div>
                           </div>
                           <div className="col-span-2 text-center">
                              <span className="text-emerald-500 font-mono text-sm font-black">--D</span>
                           </div>
                           <div className="col-span-2 px-4">
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-zinc-700" style={{ width: `${p.completion_percent}%` }}></div>
                              </div>
                           </div>
                           <div className="col-span-2 text-right text-sm font-black text-white font-mono tracking-tighter">
                              {(p.contract_value_excl_vat / 1000).toLocaleString()}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* 4. STRATEGIC HEATMAP & SIGNALS */}
            <div className="space-y-8">
               <div className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 shadow-3xl">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
                     <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Strategic_Risk_Heatmap</h4>
                  </div>

                  {/* HEATMAP BAR */}
                  <div className="w-full h-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-rose-500 rounded-full mb-8 relative">
                     <div className="absolute -top-1 left-[85%] w-1 h-4 bg-white shadow-[0_0_10px_white]"></div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                     {[
                        { label: 'CRITICAL', val: stats.critical, color: 'rose' },
                        { label: 'HIGH', val: 0, color: 'amber' },
                        { label: 'NOMINAL', val: stats.active - stats.critical - 1, color: 'emerald' },
                        { label: 'STABLE', val: 1, color: 'blue' }
                     ].map((r, i) => (
                        <div key={i}>
                           <div className={`w-1 h-1 rounded-full mx-auto mb-2 ${r.color === 'rose' ? 'bg-rose-500' : r.color === 'amber' ? 'bg-amber-500' : r.color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                           <p className="text-2xl font-black text-white font-mono tracking-tighter">{r.val}</p>
                           <p className="text-[7px] text-zinc-600 font-black uppercase tracking-widest mt-1">{r.label}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 shadow-3xl">
                  <div className="flex justify-between items-center mb-8">
                     <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Critical_Signals</h4>
                     <div className="w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 text-[9px] font-black">2</div>
                  </div>

                  <div className="space-y-6">
                     <div className="group cursor-pointer">
                        <div className="flex justify-between items-center mb-1">
                           <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest group-hover:underline">Safety_Audit_Required: Zone_B</p>
                           <span className="text-[8px] font-mono text-zinc-700">12:32 PM</span>
                        </div>
                        <p className="text-[9px] text-zinc-600 uppercase font-bold leading-relaxed">Anomaly detected in Zone B. Direct intervention required for portfolio integrity.</p>
                     </div>
                     <div className="group cursor-pointer border-t border-white/5 pt-6">
                        <div className="flex justify-between items-center mb-1">
                           <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest group-hover:underline">Contract_Expiry_Imminent: Tower_1</p>
                           <span className="text-[8px] font-mono text-zinc-700">11:15 AM</span>
                        </div>
                        <p className="text-[9px] text-zinc-600 uppercase font-bold leading-relaxed">System identified imminent lockout. Renewal protocols must be initialized.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};
