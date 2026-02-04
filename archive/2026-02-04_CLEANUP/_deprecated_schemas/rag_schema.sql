
-- Enable pgvector extension
create extension if not exists vector;

-- Document Chunks for RAG
create table if not exists doc_chunks (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references documents(id) on delete cascade,
  sec_code text,
  page_start int,
  page_end int,
  start_char int,
  end_char int,
  text_rendered text not null,
  tsv tsvector generated always as (to_tsvector('english', text_rendered)) stored,
  embedding vector(1024), -- Assuming an embedding size of 1024
  created_at timestamptz default now()
);

-- Create an index for full-text search
create index if not exists doc_chunks_tsv_gin on doc_chunks using gin(tsv);

-- Create an IVFFlat index for vector similarity search
create index if not exists doc_chunks_embedding_ivfflat on doc_chunks using ivfflat (embedding vector_l2_ops) with (lists = 100);


-- Extracted Variables from documents
create table if not exists extracted_variables (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null references documents(id) on delete cascade,
  chunk_id uuid references doc_chunks(id) on delete set null,
  ref_code text,
  var_code text,
  severity text,
  confidence numeric,
  due_at timestamptz,
  amount numeric,
  currency text,
  evidence_page int,
  created_at timestamptz default now()
);

-- RLS
ALTER TABLE doc_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see chunks for docs they can access" ON doc_chunks FOR SELECT USING (TRUE); -- Simplified for demo

ALTER TABLE extracted_variables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see variables for docs they can access" ON extracted_variables FOR SELECT USING (TRUE); -- Simplified for demo
