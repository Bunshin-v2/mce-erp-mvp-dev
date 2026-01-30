
import React, { useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import { EmptyState } from '../ui/EmptyState';

// Placeholder data and types
interface Task {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
}
const sampleTasks: Task[] = [
    { id: '1', title: 'Draft Q3 report', status: 'pending' },
    { id: '2', title: 'Follow up with client on invoice #123', status: 'in_progress' },
    { id: '3', title: 'Review new project proposal', status: 'pending' },
    { id: '4', title: 'Complete compliance training', status: 'completed' },
];

const KanbanColumn = ({ title, tasks }: { title: string, tasks: Task[] }) => (
    <div className="flex-1">
        <h3 className="text-sm font-bold italic text-white tracking-wider mb-4 px-2">{title} ({tasks.length})</h3>
        <div className="bg-zinc-900/50 border border-white/10 rounded-lg p-2 space-y-2 h-full">
            {tasks.map(task => (
                <div key={task.id} className="bg-zinc-800 p-3 rounded-md shadow-md">
                    <p className="text-sm text-zinc-200">{task.title}</p>
                </div>
            ))}
        </div>
    </div>
);


import { PageHeader } from '../ui/PageHeader';

export const PersonalTasksPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

    const tasksByStatus = {
        pending: sampleTasks.filter(t => t.status === 'pending'),
        in_progress: sampleTasks.filter(t => t.status === 'in_progress'),
        completed: sampleTasks.filter(t => t.status === 'completed'),
    };

    return (
        <div className="page-container space-y-8 pb-32">
            <PageHeader
                title="Personal Tasks"
                subtitle="Individual Action Cluster"
                actions={
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-black p-1 rounded-xl border border-glass shadow-inner">
                            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-white/10' : ''}`}><LayoutGrid size={16} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white/10' : ''}`}><List size={16} /></button>
                        </div>
                        <GlassButton className="italic px-6 py-2 rounded-xl text-[10px] font-bold italic tracking-widest shadow-glow-blue"><Plus size={16} className="mr-2" /> New Task</GlassButton>
                    </div>
                }
            />

            {viewMode === 'kanban' ? (
                <div className="flex space-x-4">
                    <KanbanColumn title="To Do" tasks={tasksByStatus.pending} />
                    <KanbanColumn title="In Progress" tasks={tasksByStatus.in_progress} />
                    <KanbanColumn title="Completed" tasks={tasksByStatus.completed} />
                </div>
            ) : (
                <EmptyState
                    icon={List}
                    title="List View Unavailable"
                    description="This view mode is currently under construction."
                    className="mt-8 border-dashed border-zinc-800 bg-zinc-900/20"
                />
            )}
        </div>
    );
};

