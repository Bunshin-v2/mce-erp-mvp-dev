-- TODO Tracker Enterprise Setup
-- Part 2 of Enterprise Recreation Blueprint

-- 1. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  default_view TEXT DEFAULT 'kanban',
  default_sort TEXT DEFAULT 'due_date',
  tasks_per_page INTEGER DEFAULT 20,
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h',
  email_notifications BOOLEAN DEFAULT TRUE,
  daily_digest BOOLEAN DEFAULT FALSE,
  digest_time TIME DEFAULT '09:00',
  due_date_reminders BOOLEAN DEFAULT TRUE,
  reminder_before TEXT DEFAULT '24h',
  auto_archive_completed BOOLEAN DEFAULT FALSE,
  archive_after_days INTEGER DEFAULT 14,
  default_task_priority TEXT DEFAULT 'medium',
  default_task_status TEXT DEFAULT 'pending',
  week_starts_on TEXT DEFAULT 'monday',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (
    user_id IN (SELECT id FROM public.profiles WHERE clerk_user_id = current_setting('request.jwt.claims')::json->>'sub')
  );

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_preferences;

-- 5. Updated At Trigger
CREATE OR REPLACE FUNCTION update_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_preferences_updated_at();

-- 6. Task Index Adjustments
CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON public.tasks(archived_at);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON public.tasks(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
