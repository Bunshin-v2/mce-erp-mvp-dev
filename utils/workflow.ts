import { supabase } from '../lib/supabase';

export type EntityType = 'project' | 'tender';
export type WorkflowAction = 'approve' | 'reject' | 'submit' | 'complete' | 'cancel';

interface Transition {
  from: string;
  to: string;
  action: WorkflowAction;
  guard?: (entityId: string) => Promise<boolean>;
}

interface WorkflowDefinition {
  initial: string;
  transitions: Transition[];
}

const ProjectWorkflow: WorkflowDefinition = {
  initial: 'planning',
  transitions: [
    { from: 'planning', to: 'design', action: 'submit' },
    { from: 'design', to: 'tender', action: 'approve', guard: async (id) => checkDocuments(id, 'DESIGN_APPROVAL') },
    { from: 'tender', to: 'construction', action: 'approve', guard: async (id) => checkDocuments(id, 'CONTRACT_SIGNED') },
    { from: 'construction', to: 'completed', action: 'complete' },
    { from: 'planning', to: 'cancelled', action: 'cancel' },
    { from: 'design', to: 'cancelled', action: 'cancel' },
    { from: 'tender', to: 'cancelled', action: 'cancel' },
  ]
};

const TenderWorkflow: WorkflowDefinition = {
  initial: 'draft',
  transitions: [
    { from: 'draft', to: 'review', action: 'submit' },
    { from: 'review', to: 'submitted', action: 'approve', guard: async (id) => checkDocuments(id, 'TENDER_PACK') },
    { from: 'submitted', to: 'awarded', action: 'complete' },
    { from: 'submitted', to: 'lost', action: 'reject' },
    { from: 'review', to: 'draft', action: 'reject' }
  ]
};

// --- Guard Helpers ---

async function checkDocuments(entityId: string, docType: string): Promise<boolean> {
  // In a real app, this queries the 'documents' table for a linked doc of the specific type
  const { count } = await (supabase
    .from('documents' as any) as any)
    .select('*', { count: 'exact', head: true })
    .eq('category', docType) // Simplified check
    .or(`project_id.eq.${entityId},tender_id.eq.${entityId}`);

  return (count || 0) > 0;
}

// --- Engine ---

export const workflowEngine = {
  getDefinition(type: EntityType) {
    return type === 'project' ? ProjectWorkflow : TenderWorkflow;
  },

  getAvailableActions(type: EntityType, currentState: string): WorkflowAction[] {
    const def = this.getDefinition(type);
    return def.transitions
      .filter(t => t.from === currentState)
      .map(t => t.action);
  },

  async canTransition(type: EntityType, currentState: string, action: WorkflowAction, entityId: string): Promise<{ allowed: boolean; reason?: string }> {
    const def = this.getDefinition(type);
    const transition = def.transitions.find(t => t.from === currentState && t.action === action);

    if (!transition) {
      return { allowed: false, reason: 'Invalid action for current state.' };
    }

    if (transition.guard) {
      const passed = await transition.guard(entityId);
      if (!passed) {
        return { allowed: false, reason: `Guard failed: Missing required documents or approvals.` };
      }
    }

    return { allowed: true };
  },

  async executeTransition(type: EntityType, entityId: string, action: WorkflowAction) {
    // 1. Fetch current state
    const table = type === 'project' ? 'projects_master' : 'tenders';
    const stateField = type === 'project' ? 'project_status' : 'status';

    const { data: entity } = await (supabase.from(table as any) as any).select(stateField).eq('id', entityId).single();
    if (!entity) throw new Error('Entity not found');

    const currentState = entity[stateField]?.toLowerCase() || 'planning'; // Normalize

    // 2. Validate
    const check = await this.canTransition(type, currentState, action, entityId);
    if (!check.allowed) throw new Error(check.reason);

    // 3. Determine next state
    const def = this.getDefinition(type);
    const transition = def.transitions.find(t => t.from === currentState && t.action === action);

    if (!transition) throw new Error('Transition logic error'); // Should be caught by canTransition

    // 4. Update DB
    const { error } = await (supabase
      .from(table as any) as any)
      .update({ [stateField]: transition.to })
      .eq('id', entityId);

    if (error) throw error;

    return transition.to;
  }
};
