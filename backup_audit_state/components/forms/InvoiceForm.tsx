import React, { useState } from 'react';
import { X, Save, Loader2, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface InvoiceFormProps {
  projects: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ projects, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_id: projects[0]?.id || '',
    invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    amount: '',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Draft'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .insert([{
          ...formData,
          amount: parseFloat(formData.amount) || 0
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
      <div className="bg-[var(--surface-layer)] border border-white/10 rounded-sm shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[var(--surface-base)]">
          <div className="flex items-center space-x-2">
            <DollarSign size={18} className="text-emerald-500" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Generate New Invoice</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Associate Project</label>
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
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Invoice Reference</label>
              <input 
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-sm text-white focus:border-[#33CCCC] outline-none font-mono"
                value={formData.invoice_number}
                onChange={e => setFormData({...formData, invoice_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Amount (AED)</label>
              <input 
                required
                type="number"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-sm text-white focus:border-[#33CCCC] outline-none font-mono"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Due Date</label>
              <input 
                type="date"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-sm text-white focus:border-[#33CCCC] outline-none [color-scheme:dark]"
                value={formData.due_date}
                onChange={e => setFormData({...formData, due_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</label>
              <select 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-sm px-4 py-2 text-sm text-white focus:border-[#33CCCC] outline-none"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option className="bg-zinc-950">Draft</option>
                <option className="bg-zinc-950">PM Review</option>
                <option className="bg-zinc-950">Finance Review</option>
                <option className="bg-zinc-950">Submitted</option>
              </select>
            </div>
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
              className="flex-1 px-4 py-2 bg-[#c21719] text-white rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-[#a01214] shadow-lg shadow-red-900/20 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
              Finalize Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};