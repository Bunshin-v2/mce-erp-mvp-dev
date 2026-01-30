-- FIELD OPERATIONS SCHEMA
-- Defines the "Boots on the Ground" layer: Weather, Manpower, and Safety

-- 1. DAILY SITE LOGS (The "Parent" record for a day)
CREATE TABLE IF NOT EXISTS public.site_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects_master(id),
    log_date DATE NOT NULL,
    
    -- Environmental Intelligence
    weather_summary TEXT, -- e.g. "Clear with localized dust"
    temp_celsius NUMERIC(3,1),
    humidity_percent INTEGER,
    wind_speed_kmh NUMERIC(4,1),
    
    -- Sentiment / Notes
    site_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(project_id, log_date)
);

-- 2. RESOURCE DEPLOYMENT (Manpower Counts)
CREATE TABLE IF NOT EXISTS public.site_manpower (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID REFERENCES public.site_logs(id) ON DELETE CASCADE,
    
    -- Resource Categories
    category TEXT NOT NULL, -- 'CIVIL', 'MEP', 'MANAGEMENT'
    count_present INTEGER DEFAULT 0,
    count_planned INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SAFETY OBSERVATIONS (HSE Command)
CREATE TABLE IF NOT EXISTS public.safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects_master(id),
    
    incident_type TEXT NOT NULL, -- 'POSITIVE', 'NEGATIVE', 'LTI', 'NEAR_MISS'
    description TEXT NOT NULL,
    location_details TEXT,
    
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    
    severity TEXT DEFAULT 'LOW' -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
);

-- 4. ACTIVITY FEED (Live Site Events)
CREATE TABLE IF NOT EXISTS public.site_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects_master(id),
    
    activity_type TEXT NOT NULL, -- 'POUR', 'DELIVERY', 'INSPECTION', 'SAFETY'
    title TEXT NOT NULL,
    description TEXT,
    user_name TEXT, -- The "Poster"
    
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_manpower;
ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_activities;

-- SEED DATA (For Immediate "WOW" Factor)
DO $$
DECLARE
    v_project_id UUID;
    v_log_id UUID;
BEGIN
    -- Get the Stem Cell Project ID (or any project)
    SELECT id INTO v_project_id FROM public.projects_master LIMIT 1;
    
    IF v_project_id IS NOT NULL THEN
        -- A. Create Today's Log
        INSERT INTO public.site_logs (project_id, log_date, weather_summary, temp_celsius, humidity_percent, wind_speed_kmh)
        VALUES (v_project_id, CURRENT_DATE, 'Clear Sky - High UV Index', 34.5, 42, 12.5)
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_log_id;
        
        -- If log already existed, get its ID
        IF v_log_id IS NULL THEN
            SELECT id INTO v_log_id FROM public.site_logs WHERE project_id = v_project_id AND log_date = CURRENT_DATE;
        END IF;
        
        -- B. Add Manpower
        DELETE FROM public.site_manpower WHERE log_id = v_log_id;
        INSERT INTO public.site_manpower (log_id, category, count_present, count_planned) VALUES
        (v_log_id, 'CIVIL', 148, 160),
        (v_log_id, 'MEP', 92, 85),
        (v_log_id, 'MANAGEMENT', 18, 18);
        
        -- C. Add Safety Observations
        INSERT INTO public.safety_incidents (project_id, incident_type, description, reported_at, severity) VALUES
        (v_project_id, 'POSITIVE', 'Excellent usage of spill kits during refueling', NOW() - INTERVAL '2 hours', 'LOW'),
        (v_project_id, 'NEGATIVE', 'Scaffolding tag expire on Zone B access tower', NOW() - INTERVAL '4 hours', 'MEDIUM'),
        (v_project_id, 'POSITIVE', 'Full PPE compliance in exclusion zone', NOW() - INTERVAL '5 hours', 'LOW');
        
        -- D. Add Activities
        INSERT INTO public.site_activities (project_id, activity_type, title, description, user_name, timestamp) VALUES
        (v_project_id, 'POUR', 'Concrete Pour - Podium L3', 'casting 450m3 of C50 mix. Pump active.', 'Ahmed Site Eng', NOW() - INTERVAL '1 hour'),
        (v_project_id, 'DELIVERY', 'Rebar Delivery Batch #402', '30 Tons of T20/T25 received at Gate 3.', 'Logistics Mgr', NOW() - INTERVAL '3 hours'),
        (v_project_id, 'INSPECTION', 'MEP First Fix - Corridor', 'Consultant inspection passed with minor comments.', 'MEP Lead', NOW() - INTERVAL '6 hours');
    END IF;
END $$;
