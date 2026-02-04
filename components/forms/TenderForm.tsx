import React, { useState } from 'react';
import { X, Save, Loader2, Gavel, FileText, Building2, DollarSign, Activity } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { GlassPanel } from '../ui/GlassPanel';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';

interface TenderFormProps {
  onClose: () => void;
  onSuccess: (tender?: any) => void;
}

export const TenderForm: React.FC<TenderFormProps> = ({ onClose, onSuccess }) => {
  const { getClient } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    value: '',
    probability: 'Medium',
    status: 'Preparation'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const client = await getClient();
      const { data, error } = await (client
        .from('tenders' as any) as any)
        .insert([{
          ...formData,
          value: parseFloat(formData.value) || 0
        }])
        .select()
        .single();

      if (error) throw error;
      onSuccess(data);
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <GlassPanel variant="elevated" className="w-full max-w-lg overflow-hidden border-white/10 shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[var(--surface-base)]/50">
          <div className="flex items-center space-x-2">
            <Gavel size={18} className="text-[var(--color-info)]" />
            <h2 className="text-sm font-bold italic text-white tracking-widest font-brand">New Business Opportunity</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <GlassInput
            label="Tender Title"
            required
            placeholder="e.g. Al Reem Island Bridge Design"
            icon={FileText}
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />

          <GlassInput
            label="Client"
            required
            placeholder="e.g. Aldar Properties"
            icon={Building2}
            value={formData.client}
            onChange={e => setFormData({ ...formData, client: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-6">
            <GlassInput
              label="Estimated Value (AED)"
              type="number"
              icon={DollarSign}
              value={formData.value}
              onChange={e => setFormData({ ...formData, value: e.target.value })}
            />

            <div className="space-y-1.5 w-full">
              <label className="text-[10px] font-bold italic text-zinc-500 tracking-widest font-brand ml-1">
                Win Probability
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-white">
                  <Activity size={14} />
                </div>
                <select
                  className="flex h-10 w-full rounded-lg border bg-[var(--surface-layer)] pl-9 pr-3 py-2 text-sm text-zinc-200 border-[var(--surface-border)] hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--mce-primary)] focus-visible:border-[var(--mce-primary)] transition-all duration-300 font-sans appearance-none"
                  value={formData.probability}
                  onChange={e => setFormData({ ...formData, probability: e.target.value })}
                >
                  <option className="bg-zinc-950">High</option>
                  <option className="bg-zinc-950">Medium</option>
                  <option className="bg-zinc-950">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
            <GlassButton
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
              disabled={loading}
            >
              <Save size={14} className="mr-2" />
              Publish Tender
            </GlassButton>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
};