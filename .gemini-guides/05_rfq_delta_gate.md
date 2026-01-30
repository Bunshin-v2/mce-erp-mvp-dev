# Guide 5: Implement RFQ Delta Gate - Document Change Detection

**Objective:** Build a requirement change detection system that flags when RFQ/document requirements change between versions.

**Time Estimate:** 2-3 hours

**Prerequisites:**
- Guides 1-4 completed
- Node.js and npm installed
- `crypto` module available (built into Node.js)

---

## Phase 1: Database Schema for Document Versions

### Step 1.1: Create Migration

Create file: `supabase/migrations/20260129_rfq_delta_gate.sql`

Copy-paste entire content:

```sql
-- RFQ Delta Gate: Document Version Tracking
-- Created: 2026-01-29

-- document_versions: Track requirement changes over time
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  requirements_text TEXT,
  requirements_hash VARCHAR(64), -- SHA256 hash
  requirements_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  change_summary TEXT,
  UNIQUE(document_id, version_number)
);

-- document_change_events: Track when requirements changed
CREATE TABLE IF NOT EXISTS document_change_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  previous_version INTEGER,
  current_version INTEGER,
  change_type TEXT NOT NULL, -- 'ADDED', 'MODIFIED', 'DELETED', 'REORDERED'
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  impact_level TEXT DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- document_acknowledgments: Track delta gate approvals
CREATE TABLE IF NOT EXISTS document_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  change_event_id UUID REFERENCES document_change_events(id),
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledgment_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_doc_versions_document ON document_versions(document_id);
CREATE INDEX idx_doc_versions_hash ON document_versions(requirements_hash);
CREATE INDEX idx_change_events_document ON document_change_events(document_id);
CREATE INDEX idx_change_events_impact ON document_change_events(impact_level);
CREATE INDEX idx_ack_document ON document_acknowledgments(document_id);
CREATE INDEX idx_ack_acknowledged_by ON document_acknowledgments(acknowledged_by);

-- Enable RLS
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_change_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_acknowledgments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY doc_versions_read ON document_versions
  FOR SELECT USING (
    auth.jwt_asserts_role('L2', 'L3', 'L4') OR true
  );

CREATE POLICY doc_versions_insert ON document_versions
  FOR INSERT WITH CHECK (
    auth.jwt_asserts_role('L2', 'L3', 'L4')
  );

CREATE POLICY change_events_read ON document_change_events
  FOR SELECT USING (
    auth.jwt_asserts_role('L3', 'L4') OR true
  );

-- Function to calculate requirements hash
CREATE OR REPLACE FUNCTION calculate_requirements_hash(req_text TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
  -- Returns SHA256 hash of requirements text
  -- In practice, this would use pgcrypto extension
  RETURN encode(
    digest(req_text, 'sha256'),
    'hex'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to detect requirement changes
CREATE OR REPLACE FUNCTION detect_requirement_changes(
  p_document_id UUID,
  p_new_requirements TEXT
)
RETURNS TABLE (
  change_type TEXT,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  impact_level TEXT
) AS $$
DECLARE
  v_previous_hash VARCHAR(64);
  v_new_hash VARCHAR(64);
  v_previous_json JSONB;
  v_new_json JSONB;
BEGIN
  -- Get previous version
  SELECT requirements_hash, requirements_json
  INTO v_previous_hash, v_previous_json
  FROM document_versions
  WHERE document_id = p_document_id
  ORDER BY version_number DESC
  LIMIT 1;

  -- Calculate new hash
  v_new_hash := calculate_requirements_hash(p_new_requirements);

  -- If hashes match, no changes
  IF v_new_hash = v_previous_hash THEN
    RETURN;
  END IF;

  -- Try to parse as JSON for detailed diffing
  BEGIN
    v_new_json := p_new_requirements::JSONB;
  EXCEPTION WHEN OTHERS THEN
    -- If not JSON, treat as plain text comparison
    RETURN QUERY SELECT
      'MODIFIED'::TEXT,
      'requirements_text'::TEXT,
      SUBSTRING(COALESCE((v_previous_json->>'requirements')::TEXT, 'N/A'), 1, 100),
      SUBSTRING(p_new_requirements, 1, 100),
      'HIGH'::TEXT;
  END;

  -- Compare JSON requirements if possible
  IF v_new_json IS NOT NULL AND v_previous_json IS NOT NULL THEN
    -- Return detailed change information
    RETURN QUERY
    SELECT
      'MODIFIED'::TEXT,
      key::TEXT,
      value::TEXT,
      v_new_json->>key,
      CASE
        WHEN key IN ('total_budget', 'scope', 'timeline') THEN 'CRITICAL'::TEXT
        WHEN key IN ('requirements', 'specifications') THEN 'HIGH'::TEXT
        ELSE 'MEDIUM'::TEXT
      END
    FROM jsonb_each_text(v_previous_json)
    WHERE value <> v_new_json->>key
      OR (v_new_json->>key IS NULL AND value IS NOT NULL);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to record document version
CREATE OR REPLACE FUNCTION record_document_version(
  p_document_id UUID,
  p_requirements_text TEXT,
  p_created_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_version_number INTEGER;
  v_new_version_id UUID;
  v_requirements_hash VARCHAR(64);
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM document_versions
  WHERE document_id = p_document_id;

  -- Calculate hash
  v_requirements_hash := calculate_requirements_hash(p_requirements_text);

  -- Insert new version
  INSERT INTO document_versions (
    document_id,
    version_number,
    requirements_text,
    requirements_hash,
    created_by
  )
  VALUES (
    p_document_id,
    v_version_number,
    p_requirements_text,
    v_requirements_hash,
    p_created_by
  )
  RETURNING id INTO v_new_version_id;

  RETURN v_new_version_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-version documents
CREATE OR REPLACE FUNCTION document_auto_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only version if title/content changed
  IF OLD.title IS DISTINCT FROM NEW.title
    OR OLD.category IS DISTINCT FROM NEW.category
  THEN
    PERFORM record_document_version(
      NEW.id,
      COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.category, ''),
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_version_trigger
AFTER UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION document_auto_version();

-- Enable pgcrypto for hashing (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Step 1.2: Execute Migration

1. Open Supabase SQL Editor
2. Create new query
3. Paste the migration content above
4. Click **Run**

**Expected Output:**
```
Success. No rows returned.
```

### Step 1.3: Verify Tables

Run:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('document_versions', 'document_change_events', 'document_acknowledgments')
ORDER BY table_name;
```

**Expected Output:** 3 rows

---

## Phase 2: TypeScript Types

### Step 2.1: Update types.ts

Open `types.ts` and add:

```typescript
// ==================== RFQ DELTA GATE TYPES ====================

export type DeltaChangeType = 'ADDED' | 'MODIFIED' | 'DELETED' | 'REORDERED';
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  requirements_text?: string;
  requirements_hash: string;
  requirements_json?: any;
  created_at: string;
  created_by?: string;
  change_summary?: string;
}

export interface DocumentChangeEvent {
  id: string;
  document_id: string;
  previous_version?: number;
  current_version: number;
  change_type: DeltaChangeType;
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  impact_level: ImpactLevel;
  created_at: string;
}

export interface DocumentAcknowledgment {
  id: string;
  document_id: string;
  change_event_id?: string;
  acknowledged_by: string;
  acknowledged_at: string;
  acknowledgment_notes?: string;
  created_at: string;
}

export interface DeltaGateAlert {
  document_id: string;
  changes: DocumentChangeEvent[];
  has_critical_changes: boolean;
  highest_impact: ImpactLevel;
  requires_acknowledgment: boolean;
  acknowledgment_deadline?: string;
}
```

**Save the file.**

---

## Phase 3: API Route for Delta Detection

### Step 3.1: Create API Route

Create file: `app/api/documents/[id]/detect-delta/route.ts`

Copy-paste entire content:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { supabase } from '@/lib/supabase';

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
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;
    const { requirements_text, auto_acknowledge } = await request.json();

    if (!requirements_text) {
      return NextResponse.json(
        { error: 'requirements_text is required' },
        { status: 400 }
      );
    }

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
    const { data: prevVersion, error: versionError } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

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
      ? extractRequirements(prevVersion.requirements_text || '')
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

    // Auto-acknowledge if requested and no critical changes
    if (auto_acknowledge && !hasCriticalChanges) {
      await supabase.from('document_acknowledgments').insert({
        document_id: documentId,
        acknowledged_by: 'SYSTEM',
        acknowledged_at: new Date().toISOString(),
        acknowledgment_notes: 'Auto-acknowledged by system (low-impact changes)',
      });
    }

    return NextResponse.json({
      has_changes: changes.length > 0,
      changes,
      highest_impact: highestImpact,
      has_critical_changes: hasCriticalChanges,
      requires_acknowledgment: hasCriticalChanges,
      previous_hash: previousHash,
      new_hash: newHash,
      metadata: {
        old_requirements: oldReqs,
        new_requirements: newReqs,
      },
    });
  } catch (error: any) {
    console.error('Delta detection error:', error);
    return NextResponse.json(
      { error: error.message || 'Delta detection failed' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id;

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
      highest_impact:
        unackedChanges.length > 0
          ? (unackedChanges.reduce((max, c) => {
              const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
              return levels.indexOf(c.impact_level) >
                levels.indexOf(max.impact_level)
                ? c.impact_level
                : max.impact_level;
            }).impact_level as string)
          : 'NONE',
      requires_acknowledgment: hasCritical,
      unacknowledged_count: unackedChanges.length,
      acknowledged_count: (acks || []).length,
    });
  } catch (error: any) {
    console.error('Failed to retrieve delta info:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve delta information' },
      { status: 500 }
    );
  }
}
```

**Save the file.**

---

## Phase 4: React Component for Delta Gate Alert

### Step 4.1: Create DeltaGateAlert Component

Create file: `components/documents/DeltaGateAlert.tsx`

Copy-paste entire content:

```typescript
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X, ChevronDown } from 'lucide-react';
import { DocumentChangeEvent } from '../../types';

interface DeltaGateAlertProps {
  documentId: string;
  onAcknowledge: () => void;
  onClose: () => void;
  autoHide?: boolean;
}

export default function DeltaGateAlert({
  documentId,
  onAcknowledge,
  onClose,
  autoHide = false,
}: DeltaGateAlertProps) {
  const [deltaInfo, setDeltaInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    fetchDeltaInfo();
  }, [documentId]);

  const fetchDeltaInfo = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/detect-delta`);
      const data = await response.json();
      setDeltaInfo(data);

      // Auto-hide if no critical changes and autoHide enabled
      if (autoHide && !data.has_critical_changes) {
        setTimeout(() => onClose(), 3000);
      }
    } catch (error) {
      console.error('Failed to fetch delta info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    setAcknowledging(true);
    try {
      onAcknowledge();
      setDeltaInfo((prev: any) => ({
        ...prev,
        requires_acknowledgment: false,
      }));
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading) {
    return <div className="bg-gray-50 border border-gray-200 rounded p-4">Loading delta information...</div>;
  }

  if (!deltaInfo?.changes || deltaInfo.changes.length === 0) {
    return null;
  }

  const { changes, has_critical_changes, highest_impact, requires_acknowledgment } = deltaInfo;

  const impactColorMap: Record<string, string> = {
    CRITICAL: 'border-red-500 bg-red-50',
    HIGH: 'border-orange-500 bg-orange-50',
    MEDIUM: 'border-yellow-500 bg-yellow-50',
    LOW: 'border-blue-500 bg-blue-50',
  };

  const impactTextMap: Record<string, string> = {
    CRITICAL: 'text-red-800',
    HIGH: 'text-orange-800',
    MEDIUM: 'text-yellow-800',
    LOW: 'text-blue-800',
  };

  return (
    <div className={`border-l-4 rounded-r ${impactColorMap[highest_impact]} p-4 mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            {has_critical_changes ? (
              <AlertTriangle className={`w-5 h-5 ${impactTextMap[highest_impact]}`} />
            ) : (
              <CheckCircle className="w-5 h-5 text-blue-600" />
            )}
          </div>

          <div className="flex-1">
            <h3 className={`font-semibold ${impactTextMap[highest_impact]}`}>
              {has_critical_changes ? 'Critical Requirements Change' : 'Requirements Updated'}
            </h3>

            <p className={`text-sm mt-1 ${impactTextMap[highest_impact]}`}>
              {changes.length} change{changes.length !== 1 ? 's' : ''} detected
              {requires_acknowledgment && ' - Acknowledgment required'}
            </p>

            {expanded && (
              <div className="mt-3 space-y-2">
                {changes.map((change: DocumentChangeEvent, idx: number) => (
                  <div
                    key={idx}
                    className={`text-sm p-2 rounded border ${
                      change.impact_level === 'CRITICAL' ? 'bg-red-100 border-red-300' :
                      change.impact_level === 'HIGH' ? 'bg-orange-100 border-orange-300' :
                      change.impact_level === 'MEDIUM' ? 'bg-yellow-100 border-yellow-300' :
                      'bg-blue-100 border-blue-300'
                    }`}
                  >
                    <div className="font-medium">
                      {change.field_changed}: {change.change_type}
                    </div>
                    {change.old_value && (
                      <div className="text-xs">
                        From: <span className="font-mono">{change.old_value}</span>
                      </div>
                    )}
                    {change.new_value && (
                      <div className="text-xs">
                        To: <span className="font-mono">{change.new_value}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-black/5 rounded"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {requires_acknowledgment && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleAcknowledge}
            disabled={acknowledging}
            className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {acknowledging ? 'Acknowledging...' : 'Acknowledge Changes'}
          </button>
          <button
            onClick={onClose}
            className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
```

**Save the file.**

### Step 4.2: Integrate into DocumentDetail

Update file: `components/documents/DocumentDetail.tsx`

Find the main render and add near the top (after header):

```typescript
import DeltaGateAlert from './DeltaGateAlert';

// Inside render:
<DeltaGateAlert
  documentId={document.id}
  onAcknowledge={() => {
    // Handle acknowledgment
    console.log('Changes acknowledged');
  }}
  onClose={() => {
    // Handle close
  }}
/>
```

---

## Phase 5: Testing

### Step 5.1: Test Delta Detection Manually

1. Open Supabase SQL Editor
2. Run:

```sql
-- Insert a test document
INSERT INTO documents (title, category, status)
VALUES ('RFQ-2026-001', 'CONTRACT', 'Review')
RETURNING id;

-- Copy the returned ID, then:
SELECT calculate_requirements_hash('Budget: $500,000, Timeline: 6 months');
```

### Step 5.2: Test API Endpoint

Using curl or Postman:

```bash
curl -X POST http://localhost:3000/api/documents/{document_id}/detect-delta \
  -H "Content-Type: application/json" \
  -d '{
    "requirements_text": "Budget: $600,000, Timeline: 8 months, Scope: Expanded",
    "auto_acknowledge": false
  }'
```

**Expected Response:**
```json
{
  "has_changes": true,
  "changes": [
    {
      "type": "MODIFIED",
      "field": "budget",
      "oldValue": "$500,000",
      "newValue": "$600,000",
      "impact": "CRITICAL"
    }
  ],
  "highest_impact": "CRITICAL",
  "has_critical_changes": true,
  "requires_acknowledgment": true
}
```

---

## Success Criteria

- [ ] All 3 database tables created
- [ ] API route `/api/documents/[id]/detect-delta` functional
- [ ] Delta detection correctly identifies changes
- [ ] Component renders alerts properly
- [ ] Can acknowledge changes
- [ ] Change history persists in database

---

## Next Steps

1. Proceed to **Guide 6: Validation Framework**
2. Then **Guide 7: Performance Polish**
3. Finally **Guide 8: Production Deployment**

---

**TROUBLESHOOTING:**

If hashing fails:
- Ensure `pgcrypto` extension enabled in Supabase
- Check that `create_hash()` function works in SQL Editor

If API returns 404:
- Verify document exists in database
- Check document ID format (should be UUID)

If changes not detected:
- Verify requirements text format
- Check extracted requirements in API response
