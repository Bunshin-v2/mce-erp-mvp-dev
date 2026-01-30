-- Stable, version-aware hybrid search RPC

CREATE OR REPLACE FUNCTION match_documents_hybrid (
  query_embedding vector(1536),
  query_text text,
  match_threshold float,
  match_count int,
  full_text_weight float DEFAULT 0.4,
  vector_weight float DEFAULT 0.6,
  index_version_id uuid DEFAULT NULL
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
      COALESCE((1 - (de.embedding <=> query_embedding)), 0) * vector_weight +
      (ts_rank_cd(de.fts, websearch_to_tsquery('english', query_text)) / (1 + ts_rank_cd(de.fts, websearch_to_tsquery('english', query_text)))) * full_text_weight
    )::float as similarity
  FROM document_embeddings de
  WHERE
    (index_version_id IS NULL OR de.index_version_id = index_version_id)
    AND (
      (query_embedding IS NULL OR (1 - (de.embedding <=> query_embedding)) > match_threshold)
      OR (ts_rank_cd(de.fts, websearch_to_tsquery('english', query_text)) > 0)
    )
  ORDER BY similarity DESC, de.id ASC
  LIMIT match_count;
END;
$$;
