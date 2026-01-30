import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Share2, CheckCircle2, Calendar, DollarSign, Edit2, Check, Activity, Clock, ShieldAlert, Building2, MapPin, Receipt, TrendingUp, AlertTriangle } from 'lucide-react';
import { Watermark } from '../Watermark';
import { supabase } from '../../lib/supabase';
import { GlassPanel } from '../ui/GlassPanel';
import { GlassButton } from '../ui/GlassButton';
import { GlassInput } from '../ui/GlassInput';
import { ProjectTimeline } from './ProjectTimeline';
import { FinancialSummary } from './FinancialSummary';
import { Badge } from '../ui/Badge';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProject, setEditedProject] = useState<any>(null);

  useEffect(() => {
    const fetchProject = async () => {
      const { data } = await supabase
        .from('projects_master')
        .select('*')
        .eq('id', projectId)
        .single();

      if (data) setProject(data);

      setMilestones([
        { id: 1, title: 'Schematic Design Approval', date: '2026-02-15', status: 'Completed' },
        { id: 2, title: 'Detailed Design Submission', date: '2026-04-10', status: 'In Progress' },
        { id: 3, title: 'Authority Permitting', date: '2026-05-20', status: 'Pending' },
      ]);

      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  if (loading) return <div className="p-8 text-center text-xs text-zinc-500">Loading...</div>;
  if (!project) return <div className="p-8 text-center text-sm text-rose-500">Not found</div>;

  const handleEditStart = () => {
    setIsEditMode(true);
    setEditedProject({ ...project });
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('projects_master')
        .update(editedProject)
        .eq('id', projectId);
      if (error) throw error;
      setProject(editedProject);
      setIsEditMode(false);
    } catch (err: any) {
      console.error('Save error:', err);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedProject(null);
  };

  const FormField = ({ label, fieldKey, value }: any) => (
    <div>
      <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block mb-1.5 font-brand">{label}</label>
      {isEditMode ? (
        <GlassInput
          value={editedProject?.[fieldKey] || ''}
          onChange={(e) => setEditedProject({ ...editedProject, [fieldKey]: e.target.value })}
        />
      ) : (
        <div className="px-3 py-2 bg-[var(--surface-base)]/40 border border-white/5 rounded-lg text-xs text-zinc-300 font-medium font-mono">
          {value || '-'}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 relative">
      {/* Document Watermark */}
      <Watermark opacity={0.04} text="MORGAN" />

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="matte-elevated border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-semibold text-white">Share Project</h2>
              <button onClick={() => setShowShareModal(false)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-4">Generate a secure link for stakeholders to track progress.</p>
            <button className="w-full px-4 py-2.5 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors text-sm">
              Generate Link
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <GlassButton variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={16} />
            </GlassButton>
            <div className="flex items-center gap-6">
              {isEditMode ? (
                <div className="space-y-2 min-w-[300px]">
                  <GlassInput
                    value={editedProject?.project_name || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, project_name: e.target.value })}
                    placeholder="Project Name"
                    className="font-bold text-lg"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5 font-brand">Project Identity</span>
                    <h1 className="text-xl font-bold text-white leading-tight font-display tracking-tight">{project.project_name}</h1>
                  </div>

                  <div className="h-8 w-px bg-white/10 hidden md:block"></div>

                  <div className="hidden md:flex items-center gap-6">
                    {project.project_code && (
                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5 font-brand">Code</span>
                        <p className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">{project.project_code}</p>
                      </div>
                    )}

                    {(project.id || project.client_entity_uid) && (
                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5 font-brand">System IDs</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="info">PID: {project.id.slice(0, 6)}</Badge>
                          {project.client_entity_uid && <Badge variant="info">CID: {project.client_entity_uid.slice(0, 6)}</Badge>}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditMode ? (
              <>
                <GlassButton variant="primary" size="sm" onClick={handleSave}>
                  <Check size={14} className="mr-2" /> Save Changes
                </GlassButton>
                <GlassButton variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </GlassButton>
              </>
            ) : (
              <>
                <GlassButton variant="secondary" size="sm" onClick={handleEditStart}>
                  <Edit2 size={14} className="mr-2" /> Edit
                </GlassButton>
                <GlassButton variant="secondary" size="sm" onClick={() => setShowShareModal(true)}>
                  <Share2 size={14} className="mr-2" /> Share
                </GlassButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">

        {/* Top KPI Strip */}
        <div className="grid grid-cols-4 gap-4">
          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-brand">Execution Maturity</span>
              <Activity size={14} className="text-[#00dc82]" />
            </div>
            <div className="flex items-end gap-2">
              {isEditMode ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editedProject?.completion_percent || 0}
                    onChange={(e) => setEditedProject({ ...editedProject, completion_percent: parseFloat(e.target.value) })}
                    className="w-16 bg-zinc-800 border border-emerald-500/50 rounded px-2 py-1 text-xl font-bold text-white focus:outline-none"
                  />
                  <span className="text-xl font-bold text-white">%</span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-white tracking-tighter font-mono">{project.completion_percent || 0}%</span>
              )}
              {!isEditMode && (
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-2 ml-2 overflow-hidden">
                  <div className="bg-[#00dc82] h-full transition-all duration-1000" style={{ width: `${project.completion_percent || 0}%` }} />
                </div>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-brand">Contract Value</span>
              <DollarSign size={14} className="text-emerald-500" />
            </div>
            <div className="flex items-center">
              {isEditMode ? (
                <input
                  type="number"
                  value={editedProject?.contract_value_excl_vat || 0}
                  onChange={(e) => setEditedProject({ ...editedProject, contract_value_excl_vat: parseFloat(e.target.value) })}
                  className="w-full bg-zinc-800 border border-emerald-500/50 rounded px-2 py-1 text-xl font-bold text-white focus:outline-none"
                />
              ) : (
                <span className="text-3xl font-bold text-white tracking-tighter font-mono">
                  {(project.contract_value_excl_vat || 0).toLocaleString(undefined, { notation: 'compact', style: 'currency', currency: 'AED' })}
                </span>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-brand">Timeline Status</span>
              <Clock size={14} className="text-blue-500" />
            </div>
            <div className="flex flex-col">
              {isEditMode ? (
                <div className="space-y-2">
                  <select
                    value={editedProject?.project_status || 'Active'}
                    onChange={(e) => setEditedProject({ ...editedProject, project_status: e.target.value })}
                    className="w-full bg-zinc-800 border border-emerald-500/50 rounded px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Construction">Construction</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              ) : (
                <>
                  <span className="text-xl font-bold text-white tracking-tight">{project.project_status || 'Active'}</span>
                  {project.contract_duration && (
                    <span className="text-[10px] text-zinc-500 font-mono mt-1 font-bold">{project.contract_duration}</span>
                  )}
                </>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-brand">Risk Profile</span>
              <ShieldAlert size={14} className={project.delivery_risk_rating === 'Critical' ? 'text-rose-500' : 'text-zinc-500'} />
            </div>
            {isEditMode ? (
              <select
                value={editedProject?.delivery_risk_rating || 'Nominal'}
                onChange={(e) => setEditedProject({ ...editedProject, delivery_risk_rating: e.target.value })}
                className="w-full bg-zinc-800 border border-emerald-500/50 rounded px-2 py-1 text-sm font-bold text-white focus:outline-none"
              >
                <option value="Nominal">Nominal</option>
                <option value="Moderate">Moderate</option>
                <option value="Critical">Critical</option>
              </select>
            ) : (
              <Badge variant={project.delivery_risk_rating === 'Critical' ? 'danger' : 'success'}>
                {project.delivery_risk_rating || 'Nominal'}
              </Badge>
            )}
          </GlassPanel>
        </div>

        {/* Main Data Grid */}
        <div className="grid grid-cols-12 gap-8">

          {/* Left Column: Strategic & Commercial */}
          <div className="col-span-8 space-y-6">

            {/* Strategic Profile */}
            <GlassPanel variant="bordered" className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Building2 size={150} />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                <Building2 size={14} /> Strategic Profile
              </h3>

              <div className="grid grid-cols-2 gap-y-8 gap-x-12 relative z-10 form-grid-edit">
                <FormField label="Client Entity" fieldKey="client_name" value={project.client_name} />
                <FormField label="End User" fieldKey="end_client_name" value={project.end_client_name} />
                <FormField label="Project Location" fieldKey="project_location_city" value={project.project_location_city} />
                <FormField label="Project Type" fieldKey="project_type" value={project.project_type} />
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Scope of Work</label>
                  {isEditMode ? (
                    <textarea
                      value={editedProject?.scope_of_services_enum || ''}
                      onChange={(e) => setEditedProject({ ...editedProject, scope_of_services_enum: e.target.value })}
                      className="w-full bg-zinc-800/60 border border-emerald-500/50 rounded px-3 py-2 text-xs text-white min-h-[80px] focus:outline-none"
                    />
                  ) : (
                    <GlassPanel variant="base" intensity="low" className="p-4 rounded-xl border-dashed border-white/10">
                      <p className="text-zinc-400 leading-relaxed">
                        {project.scope_of_services_enum || 'Comprehensive Design & Construction Supervision Services'}
                      </p>
                    </GlassPanel>
                  )}
                </div>
              </div>
            </GlassPanel>

            {/* Commercial Framework */}
            <GlassPanel variant="bordered" className="p-8">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                <Receipt size={14} /> Commercial Framework
              </h3>

              <FinancialSummary
                metrics={[
                  { label: 'Certified (YTD)', value: project.contract_value_excl_vat * 0.45 || 0, color: 'blue', subtext: '45% of Contract' },
                  { label: 'Invoiced', value: project.contract_value_excl_vat * 0.40 || 0, color: 'emerald', subtext: '90% of Certified' },
                  { label: 'Received', value: project.contract_value_excl_vat * 0.35 || 0, color: 'emerald', subtext: 'Pending: 5%' },
                  { label: 'Retention', value: project.contract_value_excl_vat * 0.1 || 0, color: 'amber', subtext: 'Release: Q4 2026' }
                ]}
                className="mb-8"
              />

              <div className="grid grid-cols-3 gap-8">
                <FormField label="Contract Form" fieldKey="contract_form" value={project.contract_form} />
                <FormField label="Payment Terms" fieldKey="payment_terms_days" value={project.payment_terms_days ? `${project.payment_terms_days} Days` : '30 Days'} />
                <FormField label="VAT Rate" fieldKey="vat_rate_percent" value={project.vat_rate_percent ? `${project.vat_rate_percent}%` : '5%'} />
                <FormField label="Retention" fieldKey="retention_percent" value={project.retention_percent ? `${project.retention_percent}%` : '10%'} />
                <FormField label="Perf. Bond" fieldKey="performance_bond_percent" value={project.performance_bond_percent ? `${project.performance_bond_percent}%` : '10%'} />

                <div>
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block mb-1.5 font-brand">Liquidated Damages</label>
                  {isEditMode ? (
                    <select
                      value={editedProject?.ld_applicable ? 'true' : 'false'}
                      onChange={(e) => setEditedProject({ ...editedProject, ld_applicable: e.target.value === 'true' })}
                      className="w-full px-2.5 py-1.5 bg-zinc-800/60 border border-emerald-500/50 rounded text-xs text-white font-medium focus:outline-none"
                    >
                      <option value="true">Applicable</option>
                      <option value="false">N/A</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${project.ld_applicable ? 'bg-rose-500/10 text-rose-500' : 'bg-zinc-800 text-zinc-500 opacity-50'}`}>
                      {project.ld_applicable ? 'APPLICABLE' : 'N/A'}
                    </span>
                  )}
                </div>
              </div>
            </GlassPanel>

          </div>

          {/* Right Column: Timeline & Remarks */}
          <div className="col-span-4 space-y-6">

            {/* Execution Timeline (Gantt) */}
            <ProjectTimeline milestones={milestones} />


            {/* Executive Remarks */}
            <GlassPanel variant="base" className="p-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" /> Executive Remarks
              </h3>
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                {isEditMode ? (
                  <textarea
                    value={editedProject?.remarks || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, remarks: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-amber-500/30 rounded p-2 text-xs text-white focus:outline-none min-h-[80px]"
                    placeholder="Enter executive remarks..."
                  />
                ) : (
                  <p className="text-xs font-medium text-zinc-300 leading-relaxed italic">
                    "{project.remarks || 'No critical remarks logged for this period.'}"
                  </p>
                )}
              </div>
            </GlassPanel>

            {/* Team */}
            <GlassPanel variant="bordered" className="p-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Key Personnel</h3>
              <div className="space-y-3">
                {[
                  { role: 'Project Director', name: project.project_director },
                  { role: 'Commercial Manager', name: project.commercial_manager },
                  { role: 'HSE Lead', name: project.hse_lead }
                ].filter(p => isEditMode || p.name).map((person, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-white/5 transition-all hover:border-[var(--mce-primary)]/20 hover:bg-white/[0.03]">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{person.role}</span>
                    <span className={`text-[10px] font-bold ${!person.name ? 'text-zinc-600' : 'text-emerald-500'}`}>
                      {person.name ? person.name.toUpperCase() : ''}
                    </span>
                  </div>
                ))}
              </div>
            </GlassPanel>

          </div>
        </div>
      </div>

    </div>
  );
};
