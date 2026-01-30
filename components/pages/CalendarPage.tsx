import React, { useMemo, useState } from 'react';
import {
    addMonths,
    addWeeks,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek,
    subMonths,
    subWeeks
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';

// Minimal types (keep page decoupled from data hooks)
export type CalendarTask = {
    id: string;
    title: string;
    due_date: string;
    status?: 'pending' | 'in_progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    project_id?: string;
    projectId?: string;
};

type CalendarPageProps = {
    tasks?: CalendarTask[];
    projects?: any[];
    onSelectProject?: (id: string) => void;
};

type CalendarEvent = {
    id: string;
    kind: 'task' | 'project';
    title: string;
    date: Date;
    priority: 'low' | 'medium' | 'high';
    status?: 'pending' | 'in_progress' | 'completed';
    projectId?: string;
};

export const CalendarPage: React.FC<CalendarPageProps> = ({
    tasks = [],
    projects = [],
    onSelectProject,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

    // Navigation
    const nextPeriod = () => {
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        else setCurrentDate(addWeeks(currentDate, 1));
    };

    const prevPeriod = () => {
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        else setCurrentDate(subWeeks(currentDate, 1));
    };

    const jumpToToday = () => setCurrentDate(new Date());

    // Week Days Header
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const events: CalendarEvent[] = useMemo(() => {
        const taskEvents: CalendarEvent[] = tasks
            .filter(t => Boolean(t.due_date))
            .map(t => {
                const priority = t.priority ?? 'medium';
                const projectId = t.projectId || t.project_id;
                return {
                    id: `task:${t.id}`,
                    kind: 'task',
                    title: t.title,
                    date: new Date(t.due_date),
                    priority,
                    status: t.status ?? 'pending',
                    projectId,
                };
            });

        const projectEvents: CalendarEvent[] = projects
            .flatMap(p => {
                const projectId = p.id;
                const projectName = p.project_name || p.name || 'Project';

                const entries: Array<{ key: string; label: string; dateValue?: string; priority?: CalendarEvent['priority'] }> = [
                    { key: 'commence', label: 'Commencement', dateValue: p.project_commencement_date, priority: 'medium' },
                    { key: 'planned_complete', label: 'Planned Completion', dateValue: p.project_completion_date_planned, priority: 'high' },
                    { key: 'dlp_end', label: 'DLP End', dateValue: p.dlp_end_date, priority: 'medium' },
                ];

                const milestoneEvents: CalendarEvent[] = Array.isArray(p.milestones)
                    ? p.milestones
                          .filter((m: any) => Boolean(m?.start_date || m?.end_date))
                          .map((m: any) => {
                              const milestoneDate = new Date(m?.end_date || m?.start_date);
                              const status = String(m?.status || 'Pending');
                              const priority: CalendarEvent['priority'] = status === 'Delayed' ? 'high' : status === 'In Progress' ? 'medium' : 'low';
                              return {
                                  id: `project:${projectId}:milestone:${m?.id || m?.title || milestoneDate.toISOString()}`,
                                  kind: 'project',
                                  title: `${projectName} — ${m?.title || 'Milestone'}`,
                                  date: milestoneDate,
                                  priority,
                                  projectId,
                              } satisfies CalendarEvent;
                          })
                    : [];

                const dateFieldEvents = entries
                    .filter(e => Boolean(e.dateValue))
                    .map(e => {
                        const d = new Date(e.dateValue as string);
                        return {
                            id: `project:${projectId}:${e.key}`,
                            kind: 'project',
                            title: `${projectName} — ${e.label}`,
                            date: d,
                            priority: e.priority ?? 'medium',
                            projectId,
                        } satisfies CalendarEvent;
                    });

                return [...dateFieldEvents, ...milestoneEvents];
            });

        return [...projectEvents, ...taskEvents].filter(e => !Number.isNaN(e.date.getTime()));
    }, [projects, tasks]);

    // Generate Calendar Grid
    const renderCalendarGrid = () => {
        let days: Date[] = [];

        if (viewMode === 'month') {
            const monthStart = startOfMonth(currentDate);
            const monthEnd = endOfMonth(currentDate);
            const startDate = startOfWeek(monthStart);
            const endDate = endOfWeek(monthEnd);
            days = eachDayOfInterval({ start: startDate, end: endDate });
        } else {
            const startDate = startOfWeek(currentDate);
            const endDate = endOfWeek(currentDate);
            days = eachDayOfInterval({ start: startDate, end: endDate });
        }

        return (
            <div className="grid grid-cols-7 gap-px bg-zinc-800/50 rounded-lg overflow-hidden border border-zinc-800">
                {/* Header */}
                {weekDays.map((day) => (
                    <div key={day} className="bg-zinc-900/50 p-3 text-center text-xs font-bold italic text-zinc-500 tracking-wider">
                        {day}
                    </div>
                ))}

                {/* Days */}
                {days.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);

                    const dayEvents = events
                        .filter(e => isSameDay(e.date, day))
                        .sort((a, b) => {
                            const priorityRank = (p: CalendarEvent['priority']) => (p === 'high' ? 0 : p === 'medium' ? 1 : 2);
                            return priorityRank(a.priority) - priorityRank(b.priority);
                        });

                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-[140px] bg-zinc-900/30 p-2 transition-colors hover:bg-zinc-800/30 group relative flex flex-col ${!isCurrentMonth && viewMode === 'month' ? 'opacity-30 bg-zinc-950' : ''
                                }`}
                        >
                            {/* Day Number */}
                            <div className="flex justify-between items-start mb-2">
                                <span
                                    className={`text-sm font-bold italic w-7 h-7 flex items-center justify-center rounded-full ${isCurrentDay
                                            ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                            : 'text-zinc-400 group-hover:text-zinc-200'
                                        }`}
                                >
                                    {format(day, 'd')}
                                </span>
                            </div>

                            {/* Events */}
                            <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                                {dayEvents.map(ev => {
                                    const isProject = ev.kind === 'project';
                                    const colorClass = isProject
                                        ? 'bg-blue-500/10 border-blue-500/20 border-l-blue-500 text-blue-200'
                                        : ev.priority === 'high'
                                            ? 'bg-rose-500/10 border-rose-500/20 border-l-rose-500 text-rose-200'
                                            : ev.priority === 'medium'
                                                ? 'bg-amber-500/10 border-amber-500/20 border-l-amber-500 text-amber-200'
                                                : 'bg-emerald-500/10 border-emerald-500/20 border-l-emerald-500 text-emerald-200';

                                    return (
                                        <button
                                            key={ev.id}
                                            type="button"
                                            onClick={() => {
                                                if (ev.projectId) {
                                                    onSelectProject?.(ev.projectId);
                                                }
                                            }}
                                            className={`w-full text-left text-[10px] px-2 py-1.5 rounded border border-l-2 truncate hover:scale-[1.02] transition-transform ${colorClass} ${
                                                ev.kind === 'task' && ev.status === 'completed' ? 'opacity-50 line-through' : ''
                                            }`}
                                            title={ev.title}
                                        >
                                            {ev.title}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            <PageHeader 
                title="Portfolio Timeline"
                subtitle="Temporal Lock // Sector 05"
                actions={
                    <div className="flex items-center gap-4">
                        <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-4 py-1.5 text-[10px] font-bold italic rounded-lg transition-all ${viewMode === 'month' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-4 py-1.5 text-[10px] font-bold italic rounded-lg transition-all ${viewMode === 'week' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Week
                            </button>
                        </div>
                        <button onClick={jumpToToday} className="px-4 py-2 text-[10px] font-bold italic bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all tracking-widest">
                            Today
                        </button>
                    </div>
                }
            />


            {/* Calendar Body */}
            <div className="flex-1 bg-[var(--surface-base)] border border-[var(--surface-border)] rounded-xl p-4 shadow-xl overflow-hidden flex flex-col">
                {renderCalendarGrid()}
            </div>
        </div>
    );
};

