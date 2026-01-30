import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// Helper to calculate SHA256 hash
function calculateHash(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

// Helper to extract requirements from text (simple pattern matching)
function extractRequirements(text: string): Record<string, any> {
  const requirements: Record<string, any> = {};

  // Extract budget
  const budgetMatch = text.match(/budget[:\s]*\$?([\d,]+)/i);
  if (budgetMatch) requirements.budget = budgetMatch[1];

  // Extract timeline
  const timelineMatch = text.match(/timeline[:\s]*([\w\s]+)/i);
  if (timelineMatch) requirements.timeline = timelineMatch[1].trim();

  // Extract scope
  const scopeMatch = text.match(/scope[:\s]*([\w\s]+)/i);
  if (scopeMatch) requirements.scope = scopeMatch[1].trim();

  // Extract specifications
  const specsMatch = text.match(/specifications?[:\s]*([\w\s,]+)/i);
  if (specsMatch) requirements.specifications = specsMatch[1].trim();

  return requirements;
}

// Helper to detect changes between requirement objects
function detectChanges(
  oldReqs: Record<string, any>,
  newReqs: Record<string, any>
): Array<{
  type: string;
  field: string;
  oldValue: string;
  newValue: string;
  impact: string;
}> {
  const changes: Array<{
    type: string;
    field: string;
    oldValue: string;
    newValue: string;
    impact: string;
  }> = [];

  const allKeys = new Set([...Object.keys(oldReqs), ...Object.keys(newReqs)]);

  allKeys.forEach((key) => {
    const oldVal = oldReqs[key]?.toString() || '';
    const newVal = newReqs[key]?.toString() || '';

    if (oldVal !== newVal) {
      // Determine impact level based on field
      const impactMap: Record<string, string> = {
        budget: 'CRITICAL',
        scope: 'CRITICAL',
        timeline: 'CRITICAL',
        requirements: 'HIGH',
        specifications: 'HIGH',
      };

      changes.push({
        type: oldVal === '' ? 'ADDED' : newVal === '' ? 'DELETED' : 'MODIFIED',
        field: key,
        oldValue: oldVal,
        newValue: newVal,
        impact: impactMap[key] || 'MEDIUM',
      });
    }
  });

  return changes;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const { requirements_text, auto_acknowledge } = await request.json();

    if (!requirements_text) {
      return NextResponse.json(
        { error: 'requirements_text is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current document
    const { data: currentDoc, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !currentDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Get previous version
    const { data: prevVersion } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const newHash = calculateHash(requirements_text);
    const previousHash = prevVersion?.requirements_hash;

    // If hashes match, no changes detected
    if (previousHash && newHash === previousHash) {
      return NextResponse.json({
        has_changes: false,
        message: 'No requirement changes detected',
      });
    }

    // Extract and compare requirements
    const oldReqs = prevVersion
      ? (prevVersion.requirements_json || extractRequirements(prevVersion.requirements_text || ''))
      : {};
    const newReqs = extractRequirements(requirements_text);
    const changes = detectChanges(oldReqs, newReqs);

    // Determine highest impact level
    const impactLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const highestImpact =
      changes.length > 0
        ? impactLevels[
            Math.max(
              ...changes.map((c) => impactLevels.indexOf(c.impact))
            )
          ]
        : 'LOW';

    const hasCriticalChanges = changes.some((c) => c.impact === 'CRITICAL');

    // Create change events in database
    for (const change of changes) {
      await supabase.from('document_change_events').insert({
        document_id: documentId,
        previous_version: prevVersion?.version_number,
        current_version: (prevVersion?.version_number || 0) + 1,
        change_type: change.type,
        field_changed: change.field,
        old_value: change.oldValue,
        new_value: change.newValue,
        impact_level: change.impact,
      });
    }

    // Record new version
    await supabase.from('document_versions').insert({
      document_id: documentId,
      version_number: (prevVersion?.version_number || 0) + 1,
      requirements_text,
      requirements_hash: newHash,
      requirements_json: newReqs
    });

    return NextResponse.json({
      has_changes: changes.length > 0,
      changes,
      highest_impact: highestImpact,
      has_critical_changes: hasCriticalChanges,
      requires_acknowledgment: hasCriticalChanges,
      previous_hash: previousHash,
      new_hash: newHash
    });
  } catch (error: any) {
    logger.error('DELTA_DETECTION_ERROR', error);
    return NextResponse.json(
      { error: error.message || 'Delta detection failed' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const supabase = await createClient();

    // Get unacknowledged change events for this document
    const { data: changes, error: changesError } = await supabase
      .from('document_change_events')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (changesError) throw changesError;

    // Get acknowledgments
    const { data: acks, error: acksError } = await supabase
      .from('document_acknowledgments')
      .select('*')
      .eq('document_id', documentId);

    if (acksError) throw acksError;

    const ackedChangeIds = new Set((acks || []).map((a) => a.change_event_id));
    const unackedChanges = (changes || []).filter(
      (c) => !ackedChangeIds.has(c.id)
    );

    const hasCritical = unackedChanges.some((c) => c.impact_level === 'CRITICAL');

    return NextResponse.json({
      document_id: documentId,
      changes: unackedChanges,
      has_critical_changes: hasCritical,
      requires_acknowledgment: hasCritical,
      unacknowledged_count: unackedChanges.length,
      acknowledged_count: (acks || []).length,
    });
  } catch (error: any) {
    logger.error('DELTA_INFO_FETCH_ERROR', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve delta information' },
      { status: 500 }
    );
  }
}
