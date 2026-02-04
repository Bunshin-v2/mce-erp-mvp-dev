import React, { useState } from 'react';
import { X, Save, Loader2, Building2, MapPin, Receipt, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GlassPanel } from '../ui/GlassPanel';
import { GlassInput } from '../ui/GlassInput';
import { GlassButton } from '../ui/GlassButton';

interface ProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    PROJECT_NAME: '',
    PROJECT_CODE: '',
    CLIENT_NAME: '',
    PROJECT_LOCATION_CITY: '',
    PROJECT_STATUS: 'Active',
    CONTRACT_VALUE_EXCL_VAT: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects_master')
        .insert([{
          ...formData,
          CONTRACT_VALUE_EXCL_VAT: parseFloat(formData.CONTRACT_VALUE_EXCL_VAT) || 0,
          COMPLETION_PERCENT: 0
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <GlassPanel variant="elevated" className="w-full max-w-2xl overflow-hidden shadow-2xl border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[var(--surface-base)]/50">
          <div className="flex items-center space-x-2">
            <Building2 size={18} className="text-[#00dc82]" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest font-brand">Initialize New Cluster</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">

          <div className="grid grid-cols-2 gap-6">
            <GlassInput
              label="Project Name"
              required
              placeholder="e.g. Nexus HQ Construction"
              icon={FileText}
              value={formData.PROJECT_NAME}
              onChange={e => setFormData({ ...formData, PROJECT_NAME: e.target.value })}
            />
            <GlassInput
              label="Client Entity"
              required
              placeholder="e.g. Aldar"
              icon={Building2}
              value={formData.CLIENT_NAME}
              onChange={e => setFormData({ ...formData, CLIENT_NAME: e.target.value })}
            />
          </div>

          <GlassInput
            label="Project Code (Optional)"
            placeholder="e.g. P-2024-001"
            value={formData.PROJECT_CODE}
            onChange={e => setFormData({ ...formData, PROJECT_CODE: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-6">
            <GlassInput
              label="Location (City)"
              placeholder="e.g. Abu Dhabi"
              icon={MapPin}
              value={formData.PROJECT_LOCATION_CITY}
              onChange={e => setFormData({ ...formData, PROJECT_LOCATION_CITY: e.target.value })}
            />
            <GlassInput
              label="Contract Value (AED)"
              type="number"
              icon={Receipt}
              value={formData.CONTRACT_VALUE_EXCL_VAT}
              onChange={e => setFormData({ ...formData, CONTRACT_VALUE_EXCL_VAT: e.target.value })}
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