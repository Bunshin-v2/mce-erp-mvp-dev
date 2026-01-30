import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { MetricDisplay } from '../ui/MetricDisplay';
import { StatusBadge } from '../ui/StatusBadge';
import { Box, Text } from '../../components/primitives';
import { cn } from '@/lib/utils';
import { PortfolioVelocityChart } from '../dashboard/PortfolioVelocityChart';
import { StrategicVolumeChart } from '../dashboard/StrategicVolumeChart';
import { OperationalLedger } from '../dashboard/OperationalLedger';
import { RiskHeatmapV2 } from '../dashboard/RiskHeatmapV2';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { useExecutiveData } from '@/hooks/useExecutiveData';
import type { Tender } from '@/types';
import type { Notification } from '../notifications/NotificationBell';
import { Activity, AlertTriangle, Briefcase, DollarSign } from 'lucide-react';

interface CockpitProps {
   projects?: any[];
   tenders?: Tender[];
   notifications?: Notification[];
   kpis?: any;
   onNavigate: (view: any) => void;
   onSelectProject?: (id: string) => void;
   onSelectTender?: (id: string) => void;
   onUpdateTender?: (id: string, status: string) => void;
}

export const ExecutiveCockpit: React.FC<CockpitProps> = ({ projects: propProjects, tenders: propTenders, notifications, kpis: propKpis, onNavigate, onSelectProject }) => {
   const [activeTab, setActiveTab] = useState('OVERVIEW');

   const { data: executiveData, isLoading } = useExecutiveData();

   const projects = executiveData?.projects || propProjects || [];

   // Map chart data
   const portfolioData = (executiveData?.revenueChart || []).map((item: any) => ({
      month: item.name,
      revenue: item.value,
      cost: item.value * 0.4
   }));

   const strategicData = (executiveData?.pipelineChart && executiveData.pipelineChart.length > 0)
      ? executiveData.pipelineChart.map((item: any) => ({ month: item.name, revenue: item.value }))
      : portfolioData.map((d: any) => ({ month: d.month, revenue: d.revenue * 0.8 }));

   const stats = {
      active: projects.filter((p: any) => {
         const status = p.project_status?.toLowerCase() || '';
         return status === 'active' || status === 'construction' || status === 'ongoing' || status === 'active units';
      }).length,
      bids: propTenders?.length || 0,
      value: projects.reduce((acc: number, p: any) => acc + (Number(p.contract_value_excl_vat) || 0), 0),
      critical: projects.filter((p: any) => p.delivery_risk_rating === 'Critical' || (p.project_status?.toLowerCase() || '').includes('delay')).length
   };

   const tabs = [
      { id: 'OVERVIEW', label: 'Operational Overview' },
      { id: 'LEDGER', label: 'Project Ledger' },
      { id: 'RISK', label: 'Risk Analysis' }
   ];

   const alerts = notifications?.map(n => ({
      id: n.id,
      title: n.message,
      severity: (n.severity === 'info' ? 'low' : n.severity) as 'critical' | 'high' | 'medium' | 'low',
      timestamp: n.created_at || 'Now',
   })) || [];

   return (
      <Box className="space-y-6 pb-20">
         {/* Adaptive Header */}
         <Box className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
            <Box>
               <Text variant="h1" className="flex items-center gap-3 text-white">
                  Executive Cockpit
                  <StatusBadge status="live" label="Live System" size="sm" pulse />
               </Text>
               <Text variant="gov-title" color="tertiary" className="mt-1 pl-1">
                  Strategic Command Interface // Sector 01
               </Text>
            </Box>

            <Box className="bg-zinc-950/40 p-1 rounded-xl border border-white/5 backdrop-blur-md flex gap-1">
               {tabs.map(tab => (
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
                        activeTab === tab.id ? "scale-105 italic text-white" : "text-zinc-500"
                     )}>
                        {tab.label}
                     </Text>
                  </button>
               ))}
            </Box>
         </Box>

         {/* 2026 Metric Grid */}
         <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="flex items-center justify-between group" variant="hover">
               <MetricDisplay
                  label="Active Units"
                  value={<AnimatedCounter value={stats.active} />}
                  trend={{ value: 4, direction: 'up', isGood: true }}
                  size="lg"
               />
               <Box className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="text-emerald-500" size={20} />
               </Box>
            </GlassCard>

            <GlassCard className="flex items-center justify-between group" variant="hover">
               <MetricDisplay
                  label="Contract Value"
                  value={
                     <div className="flex items-baseline">
                        <Text as="span" className="text-[13px] mr-1 font-bold italic text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">AED</Text>
                        <Text variant="gov-hero" as="span"><AnimatedCounter value={stats.value / 1000000} format="decimal" decimals={1} /></Text>
                        <Text as="span" className="text-[13px] ml-1 font-bold italic text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">M</Text>
                     </div>
                  }
                  trend={{ value: 12.5, direction: 'up', isGood: true }}
                  size="lg"
               />
               <Box className="h-10 w-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="text-brand-500" size={20} />
               </Box>
            </GlassCard>

            <GlassCard className="flex items-center justify-between group" variant="hover">
               <MetricDisplay
                  label="Active Tenders"
                  value={<AnimatedCounter value={stats.bids} />}
                  trend={{ value: 2, direction: 'down', isGood: false }}
                  size="lg"
               />
               <Box className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="text-amber-500" size={20} />
               </Box>
            </GlassCard>

            <GlassCard className="flex items-center justify-between group" variant={stats.critical > 0 ? "neon" : "hover"}>
               <MetricDisplay
                  label="Risk Signals"
                  value={<AnimatedCounter value={stats.critical} />}
                  trend={stats.critical > 0 ? { value: stats.critical, direction: 'up', isGood: false } : { value: 0, direction: 'neutral' }}
                  size="lg"
                  valueClassName={stats.critical > 0 ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" : ""}
               />
               <Box className={`h-10 w-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${stats.critical > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                  <AlertTriangle size={20} />
               </Box>
            </GlassCard>
         </Box>

         {/* Main Viewport */}
         <AnimatePresence mode="wait">
            {activeTab === 'OVERVIEW' && (
               <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
               >
                  <Box className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                     <div className="lg:col-span-8">
                        <GlassCard className="h-full min-h-[400px]">
                           <Box className="mb-6 flex items-center justify-between">
                              <Text variant="h4" className="text-white uppercase tracking-widest text-[var(--font-size-sm)] font-bold italic">Portfolio Velocity</Text>
                              <StatusBadge status="active" size="sm" />
                           </Box>
                           <PortfolioVelocityChart data={portfolioData} totalValue={stats.value} />
                        </GlassCard>
                     </div>
                     <div className="lg:col-span-4">
                        <GlassCard className="h-full min-h-[400px]">
                           <Box className="mb-6 flex items-center justify-between">
                              <Text variant="h4" className="text-white uppercase tracking-widest text-[var(--font-size-sm)] font-bold italic">Pipeline Volume</Text>
                              <StatusBadge status="projected" label="Forecast" size="sm" dot={false} className="bg-brand-500/10 text-brand-400" />
                           </Box>
                           <StrategicVolumeChart
                              data={strategicData}
                              activeUnits={stats.active}
                              criticalUnits={stats.critical}
                           />
                        </GlassCard>
                     </div>
                  </Box>

                  <GlassCard>
                     <Box className="mb-6 flex items-center justify-between">
                        <Text variant="h4" className="text-white uppercase tracking-widest text-[var(--font-size-sm)] font-bold italic">Operational Ledger</Text>
                     </Box>
                     <OperationalLedger projects={projects} onSelectProject={onSelectProject} />
                  </GlassCard>
               </motion.div>
            )}

            {activeTab === 'LEDGER' && (
               <motion.div
                  key="ledger"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
               >
                  <GlassCard>
                     <OperationalLedger projects={projects} onSelectProject={onSelectProject} />
                  </GlassCard>
               </motion.div>
            )}

            {activeTab === 'RISK' && (
               <motion.div
                  key="risk"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-[calc(100vh-320px)] min-h-[650px]"
               >
                  <RiskHeatmapV2 projects={projects} alerts={alerts} />
               </motion.div>
            )}
         </AnimatePresence>
      </Box>
   );
};
