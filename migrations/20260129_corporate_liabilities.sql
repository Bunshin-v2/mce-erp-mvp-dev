-- LIABILITY TRACKER SCHEMA - MASTER REGISTRY
-- Supports the 156-point compliance tracking system

-- 1. Create the main corporate_liabilities table
CREATE TABLE IF NOT EXISTS public.corporate_liabilities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Classification
    category text NOT NULL, -- 'Government', 'Insurance', 'Project', 'HR', etc.
    sub_category text, -- 'DED', 'Civil Defense', 'MOHRE'
    
    -- Core Details
    obligation_name text NOT NULL,
    reference_number text, -- 'CN-1078291'
    description text,
    
    -- Financials & Timing
    expiry_date date,
    renewal_period text, -- 'Annual', 'Monthly', '3 Years'
    annual_cost numeric DEFAULT 0,
    currency text DEFAULT 'AED',
    
    -- Risk Profile
    priority text CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    impact_description text, -- "Work stoppage on all projects..."
    
    -- Ownership
    stakeholders text[], -- Array of roles/names
    department text,
    
    -- Status
    status text DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Pending', 'Compliant')),
    
    -- Metadata
    is_recurring boolean DEFAULT true,
    auto_renewal boolean DEFAULT false
);

-- 2. Create index for fast dashboard queries (expiring soon)
CREATE INDEX IF NOT EXISTS idx_liabilities_expiry ON public.corporate_liabilities(expiry_date);
CREATE INDEX IF NOT EXISTS idx_liabilities_priority ON public.corporate_liabilities(priority);

-- 3. Enable RLS
ALTER TABLE public.corporate_liabilities ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Read: Accessible to authenticated users (Dashboard View)
CREATE POLICY "Allow read access for authenticated users"
ON public.corporate_liabilities FOR SELECT
TO authenticated
USING (true);

-- Write/Update: Restricted (This would normally be admin-only, but currently open to authenticated for seeding/demo)
CREATE POLICY "Allow write access for authenticated users"
ON public.corporate_liabilities FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update access for authenticated users"
ON public.corporate_liabilities FOR UPDATE
TO authenticated
USING (true);

-- 5. Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_corporate_liabilities_updated_at
    BEFORE UPDATE ON public.corporate_liabilities
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
