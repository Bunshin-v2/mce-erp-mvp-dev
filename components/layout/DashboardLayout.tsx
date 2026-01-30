import React from 'react';
import { MetricTile } from '../MetricTile';
import { ProjectList } from '../dashboard/ProjectList';
import { TenderList } from '../dashboard/TenderList';
import { DeadlineQueueList } from '../dashboard/DeadlineQueueList';
import { UnifiedRiskCommand } from '../dashboard/UnifiedRiskCommand';
import { LiabilityTracker } from '../dashboard/LiabilityTracker';
import { Layers } from 'lucide-react';
import { DocumentItem, KPIMetric, Project, Tender, Alert, StatusData } from '../../types';
import { useDashboardLogic } from '../../hooks/useDashboardLogic';
import { useWidgetLayoutState } from '../../hooks/useWidgetLayoutState';
import { QueueCard } from '../dashboard/QueueCard';
import { SkeletonLoader, QueueSkeleton } from '../ui/SkeletonLoader';

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

    // Extracted Logic Hook
    const {
        activeTab,
        setActiveTab,
        filteredProjects,
        deadlineTasks,
        liabilities,
        riskAlerts
    } = useDashboardLogic({ projects, tenders, alerts, searchQuery });

    // Widget State Management
    const layout = useWidgetLayoutState({
        criticalHazards: signals?.riskDistribution?.critical || 0,
        complianceBreach: deadlineTasks.some(t => {
            const days = Math.ceil((new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days <= 0;
        })
    });


    return (
        <div className="page-container flex flex-col gap-8 animate-fade-in">

            {/* TIER 1: COMMAND KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6">
                {kpis.map((kpi, idx) => {
                    const handleTileClick = () => {
                        if (!onNavigate) return;
                        if (idx === 0) onNavigate('projects');
                        if (idx === 1) onNavigate('financials');
                        if (idx === 2) onNavigate('tenders');
                        if (idx === 3) onNavigate('reports');
                        if (idx === 4) onNavigate('field');
                    };

                    return (
                        <div key={idx} onClick={handleTileClick} className={`min-h-[165px] h-[165px] overflow-hidden ${onNavigate ? "cursor-pointer" : ""}`}>
                            <MetricTile
                                metric={kpi}
                                icon={kpi.icon || Layers}
                                color={(kpi.color as any) || 'blue'}
                                index={idx}
                                onClick={handleTileClick}
                            />
                        </div>
                    );
                })}

                {kpis.length === 0 && (
                    <div className="col-span-4 py-8 text-center text-[11px] font-bold italic tracking-[0.3em] text-zinc-600 bg-white/[0.02] border border-white/[0.05] rounded-2xl backdrop-blur-xl">
                        Synchronizing Command Feed...
                    </div>
                )}
            </section>

            {/* TIER 2 & 3: COMMAND GRID (2-Lane Layout) */}
            <div className="grid grid-cols-12 gap-10 pb-20">

                {/* LEFT LANE: Primary Work Queues (8 cols) */}
                <div className="col-span-12 xl:col-span-8 space-y-10">

                    {/* 1. Project Portfolio Queue */}

                    {/* 1. Project Portfolio Queue */}
                    <QueueCard
                        title="PROJECT PORTFOLIO"
                        count={loading ? 0 : filteredProjects.length}
                        className="transition-all"
                        mode={layout.state.project_portfolio.mode}
                        onToggle={() => layout.toggle('project_portfolio')}
                    >
                        {loading ? (
                            <QueueSkeleton variant="project" count={5} />
                        ) : (
                            <ProjectList
                                projects={filteredProjects}
                                onSelectProject={onSelectProject}
                                limit={layout.state.project_portfolio.mode === 'compact' ? 6 : undefined}
                            />
                        )}
                    </QueueCard>

                    {/* 2. Tender Tracker Queue */}
                    <QueueCard
                        title="TENDER TRACKER"
                        count={loading ? 0 : (tenders?.length || 0)}
                        className="transition-all"
                        mode={layout.state.tender_tracker.mode}
                        onToggle={() => layout.toggle('tender_tracker')}
                    >
                        {loading ? (
                            <QueueSkeleton variant="tender" count={4} />
                        ) : (
                            <TenderList
                                tenders={tenders || []}
                                limit={layout.state.tender_tracker.mode === 'compact' ? 4 : undefined}
                            />
                        )}
                    </QueueCard>

                </div>

                {/* RIGHT LANE: Sticky Command (4 cols) */}
                <aside className="col-span-12 xl:col-span-4 flex flex-col gap-10 sticky top-6 h-fit z-30">

                    {/* 1. Strategic Risk Command */}
                    <div className="min-h-[300px]">
                        <UnifiedRiskCommand
                            projects={filteredProjects as any}
                            alerts={riskAlerts as any}
                            riskDistribution={signals?.riskDistribution}
                            mode={layout.state.risk_command.mode}
                            onToggle={() => layout.toggle('risk_command')}
                            pinned={layout.state.risk_command.pinned}
                        />
                    </div>

                    {/* 2. Upcoming Deadlines */}
                    <QueueCard
                        title="UPCOMING DEADLINES"
                        count={deadlineTasks.length}
                        className="transition-all"
                        mode={layout.state.deadlines.mode}
                        onToggle={() => layout.toggle('deadlines')}
                        pinned={layout.state.deadlines.pinned}
                    >
                        <DeadlineQueueList
                            tasks={deadlineTasks as any}
                            limit={layout.state.deadlines.mode === 'compact' ? 5 : undefined}
                        />
                    </QueueCard>

                    {/* 3. Liability Tracker (Optional/Stacked) */}
                    <div className="opacity-80 hover:opacity-100 transition-opacity">
                        <LiabilityTracker
                            mode={layout.state.liability_tracker.mode}
                            onToggle={() => layout.toggle('liability_tracker')}
                        />
                    </div>

                </aside>
            </div>
        </div >
    );
};