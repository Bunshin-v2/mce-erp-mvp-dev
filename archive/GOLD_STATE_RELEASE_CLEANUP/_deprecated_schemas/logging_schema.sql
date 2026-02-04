
-- Log table for escalation events
CREATE TABLE public.escalation_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  escalated_notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  escalation_level TEXT NOT NULL, -- 'L1', 'L2', etc.
  escalated_from_user_id TEXT,
  escalated_to_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.escalation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view escalation logs" ON public.escalation_log FOR SELECT
    USING (auth.jwt() ->> 'user_role' = 'super_admin');
