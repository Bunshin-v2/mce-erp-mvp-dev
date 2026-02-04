-- EMERGENCY REPAIR: RESTORE PROJECTS MASTER
-- The "projects_master" table is missing. This script recreates it and then deploys Field Ops.

-- 1. Create Projects Master (If Missing)
CREATE TABLE IF NOT EXISTS public.projects_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    project_code TEXT,
    client_name TEXT,
    client_entity_uid UUID, -- Optional link to CRM details
    
    -- Status & Value
    project_status TEXT DEFAULT 'Construction', -- 'Construction', 'Tender', 'Completed'
    completion_percent INTEGER DEFAULT 0,
    contract_value_excl_vat NUMERIC(15,2),
    
    -- Timeline
    project_commencement_date DATE,
    project_completion_date_planned DATE,
    
    -- Details
    project_location_city TEXT,
    project_type TEXT, -- 'Healthcare', 'High-Rise', etc.
    scope_of_services_enum TEXT,
    remarks TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Risk & Team (Added via ENSURE_FULL_SCHEMA usually, but including here for safety)
    delivery_risk_rating TEXT DEFAULT 'Nominal',
    flag_for_ceo_attention BOOLEAN DEFAULT FALSE,
    project_director TEXT,
    commercial_manager TEXT,
    hse_lead TEXT
);

-- 2. Seed a "Master" Project if none exist (The Abu Dhabi Stem Cell Center)
INSERT INTO public.projects_master (
    project_name, 
    project_code, 
    client_name, 
    project_location_city, 
    project_status, 
    completion_percent, 
    contract_value_excl_vat,
    delivery_risk_rating
)
SELECT 
    'Abu Dhabi Stem Cell Research Lab',
    'MED-2026-X1',
    'Abu Dhabi Stem Cell Center',
    'Abu Dhabi, UAE',
    'Construction',
    42,
    36249549.00,
    'Nominal'
WHERE NOT EXISTS (SELECT 1 FROM public.projects_master LIMIT 1);


-- 3. FIELD OPERATIONS SCHEMA (Re-run)
-- Defines the "Boots on the Ground" layer: Weather, Manpower, and Safety

-- A. DAILY SITE LOGS
CREATE TABLE IF NOT EXISTS public.site_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects_master(id),
    log_date DATE NOT NULL,
    
    weather_summary TEXT, 
    temp_celsius NUMERIC(3,1),
    humidity_percent INTEGER,
    wind_speed_kmh NUMERIC(4,1),
    
    site_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, log_date)
);

-- B. RESOURCE DEPLOYMENT
CREATE TABLE IF NOT EXISTS public.site_manpower (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID REFERENCES public.site_logs(id) ON DELETE CASCADE,
    category TEXT NOT NULL, 
    count_present INTEGER DEFAULT 0,
    count_planned INTEGER DEFAULT 0
);

-- C. SAFETY OBSERVATIONS
CREATE TABLE IF NOT EXISTS public.safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects_master(id),
    incident_type TEXT NOT NULL,
    description TEXT NOT NULL,
    location_details TEXT,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    severity TEXT DEFAULT 'LOW'
);

-- D. ACTIVITY FEED
CREATE TABLE IF NOT EXISTS public.site_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects_master(id),
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    user_name TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects_master;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_manpower;
ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_activities;

-- 5. Seed Field Data (Linked to the new/existing project)
DO $$
DECLARE
    v_project_id UUID;
    v_log_id UUID;
BEGIN
    SELECT id INTO v_project_id FROM public.projects_master LIMIT 1;
    
    IF v_project_id IS NOT NULL THEN
        -- Log
        INSERT INTO public.site_logs (project_id, log_date, weather_summary, temp_celsius, humidity_percent, wind_speed_kmh)
        VALUES (v_project_id, CURRENT_DATE, 'Clear Sky - High UV Index', 34.5, 42, 12.5)
        ON CONFLICT DO NOTHING
        RETURNING id INTO v_log_id;
        
        IF v_log_id IS NULL THEN
            SELECT id INTO v_log_id FROM public.site_logs WHERE project_id = v_project_id AND log_date = CURRENT_DATE;
        END IF;
        
        -- Manpower
        DELETE FROM public.site_manpower WHERE log_id = v_log_id;
        INSERT INTO public.site_manpower (log_id, category, count_present, count_planned) VALUES
        (v_log_id, 'CIVIL', 148, 160),
        (v_log_id, 'MEP', 92, 85),
        (v_log_id, 'MANAGEMENT', 18, 18);
        
        -- Safety
        INSERT INTO public.safety_incidents (project_id, incident_type, description, reported_at, severity) VALUES
        (v_project_id, 'POSITIVE', 'Excellent usage of spill kits during refueling', NOW() - INTERVAL '2 hours', 'LOW'),
        (v_project_id, 'NEGATIVE', 'Scaffolding tag expire on Zone B access tower', NOW() - INTERVAL '4 hours', 'MEDIUM');
        
        -- Activities
        INSERT INTO public.site_activities (project_id, activity_type, title, description, user_name, timestamp) VALUES
        (v_project_id, 'POUR', 'Concrete Pour - Podium L3', 'casting 450m3 of C50 mix. Pump active.', 'Ahmed Site Eng', NOW() - INTERVAL '1 hour');
    END IF;
END $$;
