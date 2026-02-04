
-- Personal To-Do Tracker Schema based on TO DO TRACKER doc

-- Categories
CREATE TABLE public.todo_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Tasks
CREATE TABLE public.todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Task-Category junction table
CREATE TABLE public.todo_task_categories (
  task_id UUID REFERENCES public.todos(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.todo_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, category_id)
);

-- RLS Policies
ALTER TABLE public.todo_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own todo categories" ON public.todo_categories
  FOR ALL USING (auth.uid()::TEXT = user_id);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own todos" ON public.todos
  FOR ALL USING (auth.uid()::TEXT = user_id);

ALTER TABLE public.todo_task_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own todo task links" ON public.todo_task_categories
  FOR ALL USING (
    (SELECT user_id FROM public.todos WHERE id = task_id) = auth.uid()::TEXT
  );

-- Indexes for performance
CREATE INDEX idx_todos_user_id ON public.todos(user_id);
CREATE INDEX idx_todos_status ON public.todos(status);
CREATE INDEX idx_todos_due_date ON public.todos(due_date);
