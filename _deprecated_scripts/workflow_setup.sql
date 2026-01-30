-- MODULE 6: NOTIFICATIONS & FOLLOW-UPS
-- Purpose: Robust alerting system with T-minus countdowns and Acknowledgment

-- 1. Notification Store
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id uuid REFERENCES public.profiles(id),
    
    -- Alert Details
    title text NOT NULL,
    message text,
    severity text DEFAULT 'info', -- info, warning, critical, success
    category text DEFAULT 'general', -- tender, project, compliance, system
    
    -- Link to Entity
    entity_type text, -- 'tender', 'project', 'document'
    entity_id uuid,
    
    -- Workflow Status
    is_read boolean DEFAULT false,
    acked_at timestamptz,
    acked_by_profile_id uuid REFERENCES public.profiles(id),
    
    -- Deduplication (Prevents spamming same alert)
    dedupe_key text UNIQUE, -- e.g., 'tender_deadine_T14_{tender_id}'
    
    created_at timestamptz DEFAULT now()
);

-- 2. Follow-Up Rules / Engine (Conceptual RPC)
-- This function would be called by a cron job or background worker
CREATE OR REPLACE FUNCTION public.generate_tender_deadlines()
RETURNS void AS $$
BEGIN
    -- T-14 Day Alerts
    INSERT INTO public.notifications (recipient_id, title, message, severity, category, entity_type, entity_id, dedupe_key)
    SELECT 
        created_by, 
        'T-14: Tender Deadline Approaching',
        'Tender "' || title || '" is due in 14 days. Ensure Technical volumes are initiated.',
        'warning',
        'tender',
        'tender',
        id,
        'tender_deadline_T14_' || id
    FROM public.tenders
    WHERE deadline_at <= (now() + interval '14 days') 
      AND deadline_at > (now() + interval '13 days')
    ON CONFLICT (dedupe_key) DO NOTHING;

    -- T-3 Day Alerts (Critical)
    INSERT INTO public.notifications (recipient_id, title, message, severity, category, entity_type, entity_id, dedupe_key)
    SELECT 
        created_by, 
        'URGENT: T-3 Tender Deadline',
        'Tender "' || title || '" is due in 72 hours. Final Commercial review required.',
        'critical',
        'tender',
        'tender',
        id,
        'tender_deadline_T3_' || id
    FROM public.tenders
    WHERE deadline_at <= (now() + interval '3 days')
    ON CONFLICT (dedupe_key) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 3. RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View Own Notifications" ON public.notifications 
FOR SELECT TO authenticated 
USING (recipient_id = auth.uid() OR get_current_user_tier() >= 'L3');

CREATE POLICY "Acknowledge Notifications" ON public.notifications 
FOR UPDATE TO authenticated 
USING (recipient_id = auth.uid() OR get_current_user_tier() >= 'L3');
