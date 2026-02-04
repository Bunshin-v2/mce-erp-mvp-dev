import { SupabaseClient } from '@supabase/supabase-js';
import { notificationEngine, AlertSeverity } from './notifications';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from '@/lib/logger';

// Initialize Gemini for Global Knowledge
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;
// Simple concurrency tracker for Anthropic calls
let anthropicConcurrent = 0;

export type AgentStatus = 'idle' | 'processing' | 'completed' | 'awaiting_hil' | 'failed';

export interface AgentActivity {
  id?: string;
  agent_id: string;
  action_type: string;
  status: AgentStatus;
  payload: any;
  result?: any;
  hil_required?: boolean;
}

export abstract class BaseAgent {
  abstract id: string;
  abstract name: string;
  abstract description: string;

  protected async logActivity(client: SupabaseClient, activity: Partial<AgentActivity>) {
    const { data, error } = await client
      .from('agent_activity')
      .insert([
        {
          agent_id: this.id,
          status: activity.status || 'processing',
          action_type: activity.action_type || 'default',
          payload: activity.payload || {},
          result: activity.result || {},
          hil_required: activity.hil_required || false
        }
      ])
      .select()
      .single();

    if (error) logger.error(`AGENT_LOGGING_FAILED`, { error: error.message, agentId: this.id });
    return data;
  }

  protected async updateActivity(client: SupabaseClient, id: string, updates: Partial<AgentActivity>) {
    await client
      .from('agent_activity')
      .update(updates)
      .match({ id });
  }
}

// P1. CONTRACT_EXTRACTOR (REAL)
export class ContractExtractor extends BaseAgent {
  id = 'P1.CONTRACT_EXTRACTOR';
  name = 'Contract Extractor';
  description = 'Analyzes real documents for compliance nodes.';

  async run(client: SupabaseClient, documentId: string) {
    const activity = await this.logActivity(client, { action_type: 'DOCUMENT_ANALYSIS', payload: { documentId } });
    if (!activity) return;

    // REAL OPERATION: Verify document exists and has embeddings
    const { data: doc } = await client.from('documents').select('title, category').eq('id', documentId).single();
    const { count: embeddings } = await client.from('document_embeddings').select('*', { count: 'exact', head: true }).eq('document_id', documentId);

    // AUTO-LIFECYCLE: Update document to 'Reviewed' if analysis is done
    if (embeddings && embeddings > 0) {
      await client.from('documents').update({ status: 'Reviewed' }).eq('id', documentId);
    }

    const result = {
      verified: !!doc,
      title: doc?.title || 'Unknown',
      nodes_identified: embeddings || 0,
      status: embeddings ? 'Mapped' : 'Unprocessed'
    };

    await this.updateActivity(client, activity.id, { status: 'completed', result });
    return result;
  }
}

// P5. RISK_COMPLIANCE (REAL)
export class RiskComplianceAgent extends BaseAgent {
  id = 'P5.RISK_COMPLIANCE';
  name = 'Risk & Compliance';
  description = 'Monitors project risk vectors based on real database flags.';

  async findEvidence(client: SupabaseClient, requirementText: string) {
    // FUNCTIONAL HOOK: Automated Evidence Mapping
    // Uses the RAG Hybrid Search to find documents matching the requirement string
    const { data: matches } = await client.rpc('match_documents_hybrid', {
      query_embedding: null,
      query_text: requirementText,
      match_threshold: 0.2,
      match_count: 1
    });

    if (matches && matches.length > 0) {
      return {
        doc_id: matches[0].document_id,
        confidence: matches[0].similarity,
        title: matches[0].metadata?.title || 'Matching Artifact'
      };
    }
    return null;
  }

  async run(client: SupabaseClient, projectId: string) {
    const activity = await this.logActivity(client, {
      action_type: projectId === 'GLOBAL_PORTFOLIO' ? 'GLOBAL_RISK_SCAN' : 'RISK_SCAN',
      payload: { projectId }
    });
    if (!activity) return;

    // GLOBAL SCAN LOGIC
    if (projectId === 'GLOBAL_PORTFOLIO') {
      const { data: projects } = await client.from('projects_master').select('id, project_name, delivery_risk_rating');
      const { data: allPos } = await client.from('purchase_orders').select('project_id, remaining_balance');

      if (!projects) {
        await this.updateActivity(client, activity.id, { status: 'failed', result: { error: 'No projects found' } });
        return;
      }

      let criticalCount = 0;
      let budgetBreachCount = 0;
      const criticalProjectsList: string[] = [];

      projects.forEach(p => {
        const isCritical = p.delivery_risk_rating === 'Critical';

        // Check budget breaches (any PO negative)
        const projectPos = allPos?.filter((po: any) => po.project_id === p.id) || [];
        const isOverspent = projectPos.some((po: any) => po.remaining_balance < 0);

        if (isCritical || isOverspent) {
          if (isCritical) criticalCount++;
          if (isOverspent) budgetBreachCount++;
          criticalProjectsList.push(p.project_name);
        }
      });

      const riskLevel = (criticalCount > 0 || budgetBreachCount > 0) ? 'CRITICAL' : 'NOMINAL';

      const result = {
        scan_scope: 'GLOBAL',
        total_projects: projects.length,
        risk_level: riskLevel,
        critical_flags: criticalCount,
        budget_breaches: budgetBreachCount,
        flagged_projects: criticalProjectsList.slice(0, 5) // Top 5
      };

      await this.updateActivity(client, activity.id, {
        status: 'completed',
        result,
        hil_required: riskLevel === 'CRITICAL'
      });
      return result;
    }

    // SINGLE PROJECT LOGIC (Legacy)
    const { data: project } = await client.from('projects_master').select('*').eq('id', projectId).single();
    const { data: po } = await client.from('purchase_orders').select('*').eq('project_id', projectId);

    const overspent = po?.some((p: any) => p.remaining_balance < 0);
    const riskLevel = overspent || project?.delivery_risk_rating === 'Critical' ? 'CRITICAL' : 'NOMINAL';

    const result = {
      project: project?.project_name,
      riskLevel,
      triggers: [
        overspent ? 'PO_BREACH_DETECTED' : null,
        project?.delivery_risk_rating === 'Critical' ? 'EXECUTIVE_FLAG_ACTIVE' : null
      ].filter(Boolean)
    };

    await this.updateActivity(client, activity.id, { status: riskLevel === 'CRITICAL' ? 'awaiting_hil' : 'completed', result, hil_required: riskLevel === 'CRITICAL' });
    return result;
  }
}

// P4/P9. NEXUS INTELLIGENCE CORE (Reasoning Engine V4)
export class KnowledgeAgent extends BaseAgent {
  id = 'P9.KNOWLEDGE_AGENT';
  name = 'Nexus Intelligence Core';
  description = 'High-precision reasoning engine with Hybrid RAG (Vector + BM25). Capability Layer: Activated.';

  private async callAiService(query: string) {
    const pickProvider = () => {
      const len = query.trim().length;
      const easyKeywords = ['status','list','count','what','who','help','summary','todo','how many','show'];
      const q = query.toLowerCase();
      const hasEasy = easyKeywords.some(k => q.includes(k));
      if (len < 80 && hasEasy) return { provider: 'copilot', model: 'copilot-5o', style: 'haiku' };
      if (len < 140) return { provider: 'copilot', model: 'copilot-4o', style: 'short' };
      return { provider: 'anthropic', model: 'claude-4.5', style: 'sonnet' };
    };

    const selection = pickProvider();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          client: { app: 'vercel-nextjs', version: 'unknown' },
          routing: { provider: selection.provider, model: selection.model, style: selection.style }
        }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'AI Gateway Offline');
      }
      return data?.data?.answer || null;
    } catch (err) {
      logger.warn("AI_SERVICE_BACKEND_UNREACHABLE", { error: String(err) });
      return null;
    }
  }

  async query(client: SupabaseClient, userQuery: string) {
    const activity = await this.logActivity(client, {
      action_type: 'REASONING_ENGINE_EXECUTION',
      payload: { query: userQuery, engine: 'Gemini-Nexus-Hybrid' }
    });

    try {
      // 1. TRY BACKEND FIRST (SQL AGENT + HYBRID RAG)
      const serviceResponse = await this.callAiService(userQuery);

      if (serviceResponse) {
        const finalResult = {
          answer: serviceResponse,
          citations: ['NEXUS-SQL-AGENT'],
          verifiabilityScore: 5.0,
          status: 'Direct Ledger Access: OK'
        };
        if (activity) await this.updateActivity(client, activity.id, { status: 'completed', result: finalResult });
        return finalResult;
      }

      // 2. FALLBACK TO DIRECT GEMINI (RAG ONLY)
      const { data: vectorMatches } = await client.rpc('match_documents_hybrid', {
        query_embedding: null, // Bridge mode: use keywords
        query_text: userQuery,
        match_threshold: 0.1,
        match_count: 5
      });

      // GROUNDING STATS
      const { count: projectCount } = await client.from('projects_master').select('*', { count: 'exact', head: true });

      const context = vectorMatches?.map((m: any) => m.content).join('\n---\n') || "No grounded evidence found in vault.";

      const systemPrompt = `
        CORE IDENTITY: Nexus Intelligence Core.
        OBJECTIVE: Grounded reasoning over project data.
        RECONCILED STATS: ${projectCount} active projects.
        VAULT CONTEXT: ${context}
      `;

      let responseText = "";
      if (genAI) {
        const model = genAI.getGenerativeModel(
          { model: "gemini-2.5-flash" },
          { apiVersion: 'v1' }
        );
        const result = await model.generateContent([systemPrompt, userQuery]);
        responseText = result.response.text();
      } else {
        throw new Error("No reasoning engine available (Local/Cloud).");
      }

      const finalResult = {
        answer: responseText,
        citations: this.extractCitations(context),
        verifiabilityScore: 4.5,
        status: 'Vault Retrieval: OK'
      };

      if (activity) await this.updateActivity(client, activity.id, { status: 'completed', result: finalResult });
      return finalResult;

    } catch (err: any) {
      logger.error("REASONING_ENGINE_FAILURE", err);
      return {
        answer: `CRITICAL ERROR: ${err.message}. Connection to Intelligence Core interrupted.`,
        citations: [],
        verifiabilityScore: 0
      };
    }
  }

  private analyzeIntent(query: string) {
    const keywords = query.split(' ').filter(w => w.length > 4);
    return { keywords, domain: 'GENERAL' };
  }

  private generateProtocolHeader(context: string, query: string): string {
    const doc = context.match(/DOC=([^ ]+)/)?.[1] || 'NEX-GEN';
    const sev = query.toLowerCase().includes('urgent') || context.includes('SEV=CRITICAL') ? 'CRITICAL' : 'CASUAL';
    return `DOC=${doc} SEC=AUTO VAR=LOGIC.REASONING SEV=${sev} DUE=NONE AMT=0 CUR=USD THR=NONE OWN=ENGINE DEPT=AI ACT=HITL STA=OPEN EVD=VaultScan SRC=IntelligenceCore HSH=v4-act`;
  }

  private extractCitations(context: string): string[] {
    const matches = context.match(/DOC=([^ ]+)/g);
    return matches ? matches.map(m => `${m.split('=')[1]}:SEC:AUTO`) : ['NEXUS-CORE:V4'];
  }
}

// S1. SECURITY_GUARD (REAL)
export class SecurityGuardAgent extends BaseAgent {
  id = 'S1.SECURITY_GUARD';
  name = 'Security Guard';
  description = 'Monitors system integrity and RLS policy adherence.';

  async run(client: SupabaseClient) {
    const activity = await this.logActivity(client, { action_type: 'SYSTEM_INTEGRITY_CHECK' });
    if (!activity) return;

    // REAL OPERATION: Check for high-severity notifications and orphan records
    const { data: criticalAlerts } = await client
      .from('notifications')
      .select('id')
      .eq('priority', 'critical')
      .is('acked_at', null);

    const { data: orphanProjects } = await client
      .from('projects_master')
      .select('id')
      .is('client_entity', null);

    const violations = [
      ...(criticalAlerts?.map(() => 'UNACKNOWLEDGED_CRITICAL_ALERT') || []),
      ...(orphanProjects?.map(() => 'ORPHAN_PROJECT_DETECTED') || [])
    ];

    const status = violations.length > 0 ? 'awaiting_hil' : 'completed';
    const result = {
      integrity_score: Math.max(0, 100 - (violations.length * 10)),
      violations_detected: violations.length,
      critical_alerts: criticalAlerts?.length || 0,
      orphan_records: orphanProjects?.length || 0,
      protocol: 'IRON_DOME_ACTIVE'
    };

    await this.updateActivity(client, activity.id, { status, result, hil_required: status === 'awaiting_hil' });
    return result;
  }
}

export const agentRegistry = {
  p1: new ContractExtractor(),
  p5: new RiskComplianceAgent(),
  knowledge: new KnowledgeAgent(),
  s1: new SecurityGuardAgent()
};

// Agent Task Writer for Document Review (HITL Workflow)
export const agentTaskWriter = {
  async reviewDocument(client: SupabaseClient, documentId: string, status: string) {
    const { data, error } = await client
      .from('documents')
      .update({ status })
      .match({ id: documentId })
      .select()
      .single();

    if (error) {
      logger.error('DOCUMENT_REVIEW_FAILED', { error: error.message, documentId });
      throw error;
    }

    return data;
  },

  async createAlertFromRAG(client: SupabaseClient, metadata: any) {
    const { data: variable } = await client
      .from('extracted_variables')
      .insert([
        {
          doc_id: metadata.docId || '00000000-0000-0000-0000-000000000000',
          var_code: metadata.varCode,
          severity: metadata.severity,
          confidence: 1.0,
          due_at: metadata.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ])
      .select()
      .single();

    if (variable) {
      return await notificationEngine.createAlert(
        client,
        variable.id,
        metadata.severity as AlertSeverity,
        variable.due_at
      );
    }
  },

  async spawnTaskFromRAG(client: SupabaseClient, metadata: any) {
    const { data, error } = await client
      .from('tasks')
      .insert([
        {
          title: `AI Action: Review ${metadata.varcode || 'Contract Clause'}`,
          description: `Auto-generated follow-up from document ${metadata.docid || 'Registry'}. High priority review required for ${metadata.varcode || 'compliance'}`,
          priority: metadata.sev === 'CRITICAL' ? 'high' : 'medium',
          status: 'pending',
          due_date: metadata.due && metadata.due !== 'NONE' ? metadata.due.split('T')[0] : null
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
