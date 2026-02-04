
-- User Notification Preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,

  -- Sound
  sound_enabled BOOLEAN DEFAULT true,
  sound_volume INTEGER DEFAULT 75,
  
  -- Email
  email_enabled BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'immediate_critical', -- 'immediate_critical', 'immediate', 'daily', 'weekly'
  
  -- Quiet Hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own preferences" ON notification_preferences
    FOR ALL
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());
