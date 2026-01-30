-- SETUP: Missing Tables (purchase_orders & custom_sidebar_tabs)
-- This script creates the missing tables that are referenced by the application

-- 1. Create purchase_orders table (Iron Dome financial validation)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid,
    po_number text NOT NULL UNIQUE,
    vendor_name text NOT NULL,
    total_amount numeric NOT NULL,
    remaining_balance numeric NOT NULL,
    status text DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

-- 2. Create custom_sidebar_tabs table
CREATE TABLE IF NOT EXISTS public.custom_sidebar_tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  target_url TEXT,
  target_view TEXT,
  required_tier TEXT DEFAULT 'L1',
  sort_order INTEGER DEFAULT 0,
  group_title TEXT DEFAULT 'Custom',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS for both tables
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_sidebar_tabs ENABLE ROW LEVEL SECURITY;

-- 4. Create basic RLS policies for purchase_orders
DROP POLICY IF EXISTS "purchase_orders_read" ON public.purchase_orders;
DROP POLICY IF EXISTS "purchase_orders_write" ON public.purchase_orders;

CREATE POLICY "purchase_orders_read" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "purchase_orders_write" ON public.purchase_orders FOR INSERT WITH CHECK (true);

-- 5. Create basic RLS policies for custom_sidebar_tabs
DROP POLICY IF EXISTS "custom_tabs_read" ON public.custom_sidebar_tabs;
DROP POLICY IF EXISTS "custom_tabs_write" ON public.custom_sidebar_tabs;

CREATE POLICY "custom_tabs_read" ON public.custom_sidebar_tabs FOR SELECT USING (is_active = true);
CREATE POLICY "custom_tabs_write" ON public.custom_sidebar_tabs FOR INSERT WITH CHECK (true);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_po_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_project ON public.purchase_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_custom_tabs_active ON public.custom_sidebar_tabs(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_tabs_sort ON public.custom_sidebar_tabs(sort_order);
