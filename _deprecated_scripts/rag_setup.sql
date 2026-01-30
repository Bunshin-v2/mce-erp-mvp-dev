-- MODULE 9: RAG & VECTOR SEARCH INFRASTRUCTURE
-- Purpose: Enable semantic search over document content

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Embeddings Table
CREATE TABLE IF NOT EXISTS public.document_embeddings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
    content text, -- The raw text chunk
    embedding vector(1536), -- 1536 dims for OpenAI/Supabase standard
    created_at timestamptz DEFAULT now()
);

-- 3. Search Function (Semantic Search)
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.document_id,
    document_embeddings.content,
    1 - (document_embeddings.embedding <=> query_embedding) as similarity
  FROM document_embeddings
  WHERE 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. RLS for Embeddings
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read Embeddings" ON public.document_embeddings FOR SELECT TO authenticated USING (true);
