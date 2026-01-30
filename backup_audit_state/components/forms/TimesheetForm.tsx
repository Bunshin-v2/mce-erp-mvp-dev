import React, { useState } from 'react';
import { X, Save, Loader2, Clock, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TimesheetFormProps {
  resourceId: string;
  projects: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export const TimesheetForm: React.FC<TimesheetFormProps> = ({ resourceId, projects, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_id: projects[0]?.id || '',
    hours_logged: '8',
    work_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('timesheets')
        .insert([{
          ...formData,
          resource_id: resourceId,
          hours_logged: parseFloat(formData.hours_logged) || 0
        }]);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[var(--surface-layer)] border border-white/10 rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[var(--surface-base)]">
          <div className="flex items-center space-x-2">
            <Clock size={18} className="text-[#33CCCC]" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Log Billable Hours</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Project</label>
            <select 
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-sm text-white focus:border-[#33CCCC] outline-none transition-colors"
              value={formData.project_id}
              onChange={e => setFormData({...formData, project_id: e.target.value})}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-zinc-950">{p.PROJECT_NAME}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Hours Logged</label>
              <input 
                required
                type="number"
                step="0.5"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-sm text-white focus:border-[#33CCCC] outline-none font-mono transition-colors"
                value={formData.hours_logged}
                onChange={e => setFormData({...formData, hours_logged: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Work Date</label>
              <input 
                type="date"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-sm text-white focus:border-[#33CCCC] outline-none [color-scheme:dark] transition-colors"
                value={formData.work_date}
                onChange={e => setFormData({...formData, work_date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Activity Record</label>
            <textarea 
              placeholder="Detail mission objectives and outcomes..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-sm text-white focus:border-[#33CCCC] outline-none resize-none transition-colors"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-zinc-800 text-zinc-500 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#c21719] text-white rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-[#a01214] shadow-lg transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
              Commit Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};