-- System Architecture Prompts for MCE Assistant Context

CREATE TABLE IF NOT EXISTS system_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('architecture', 'feature', 'workflow', 'reference')),
  version text NOT NULL DEFAULT '1.0',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_prompts_category ON system_prompts(category);
CREATE INDEX IF NOT EXISTS idx_system_prompts_active ON system_prompts(is_active);

-- Seed initial architecture prompts
INSERT INTO system_prompts (prompt_key, title, content, category)
VALUES
  ('p050_tasks', 'Tasks Suite Implementation', 'Task management using Kanban, todo tracking, and deadline management', 'feature'),
  ('p080_rag', 'RAG Hybrid Retrieval', 'Hybrid BM25 + Vector search with citation and evidence-based responses', 'architecture'),
  ('p095_agents', 'AI Agent Console', 'Automated agent patterns for task processing and workflow automation', 'feature'),
  ('p040_tenders', 'Tender Management & Win Probability', 'Tender intake, kanban workflow, and probability calculations', 'feature'),
  ('p070_documents', 'Document Management System', 'DMS with versioning, storage, and compliance tracking', 'feature'),
  ('p090_reports', 'Reports & Custom Builder', 'Custom report builder with export and safety validation', 'feature'),
  ('p060_notifications', 'Notifications & Signal Deduplication', 'Real-time notifications with sweep and deduplication', 'feature'),
  ('p010_rbac', 'RBAC & RLS Foundation', 'Role-based access control and row-level security', 'architecture')
ON CONFLICT (prompt_key) DO NOTHING;
