
-- Snooze Records
CREATE TABLE notification_snoozes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  snoozed_by_profile_id UUID REFERENCES auth.users(id),
  snoozed_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE notification_snoozes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own snoozes" ON notification_snoozes
    FOR ALL
    USING (snoozed_by_profile_id = auth.uid())
    WITH CHECK (snoozed_by_profile_id = auth.uid());
