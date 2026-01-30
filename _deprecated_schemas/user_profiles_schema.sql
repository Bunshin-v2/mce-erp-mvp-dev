
-- USER PROFILES (synced from Clerk)
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY, -- Clerk user ID
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('super_admin', 'chairman', 'vp', 'dept_head', 'pm', 'engineer', 'finance', 'viewer')) DEFAULT 'viewer',
    department TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to see their own profile" ON user_profiles FOR SELECT USING (id = auth.uid()::text);
CREATE POLICY "Allow admins/PMs to see all profiles" ON user_profiles FOR SELECT USING (get_user_role() IN ('super_admin', 'pm', 'dept_head'));
