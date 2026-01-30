-- Create system_notifications table
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  priority TEXT CHECK (priority IN ('info', 'warning', 'critical')) DEFAULT 'info',
  is_unread BOOLEAN DEFAULT TRUE,
  acked_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow read access for authenticated users" ON system_notifications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow update for authenticated users" ON system_notifications
  FOR UPDATE TO authenticated USING (true);

-- Seed Initial Data
INSERT INTO system_notifications (title, message, priority, timestamp)
VALUES 
  ('System Online', 'Health monitoring services active.', 'info', NOW()),
  ('Database Latency', 'Read metrics within nominal range.', 'info', NOW() - INTERVAL '2 hours'),
  ('Security Audit', 'RLS policies enforced on all endpoints.', 'info', NOW() - INTERVAL '1 day');
