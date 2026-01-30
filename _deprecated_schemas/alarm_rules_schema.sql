
-- Alarm Rules Table
CREATE TABLE alarm_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  condition_field TEXT NOT NULL,
  condition_operator TEXT NOT NULL,
  condition_value INTEGER NOT NULL,
  base_severity TEXT NOT NULL,
  ack_required BOOLEAN DEFAULT false,
  channels TEXT[] DEFAULT ARRAY['in_app'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE alarm_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin to manage alarm rules" ON alarm_rules FOR ALL
    USING (get_user_role() = 'super_admin')
    WITH CHECK (get_user_role() = 'super_admin');
