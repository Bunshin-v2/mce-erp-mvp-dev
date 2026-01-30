-- RAG Versioning, Idempotent Ingestion, and Embedding Hardening

CREATE TABLE IF NOT EXISTS rag_index_versions (
  index_version_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL CHECK (status IN ('building','active','deprecated','failed')),

  embedding_model text NOT NULL,
  embedding_dim integer NOT NULL DEFAULT 1536,
  chunker_version text NOT NULL,
  prompt_template_version text NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz
);

-- Only one active index at a time
CREATE UNIQUE INDEX IF NOT EXISTS uniq_rag_index_versions_active
  ON rag_index_versions ((status))
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS rag_documents_index_state (
  document_id uuid NOT NULL,
  index_version_id uuid NOT NULL REFERENCES rag_index_versions(index_version_id) ON DELETE CASCADE,
  content_hash text NOT NULL,
  status text NOT NULL CHECK (status IN ('queued','processing','indexed','failed')),
  last_error jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (document_id, index_version_id, content_hash)
);

CREATE TABLE IF NOT EXISTS rag_ingest_jobs (
  job_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  tenant_id uuid,
  document_id uuid NOT NULL,
  index_version_id uuid NOT NULL REFERENCES rag_index_versions(index_version_id) ON DELETE CASCADE,
  content_hash text NOT NULL,

  status text NOT NULL CHECK (status IN ('queued','processing','succeeded','failed','dlq')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_error jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_rag_ingest_jobs_dedupe
  ON rag_ingest_jobs (document_id, index_version_id, content_hash);

CREATE INDEX IF NOT EXISTS idx_rag_ingest_jobs_next_attempt
  ON rag_ingest_jobs (status, next_attempt_at ASC);

-- Harden document_embeddings for versioned, idempotent chunk inserts
ALTER TABLE document_embeddings
  ADD COLUMN IF NOT EXISTS index_version_id uuid,
  ADD COLUMN IF NOT EXISTS chunk_hash text,
  ADD COLUMN IF NOT EXISTS embedding_model text;

-- Partial uniqueness to avoid breaking legacy rows
CREATE UNIQUE INDEX IF NOT EXISTS uniq_document_embeddings_chunk
  ON document_embeddings (document_id, index_version_id, chunk_hash)
  WHERE index_version_id IS NOT NULL AND chunk_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_document_embeddings_index_version
  ON document_embeddings (index_version_id);
