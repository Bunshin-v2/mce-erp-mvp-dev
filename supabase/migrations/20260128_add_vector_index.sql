-- Add missing vector index for RAG performance
-- Issue #11 from RAG Audit

-- NOTE: This requires the pgvector extension to be enabled
-- CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector
ON document_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Verify it was created
SELECT indexname, indexdef
FROM pg_indexes
WHERE indexname = 'idx_document_embeddings_vector';
