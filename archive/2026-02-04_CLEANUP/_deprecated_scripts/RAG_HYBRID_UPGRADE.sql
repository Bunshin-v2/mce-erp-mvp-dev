-- RAG HYBRID UPGRADE (v2.0 Compliance)
-- Ensuring table existence and adding Hybrid Search capabilities.

-- 0. CRITICAL: Enable Extensions
-- This fixes the "type vector does not exist" error.
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure the base table exists (in case rag_setup.sql wasn't run)
CREATE TABLE IF NOT EXISTS public.document_embeddings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
    content text,
    metadata jsonb DEFAULT '{}'::jsonb,
    embedding vector(1536), 
    created_at timestamptz DEFAULT now()
);

-- 2. Add Full Text Search Column (Auto-generated from content)
ALTER TABLE public.document_embeddings 
ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

-- 3. Create Index for FTS
CREATE INDEX IF NOT EXISTS document_embeddings_fts_idx ON public.document_embeddings USING GIN (fts);

-- 4. Hybrid Search Function (Keyword + Vector)
-- SECURITY: INVOKER (Respects RLS)
CREATE OR REPLACE FUNCTION match_documents_hybrid (
  query_embedding vector(1536),
  query_text text,
  match_threshold float,
  match_count int,
  full_text_weight float DEFAULT 0.4,
  vector_weight float DEFAULT 0.6
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY INVOKER 
AS $$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.document_id,
    de.content,
    de.metadata,
    (
      -- Handle cases where embedding might be null (graceful degradation)
      COALESCE((1 - (de.embedding <=> query_embedding)), 0) * vector_weight +
      -- Keyword rank
      (ts_rank_cd(de.fts, websearch_to_tsquery('english', query_text)) / (1 + ts_rank_cd(de.fts, websearch_to_tsquery('english', query_text)))) * full_text_weight
    )::float as similarity
  FROM document_embeddings de
  WHERE 
    -- If we have an embedding, check threshold. If not, rely on keyword match > 0
    (query_embedding IS NULL OR (1 - (de.embedding <=> query_embedding)) > match_threshold)
    OR (ts_rank_cd(de.fts, websearch_to_tsquery('english', query_text)) > 0)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
