
-- TENDERS
CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref TEXT UNIQUE NOT NULL,
    title TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    value_amount DECIMAL(15,2),
    value_currency TEXT DEFAULT 'AED',
    status TEXT CHECK (status IN ('new', 'active', 'drafting', 'in_review', 'submitted', 'won', 'lost', 'cancelled')) DEFAULT 'new',
    owner_user_id TEXT, -- Clerk user ID
    next_followup_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- PROJECT MILESTONES
CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    achieved_date DATE,
    status TEXT CHECK (status IN ('pending', 'achieved', 'missed')) DEFAULT 'pending',
    owner_user_id TEXT, -- Clerk user ID
    evidence_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    message TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    related_entity_type TEXT,
    related_entity_id UUID,
    ack_required BOOLEAN DEFAULT FALSE,
    ack_at TIMESTAMPTZ,
    ack_by_user_id TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- Enable RLS
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "tenders_select" ON tenders FOR SELECT USING (TRUE);
CREATE POLICY "notifications_select_by_user" ON notifications FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "notifications_update_by_user" ON notifications FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "milestones_select" ON project_milestones FOR SELECT USING (TRUE);

-- Add to realtime
alter publication supabase_realtime add table tenders;
alter publication supabase_realtime add table project_milestones;
alter publication supabase_realtime add table notifications;
