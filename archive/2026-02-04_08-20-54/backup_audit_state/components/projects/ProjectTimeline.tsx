import React from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { Badge } from '../ui/Badge';

interface Milestone {
    id: string | number;
    title: string;
    date: string;
    status: 'Completed' | 'In Progress' | 'Pending' | 'Delayed';
}

interface ProjectTimelineProps {
    milestones: Milestone[];
    startDate?: string;
    endDate?: string;
    className?: string;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ milestones, startDate, endDate, className }) => {
    // Sort milestones by date
    const sorted = [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <GlassPanel className={`p-6 ${className}`}>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center justify-between">
                <span>Execution Timeline</span>
                <span className="text-[9px] text-zinc-500 font-mono">{milestones.length} Key Milestones</span>
            </h3>

            <div className="relative pl-4 space-y-8 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-px before:bg-zinc-800 before:z-0">
                {sorted.map((milestone, index) => {
                    const isCompleted = milestone.status === 'Completed';
                    const isInProgress = milestone.status === 'In Progress';
                    const isDelayed = milestone.status === 'Delayed';

                    let dotColor = 'bg-zinc-700 border-zinc-600';
                    if (isCompleted) dotColor = 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
                    if (isInProgress) dotColor = 'bg-blue-500 border-blue-400 animate-pulse';
                    if (isDelayed) dotColor = 'bg-rose-500 border-rose-400';

                    return (
                        <div key={milestone.id} className="relative z-10 flex items-start group">
                            {/* Timeline Dot */}
                            <div className={`w-3.5 h-3.5 rounded-full border-2 ${dotColor} mt-1 mr-4 shrink-0 transition-all group-hover:scale-125`} />

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className={`text-sm font-bold ${isCompleted ? 'text-emerald-400' : 'text-zinc-200'} group-hover:text-white transition-colors`}>
                                        {milestone.title}
                                    </h4>
                                    <span className="text-[10px] font-mono text-zinc-500 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                        {new Date(milestone.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge status={milestone.status.toUpperCase()}>{milestone.status}</Badge>
                                    {isDelayed && <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wide">Critical Delay</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </GlassPanel>
    );
};
