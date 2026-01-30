import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ResourceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    department: 'Projects',
    hourly_rate: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('resources').insert([formData]);
      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error adding resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1e293b] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#333999]">
          <h3 className="text-lg font-bold text-white">Add New Resource</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FFFF]"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FFFF]"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FFFF]"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option>Projects</option>
                <option>Engineering</option>
                <option>Finance</option>
                <option>HR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hourly Rate (AED)</label>
            <input 
              required
              type="number" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00FFFF]"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({...formData, hourly_rate: Number(e.target.value)})}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#00FFFF] text-[#0A0F2C] px-6 py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:bg-[#00FFFF]/80 transition-all flex items-center"
            >
              {loading ? 'Saving...' : <><Save size={16} className="mr-2" /> Save Resource</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
