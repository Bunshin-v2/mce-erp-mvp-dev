
-- TENDER COMMUNICATIONS LOG
CREATE TABLE tender_comms_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    event_type TEXT CHECK (event_type IN ('email', 'call', 'meeting', 'site_visit', 'other')),
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    with_party TEXT,
    outcome TEXT,
    notes TEXT,
    event_at TIMESTAMPTZ DEFAULT now(),
    logged_by_user_id TEXT NOT NULL, -- Clerk user ID
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE tender_comms_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to see comms for their tenders" ON tender_comms_events FOR SELECT USING (
    tender_id IN (SELECT id FROM tenders WHERE owner_user_id = auth.uid()::text)
);
CREATE POLICY "Allow users to insert comms for their tenders" ON tender_comms_events FOR INSERT WITH CHECK (
    logged_by_user_id = auth.uid()::text
);
