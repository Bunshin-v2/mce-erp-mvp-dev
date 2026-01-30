
import React, { useState } from 'react';
import { useLiabilityData, LiabilityItem } from '@/hooks/useLiabilityData';
import {
   ShieldAlert, Calendar, AlertTriangle, CheckCircle2,
   Siren, Building2, Zap, Users, Wallet, FileText
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
   Government: Building2,
   Insurance: ShieldAlert,
   Facilities: Zap,
   HR: Users,
   Finance: Wallet,
   Project: FileText
};

import { PageHeader } from '../ui/PageHeader';
import { GlassButton } from '../ui/GlassButton';
import { RippleButton } from '../ui/RippleButton';
import { EmptyState } from '../ui/EmptyState';

export const LiabilityDashboard: React.FC = () => {
   const { items, stats, loading, error, scan } = useLiabilityData();
   const [filter, setFilter] = useState('All');

   console.log('LiabilityDashboard Mounted. Scan Function Available:', !!scan, 'Items:', items?.length);

   const getTrafficLight = (dateStr: string, priority: string) => {
      const days = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (days < 0) return 'bg-zinc-800 border-zinc-700 text-zinc-500'; // Expired
      if (days < 30 || priority === 'CRITICAL') return 'bg-rose-500/10 border-rose-500/50 text-rose-500 animate-pulse-slow';
      if (days < 90) return 'bg-amber-500/10 border-amber-500/50 text-amber-500';
      return 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500';
   };

   const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
   const filteredItems = filter === 'All' ? items : items.filter(i => i.category === filter);

   if (loading) return <div className="p-20 text-center text-zinc-500 font-mono animate-pulse">Scanning Corporate Registries...</div>;

   return (
      <div className="page-container pb-20 animate-in fade-in duration-700">
         <PageHeader
            title={
               <>LIABILITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">COMMAND</span></>
            }
            subtitle="MCE Governance System // Strategic Obligations"
            actions={
               <div className="flex gap-4">
                  <div className="bg-zinc-900/50 backdrop-blur-md border border-glass px-5 py-2 rounded-xl flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 font-bold italic">Critical</span>
                        <span className="text-xl font-bold italic text-rose-500 font-mono leading-none">{stats.critical}</span>
                     </div>
                     <div className="w-px h-6 bg-glass" />
                     <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 font-bold italic">Expiring</span>
                        <span className="text-xl font-bold italic text-amber-500 font-mono leading-none">{stats.expiring30}</span>
                     </div>
                  </div>
                  <GlassButton
                     onClick={scan}
                     disabled={loading}
                     className="px-6 py-2 rounded-xl text-[10px] font-bold italic tracking-widest relative overflow-hidden"
                  >
                     {loading ? (
                        <div className="flex items-center gap-2">
                           <span className="animate-spin">⟳</span> SCANNING...
                        </div>
                     ) : (
                        "INITIALIZE SCAN"
                     )}
                  </GlassButton>
               </div>
            }
         />

         {/* MAIN DASHBOARD CONTENT */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* LEFT: FILTERS & SUMMARY */}
            <div className="lg:col-span-1 space-y-4">
               <div className="bg-zinc-900/40 border border-glass rounded-xl p-4 sticky top-4">
                  <h3 className="text-xs font-bold italic text-zinc-400 tracking-widest mb-4">Domains</h3>
                  <div className="space-y-1">
                     {categories.map(cat => (
                        <button
                           key={cat}
                           onClick={() => setFilter(cat)}
                           className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold italic transition-all ${filter === cat
                              ? 'bg-white/10 text-white shadow-lg border border-white/10'
                              : 'text-zinc-500 hover:bg-glass hover:text-zinc-300'
                              }`}
                        >
                           <div className="flex justify-between items-center">
                              <span>{cat}</span>
                              {cat !== 'All' && <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-zinc-600">
                                 {items.filter(i => i.category === cat).length}
                              </span>}
                           </div>
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* RIGHT: THE REGISTRY GRID */}
            <div className="lg:col-span-3 space-y-4">
               {filteredItems.length === 0 ? (
                  <EmptyState
                     icon={FileText}
                     title="No Liabilities Found"
                     description={`No items match the '${filter}' category.`}
                     action={{
                        label: "Clear Filters",
                        onClick: () => setFilter('All')
                     }}
                     className="mt-8 border-dashed border-zinc-800 bg-zinc-900/20"
                  />
               ) : (
                  filteredItems.map((item) => {
                     const daysLeft = Math.ceil((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                     const StatusIcon = item.priority === 'CRITICAL' ? Siren : CheckCircle2;
                     const CategoryIcon = CATEGORY_ICONS[item.category] || FileText;

                     return (
                        <div key={item.id} className="group relative bg-zinc-900/20 border border-glass hover:bg-glass-subtle hover:border-white/10 rounded-xl p-6 transition-all duration-300">
                           {/* TRAFFIC LIGHT INDICATOR BAR */}
                           <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${item.priority === 'CRITICAL' ? 'bg-rose-500' :
                              daysLeft < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />

                           <div className="flex flex-col md:flex-row justify-between gap-6 pl-4">
                              {/* INFO BLOCK */}
                              <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-2">
                                    <CategoryIcon size={14} className="text-zinc-500" />
                                    <span className="text-[10px] tracking-wider text-zinc-500 font-bold italic">{item.category} • {item.sub_category || 'General'}</span>
                                    {item.priority === 'CRITICAL' && (
                                       <span className="ml-2 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[9px] text-rose-500 font-bold italic tracking-wider">Critical</span>
                                    )}
                                 </div>
                                 <h3 className="text-lg font-bold italic text-zinc-200 group-hover:text-white transition-colors">
                                    {item.obligation_name}
                                 </h3>
                                 <div className="mt-2 text-xs text-zinc-500 font-mono">
                                    REF: <span className="text-zinc-400">{item.reference_number || 'N/A'}</span>
                                 </div>
                              </div>

                              {/* STATUS BLOCK */}
                              <div className="flex flex-col items-end min-w-[140px]">
                                 <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 mb-2 ${getTrafficLight(item.expiry_date, item.priority)}`}>
                                    <StatusIcon size={14} />
                                    <span className="text-xs font-bold italic font-mono">
                                       {daysLeft < 0 ? 'EXPIRED' : `${daysLeft} DAYS`}
                                    </span>
                                 </div>
                                 <div className="text-[10px] text-zinc-600 tracking-wider font-bold italic text-right">
                                    Due: {item.expiry_date}
                                 </div>
                                 {item.annual_cost && item.annual_cost > 0 && (
                                    <div className="mt-2 text-xs font-mono text-zinc-400">
                                       AED {item.annual_cost.toLocaleString()}
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* HOVER DETAILS (IMPACT) */}
                           {item.impact_description && (
                              <div className="mt-4 pt-4 border-t border-glass opacity-60 group-hover:opacity-100 transition-opacity">
                                 <div className="flex gap-2 items-start">
                                    <AlertTriangle size={12} className="text-zinc-500 mt-0.5" />
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                       <span className="font-bold italic text-zinc-500 not-italic text-[10px] mr-1">Impact:</span>
                                       {item.impact_description}
                                    </p>
                                 </div>
                              </div>
                           )}
                        </div>
                     );
                  })
               )}
            </div>
         </div>
      </div>
   );
};

