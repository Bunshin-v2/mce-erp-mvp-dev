import React, { useState } from 'react';
import { X, Save, Loader2, Building2, MapPin, Receipt, FileText } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { GlassPanel } from '../ui/GlassPanel';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';
import { Text as UIText } from '../primitives/Text';

interface ProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, onSuccess }) => {
  const { getClient } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_name: '',
    project_code: '',
    client_name: '',
    project_location_city: '',
    project_status: 'Active',
    contract_value_excl_vat: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInternalError(null); // Clear previous errors

    try {
      const client = await getClient();
      const { error } = await (client
        .from('projects_master' as any) as any)
        .insert([{
          ...formData,
          contract_value_excl_vat: parseFloat(formData.contract_value_excl_vat) || 0,
          completion_percent: 0
        }]);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (err: any) {
      setInternalError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const [internalError, setInternalError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <GlassPanel variant="elevated" className="w-full max-w-2xl overflow-hidden shadow-2xl border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[var(--surface-base)]/50">
          <div className="flex items-center space-x-2">
            <Building2 size={18} className="text-[var(--color-success)]" />
            <UIText variant="h3" className="text-sm font-bold italic text-white tracking-widest font-brand">Initialize New Cluster</UIText>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">

          {internalError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-mono rounded-lg flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {internalError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <GlassInput
              label="Project Name"
              required
              placeholder="e.g. Nexus HQ Construction"
              icon={FileText}
              value={formData.project_name}
              onChange={e => setFormData({ ...formData, project_name: e.target.value })}
            />
            <GlassInput
              label="Client Entity"
              required
              placeholder="e.g. Aldar"
              icon={Building2}
              value={formData.client_name}
              onChange={e => setFormData({ ...formData, client_name: e.target.value })}
            />
          </div>

          <GlassInput
            label="Project Code (Optional)"
            placeholder="e.g. P-2024-001"
            value={formData.project_code}
            onChange={e => setFormData({ ...formData, project_code: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-6">
            <GlassInput
              label="Location (City)"
              placeholder="e.g. Abu Dhabi"
              icon={MapPin}
              value={formData.project_location_city}
              onChange={e => setFormData({ ...formData, project_location_city: e.target.value })}
            />
            <GlassInput
              label="Contract Value (AED)"
              type="number"
              icon={Receipt}
              value={formData.contract_value_excl_vat}
              onChange={e => setFormData({ ...formData, contract_value_excl_vat: e.target.value })}
            />
          </div>

          <div className="pt-4 flex space-x-3 border-t border-white/5 mt-6">
            <GlassButton
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Abort
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
              disabled={loading}
            >
              <Save size={14} className="mr-2" />
              Initialize Project
            </GlassButton>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
};