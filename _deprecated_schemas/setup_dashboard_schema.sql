-- Tailored schema for Dashboard + Cockpit (Next migration)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text not null,
  full_name text,
  role text default 'super_admin',
  tier text default 'L4',
  department text,
  created_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text default 'pending',
  priority text default 'medium',
  due_date timestamptz,
  assigned_to uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  severity text default 'info',
  acked_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.agent_activity (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  action_type text not null,
  status text not null,
  payload jsonb,
  result jsonb,
  timestamp timestamptz default now()
);

create table if not exists public.doc_chunks (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid not null,
  chunk_index integer not null,
  text_rendered text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
drop policy if exists profiles_authenticated on public.profiles;
create policy profiles_authenticated on public.profiles
  for all
  using (true)
  with check (true);

alter table public.tasks enable row level security;
drop policy if exists tasks_public on public.tasks;
create policy tasks_public on public.tasks
  for all
  using (true)
  with check (true);

alter table public.notifications enable row level security;
drop policy if exists notifications_public on public.notifications;
create policy notifications_public on public.notifications
  for all
  using (true)
  with check (true);

alter table public.agent_activity enable row level security;
drop policy if exists activity_public on public.agent_activity;
create policy activity_public on public.agent_activity
  for all
  using (true)
  with check (true);

alter table public.doc_chunks enable row level security;
drop policy if exists doc_chunks_public on public.doc_chunks;
create policy doc_chunks_public on public.doc_chunks
  for all
  using (true)
  with check (true);

insert into public.profiles (clerk_user_id, email, full_name, role, tier)
values
  ('demo-admin', 'dev@company.com', 'System Developer', 'super_admin', 'L4')
on conflict (clerk_user_id) do nothing;