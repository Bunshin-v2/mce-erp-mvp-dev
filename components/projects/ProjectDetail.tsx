import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, X, Share2, CheckCircle2, Calendar, DollarSign, Edit2, Check, Activity, Clock, ShieldAlert, Building2, MapPin, Receipt, TrendingUp, AlertTriangle } from 'lucide-react';
import { Watermark } from '../Watermark';
import { useSupabase } from '../../hooks/useSupabase';
import { GlassPanel } from '../ui/GlassPanel';
import { GlassButton } from '../ui/GlassButton';
import { GlassInput } from '../ui/GlassInput';
import { ProjectTimeline } from './ProjectTimeline';
import { FinancialSummary } from './FinancialSummary';
import { Badge } from '../ui/Badge';
import { Text } from '../primitives';
import { workflowEngine, WorkflowAction } from '../../utils/workflow';
import { RagSyncButton } from '../ai/RagSyncButton';
import { useToast } from '@/lib/toast-context';
import { logger } from '../../lib/logger';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProject, setEditedProject] = useState<any>(null);
  const toast = useToast();

  const [availableActions, setAvailableActions] = useState<WorkflowAction[]>([]);
  const [processingAction, setProcessingAction] = useState<WorkflowAction | null>(null);

  const { getClient } = useSupabase();

  const fetchProject = useCallback(async () => {
    const client = await getClient();
    const { data } = await client
      .from('projects_master')
      .select('*')
      .eq('id', projectId)
      .single();

    if (data) {
      setProject(data);
      const actions = workflowEngine.getAvailableActions('project', data.project_status?.toLowerCase() || 'planning');
      setAvailableActions(actions);
    }

    setMilestones([
      { id: 1, title: 'Schematic Design Approval', date: '2026-02-15', status: 'Completed' },
      { id: 2, title: 'Detailed Design Submission', date: '2026-04-10', status: 'In Progress' },
      { id: 3, title: 'Authority Permitting', date: '2026-05-20', status: 'Pending' },
    ]);

    setLoading(false);
  }, [projectId, getClient]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleTransition = async (action: WorkflowAction) => {
    const prevStatus = project.project_status;
    setProcessingAction(action);

    // Optimistic Update
    setProject({ ...project, project_status: action });
    toast.info("Transition Initiated", `Moving project node to ${action.toUpperCase()}`);

    try {
      const newState = await workflowEngine.executeTransition('project', projectId, action);
      toast.success("Transition Successful", `Node state finalized as ${newState.toUpperCase()}`);
      await fetchProject();
    } catch (err: any) {
      // Rollback
      setProject({ ...project, project_status: prevStatus });
      toast.error("Transition Failed", err.message);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleEditStart = () => {
    setIsEditMode(true);
    setEditedProject({ ...project });
  };

  const handleSave = async () => {
    const prevProject = project;
    // Optimistic Update
    setProject(editedProject);
    setIsEditMode(false);
    toast.info("Saving Changes", "Synchronizing project node with registry...");

    try {
      const client = await getClient();
      const { error } = await client
        .from('projects_master')
        .update(editedProject)
        .eq('id', projectId);

      if (error) throw error;
      toast.success("Changes Persisted", "Project registry updated successfully.");
      logger.info('PROJECT_EDIT_SUCCESS', { id: projectId });
    } catch (err: any) {
      // Rollback
      setProject(prevProject);
      toast.error("Save Failed", "Could not sync changes to the vault.");
      logger.error('PROJECT_EDIT_FAILED', { error: err.message, id: projectId });
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditedProject(null);
  };

  if (loading) return <div className="p-8 text-center text-xs text-zinc-500">Loading...</div>;
  if (!project) return <div className="p-8 text-center text-sm text-rose-500">Not found</div>;

  const FormField = ({ label, fieldKey, value }: any) => (
    <div>
      <Text variant="gov-label" className="block mb-1.5 ml-1">{label}</Text>
      {isEditMode ? (
        <GlassInput
          value={editedProject?.[fieldKey] || ''}
          onChange={(e) => setEditedProject({ ...editedProject, [fieldKey]: e.target.value })}
        />
      ) : (
        <div className="px-3 py-2 bg-[var(--surface-base)]/40 border border-white/5 rounded-lg">
          <Text variant="mono" className="text-zinc-300">
            {value || '-'}
          </Text>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 relative">
      <Watermark opacity={0.04} text="MORGAN" />

      {showShareModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="matte-elevated border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <Text variant="h3" className="text-white">Share Project</Text>
              <button onClick={() => setShowShareModal(false)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <Text variant="caption" className="text-zinc-400 mb-4 block">Generate a secure link for stakeholders to track progress.</Text>
            <GlassButton className="w-full" variant="primary">
              Generate Link
            </GlassButton>
          </div>
        </div>
      )}

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
                    className="font-bold italic text-lg"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <Text variant="gov-label" color="secondary" className="block mb-0.5">Project Identity</Text>
                    <Text variant="h1" className="text-white">{project.project_name}</Text>
                  </div>
                  <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                  <div className="hidden md:flex items-center gap-6">
                    {project.project_code && (
                      <div>
                        <Text variant="gov-label" color="secondary" className="block mb-0.5">Code</Text>
                        <Text variant="mono" className="text-emerald-400 tracking-wider !text-[11px]">{project.project_code}</Text>
                      </div>
                    )}
                    <div>
                      <Text variant="gov-label" color="secondary" className="block mb-0.5">System IDs</Text>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">PID: {project.id.slice(0, 6)}</Badge>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditMode && (availableActions || []).map(action => (
              <GlassButton
                key={action}
                variant="primary"
                size="sm"
                onClick={() => handleTransition(action)}
                disabled={!!processingAction}
                className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50"
              >
                {processingAction === action ? 'Processing...' : action.toUpperCase()}
              </GlassButton>
            ))}

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
                <div className="w-px h-4 bg-white/10 mx-1"></div>
                <RagSyncButton
                  documentId={`project_${project.id}`}
                  data={project}
                  label="Sync to Brain"
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-4 gap-4">
          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Text variant="gov-label" color="secondary">Execution Maturity</Text>
              <Activity size={14} className="text-[var(--color-success)]" />
            </div>
            <div className="flex items-end gap-2">
              {isEditMode ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editedProject?.completion_percent || 0}
                    onChange={(e) => setEditedProject({ ...editedProject, completion_percent: parseFloat(e.target.value) })}
                    className="w-16 bg-zinc-800 border border-emerald-500/50 rounded px-2 py-1 text-xl font-bold italic text-white focus:outline-none font-sans"
                  />
                  <Text variant="gov-hero" className="text-white">%</Text>
                </div>
              ) : (
                <Text variant="gov-metric" className="text-white !text-3xl tracking-tighter">
                  {project.completion_percent || 0}%
                </Text>
              )}
              {!isEditMode && (
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-2 ml-2 overflow-hidden">
                  <div className="bg-[var(--color-success)] h-full transition-all duration-1000" style={{ width: `${project.completion_percent || 0}%` }} />
                </div>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Text variant="gov-label" color="secondary">Contract Value</Text>
              <DollarSign size={14} className="text-emerald-500" />
            </div>
            <div className="flex items-center">
              {isEditMode ? (
                <input
                  type="number"
                  value={editedProject?.contract_value_excl_vat || 0}
                  onChange={(e) => setEditedProject({ ...editedProject, contract_value_excl_vat: parseFloat(e.target.value) })}
                  className="w-full bg-zinc-800 border border-emerald-500/50 rounded px-2 py-1 text-xl font-bold italic text-white focus:outline-none font-sans"
                />
              ) : (
                <Text variant="gov-metric" className="text-white !text-3xl tracking-tighter">
                  {(project.contract_value_excl_vat || 0).toLocaleString(undefined, { notation: 'compact', style: 'currency', currency: 'AED' })}
                </Text>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Text variant="gov-label" color="secondary">Timeline Status</Text>
              <Clock size={14} className="text-blue-500" />
            </div>
            <div className="flex flex-col">
              {isEditMode ? (
                <div className="space-y-2">
                  <select
                    value={editedProject?.project_status || 'Active'}
                    onChange={(e) => setEditedProject({ ...editedProject, project_status: e.target.value })}
                    className="w-full bg-zinc-800 border border-emerald-500/50 rounded px-2 py-1 text-xs text-white focus:outline-none font-sans font-bold italic"
                  >
                    <option value="Active">Active</option>
                    <option value="Construction">Construction</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              ) : (
                <Text variant="gov-hero" className="text-white !text-xl">
                  {project.project_status || 'Active'}
                </Text>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Text variant="gov-label" color="secondary">Risk Profile</Text>
              <ShieldAlert size={14} className={project.delivery_risk_rating === 'Critical' ? 'text-rose-500' : 'text-zinc-500'} />
            </div>
            {isEditMode ? (
              <select
                value={editedProject?.delivery_risk_rating || 'Nominal'}
                onChange={(e) => setEditedProject({ ...editedProject, delivery_risk_rating: e.target.value })}
                className="w-full bg-zinc-800 border border-emerald-500/50 rounded px-2 py-1 text-sm font-bold italic text-white focus:outline-none font-sans"
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

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8 space-y-6">
            <GlassPanel variant="bordered" className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Building2 size={150} />
              </div>
              <Text variant="gov-header" className="text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                <Building2 size={14} /> Strategic Profile
              </Text>
              <div className="grid grid-cols-2 gap-y-8 gap-x-12 relative z-10">
                <FormField label="Client Entity" fieldKey="client_name" value={project.client_name} />
                <FormField label="End User" fieldKey="end_client_name" value={project.end_client_name} />
                <FormField label="Project Location" fieldKey="project_location_city" value={project.project_location_city} />
                <FormField label="Project Type" fieldKey="project_type" value={project.project_type} />
                <div className="col-span-2">
                  <Text variant="gov-label" color="secondary" className="block mb-1.5 ml-1">Scope of Work</Text>
                  {isEditMode ? (
                    <textarea
                      value={editedProject?.scope_of_services_enum || ''}
                      onChange={(e) => setEditedProject({ ...editedProject, scope_of_services_enum: e.target.value })}
                      className="w-full bg-zinc-800/60 border border-emerald-500/50 rounded px-3 py-2 text-xs text-white min-h-[80px] focus:outline-none font-sans font-bold italic"
                    />
                  ) : (
                    <GlassPanel variant="base" intensity="low" className="p-4 rounded-xl border-dashed border-white/10">
                      <Text variant="body" className="text-zinc-400">
                        {project.scope_of_services_enum || 'Comprehensive Design & Construction Supervision Services'}
                      </Text>
                    </GlassPanel>
                  )}
                </div>
              </div>
            </GlassPanel>

            <GlassPanel variant="bordered" className="p-8">
              <Text variant="gov-header" className="text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                <Receipt size={14} /> Commercial Framework
              </Text>
              <FinancialSummary
                metrics={[
                  { label: 'Certified (YTD)', value: (project.contract_value_excl_vat || 0) * 0.45, color: 'blue', subtext: '45% of Contract' },
                  { label: 'Invoiced', value: (project.contract_value_excl_vat || 0) * 0.40, color: 'emerald', subtext: '90% of Certified' },
                  { label: 'Received', value: (project.contract_value_excl_vat || 0) * 0.35, color: 'emerald', subtext: 'Pending: 5%' },
                  { label: 'Retention', value: (project.contract_value_excl_vat || 0) * 0.1, color: 'amber', subtext: 'Release: Q4 2026' }
                ]}
                className="mb-8"
              />
              <div className="grid grid-cols-3 gap-8">
                <FormField label="Contract Form" fieldKey="contract_form" value={project.contract_form} />
                <FormField label="Payment Terms" fieldKey="payment_terms_days" value={project.payment_terms_days ? `${project.payment_terms_days} Days` : '30 Days'} />
                <FormField label="VAT Rate" fieldKey="vat_rate_percent" value={project.vat_rate_percent ? `${project.vat_rate_percent}%` : '5%'} />
              </div>
            </GlassPanel>
          </div>

          <div className="col-span-4 space-y-6">
            <ProjectTimeline
              milestones={milestones}
              projectStartDate={project.start_date}
              projectEndDate={project.anticipated_date}
            />
            <GlassPanel variant="base" className="p-6">
              <Text variant="gov-header" className="text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" /> Executive Remarks
              </Text>
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                {isEditMode ? (
                  <textarea
                    value={editedProject?.remarks || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, remarks: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-amber-500/30 rounded p-2 text-xs text-white focus:outline-none min-h-[80px] font-sans font-bold italic"
                    placeholder="Enter executive remarks..."
                  />
                ) : (
                  <Text variant="caption" className="text-zinc-300 !text-xs leading-relaxed">
                    "{project.remarks || 'No critical remarks logged for this period.'}"
                  </Text>
                )}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
};
