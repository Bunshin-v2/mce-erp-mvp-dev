-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Enums
create type if not exists document_category as enum ('COMPLIANCE', 'CONTRACT', 'INVOICE', 'SAFETY');
create type if not exists document_status as enum ('Review', 'Reviewed', 'Approved', 'Rejected');
create type if not exists project_status as enum ('Active', 'Paused', 'Completed');
create type if not exists alert_severity_old as enum ('info', 'warning', 'critical');
create type if not exists agent_action_type as enum ('POST', 'PATCH');

-- 2. Tables

-- Documents
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category document_category not null,
  status document_status default 'Review',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  reviewed_at timestamptz,
  assigned_to uuid references auth.users(id)
);

-- Projects
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  status project_status default 'Active',
  created_at timestamptz default now()
);

-- Alerts (Module 6)
create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  variable_id uuid, -- Link to extraction
  severity text not null check (severity in ('CASUAL', 'CRITICAL', 'CATASTROPHIC')),
  status text default 'PENDING_REVIEW',
  due_at timestamptz,
  next_notify_at timestamptz,
  ack_required boolean default true,
  created_at timestamptz default now()
);

-- Alert Events (Audit Trail)
create table if not exists alert_events (
  id uuid primary key default uuid_generate_v4(),
  alert_id uuid references alerts(id) on delete cascade,
  actor_profile_id uuid,
  event_type text, -- DISMISS, SNOOZE, DONE
  note text,
  created_at timestamptz default now()
);

-- TODO TRACKER MODULE
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  name text not null,
  color text default '#3B82F6',
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz
);

create table if not exists task_categories (
  task_id uuid references tasks(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (task_id, category_id)
);

-- Incidents
create table if not exists incidents (
  id uuid primary key default uuid_generate_v4(),
  description text not null,
  date date not null
);

-- Agent Activity
create table if not exists agent_activity (
  id uuid primary key default uuid_generate_v4(),
  agent_name text not null,
  action agent_action_type not null,
  document_id uuid references documents(id),
  timestamp timestamptz default now()
);

-- RAG Knowledge
create table if not exists document_embeddings (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid references documents(id) on delete cascade,
    content text,
    metadata jsonb,
    embedding vector(1536),
    created_at timestamptz default now()
);

-- 3. Row Level Security (RLS) & Policies

alter table documents enable row level security;
alter table projects enable row level security;
alter table alerts enable row level security;
alter table alert_events enable row level security;
alter table incidents enable row level security;
alter table agent_activity enable row level security;
alter table tasks enable row level security;
alter table categories enable row level security;
alter table document_embeddings enable row level security;

-- Global Read Access for Demo
create policy "Allow public read all" on documents for select using (true);
create policy "Allow public read projects" on projects for select using (true);
create policy "Allow public read alerts" on alerts for select using (true);
create policy "Allow public read tasks" on tasks for select using (true);
create policy "Allow public read categories" on categories for select using (true);
create policy "Allow public read embeddings" on document_embeddings for select using (true);

-- Restricted Writes (Simplified for Demo)
create policy "Allow public insert all" on documents for insert with check (true);
create policy "Allow public insert tasks" on tasks for insert with check (true);
create policy "Allow public insert alerts" on alerts for insert with check (true);
create policy "Allow public insert events" on alert_events for insert with check (true);

-- 4. Realtime Setup
alter publication supabase_realtime add table documents;
alter publication supabase_realtime add table alerts;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table agent_activity;