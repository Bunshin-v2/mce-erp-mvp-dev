import React from 'react';
import { Search, Filter, List as ListIcon, LayoutGrid, CheckSquare, Edit2, Trash2, Archive, Calendar, Database, MoreHorizontal } from 'lucide-react';
import { Task, TaskPriority } from '../../types';
import { GlassPanel } from '../ui/GlassPanel';

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks, onTaskClick, onAddTask, selectedIds, onToggleSelect }) => {
  
  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-zinc-500 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3 italic">
          <ListIcon size={20} className="text-blue-500" />
          All Tasks
          <span className="ml-2 bg-white/5 px-3 py-1 rounded-full text-[10px] text-zinc-500 font-mono not-italic">{tasks.length}</span>
        </h2>
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest pl-8">Manage and organize all your matrix nodes</p>
      </div>

      {/* TOOLBAR - TODO TRACKER STYLE */}
      <div className="flex flex-wrap items-center justify-between gap-6">
         <div className="flex items-center bg-black/40 border border-white/5 p-1 rounded-xl shadow-inner">
            <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all">
               <ListIcon size={14} className="mr-2.5" /> List
            </button>
            <button className="flex items-center px-6 py-2 text-zinc-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
               <LayoutGrid size={14} className="mr-2.5" /> Grid
            </button>
         </div>

         <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1 group">
               <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
               <input placeholder="Search nodes..." className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-xs text-white outline-none focus:border-blue-500/30 transition-all font-bold uppercase tracking-wider" />
            </div>
            <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
               <Filter size={14} /> Filters
            </button>
            <select className="bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] text-zinc-400 outline-none font-bold uppercase tracking-widest">
               <option>Newest First</option>
               <option>Oldest First</option>
               <option>Priority High</option>
            </select>
         </div>
      </div>

      {/* TASK LIST TABLE */}
      <GlassPanel className="p-0 overflow-hidden border-white/5 shadow-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="bg-white/[0.02] text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-white/5">
                     <th className="p-6 w-16">
                        <div className="w-4 h-4 rounded border border-white/10 bg-black flex items-center justify-center"></div>
                     </th>
                     <th className="p-6">Task Signature</th>
                     <th className="p-6">Status</th>
                     <th className="p-6 text-center">Priority</th>
                     <th className="p-6">Due Date</th>
                     <th className="p-6">Cluster Path</th>
                     <th className="p-6 text-right pr-10">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {tasks.map(task => (
                     <tr key={task.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                           <button 
                              onClick={() => onToggleSelect(task.id)}
                              className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${
                                 selectedIds.includes(task.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10 bg-black shadow-inner'
                              }`}
                           >
                              {selectedIds.includes(task.id) && <CheckSquare size={12} />}
                           </button>
                        </td>
                        <td className="p-6" onClick={() => onTaskClick(task)}>
                           <div className="font-bold text-zinc-200 text-sm group-hover:text-white transition-colors cursor-pointer uppercase tracking-tight">{task.title}</div>
                           <div className="text-[10px] text-zinc-600 mt-1 font-medium italic line-clamp-1 max-w-md opacity-0 group-hover:opacity-100 transition-opacity">Click to edit or use the action buttons</div>
                        </td>
                        <td className="p-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                              task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'
                           }`}>
                              {task.status}
                           </span>
                        </td>
                        <td className="p-6">
                           <div className="flex justify-center">
                              <span className={`px-2.5 py-1 rounded text-[9px] font-black border uppercase tracking-widest font-mono ${getPriorityColor(task.priority)}`}>
                                 {task.priority}
                              </span>
                           </div>
                        </td>
                        <td className="p-6 font-mono text-[10px] font-bold text-zinc-500">
                           {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </td>
                        <td className="p-6">
                           <div className="flex flex-wrap gap-1.5">
                              {task.categories && task.categories.length > 0 ? task.categories.map(cat => (
                                 <span key={cat.id} className="bg-white/5 border border-white/5 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest font-mono italic" style={{ color: cat.color }}>
                                    {cat.name}
                                 </span>
                              )) : <span className="text-zinc-800 font-mono text-[8px]">UNDEFINED</span>}
                           </div>
                        </td>
                        <td className="p-6 text-right pr-10">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 bg-white/5 text-zinc-500 border border-white/5 rounded-lg hover:text-white transition-all"><CheckSquare size={14}/></button>
                              <button className="p-2 bg-white/5 text-zinc-500 border border-white/5 rounded-lg hover:text-white transition-all"><Edit2 size={14}/></button>
                              <button className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg hover:bg-rose-500 hover:text-black transition-all"><Trash2 size={14}/></button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {tasks.length === 0 && (
               <div className="p-32 text-center flex flex-col items-center justify-center space-y-6 opacity-20 filter grayscale">
                  <Database className="text-zinc-500" size={64} />
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Recursive Query Empty</p>
               </div>
            )}
         </div>
      </GlassPanel>
    </div>
  );
};
