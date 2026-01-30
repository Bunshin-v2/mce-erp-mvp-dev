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
  user_id text, -- Clerk User ID
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledgment_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_doc_versions_document ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_versions_hash ON document_versions(requirements_hash);
CREATE INDEX IF NOT EXISTS idx_change_events_document ON document_change_events(document_id);
CREATE INDEX IF NOT EXISTS idx_change_events_impact ON document_change_events(impact_level);
CREATE INDEX IF NOT EXISTS idx_ack_document ON document_acknowledgments(document_id);

-- Enable RLS
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_change_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_acknowledgments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY doc_versions_read ON document_versions
  FOR SELECT USING (
    get_user_tier() IN ('L2', 'L3', 'L4')
  );

CREATE POLICY doc_versions_insert ON document_versions
  FOR INSERT WITH CHECK (
    get_user_tier() IN ('L2', 'L3', 'L4')
  );

CREATE POLICY change_events_read ON document_change_events
  FOR SELECT USING (
    get_user_tier() IN ('L3', 'L4')
  );

CREATE POLICY acknowledgments_read ON document_acknowledgments
  FOR SELECT USING (
    get_user_tier() IN ('L3', 'L4')
  );

-- Function to calculate requirements hash (using pgcrypto)
CREATE OR REPLACE FUNCTION calculate_requirements_hash(req_text TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
  RETURN encode(digest(req_text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-version documents
CREATE OR REPLACE FUNCTION document_auto_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only version if title/category changed
  IF OLD.title IS DISTINCT FROM NEW.title
    OR OLD.category IS DISTINCT FROM NEW.category
  THEN
    INSERT INTO document_versions (
      document_id,
      version_number,
      requirements_text,
      requirements_hash
    )
    SELECT
      NEW.id,
      COALESCE(MAX(version_number), 0) + 1,
      COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.category::text, ''),
      calculate_requirements_hash(COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.category::text, ''))
    FROM document_versions
    WHERE document_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documents_version_trigger ON documents;
CREATE TRIGGER documents_version_trigger
AFTER UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION document_auto_version();

-- Enable pgcrypto for hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;
