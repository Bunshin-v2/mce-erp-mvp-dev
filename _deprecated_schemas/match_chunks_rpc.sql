
-- Function to match document chunks based on vector similarity
CREATE OR REPLACE FUNCTION match_doc_chunks (
  query_embedding vector(1024),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  text_rendered text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  select
    doc_chunks.id,
    doc_chunks.text_rendered,
    1 - (doc_chunks.embedding <=> query_embedding) as similarity
  from doc_chunks
  where 1 - (doc_chunks.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
