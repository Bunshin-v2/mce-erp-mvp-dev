import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { useDashboardData } from '../../hooks/useDashboardData';

// Types
interface Task {
    id: string;
    title: string;
    due_date: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
}

export const CalendarPage: React.FC = () => {
    const { tasks } = useDashboardData();
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
                    <div key={day} className="bg-zinc-900/50 p-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}

                {/* Days */}
                {days.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isCurrentDay = isToday(day);

                    // Filter tasks for this day
                    const dayTasks = tasks.filter(t => isSameDay(new Date(t.due_date), day));

                    return (
                        <div
                            key={day.toISOString()}
                            className={`min-h-[140px] bg-zinc-900/30 p-2 transition-colors hover:bg-zinc-800/30 group relative flex flex-col ${!isCurrentMonth && viewMode === 'month' ? 'opacity-30 bg-zinc-950' : ''
                                }`}
                        >
                            {/* Day Number */}
                            <div className="flex justify-between items-start mb-2">
                                <span
                                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isCurrentDay
                                            ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                            : 'text-zinc-400 group-hover:text-zinc-200'
                                        }`}
                                >
                                    {format(day, 'd')}
                                </span>
                            </div>

                            {/* Task List */}
                            <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={`text-[10px] px-2 py-1.5 rounded border border-l-2 truncate cursor-pointer hover:scale-[1.02] transition-transform ${task.priority === 'high' ? 'bg-rose-500/10 border-rose-500/20 border-l-rose-500 text-rose-200' :
                                                task.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 border-l-amber-500 text-amber-200' :
                                                    'bg-emerald-500/10 border-emerald-500/20 border-l-emerald-500 text-emerald-200'
                                            } ${task.status === 'completed' ? 'opacity-50 line-through' : ''}`}
                                        title={task.title}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header Bar */}
            <div className="flex justify-between items-center bg-[var(--surface-elevated)] p-4 rounded-xl border border-[var(--surface-border)] shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Schedule</h1>
                        <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
                            Master Timeline
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Switcher */}
                    <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${viewMode === 'month' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${viewMode === 'week' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Week
                        </button>
                    </div>

                    <div className="h-6 w-px bg-zinc-800 mx-2"></div>

                    {/* Date Controls */}
                    <div className="flex items-center gap-2">
                        <button onClick={prevPeriod} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-sm font-bold text-white min-w-[140px] text-center">
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                        <button onClick={nextPeriod} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <button onClick={jumpToToday} className="px-3 py-1.5 text-xs font-bold bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-all uppercase tracking-wider">
                        Today
                    </button>
                </div>
            </div>

            {/* Calendar Body */}
            <div className="flex-1 bg-[var(--surface-base)] border border-[var(--surface-border)] rounded-xl p-4 shadow-xl overflow-hidden flex flex-col">
                {renderCalendarGrid()}
            </div>
        </div>
    );
};
