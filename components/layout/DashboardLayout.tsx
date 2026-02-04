import React from 'react';
import { MetricTile } from '../MetricTile';
import { DashboardFrame } from '../governance/DashboardFrame';
import { OperationalCommand } from '../dashboard/OperationalCommand';
import { Layers } from 'lucide-react';
import { DocumentItem, KPIMetric, Project, Tender, Alert, StatusData } from '../../types';
import { useDashboardLogic } from '../../hooks/useDashboardLogic';
import { useWidgetLayoutState } from '../../hooks/useWidgetLayoutState';
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


    // Memoized Metrics for Frame
    const metricsDisplay = (
        <>
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
        </>
    );

    return (
        <DashboardFrame
            title="Operational Workspace"
            metrics={metricsDisplay}
            loading={loading}
        >
            <div className="flex flex-col gap-8 animate-fade-in p-6">
                {/* Note: DashboardFrame provides the shell, but we need inner padding for the grid content.
                    We use p-6 here to match the internal padding of the frame's content area if needed,
                    OR relying on the frame's internal structure. 
                    Given DashboardFrame has "p-[var(--gov-s3)]" on the outer, and "custom-scrollbar" on the inner.
                    We add standard p-6 to the inner content to give breathing room to the grid.
                */}

                {/* OPERATIONAL COMMAND - Redesigned Grid Section */}
                <div className="w-full">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-[var(--text-tertiary)]">
                            <SkeletonLoader />
                        </div>
                    ) : (
                        <OperationalCommand
                            projects={filteredProjects as any}
                            deadlines={deadlineTasks as any}
                            tenders={tenders || []}
                        />
                    )}
                </div>
            </div>
        </DashboardFrame>
    );
};