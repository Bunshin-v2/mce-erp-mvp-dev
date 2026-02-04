-- Custom Sidebar Tabs Setup
-- Table to store custom sidebar tabs (L4 admin only)

-- 1. Create table for custom sidebar tabs
CREATE TABLE IF NOT EXISTS public.custom_sidebar_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  target_url TEXT,
  target_view TEXT,
  required_tier public.permission_tier DEFAULT 'L1',
  sort_order INTEGER DEFAULT 0,
  group_title TEXT DEFAULT 'Custom',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.custom_sidebar_tabs ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read active custom tabs" ON public.custom_sidebar_tabs;
DROP POLICY IF EXISTS "L4 users can manage custom tabs" ON public.custom_sidebar_tabs;
DROP POLICY IF EXISTS "L4 users can insert custom tabs" ON public.custom_sidebar_tabs;
DROP POLICY IF EXISTS "L4 users can delete custom tabs" ON public.custom_sidebar_tabs;

-- 4. Policies
-- Everyone can read active custom tabs
CREATE POLICY "Users can read active custom tabs" ON public.custom_sidebar_tabs
  FOR SELECT USING (is_active = TRUE);

-- L4 users can read all (active and inactive)
CREATE POLICY "L4 users can read all custom tabs" ON public.custom_sidebar_tabs
  FOR SELECT USING (
    (SELECT tier FROM public.profiles WHERE clerk_user_id = current_setting('request.jwt.claims')::json->>'sub') = 'L4'
  );

-- L4 users can create custom tabs
CREATE POLICY "L4 users can insert custom tabs" ON public.custom_sidebar_tabs
  FOR INSERT WITH CHECK (
    (SELECT tier FROM public.profiles WHERE clerk_user_id = current_setting('request.jwt.claims')::json->>'sub') = 'L4'
  );

-- L4 users can update custom tabs
CREATE POLICY "L4 users can update custom tabs" ON public.custom_sidebar_tabs
  FOR UPDATE USING (
    (SELECT tier FROM public.profiles WHERE clerk_user_id = current_setting('request.jwt.claims')::json->>'sub') = 'L4'
  );

-- L4 users can delete custom tabs
CREATE POLICY "L4 users can delete custom tabs" ON public.custom_sidebar_tabs
  FOR DELETE USING (
    (SELECT tier FROM public.profiles WHERE clerk_user_id = current_setting('request.jwt.claims')::json->>'sub') = 'L4'
  );

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_tabs_active ON public.custom_sidebar_tabs(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_tabs_sort_order ON public.custom_sidebar_tabs(sort_order);
CREATE INDEX IF NOT EXISTS idx_custom_tabs_group ON public.custom_sidebar_tabs(group_title);
CREATE INDEX IF NOT EXISTS idx_custom_tabs_created_by ON public.custom_sidebar_tabs(created_by);

-- 6. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_sidebar_tabs;
