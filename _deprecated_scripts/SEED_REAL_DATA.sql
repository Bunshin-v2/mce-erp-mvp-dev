-- REAL DATA SEED FILE GENERATED FROM CSV
-- 1. SCHEMA REPAIR: Ensure columns exist
CREATE TABLE IF NOT EXISTS public.projects_master (id uuid PRIMARY KEY DEFAULT uuid_generate_v4());
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_name text;
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_code text;
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_location_city text;
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS scope_of_services_enum text;
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_type text;
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS contract_value_excl_vat numeric(18,2);
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS contract_duration text;
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_status text;
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_commencement_date timestamptz;
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_completion_date_planned timestamptz;
ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS remarks text;
-- 2. DATA INSERTION
TRUNCATE TABLE public.projects_master CASCADE;
DELETE FROM public.projects_master WHERE project_code LIKE '20%' OR project_name IS NOT NULL;
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'b790ef0b-6674-4508-8b2d-32628afb6e3b',
    'New Corniche Hospital',
    'RAFED',
    '2023.010.HLT.012',
    'Abu Dhabi',
    'Full Design & Construction Supervision',
    'Healthcare',
    57000000.00,
    '5  Years',
    'Construction',
    '2022-01-01',
    '2028-01-01',
    'The Project was on hold'
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '7b1bf63c-efd8-4013-a997-f0c9f5e12a9a',
    'New Corniche Hospital - Royal Suites - V01',
    'RAFED',
    NULL,
    'Abu Dhabi',
    'Design Services',
    'Healthcare',
    1638308.00,
    '9 Months',
    'Tender Documents',
    '2024-05-01',
    '2026-01-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '744076ba-f924-4d4f-9dcf-e5b8db951e6b',
    'New Corniche Hospital - Royal Suites - V02',
    'RAFED',
    NULL,
    'Abu Dhabi',
    'Design Services',
    'Healthcare',
    1227096.00,
    '6 Months',
    'Tender Documents',
    '2025-06-01',
    '2026-01-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '3b20369a-7a0d-423a-9d04-fdd06e5aad6e',
    'New Corniche Hospital - SKMC Retail / Mosque - V03',
    'RAFED',
    NULL,
    'Abu Dhabi',
    'Authority Approval / Permitting',
    'Healthcare',
    140000.00,
    '3 Months',
    'Awaiting Building Permit',
    '2025-06-01',
    '2026-01-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '159bb042-8442-4ced-8a6b-ba16c03f5551',
    'New Corniche Hospital - Biomed Tender Package - V04',
    'RAFED',
    NULL,
    'Abu Dhabi',
    'Design Services',
    'Healthcare',
    300000.00,
    '3 Months',
    'Client Review',
    '2025-08-01',
    '2025-12-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '6df1c200-4607-4886-95dd-d43c88ca27d2',
    'AD Police Saadiyat D2',
    'AD POLICE',
    NULL,
    'Abu Dhabi',
    'Full Design & Construction Supervision',
    'Governmental',
    1212522.64,
    '16 Months',
    'Tender Stage',
    '2026-01-01',
    '2027-01-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'a2985245-e2a0-4a56-819a-abad91402008',
    'AD Police Saadiyat D3',
    'AD POLICE',
    NULL,
    'Abu Dhabi',
    'Full Design & Construction Supervision',
    'Governmental',
    1215976.88,
    '16 Months',
    'Construction Ongoing',
    '2025-11-01',
    '2026-09-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '6193f5cf-c231-45ea-9a3f-8e370a7b7463',
    'AD Police Training Hangar - Tarif',
    'AD POLICE',
    NULL,
    'Abu Dhabi',
    'Full Design & Construction Supervision',
    'Governmental',
    1248975.04,
    '16 Months',
    'Construction Ongoing',
    '2026-02-01',
    '2026-12-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '0ef231c6-f4b5-427f-b2ff-18e9bbbee193',
    'Civil Defence Al Shawamekh - C',
    'AD POLICE',
    NULL,
    'Abu Dhabi',
    'Full Design & Construction Supervision',
    'Governmental',
    1928500.00,
    '16 Months',
    'Tender Stage',
    '2025-11-01',
    '2026-09-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'c1f91f8a-1b2c-4d6e-9cbd-576baebe09df',
    'AD Police Beda Mutawah',
    'AD POLICE',
    NULL,
    'Abu Dhabi',
    'Full Design & Construction Supervision',
    'Governmental',
    1465721.82,
    '16 Months',
    'Tender Stage',
    '2025-12-01',
    '2026-10-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '296361b3-0140-416e-b93a-ba0b712e48a5',
    'AD Police, Emergency, and Civil Defence - Rahayel',
    'AD POLICE',
    NULL,
    'Abu Dhabi',
    'Full Design & Construction Supervision',
    'Governmental',
    1047290.40,
    '16 Months',
    'Tender Stage',
    '2026-01-01',
    '2027-01-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'c004f08d-bdaa-4df4-a0f0-c7f6ace48faa',
    'STMC Multi-Storey Parking',
    'RAFED',
    '2024.004.HLT-002',
    'Al Ain',
    'Design Services',
    'Healthcare',
    985000.00,
    '6 months',
    'Schematic Stage (Design)',
    '2024-11-01',
    '2025-04-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'b3a7ff53-588d-43a7-9747-640fe5cd2de9',
    'Long Term Care Center',
    'Al Jalila Foundation',
    NULL,
    'Dubai',
    'Full Design & Construction Supervision',
    'Healthcare',
    8016400.00,
    '35 Months',
    'Concept Stage (Design)',
    '2025-08-01',
    '2027-09-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '31b8e1cc-2a50-4de9-ac8b-49ff20e75b3e',
    'Majlis (2) Al Dhafra',
    'Presidential Court',
    NULL,
    'Abu Dhabi, Western Region',
    'Design Review & Supervision',
    'Commercial',
    1676000.00,
    '12 Months',
    'Construction Ongoing',
    '2025-02-01',
    '2026-04-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '3ff98b90-320f-4618-9aa1-ba6cfcf15180',
    'Majalis Phase 3 (No 5) Supervision',
    'Presidential Court',
    NULL,
    'Abu Dhabi, Western Region',
    'Construction Supervision',
    'Commercial',
    3467000.00,
    '11 Months',
    'Construction Ongoing',
    '2025-02-01',
    '2026-03-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'c2105579-d385-4dbc-a815-91adbc21348c',
    'Abu Dhabi Stem Cell Research Lab & Hospital',
    'Abu Dhabi Stem Cell Center',
    NULL,
    'Abu Dhabi',
    'Full Design & Supervision',
    'Healthcare',
    36249549.00,
    '16 Months',
    'Ongoing',
    '2021-03-01',
    '2021-05-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '2d659e42-cc71-44c6-9836-4d7ffa3a07a5',
    'Arab Monetary Fund Fitout & Façade',
    'Arab Monetary Fund',
    NULL,
    'Abu Dhabi',
    'Design & Supervision',
    'Commercial',
    2358333.00,
    '9 Months',
    'Construction Ongoing',
    '2024-05-01',
    '2026-05-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '9325d354-033b-4567-a56b-a5e43ace240e',
    'Al Kheiran Villa ',
    'Presidential Court',
    NULL,
    'Abu Dhabi',
    'Full Design & Supervision',
    'Residential',
    3266300.00,
    '5 Months',
    'Ongoing',
    '1900-09-30',
    '2026-04-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '57d0c42a-f1ac-41a3-9b23-538fe15502f0',
    'Al Ghurair Rehabilitation Center',
    'Al Ghurair Centre',
    NULL,
    'Dubai, UAE',
    'Design & Supervision',
    'Healthcare',
    1784900.00,
    '1 Year',
    'Completed',
    '2023-10-01',
    '2024-12-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '8b79f750-384d-41b5-b8c8-0106864a82f6',
    'Perla Towers 1',
    'Emirates Limited ',
    NULL,
    'Abu Dhabi',
    'Supervision',
    'Residential',
    2608000.00,
    '24 Months',
    'Completed',
    '2023-10-01',
    '2025-01-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '5af9ff76-0d13-4386-a6e5-f77e1b8c22e3',
    'SSMC Staff Parking Phase I',
    'SSMC/RAFED',
    NULL,
    'Abu Dhabi',
    'Design Build',
    'Healthcare',
    3953012.00,
    '5 Months',
    'Completed ',
    '2024-02-01',
    '2024-08-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'bf3acbcd-5d09-4599-b8e5-2c912c2cde1a',
    'SSMC Staff Parking Phase II',
    'SSMC/RAFED',
    NULL,
    'Abu Dhabi',
    'Design Build',
    'Healthcare',
    7915590.00,
    '6 Months',
    'DLP Period',
    '2024-09-01',
    '2025-02-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '63387c30-0e5e-4ec2-bd59-4f878159f6ac',
    'Tawazun Industrial Park',
    'Tawazun',
    NULL,
    'Abu Dhabi',
    'Design & Supervision',
    'Industrial',
    13573000.00,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'a4908dd8-a9c8-461c-babd-afea5c1c0cbf',
    'Facelift Enhancement Projects at SKMC and Tawam Hospital',
    'RAFED',
    NULL,
    'Abu Dhabi & Al Ain',
    'Design & Supervision',
    'Healthcare ',
    23425855.74,
    '36 Months',
    'Pre-Award / Tender Stage',
    NULL,
    NULL,
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '2e30a0c7-09d4-461c-bfbb-708c69aa56ca',
    'Abu Dhabi Plant Tissue Culture Lab',
    'Presidential Court',
    NULL,
    'Abu Dhabi',
    'Design & Supervision',
    'Institutional',
    4753600.00,
    '21  Months',
    'Pre-Award / Tender Stage',
    '2026-01-01',
    '2027-10-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '499d7f37-2568-4cf0-af65-71f28ec5761e',
    'New Hospital at Delma Island - Abu Dhabi',
    'RAFED',
    NULL,
    'Abu Dhabi',
    'Design & Supervision',
    'Healthcare ',
    11895097.00,
    '48 Months',
    'Pre-Award / Tender Stage',
    '2026-03-01',
    '2030-03-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '82f7b737-cf8f-4762-b67c-e6c88bc5ed5e',
    'Agricultural Genome Bank Design',
    'Abu Dhabi Agriculture & Food Safety Authority (ADAFSA)',
    NULL,
    'Abu Dhabi',
    'Design & Supervision',
    'Institutional',
    13149500.00,
    '27 Months',
    'Pre-Award / Tender Stage',
    '2026-01-01',
    '2028-04-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '14b285db-cde5-40b2-a3aa-e006c930cc91',
    'The Farm house',
    'ZAAD DEVELOPMENT LLC',
    NULL,
    'Abu Dhabi',
    'Design & Supervision',
    'Residential',
    4966200.00,
    '25 Months',
    'Pre-Award',
    '2026-12-01',
    '2028-01-01',
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'cf7b4a91-2982-41e2-8aec-5920547706d3',
    'The Beach House',
    'ZAAD DEVELOPMENT LLC',
    NULL,
    'Abu Dhabi',
    'Design & Supervision',
    'Residential',
    5514456.00,
    '21 Months',
    ' Tender Stage',
    NULL,
    NULL,
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'ec77fd7b-711b-45cd-ab25-a042a6370d6d',
    'Lusaili & Lahbab',
    'Dubai Health',
    NULL,
    'Abu Dhabi',
    'Design & Supervision',
    'Healthcare ',
    8002900.00,
    '36 Months',
    'Pre-Award / Tender Stage',
    NULL,
    NULL,
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'b790ef76-2141-4c8e-bfb9-0cd1e2989cd2',
    'Converting  group of villas into a specialized hospital',
    'AI Hospital - Private',
    NULL,
    'Abu Dhabi',
    'Design',
    'Healthcare ',
    540000.00,
    NULL,
    'Tender Stage',
    NULL,
    NULL,
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '91ee23af-f89f-47f4-92fc-b566ffdd4fe1',
    '80-Bed General Hospital ',
    'Al Ghurair',
    NULL,
    'Abu Dhabi',
    'Full Design',
    'Healthcare ',
    4298000.00,
    '30 Months',
    'Pre-Award / Tender Stage',
    NULL,
    NULL,
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '564b2d76-bd73-4549-a7f2-f7ecccd440ed',
    'Al Gurm Island Villa',
    'ZAAD DEVELOPMENT LLC',
    NULL,
    'Abu Dhabi',
    'Design & Supervision',
    'Residential',
    6457665.50,
    '24 Months',
    'Pre-Award / Tender Stage',
    NULL,
    NULL,
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '1b6a6e81-0ecd-4851-ba52-1c147369151b',
    'SSMC - Strategic Internal Expansion',
    'RAFED',
    NULL,
    'Abu Dhabi',
    'Fit out',
    'Healthcare ',
    15209806.00,
    '36 Months',
    'Pre-Award / Tender Stage',
    '2025-04-01',
    NULL,
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'c2e74f50-ee77-45be-819c-0e0729c89d33',
    'Majlis Al  Amal Ground Floor, Building No: 12, DHCC, Dubai, UAE',
    'Al Jalila Foundation',
    NULL,
    'Abu Dhabi',
    'Design & Build',
    'Healthcare ',
    1018970.00,
    '3 Months',
    'Pre-Award / Tender Stage',
    NULL,
    NULL,
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '66ef31ea-d83c-4011-9d01-48be675452dc',
    'Development of Up to Five (5) Clinics',
    'Al Ghurair',
    NULL,
    'Abu Dhabi',
    'Pre concept',
    'Healthcare ',
    21424000.00,
    '38 Months',
    'Pre-Award / Tender Stage',
    NULL,
    NULL,
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'a759a099-7a46-40f4-bc42-686fe89b5a79',
    'Central Honeybee Pest and Disease Laboratory ',
    'Abu Dhabi Agriculture & Food Safety Authority (ADAFSA)',
    NULL,
    'Abu Dhabi',
    'Full Design & Supervision',
    'Healthcare ',
    5500000.00,
    '24 Months',
    'Tender Stage',
    NULL,
    NULL,
    NULL
);
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    'c0b9b2f0-d7cf-4bc9-a531-929124478200',
    'Specialized Rehab Hospital Extension',
    'IMKAN Properties ',
    NULL,
    'Abu Dhabi',
    'Design Consultancy Services',
    'Healthcare',
    3646000.00,
    '5 Months',
    ' Tender Stage',
    NULL,
    NULL,
    NULL
);