import React from 'react';
import { MetricTile } from '../MetricTile';
import { ProjectList } from '../dashboard/ProjectList';
import { RiskHeatmap } from '../dashboard/RiskHeatmap';
import { TendersModule } from '../dashboard/TendersModule';
import { DocumentsModule } from '../dashboard/DocumentsModule';
import { ShieldAlert, Layers, Clock, Briefcase, FileText, AlertTriangle, TrendingUp, Search, SlidersHorizontal, Bell } from 'lucide-react';
import { useStyleSystem } from '../../lib/StyleSystem';
import { DocumentItem, KPIMetric, Project, Tender, Alert, StatusData } from '../../types';

interface DashboardLayoutProps {
    kpis: KPIMetric[];
    projects: Project[];
    tenders: Tender[];
    documents: DocumentItem[];
    alerts: Alert[];
    statusData: StatusData[];
    searchQuery: string;
    loading: boolean;
    onRefetch: (query?: string) => void;
    onSelectProject: (id: string | null) => void;
    onSelectTender: (id: string | null) => void;
    onNavigate?: (view: string) => void;
    mode?: 'operational' | 'executive';
    signals?: any;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    kpis, projects, tenders, documents, alerts, statusData, searchQuery, loading, onRefetch, onSelectProject, onSelectTender, onNavigate, mode = 'operational', signals
}) => {
    const { config } = useStyleSystem();
    const [activeTab, setActiveTab] = React.useState<'ONGOING' | 'COMPLETED' | 'UPCOMING'>('ONGOING');

    const filteredProjects = projects.filter(p => {
        // 1. Search Query Filter
        if (searchQuery) {
            const matchesSearch = p.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.project_code?.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;
        }

        // 2. Tab Filter
        const status = p.project_status?.toUpperCase() || '';
        if (activeTab === 'ONGOING') return status.includes('CONSTRUCTION') || status.includes('ONGOING') || status.includes('ACTIVE');
        if (activeTab === 'COMPLETED') return status.includes('COMPLETED') || status.includes('DLP');
        if (activeTab === 'UPCOMING') return status.includes('TENDER') || status.includes('PRE-AWARD') || status.includes('AWAITING');

        return true;
    });

    return (
        <div className="page-container flex flex-col gap-6">

            {/* TIER 1: COMMAND KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => {
                    // Map KPI index to views: 0=Projects, 1=Financials, 2=Tenders, 3=Reports/Risks
                    const handleTileClick = () => {
                        if (!onNavigate) return;
                        if (idx === 0) onNavigate('projects');
                        if (idx === 1) onNavigate('financials');
                        if (idx === 2) onNavigate('tenders');
                        if (idx === 3) onNavigate('reports');
                        if (idx === 4) onNavigate('field');
                    };

                    return (
                        <div key={idx} onClick={handleTileClick} className={onNavigate ? "cursor-pointer" : ""}>
                            <MetricTile
                                metric={kpi}
                                icon={kpi.icon || Layers}
                                color={kpi.color || 'blue'}
                                index={idx}
                                onClick={handleTileClick}
                            />
                        </div>
                    );
                })}

                {/* If missing some KPIs, fallback to placeholder logic but with tokens */}
                {kpis.length === 0 && (
                    <div className="col-span-4 py-8 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-600 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-xl">
                        Synchronizing Command Feed...
                    </div>
                )}
            </section>

            {/* MAIN DATA GRID (Tier 2 & 3 Combined) */}
            <div className="grid grid-cols-12 gap-8 pb-20">

                {/* LEFT: Project Portfolio (66%) */}
                <section className="col-span-12 xl:col-span-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/[0.05] pb-6 px-2">
                        <div>
                            <h3 className="text-[13px] font-bold text-white uppercase tracking-[0.25em] font-sans">Project Portfolio</h3>
                            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-1.5 font-sans opacity-60">{filteredProjects.length} Records Detected</p>
                        </div>
                        <div className="flex bg-white/[0.03] p-1 rounded-full border border-white/[0.05] backdrop-blur-md">
                            {(['ONGOING', 'COMPLETED', 'UPCOMING'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full transition-all font-sans ${activeTab === tab ? 'bg-white/10 text-[#00dc82] shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <ProjectList projects={filteredProjects} onSelectProject={onSelectProject} />
                    </div>
                </section>

                {/* RIGHT: COMMAND SIDEBAR (33%) */}
                <aside className="col-span-12 xl:col-span-4 space-y-8">

                    {/* Heatmap */}
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 shadow-2xl backdrop-blur-2xl">
                        <RiskHeatmap projects={projects} onSelectProject={onSelectProject} />
                    </div>

                    {/* Critical Signals Feed */}
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-2xl">
                        <div className="px-8 py-5 border-b border-white/[0.05] bg-white/[0.03] flex justify-between items-center">
                            <h3 className="text-[11px] font-bold text-rose-500 uppercase tracking-[0.2em] font-sans">Critical Signals</h3>
                            {alerts.length > 0 && <span className="text-[9px] bg-rose-500/20 text-rose-500 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">{alerts.length}</span>}
                        </div>
                        <div className="p-8 space-y-8">
                            {alerts.length > 0 ? alerts.slice(0, 5).map((alert, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest group-hover:text-rose-500 transition-colors">{alert.title}</h4>
                                        <div className="flex items-center space-x-2 text-zinc-600">
                                            <span className="text-[9px] font-mono font-bold uppercase">{alert.timestamp}</span>
                                            <Clock size={12} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-300 transition-colors font-sans">
                                        Anomaly detected in <span className="text-zinc-300 font-bold italic">{alert.title}</span>. Direct intervention required for portfolio integrity.
                                    </p>
                                </div>
                            )) : (
                                <div className="py-12 text-center">
                                    <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.25em] font-sans opacity-40">System Neutral • No Active Hazards</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};