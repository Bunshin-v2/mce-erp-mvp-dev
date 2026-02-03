import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ProjectionPulse } from '../dashboard/ProjectionPulse';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';
import { InvoiceForm } from '../forms/InvoiceForm';
import { safeExportToCSV } from '../../utils/exportUtils';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2, FileText, Plus, Search, MapPin, Hash, Activity, Download, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DashboardFrame } from '../governance/DashboardFrame';
import { MetricBlock } from '../governance/MetricBlock';
import { GovernanceTable } from '../governance/GovernanceTable';
import { GlassButton } from '../ui/GlassButton';
import { EmptyState } from '../ui/EmptyState';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { Badge } from '../ui/Badge';
import { Box, Text } from '../../components/primitives';
import { cn } from '@/lib/utils';
import { FinancialMetricCard } from '../ui/FinancialMetricCard';
import { FlashUpdate } from '../ui/FlashUpdate';
import { TiltCard } from '../ui/TiltCard';

interface FinancialsPageProps {
   projects: any[];
   onRefresh: () => void;
   onNavigate?: (view: string) => void;
   onSelectProject?: (id: string | null) => void;
   loading?: boolean;
}

export const FinancialsPage: React.FC<FinancialsPageProps> = ({
   projects,
   onRefresh,
   onNavigate,
   onSelectProject,
   loading: globalLoading = false
}) => {
   const { purchaseOrders } = useDashboardData();
   const [isFormOpen, setIsFormOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [invoices, setInvoices] = useState<any[]>([]);
   const [localLoading, setLocalLoading] = useState(true);
   const [activeTab, setActiveTab] = useState('LEDGER');

   const isLoading = globalLoading || localLoading;

   React.useEffect(() => {
      const fetchInvoices = async () => {
         setLocalLoading(true);
         try {
            const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
            if (data) setInvoices(data);
         } catch (err) {
            console.error('Invoice fetch exception:', err);
         } finally {
            setLocalLoading(false);
         }
      };
      fetchInvoices();
   }, []);

   const safeInvoices = Array.isArray(invoices) ? invoices : [];
   const safeProjects = Array.isArray(projects) ? projects : [];
   const safePOs = Array.isArray(purchaseOrders) ? purchaseOrders : [];

   const breachedPOs = safePOs.filter(po => po.remaining_balance < 0);
   const criticalPOs = safePOs.filter(po => po.remaining_balance > 0 && po.remaining_balance < 10000);
   const ironDomeStatus = breachedPOs.length > 0 ? 'BREACHED' : criticalPOs.length > 0 ? 'CRITICAL' : 'SECURE';

   const combinedLedger = useMemo(() => {
      const data = [
         ...safeInvoices.map(inv => ({
            id: inv.id,
            type: 'INVOICE',
            identification: inv.invoice_number,
            value: Number(inv.amount || 0),
            status: inv.status,
            date: inv.due_date,
            client: inv.client_name || 'MCE INTERNAL',
            project_code: inv.project_code || 'N/A'
         })),
         ...safeProjects.map(p => ({
            id: p.id,
            type: 'PROJECT',
            identification: p.project_name,
            value: Number(p.contract_value_excl_vat || 0),
            status: p.project_status,
            date: p.project_completion_date_planned,
            client: p.client_name,
            project_code: p.project_code
         }))
      ];
      return data.sort((a, b) => {
         const aDate = a.date ? new Date(a.date).getTime() : Infinity;
         const bDate = b.date ? new Date(b.date).getTime() : Infinity;
         return aDate - bDate;
      }).filter(item =>
         item.identification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.client?.toLowerCase().includes(searchQuery.toLowerCase())
      );
   }, [safeInvoices, safeProjects, searchQuery]);

   const stats = {
      revenue: safeInvoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? Number(inv.amount || 0) : 0), 0),
      receivables: safeInvoices.reduce((sum, inv) => sum + (inv.status !== 'Paid' ? Number(inv.amount || 0) : 0), 0),
      portfolio: safeProjects.reduce((sum, p) => sum + (Number(p.contract_value_excl_vat || 0)), 0)
   };

   // Generate sparkline data for demonstration
   const sparklineData = [
      { value: 45 }, { value: 52 }, { value: 48 }, { value: 61 }, { value: 55 },
      { value: 67 }, { value: 72 }, { value: 68 }, { value: 75 }, { value: 82 },
      { value: 78 }, { value: 85 }
   ];

   const metrics = [
      <motion.div key="revenue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0 }}>
         <MetricBlock
            label="Verified Revenue"
            value={<><span className="text-xs text-zinc-400">AED </span><AnimatedCounter value={stats.revenue / 1000000} format="decimal" decimals={2} /><span className="text-xs text-zinc-400">M</span></>}
            trend={{ value: 12, type: 'up' }}
            status="nominal"
         />
      </motion.div>,
      <motion.div key="receivables" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
         <MetricBlock
            label="Receivables"
            value={<><span className="text-xs text-zinc-400">AED </span><AnimatedCounter value={stats.receivables / 1000000} format="decimal" decimals={2} /><span className="text-xs text-zinc-400">M</span></>}
            trend={{ value: 8, type: 'down' }}
            status="warning"
         />
      </motion.div>,
      <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
         <MetricBlock
            label="Asset Value"
            value={<><span className="text-xs text-zinc-400">AED </span><AnimatedCounter value={stats.portfolio / 1000000} format="decimal" decimals={2} /><span className="text-xs text-zinc-400">M</span></>}
            trend={{ value: 5, type: 'up' }}
            status="nominal"
         />
      </motion.div>,
      <motion.div key="dome" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
         <MetricBlock
            label="Iron Dome"
            value={ironDomeStatus === 'BREACHED' ? 'BREACHED' : ironDomeStatus === 'CRITICAL' ? 'CRITICAL' : 'SECURE'}
            status={ironDomeStatus === 'BREACHED' ? 'critical' : ironDomeStatus === 'CRITICAL' ? 'warning' : 'nominal'}
            trend={{ value: ironDomeStatus === 'SECURE' ? 100 : 25, type: ironDomeStatus === 'SECURE' ? 'up' : 'down' }}
         />
      </motion.div>
   ];

   const columns = [
      {
         header: 'Artifact Focus',
         width: '40%',
         accessor: (item: any) => (
            <div className="flex items-center gap-4">
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'PROJECT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  <FileText size={14} />
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-white font-bold italic text-[12px]">{item.identification}</span>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-tight">{item.client} • {item.project_code}</span>
               </div>
            </div>
         )
      },
      {
         header: 'Timeline',
         width: '20%',
         align: 'center' as const,
         accessor: (item: any) => {
            const daysLeft = item.date ? Math.ceil((new Date(item.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
            return (
               <div className="flex flex-col items-center">
                  <span className={`text-sm font-mono font-bold italic ${daysLeft !== null && daysLeft < 30 ? 'text-rose-600' : 'text-zinc-300'}`}>
                     {item.status === 'Paid' ? 'CLOSED' : daysLeft !== null ? `${daysLeft}D` : 'TBD'}
                  </span>
                  <span className="text-xs text-zinc-600">Countdown</span>
               </div>
            );
         }
      },
      {
         header: 'Status',
         width: '20%',
         accessor: (item: any) => (
            <div className="px-4">
               <Badge
                  status={item.status}
                  variant={item.status === 'Paid' || item.status === 'Completed' || item.status === 'Active' ? 'success' : 'outline'}
               >
                  {item.status}
               </Badge>
            </div>
         )
      },
      {
         header: 'Valuation',
         width: '20%',
         align: 'right' as const,
         accessor: (item: any) => (
            <div className="flex flex-col items-end gap-2">
               <div className="text-sm font-mono font-bold text-white flex items-baseline gap-1">
                  <span className="text-zinc-600 text-xs opacity-70">AED</span>
                  <AnimatedCounter value={item.value >= 1000000 ? item.value / 1000000 : item.value} format={item.value >= 1000000 ? 'decimal' : 'number'} decimals={item.value >= 1000000 ? 2 : 0} />
                  {item.value >= 1000000 && <span className="text-zinc-600 text-xs opacity-70">M</span>}
               </div>
               <span className="text-xs text-zinc-600">{item.type}</span>
            </div>
         )
      }
   ];

   const forecastData = [
      { month: 'Feb', confirmed: 480000 },
      { month: 'Mar', confirmed: 720000 },
      { month: 'Apr', confirmed: 1100000 },
      { month: 'May', confirmed: 1250000 },
      { month: 'Jun', confirmed: 950000 },
   ];

   return (
      <DashboardFrame
         title="Financial Command"
         subtitle="Fiscal Governance // Sector 03"
         loading={isLoading}
         metrics={
            <>
               <MetricBlock
                  label="Portfolio Value"
                  value={stats.portfolio}
                  isCurrency
                  trend={{ value: 8.4, type: 'up' }}
               />
               <MetricBlock
                  label="Operational Burn"
                  value={42.5}
                  isCurrency
                  trend={{ value: 2.1, type: 'down' }}
               />
               <MetricBlock
                  label="Invoiced"
                  value={stats.revenue}
                  isCurrency
                  trend={{ value: 15.2, type: 'up' }}
               />
               <MetricBlock
                  label="Pending Recovery"
                  value={stats.portfolio - stats.revenue}
                  isCurrency
                  status="warning"
               />
            </>
         }
         tabs={
            <Box className="bg-zinc-950/40 p-1 rounded-xl border border-white/5 backdrop-blur-md flex gap-1">
               {[
                  { id: 'LEDGER', label: 'Financial Ledger' },
                  { id: 'FORECAST', label: 'Capital Forecast' }
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={cn(
                        "px-5 py-2.5 rounded-lg transition-all duration-300 group",
                        activeTab === tab.id
                           ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10'
                           : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
                     )}
                  >
                     <Text variant="gov-header" className={cn(
                        "text-[10px] transition-all",
                        activeTab === tab.id ? "scale-105 text-white" : "text-zinc-500"
                     )}>
                        {tab.label}
                     </Text>
                  </button>
               ))}
            </Box>
         }
      >
         {/* Toolbar moved from tabs prop */}
         <div className="flex items-center justify-between p-[var(--gov-s2)] mb-4">
            <div className="flex items-center gap-4">
               <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                  <input
                     type="text"
                     placeholder="REGISTRY QUERY..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="bg-black/40 border border-glass rounded-lg pl-9 pr-4 py-2 text-[10px] font-mono text-zinc-400 w-64 focus:outline-none focus:border-blue-500/30 transition-all"
                  />
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => safeExportToCSV(combinedLedger, 'MCE_Fiscal_Ledger')} className="p-2 text-zinc-600 hover:text-white transition-colors">
                  <Download size={16} />
               </button>
               <GlassButton onClick={() => setIsFormOpen(true)} className="px-6 py-2 rounded-lg text-xs font-bold">
                  <Plus size={14} className="mr-2" /> Register Entry
               </GlassButton>
            </div>
         </div>
         {isFormOpen && <InvoiceForm projects={projects} onClose={() => setIsFormOpen(false)} onSuccess={onRefresh} />}

         <div className="flex flex-col lg:grid lg:grid-cols-3 gap-0 h-full divide-x divide-white/5">
            <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
               <div className="p-6 border-b border-glass bg-white/[0.01]">
                  <h4 className="text-gov-label">Unified Fiscal Ledger</h4>
               </div>
               <div className="flex-1 overflow-hidden">
                  {combinedLedger.length > 0 ? (
                     <GovernanceTable data={combinedLedger} columns={columns} onRowClick={(item) => item.type === 'PROJECT' && onSelectProject?.(item.id)} />
                  ) : (
                     <div className="p-12">
                        <EmptyState
                           icon={DollarSign}
                           title="Fiscal Set Null"
                           description="No transaction artifacts or valuation nodes detected in current ledger view."
                           action={{
                              label: "Register Entry",
                              onClick: () => setIsFormOpen(true)
                           }}
                        />
                     </div>
                  )}
               </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
               {/* Iron Dome POs */}
               {safePOs.length > 0 && (
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <h3 className="text-gov-label">Purchase Order Control</h3>
                        <span className="text-[9px] font-mono text-zinc-600">{safePOs.length} ACTIVE</span>
                     </div>
                     <div className="grid grid-cols-1 gap-3">
                        {safePOs.map(po => (
                           <div key={po.id} className={`p-4 rounded-xl border ${po.remaining_balance < 0 ? 'bg-rose-500/5 border-rose-500/20' : 'bg-glass-subtle border-glass'}`}>
                              <div className="flex justify-between items-start mb-2">
                                 <span className="text-[9px] font-bold text-zinc-500 font-mono tracking-tighter">{po.po_number}</span>
                                 {po.remaining_balance < 0 && <AlertCircle size={12} className="text-rose-500 animate-pulse" />}
                              </div>
                              <h4 className="text-[11px] font-bold text-white truncate mb-2">{po.vendor_name}</h4>
                              <div className="flex justify-between text-[10px] font-mono">
                                 <span className="text-zinc-600">Balance</span>
                                 <span className={po.remaining_balance < 0 ? 'text-rose-500' : 'text-emerald-500'}>AED {Number(po.remaining_balance).toLocaleString()}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Projection Chart */}
               <div className="space-y-6 pt-6 border-t border-glass">
                  <ProjectionPulse
                     data={forecastData.map(d => ({ month: d.month, value: d.confirmed }))}
                     trend={12.4}
                     insight="Fiscal engine identifies maturing assets. Revenue yield projected at"
                  />
               </div>

            </div>
         </div>
      </DashboardFrame>
   );
};

