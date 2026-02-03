import { SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from './logger';

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

export const riskIntelligence = {
  /**
   * Scans a project's documents for operational risks and sentiment friction.
   */
  async scanProjectRisk(client: SupabaseClient, projectId: string) {
    logger.info('STARTING_RISK_SCAN', { projectId });

    try {
      // 1. Get documents linked to this project
      const { data: docs } = await client
        .from('documents')
        .select('id, title, text_content')
        .eq('project_id', projectId);

      if (!docs || docs.length === 0) {
        return { riskScore: 0, factors: [], status: 'STABLE' };
      }

      // 2. Fetch relevant embeddings for "risk" keywords
      const { data: riskMatches } = await client.rpc('match_documents_hybrid', {
        query_embedding: null, // Keyword mode
        query_text: 'delay dispute penalty liquid damages safety violation non-payment',
        match_threshold: 0.1,
        match_count: 10
      });

      // Filter matches to only those belonging to this project
      const projectMatches = (riskMatches || []).filter((m: any) =>
        docs.some(d => d.id === m.document_id)
      );

      if (projectMatches.length === 0) {
        return { riskScore: 10, factors: ['No significant friction detected'], status: 'STABLE' };
      }

      // 3. Use Gemini to analyze the friction sentiment
      const context = projectMatches.map((m: any) => m.content).join('\n---\n');
      const systemPrompt = `
        Analyze the following document excerpts for a construction project. 
        Identify specific operational risks (delays, legal disputes, financial defaults).
        Rate the overall risk from 0-100.
        Output ONLY a JSON object: {"score": number, "factors": string[], "sentiment": "STABLE" | "WARNING" | "CRITICAL"}
      `;

      if (!genAI) throw new Error("AI Engine offline");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent([systemPrompt, context]);
      const responseText = result.response.text();

      // Clean potential markdown wrapper
      const jsonStr = responseText.replace(/```json|```/g, '').trim();
      const analysis = JSON.parse(jsonStr);

      logger.info('RISK_SCAN_COMPLETE', { projectId, score: analysis.score });

      return {
        riskScore: analysis.score,
        factors: analysis.factors,
        status: analysis.sentiment
      };

    } catch (err: any) {
      logger.error('RISK_SCAN_FAILED', { error: err.message, projectId });
      return { riskScore: 0, factors: ['Scan failed'], status: 'UNKNOWN' };
    }
  }
};
