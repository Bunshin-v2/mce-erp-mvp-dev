-- POPULATE RICH DATA: Instant Visualization
-- Run this script to fill your projects with realistic "Big Data" so you can see the UI features in action.

-- 1. Updates "Abu Dhabi Stem Cell Research Lab" (or creates it if missing) with MAX DATA
UPDATE public.projects_master
SET 
  client_name = 'Abu Dhabi Stem Cell Center',
  end_client_name = 'Direct to Client',
  project_location_city = 'Abu Dhabi, UAE',
  project_code = 'MED-2026-X1',
  contract_value_excl_vat = 36249549.00,
  project_status = 'Construction',
  completion_percent = 42.5,
  
  -- Timeline
  project_commencement_date = NOW() - INTERVAL '6 months',
  project_completion_date_planned = NOW() + INTERVAL '10 months',
  contract_duration = '16 Months',
  
  -- Technical
  scope_of_services_enum = 'Full Design & Construction Supervision including specialist medical equipment installation and commissioning.',
  project_type = 'Healthcare / Research',
  
  -- Commercial
  contract_form = 'FIDIC RED BOOK',
  payment_terms_days = 45,
  vat_rate_percent = 5.0, 
  retention_percent = 10.0,
  performance_bond_percent = 10.0,
  ld_applicable = true,
  
  -- Risk & Team
  delivery_risk_rating = 'Nominal',
  project_director = 'Dr. A. Al Mansoori',
  commercial_manager = 'James Wilson',
  hse_lead = 'Sarah Jenkins',
  
  remarks = 'Structural works 90% complete. MEP first fix underway. No critical delays anticipated.',
  client_entity_uid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
WHERE project_name ILIKE '%Stem Cell%';

-- 2. Update a second project to show variety (e.g. Skyline Tower)
UPDATE public.projects_master
SET 
  client_name = 'Emaar Properties',
  end_client_name = 'Emaar Hospitality',
  project_location_city = 'Dubai Creek Harbour',
  project_code = 'TWR-DXB-09',
  contract_value_excl_vat = 125000000.00,
  project_status = 'Tender',
  completion_percent = 0,
  
  -- Timeline
  project_commencement_date = NOW() + INTERVAL '1 month',
  project_completion_date_planned = NOW() + INTERVAL '25 months',
  contract_duration = '24 Months',
  
  -- Technical
  scope_of_services_enum = 'Lead Consultant: Architecture, Structural, and MEP Design for G+45 Residential Tower.',
  project_type = 'High-Rise Residential',
  
  -- Commercial
  contract_form = 'FIDIC YELLOW BOOK',
  payment_terms_days = 60,
  ld_applicable = true,
  
  -- Risk & Team
  delivery_risk_rating = 'Moderate',
  project_director = 'TBD',
  
  remarks = 'Tender evaluation in progress. AOI expected next week.'
WHERE project_name ILIKE '%Tower%' OR project_name ILIKE '%Emaar%';

-- 3. Fallback: If no projects match, update ALL projects with generic but rich data
UPDATE public.projects_master
SET
  client_name = COALESCE(client_name, 'Strategic Partner LLC'),
  project_location_city = COALESCE(project_location_city, 'Dubai, UAE'),
  -- Generate a realistic Project Code if missing (e.g., PRJ-2025-X92)
  project_code = COALESCE(project_code, 'PRJ-2025-' || UPPER(SUBSTRING(MD5(random()::text) FROM 1 FOR 3))),
  contract_value_excl_vat = COALESCE(contract_value_excl_vat, 5000000 + floor(random() * 10000000)),
  scope_of_services_enum = COALESCE(scope_of_services_enum, 'General Construction Services'),
  project_director = COALESCE(project_director, 'Pending Assignment'),
  delivery_risk_rating = COALESCE(delivery_risk_rating, 'Nominal')
WHERE client_name IS NULL OR project_code IS NULL;
