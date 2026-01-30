import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Clock, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    dueDate: string;
    priority: 'High' | 'Medium' | 'Low';
    assignedTo: string;
    project: string;
}

interface DeadlineListProps {
    tasks?: Task[];
}

export const DeadlineList: React.FC<DeadlineListProps> = ({ tasks = [] }) => {

    // Sort tasks by due date (closest first)
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [tasks]);

    const getDaysRemaining = (dateString: string) => {
        const today = new Date();
        const due = new Date(dateString);
        const setHours = (d: Date) => d.setHours(0, 0, 0, 0);
        const diffTime = setHours(due) - setHours(today);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return (
        <Card className="h-full bg-zinc-900/50 backdrop-blur-md border-zinc-800/50" padding="none">
            <CardHeader className="px-6 py-4 border-b border-glass">
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-zinc-500" />
                    <CardTitle>UPCOMING DEADLINES</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="divide-y divide-zinc-800/50 flex-col h-full overflow-y-auto custom-scrollbar">
                {sortedTasks.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-xs font-bold italic opacity-50">No Pending Tasks</div>
                ) : (
                    sortedTasks.map((task) => {
                        const days = getDaysRemaining(task.dueDate);
                        const isUrgent = days <= 3;

                        return (
                            <div key={task.id} className="p-4 hover:bg-glass-subtle transition-colors group cursor-pointer relative overflow-hidden">
                                {isUrgent && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-500 to-amber-600 opacity-80" />
                                )}

                                <div className="flex items-start justify-between mb-1.5 pl-2">
                                    <div className="flex flex-col gap-0.5">
                                        <Badge>{task.project}</Badge>
                                        <h4 className="text-[13px] font-bold italic text-zinc-200 group-hover:text-white transition-colors line-clamp-1">
                                            {task.title}
                                        </h4>
                                    </div>
                                    <div className={`flex flex-col items-end shrink-0 ${isUrgent ? 'animate-pulse' : ''}`}>
                                        <span className={`text-xl font-mono font-bold italic leading-none ${isUrgent ? 'text-rose-500' :
                                            days <= 7 ? 'text-amber-500' : 'text-emerald-500'
                                            }`}>
                                            {days < 0 ? 'OD' : days}
                                        </span>
                                        <span className="text-xs font-bold italic text-zinc-600">
                                            {days < 0 ? 'Overdue' : 'Days Left'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3 pl-2">
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-xs font-bold italic text-zinc-400">
                                            {task.assignedTo.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span>Assigned to <span className="text-zinc-400 font-bold italic">{task.assignedTo}</span></span>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-emerald-500 font-bold italic tracking-wider">
                                        <span>Action</span>
                                        <ArrowRight size={12} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
};

