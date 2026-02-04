
-- Notification Queue for multi-channel dispatch
CREATE TABLE public.notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'in_app')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  recipient TEXT NOT NULL, -- email address, phone number, or user_id
  content TEXT NOT NULL,
  attempt_count INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage the queue" ON public.notification_queue FOR ALL
    USING (auth.jwt() ->> 'user_role' = 'super_admin');

-- Function to add notifications to the queue
CREATE OR REPLACE FUNCTION queue_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- For now, we'll only queue 'critical' email notifications
  IF NEW.severity = 'critical' THEN
    INSERT INTO public.notification_queue (notification_id, channel, recipient, content)
    SELECT NEW.id, 'email', up.email, NEW.message
    FROM public.user_profiles up
    WHERE up.id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically queue new notifications
CREATE TRIGGER on_new_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION queue_notification();
