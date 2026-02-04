import { useState, useMemo } from 'react';
import type { KPIMetric, Project, Tender, Alert, DocumentItem, StatusData } from '../types';

interface MetricTileData extends KPIMetric {
    icon?: any;
    color?: string;
}

interface UseDashboardLogicProps {
    projects: Project[];
    tenders: Tender[];
    alerts: Alert[];
    searchQuery: string;
}

export const useDashboardLogic = ({ projects, tenders, alerts, searchQuery }: UseDashboardLogicProps) => {
    const [activeTab, setActiveTab] = useState<'ONGOING' | 'COMPLETED' | 'UPCOMING'>('ONGOING');

    // 1. Filter Projects based on Tab and Search
    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            // Search Query Filter
            if (searchQuery) {
                const matchesSearch = (p.project_name || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.project_code || '').toLowerCase().includes(searchQuery.toLowerCase());
                if (!matchesSearch) return false;
            }

            // Tab Filter
            const status = p.project_status?.toUpperCase() || '';
            if (activeTab === 'ONGOING') return status.includes('CONSTRUCTION') || status.includes('ONGOING') || status.includes('ACTIVE');
            if (activeTab === 'COMPLETED') return status.includes('COMPLETED') || status.includes('DLP');
            if (activeTab === 'UPCOMING') return status.includes('TENDER') || status.includes('PRE-AWARD') || status.includes('AWAITING');

            return true;
        });
    }, [projects, searchQuery, activeTab]);

    // 2. Derive Deadline Tasks from Projects & Tenders
    const deadlineTasks = useMemo(() => {
        const projectDeadlines = projects
            .filter(p => Boolean(p.project_completion_date_planned) || Boolean(p.dlp_end_date) || Boolean(p.project_commencement_date))
            .flatMap(p => {
                const projectLabel = p.project_name || p.name || 'Project';
                const items: any[] = [];
                
                if (p.project_completion_date_planned) {
                    items.push({
                        id: `proj:${p.id}:planned_complete`,
                        title: 'Planned Completion',
                        dueDate: p.project_completion_date_planned,
                        priority: 'High' as const,
                        project: projectLabel,
                    });
                }
                
                if (p.dlp_end_date) {
                    items.push({
                        id: `proj:${p.id}:dlp_end`,
                        title: 'DLP Period End',
                        dueDate: p.dlp_end_date,
                        priority: 'Medium' as const,
                        project: projectLabel,
                    });
                }

                if (p.project_commencement_date) {
                    items.push({
                        id: `proj:${p.id}:start`,
                        title: 'Project Commencement',
                        dueDate: p.project_commencement_date,
                        priority: 'High' as const,
                        project: projectLabel,
                    });
                }
                
                return items;
            });

        const tenderDeadlines = tenders
            .filter(t => Boolean(t.submission_deadline))
            .map(t => ({
                id: `tender:${t.id}:submission`,
                title: 'Tender Submission',
                dueDate: t.submission_deadline as string,
                priority: 'High' as const,
                project: t.title,
            }));

        // Combine, filter out past dates (optional, but requested "next to come"), and sort
        const today = new Date().getTime();
        
        return [...projectDeadlines, ...tenderDeadlines]
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            // Only show future deadlines + very recent past (within 7 days) for context
            .filter(d => {
                const due = new Date(d.dueDate).getTime();
                return due > today - (7 * 24 * 60 * 60 * 1000);
            })
            .slice(0, 20); 
    }, [projects, tenders]);

    // 3. Derive Liabilities (DLP)
    const liabilities = useMemo(() => {
        return projects
            .filter(p => Boolean(p.dlp_end_date))
            .map(p => {
                const risk = (p.delivery_risk_rating || '').toString().toLowerCase();
                const riskLevel = risk === 'critical' || risk === 'high' ? 'High' : risk === 'medium' ? 'Medium' : 'Low';
                return {
                    id: `proj:${p.id}:dlp_end`,
                    projectId: p.id,
                    projectName: p.project_name || p.name || 'Project',
                    type: 'DLP' as const,
                    expiryDate: p.dlp_end_date as string,
                    riskLevel: riskLevel as 'Low' | 'Medium' | 'High',
                    retentionAmount: 0,
                };
            });
    }, [projects]);

    // 4. Transform Alerts for Risk Command
    const riskAlerts = useMemo(() => {
        return alerts.map(a => ({
            id: a.id,
            title: a.title,
            severity: a.priority === 'critical' ? 'critical' : a.priority === 'warning' ? 'medium' : 'low',
            timestamp: a.timestamp,
            category: 'system',
        }));
    }, [alerts]);

    return {
        activeTab,
        setActiveTab,
        filteredProjects,
        deadlineTasks,
        liabilities,
        riskAlerts
    };
};
