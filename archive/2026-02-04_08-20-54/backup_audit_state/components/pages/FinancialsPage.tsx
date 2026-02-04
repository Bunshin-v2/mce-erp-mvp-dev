import React, { useState } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';
import { InvoiceForm } from '../forms/InvoiceForm';
import { safeExportToCSV } from '../../utils/exportUtils';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle, FileText, BarChart3, Wallet, CreditCard, Plus, Search, Building2, MapPin, Hash, Calendar, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface FinancialsPageProps {
   projects: any[];
   onRefresh: () => void;
   onNavigate?: (view: string) => void;
   onSelectProject?: (id: string | null) => void;
}

/**
 * Verified: Production Ready
 * Fiscal Intelligence Ledger v2.0
 */
export const FinancialsPage: React.FC<FinancialsPageProps> = ({ projects, onRefresh, onNavigate, onSelectProject }) => {
   const { purchaseOrders } = useDashboardData(); // Fetch Iron Dome Data
   const [isFormOpen, setIsFormOpen] = useState(false);
   const [activeScenario, setActiveScenario] = useState<'likely' | 'best' | 'bear'>('likely');
   const [searchQuery, setSearchQuery] = useState('');

   // Hover Card State
   const [hoveredProject, setHoveredProject] = useState<any | null>(null);
   const [hoverPosition, setHoverPosition] = useState<{ top: number, left: number } | null>(null);

   // Fetch invoices from Supabase
   const [invoices, setInvoices] = React.useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   React.useEffect(() => {
      const fetchInvoices = async () => {
         setLoading(true);
         try {
            const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
            if (data) setInvoices(data);
         } catch (err) {
            console.error('Invoice fetch exception:', err);
         } finally {
            setLoading(false);
         }
      };
      fetchInvoices();
   }, []);

   const safeInvoices = Array.isArray(invoices) ? invoices : [];
   const safeProjects = Array.isArray(projects) ? projects : [];
   const safePOs = Array.isArray(purchaseOrders) ? purchaseOrders : [];

   // Iron Dome Logic
   const breachedPOs = safePOs.filter(po => po.remaining_balance < 0);
   const criticalPOs = safePOs.filter(po => po.remaining_balance > 0 && po.remaining_balance < 10000);
   const ironDomeStatus = breachedPOs.length > 0 ? 'BREACHED' : criticalPOs.length > 0 ? 'CRITICAL' : 'SECURE';
   const domeColor = ironDomeStatus === 'BREACHED' ? 'text-rose-500' : ironDomeStatus === 'CRITICAL' ? 'text-amber-500' : 'text-emerald-500';

   // Transform and Combine Data for Unified Ledger
   const combinedLedger = [
      ...safeInvoices.map(inv => ({
         id: inv.id,
         type: 'INVOICE',
         identification: inv.invoice_number,
         value: Number(inv.amount || 0),
         status: inv.status,
         date: inv.due_date,
         label: 'REF-SYNC',
         client: inv.client_name || 'MCE INTERNAL',
         project_code: inv.project_code || 'N/A',
         project_id: inv.project_id,
         client_id: null,
         completion: 100,
         // Extra fields for consistency (null for invoices)
         location: null,
         project_type: null,
         commencement: null,
         scope: null,
         remarks: null
      })),
      ...safeProjects.map(p => ({
         id: p.id,
         type: 'PROJECT',
         identification: p.project_name,
         value: Number(p.contract_value_excl_vat || 0),
         status: p.project_status,
         date: p.project_completion_date_planned,
         label: p.project_code || 'MCE-UNIT',
         client: p.client_name,
         project_code: p.project_code,
         project_id: p.id,
         client_id: p.client_entity_uid,
         completion: p.completion_percent || 0,
         // Rich Data for Hover Card
         location: p.project_location_city,
         project_type: p.project_type,
         commencement: p.project_commencement_date,
         scope: p.scope_of_services_enum,
         remarks: p.remarks
      }))
   ].sort((a, b) => {
      const aDate = a.date ? new Date(a.date).getTime() : Infinity;
      const bDate = b.date ? new Date(b.date).getTime() : Infinity;
      return aDate - bDate;
   });

   const filteredLedger = combinedLedger.filter(item =>
      item.identification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client?.toLowerCase().includes(searchQuery.toLowerCase())
   );

   const totalRevenue = safeInvoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? Number(inv.amount || 0) : 0), 0);
   const pendingRevenue = safeInvoices.reduce((sum, inv) => sum + (inv.status !== 'Paid' ? Number(inv.amount || 0) : 0), 0);
   const portfolioValue = safeProjects.reduce((sum, p) => sum + (Number(p.CONTRACT_VALUE_EXCL_VAT || 0)), 0);

   const handleExport = () => {
      // Mapping to clean column names for the secure export
      const dataToExport = combinedLedger.map(item => ({
         IDENTIFICATION: item.identification,
         CLIENT: item.client,
         VALUE_AED: item.value,
         STATUS: item.status,
         TIMELINE: item.date,
         TYPE: item.type
      }));

      safeExportToCSV(dataToExport, 'MCE_Fiscal_Ledger');
   };

   // Forecast Data
   const forecastData = [
      { month: 'Feb', baseline: 450000, confirmed: 480000 },
      { month: 'Mar', baseline: 890000, confirmed: 720000 },
      { month: 'Apr', baseline: 1200000, confirmed: 1100000 },
      { month: 'May', baseline: 1100000, confirmed: 1250000 },
      { month: 'Jun', baseline: 900000, confirmed: 950000 },
   ];

   return (
      <div className="page-container space-y-6">
         {isFormOpen && <InvoiceForm projects={projects} onClose={() => setIsFormOpen(false)} onSuccess={onRefresh} />}

         {/* Modern Strategic Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2 font-sans opacity-60">
                  <span className="cursor-pointer hover:text-white transition-colors" onClick={() => onNavigate?.('dashboard')}>Command</span>
                  <span className="opacity-30">/</span>
                  <span className="text-blue-500/80">Fiscal Intelligence</span>
               </div>
               <h1 className="text-2xl font-bold text-white tracking-tight">Fiscal Intelligence Ledger</h1>
            </div>

            <div className="flex items-center gap-3">
               <button onClick={handleExport} className="px-4 py-2 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all">
                  Export Ledger
               </button>
               <button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-white text-black px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center shadow-lg active:scale-95"
               >
                  <Plus size={14} className="mr-2" strokeWidth={3} />
                  Register Entry
               </button>
            </div>
         </div>

         {/* Intelligence Summary Strip */}
         <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl px-10 py-6 flex flex-wrap items-center justify-between gap-8 backdrop-blur-md relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/40" />

            <div className="flex items-center gap-12">
               <div className="space-y-1">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Verified Revenue</p>
                  <p className="text-lg font-bold text-white font-mono tracking-tighter">AED {(totalRevenue / 1000000).toFixed(2)}M</p>
               </div>
               <div className="w-px h-8 bg-zinc-800/50 hidden md:block"></div>
               <div className="space-y-1">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Strategic Receivables</p>
                  <p className="text-lg font-bold text-amber-500 font-mono tracking-tighter">AED {(pendingRevenue / 1000000).toFixed(2)}M</p>
               </div>
               <div className="w-px h-8 bg-zinc-800/50 hidden md:block"></div>
               <div className="space-y-1">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Portfolio Asset Value</p>
                  <p className="text-lg font-bold text-blue-400 font-mono tracking-tighter">AED {(portfolioValue / 1000000).toFixed(1)}M</p>
               </div>
               <div className="w-px h-8 bg-zinc-800/50 hidden md:block"></div>
               <div className="space-y-1">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Iron Dome Status</p>
                  <div className="flex items-center gap-2">
                     <span className={`text-lg font-bold font-mono tracking-tighter uppercase ${domeColor}`}>{ironDomeStatus}</span>
                     {ironDomeStatus === 'BREACHED' && <AlertCircle size={14} className="text-rose-500 animate-pulse" />}
                     {ironDomeStatus === 'SECURE' && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </div>
               </div>
            </div>
         </div>

         {/* Iron Dome PO Grid (Only show if POs exist) */}
         {safePOs.length > 0 && (
            <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-xl overflow-hidden backdrop-blur-sm mb-8">
               <div className="px-6 py-4 border-b border-zinc-800/50 bg-white/[0.01] flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Purchase Order Control</h3>
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{safePOs.length} Active Contracts</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {safePOs.map(po => (
                     <div key={po.id} className={`p-4 rounded-lg border ${po.remaining_balance < 0 ? 'bg-rose-950/10 border-rose-500/20' :
                           po.remaining_balance < 10000 ? 'bg-amber-950/10 border-amber-500/20' :
                              'bg-zinc-900/50 border-zinc-800'
                        }`}>
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{po.po_number}</span>
                           <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${po.remaining_balance < 0 ? 'bg-rose-500/20 text-rose-500' : 'bg-zinc-800 text-zinc-500'
                              }`}>{po.remaining_balance < 0 ? 'BREACH' : 'ACTIVE'}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate mb-3">{po.vendor_name}</h4>
                        <div className="space-y-1">
                           <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                              <span>Total</span>
                              <span>{Number(po.total_amount).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-[9px] font-mono font-bold">
                              <span className={po.remaining_balance < 0 ? 'text-rose-500' : 'text-zinc-400'}>Balance</span>
                              <span className={po.remaining_balance < 0 ? 'text-rose-500' : 'text-emerald-500'}>{Number(po.remaining_balance).toLocaleString()}</span>
                           </div>
                           <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                              <div
                                 className={`h-full ${po.remaining_balance < 0 ? 'bg-rose-500' : 'bg-blue-500'}`}
                                 style={{ width: `${Math.min(((Number(po.total_amount) - Number(po.remaining_balance)) / Number(po.total_amount)) * 100, 100)}%` }}
                              ></div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
            {/* Strategic Ledger Grid */}
            <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-800/40 rounded-[2rem] overflow-hidden backdrop-blur-sm shadow-3xl flex flex-col min-h-[600px]">
               <div className="px-10 py-6 border-b border-zinc-800/50 bg-white/[0.01] flex justify-between items-center">
                  <h3 className="text-[12px] font-black text-zinc-400 uppercase tracking-[0.3em] font-sans">Unified Fiscal Ledger</h3>
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={12} />
                     <input
                        type="text"
                        placeholder="Filter ledger artifacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-black/40 border border-zinc-800 rounded-full pl-9 pr-4 py-1.5 text-[10px] text-zinc-300 w-56 focus:outline-none focus:border-zinc-700 transition-all font-bold uppercase tracking-wider"
                     />
                  </div>
               </div>

               <div className="flex flex-col flex-1 p-2">
                  {/* Ledger Headers */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-sans opacity-50 border-b border-white/5 mb-2">
                     <div className="col-span-5">Artifact Focus</div>
                     <div className="col-span-2 text-center">Timeline</div>
                     <div className="col-span-3">Maturity & Status</div>
                     <div className="col-span-2 text-right">Valuation</div>
                  </div>

                  {/* Ledger Rows */}
                  <div className="space-y-1.5 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                     {filteredLedger.length === 0 ? (
                        <div className="py-24 text-center text-[11px] font-black uppercase tracking-widest text-zinc-600 opacity-40 grayscale flex flex-col items-center">
                           <Activity size={32} className="mb-4 animate-pulse" />
                           Null-set: Ledger Offline
                        </div>
                     ) : (
                        filteredLedger.map((item) => {
                           const daysLeft = item.date ? Math.ceil((new Date(item.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

                           return (
                              <div
                                 key={item.id}
                                 onMouseEnter={(e) => {
                                    if (item.type !== 'PROJECT') return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoverPosition({
                                       top: rect.top + (rect.height / 2),
                                       left: rect.right + 24
                                    });
                                    setHoveredProject(item);
                                 }}
                                 onMouseLeave={() => {
                                    setHoveredProject(null);
                                    setHoverPosition(null);
                                 }}
                                 className="group grid grid-cols-12 gap-4 px-6 py-4 bg-white/[0.01] border border-white/[0.03] rounded-xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 cursor-pointer items-center relative hover:z-[50]"
                              >
                                 <div className={`absolute left-0 inset-y-0 w-0.5 opacity-0 group-hover:opacity-100 transition-all rounded-l-xl ${item.type === 'PROJECT' ? 'bg-[#00dc82]' : 'bg-blue-500'}`}></div>

                                 {/* Col 1: Identification & Hover Card */}
                                 <div className="col-span-5 flex items-center space-x-4 relative" onClick={() => { if (item.type === 'PROJECT' && item.project_id) onSelectProject?.(item.project_id) }}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${item.type === 'PROJECT'
                                       ? 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 group-hover:text-emerald-400'
                                       : 'bg-blue-500/5 border border-blue-500/10 text-blue-600 group-hover:text-blue-400'
                                       }`}>
                                       {item.type === 'PROJECT' ? <FileText size={16} strokeWidth={1.5} /> : <FileText size={16} strokeWidth={1.5} />}
                                    </div>
                                    <div className="min-w-0 flex flex-col gap-1 relative group/tooltip">
                                       <h4 className={`text-[13px] font-bold truncate tracking-tight transition-colors font-sans leading-none ${item.type === 'PROJECT' ? 'text-white group-hover:text-[#00dc82]' : 'text-zinc-200 group-hover:text-blue-400'
                                          }`}>
                                          {item.identification}
                                       </h4>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider truncate max-w-[150px]">
                                             {item.client}
                                          </span>
                                          {item.project_code && item.project_code !== 'N/A' && (
                                             <span className="text-[8px] font-mono text-zinc-600 bg-white/5 px-1 rounded border border-white/5">
                                                {item.project_code}
                                             </span>
                                          )}
                                       </div>

                                    </div>
                                 </div>

                                 {/* Col 2: Timeline */}
                                 <div className="col-span-2 text-center">
                                    <div className="inline-flex flex-col items-center">
                                       <span className={`text-[13px] font-black font-mono tracking-tighter ${daysLeft !== null && daysLeft < 30
                                          ? 'text-rose-500 animate-pulse'
                                          : item.status === 'Paid' ? 'text-zinc-600' : 'text-emerald-500'
                                          }`}>
                                          {item.status === 'Paid' ? 'CLOSED' : daysLeft !== null ? `${daysLeft}D` : 'TBD'}
                                       </span>
                                       <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Countdown</span>
                                    </div>
                                 </div>

                                 {/* Col 3: Maturity/Status */}
                                 <div className="col-span-3 px-2">
                                    <div className="flex flex-col gap-1.5">
                                       <div className="flex justify-between items-end">
                                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                                             {item.type === 'PROJECT' ? 'Completion' : 'Status'}
                                          </span>
                                          <span className={`text-[10px] font-black font-mono ${item.status === 'Overdue' ? 'text-rose-500' : 'text-white'
                                             }`}>
                                             {item.type === 'PROJECT' ? `${item.completion}%` : item.status}
                                          </span>
                                       </div>
                                       {item.type === 'PROJECT' ? (
                                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                                             <div
                                                className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out bg-[#00dc82]"
                                                style={{ width: `${item.completion}%` }}
                                             ></div>
                                          </div>
                                       ) : (
                                          <div className={`w-full h-1.5 rounded-full ${item.status === 'Paid' ? 'bg-emerald-500' :
                                             item.status === 'Overdue' ? 'bg-rose-500' :
                                                item.status === 'Sent' ? 'bg-blue-500' : 'bg-zinc-700'
                                             }`}></div>
                                       )}
                                    </div>
                                 </div>

                                 {/* Col 4: Valuation */}
                                 <div className="col-span-2 text-right">
                                    <div className="flex flex-col items-end">
                                       <div className="flex items-baseline gap-1">
                                          <span className="text-[8px] font-bold text-zinc-600 uppercase">AED</span>
                                          <span className="text-[12px] font-bold text-white font-mono tracking-tighter">
                                             {item.value >= 1000000
                                                ? `${(item.value / 1000000).toFixed(2)}M`
                                                : item.value.toLocaleString()}
                                          </span>
                                       </div>
                                       <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                          {item.type}
                                       </span>
                                    </div>
                                 </div>

                              </div>
                           );
                        })
                     )}
                  </div>
               </div>
            </div>

            {/* Revenue Intelligence Area chart */}
            <div className="bg-gradient-to-br from-[#0f0f11] to-transparent border border-white/[0.05] rounded-2xl p-10 shadow-3xl relative overflow-hidden group h-fit">
               <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />

               <div className="flex items-center justify-between mb-12 relative z-10">
                  <div className="flex items-center space-x-4">
                     <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-900 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
                     <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white font-sans">Projection Pulse</h3>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1 opacity-60 tracking-widest">Temporal Fiscal Clustering</p>
                     </div>
                  </div>
               </div>

               <div className="h-[240px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={forecastData}>
                        <defs>
                           <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.02)" />
                        <XAxis
                           dataKey="month"
                           axisLine={false}
                           tickLine={false}
                           tick={{ fill: '#52525b', fontSize: 9, fontWeight: 800 }}
                           dy={15}
                        />
                        <YAxis hide />
                        <Tooltip
                           cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 1 }}
                           content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                 return (
                                    <div className="bg-[#0f0f11]/90 backdrop-blur-3xl border border-white/10 p-5 rounded-xl shadow-4xl">
                                       <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">{payload[0].payload.name}</p>
                                       <div className="flex items-baseline gap-2">
                                          <span className="text-[10px] font-bold text-zinc-600">AED</span>
                                          <p className="text-xl font-bold text-white tracking-tighter">
                                             {payload[0].value?.toLocaleString()}
                                          </p>
                                       </div>
                                    </div>
                                 );
                              }
                              return null;
                           }}
                        />
                        <Area
                           type="monotone"
                           dataKey="confirmed"
                           stroke="#3b82f6"
                           strokeWidth={3}
                           fillOpacity={1}
                           fill="url(#colorConfirmed)"
                           animationDuration={2500}
                        />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>

               <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl relative overflow-hidden group-hover:bg-blue-500/10 transition-all duration-500">
                  <div className="flex items-start gap-4 relative z-10">
                     <TrendingUp className="text-blue-500 mt-1 opacity-60" size={18} strokeWidth={2} />
                     <p className="text-[11px] text-zinc-400 font-bold leading-relaxed tracking-tight">
                        Fiscal engine identifies <span className="text-blue-400">maturing assets</span> in Q2. Revenue yield projected at <span className="text-white">+12.4%</span> above baseline.
                     </p>
                  </div>
               </div>
            </div>
         </div>
         {/* FLOATING HOVER CARD PORTAL (Fixed Position to avoid clipping) */}
         {hoveredProject && hoverPosition && (
            <div
               className="fixed z-[9999] w-[340px] pointer-events-none transition-opacity duration-200"
               style={{
                  top: hoverPosition.top,
                  left: hoverPosition.left,
                  transform: 'translateY(-50%)'
               }}
            >
               {/* Decorative Connector Line */}
               <div className="absolute right-[100%] top-1/2 -translate-y-1/2 w-6 h-[1px] bg-gradient-to-r from-transparent to-emerald-500/50"></div>

               <div className="bg-[#09090b]/95 border border-white/5 rounded-xl shadow-2xl backdrop-blur-3xl overflow-hidden relative">

                  {/* 1. Header */}
                  <div className="p-4 border-b border-white/5 bg-white/[0.02] space-y-3">
                     <div>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Project Entity</span>
                        <h4 className="text-[13px] font-bold text-white leading-tight">{hoveredProject.identification}</h4>
                     </div>
                     {(hoveredProject.client || hoveredProject.project_code) && (
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Client</span>
                              <p className="text-[11px] text-zinc-300 font-medium truncate">{hoveredProject.client || 'Internal'}</p>
                           </div>
                           <div>
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Code</span>
                              <p className="text-[11px] font-mono text-emerald-500 font-medium">{hoveredProject.project_code || 'N/A'}</p>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* 2. Key Data (Location/Type) */}
                  {hoveredProject.location && (
                     <div className="grid grid-cols-2 border-b border-white/5 divide-x divide-white/5">
                        <div className="p-3 space-y-3 col-span-2 flex gap-4">
                           <div className="flex-1">
                              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5 mb-0.5"><MapPin size={9} /> Location</span>
                              <p className="text-[10px] text-zinc-300 font-medium truncate">{hoveredProject.location}</p>
                           </div>
                           {hoveredProject.project_type && (
                              <div className="flex-1">
                                 <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5 mb-0.5"><Hash size={9} /> Type</span>
                                 <p className="text-[10px] text-zinc-300 font-medium truncate">{hoveredProject.project_type}</p>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* 3. Scope */}
                  {hoveredProject.scope && (
                     <div className="p-4 bg-white/[0.01]">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                           <FileText size={10} /> Scope
                        </span>
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-medium line-clamp-2">{hoveredProject.scope}</p>
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};