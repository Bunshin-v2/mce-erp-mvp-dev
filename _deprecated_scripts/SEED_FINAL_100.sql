-- SEED DATA: Final 100% Synchronization
-- Uses standardized lowercase column names for Postgres compatibility

-- 1. Clear existing projects
DELETE FROM projects_master;

-- 2. Insert Projects
INSERT INTO projects_master (project_name, client_name, project_code, project_location_city, project_status, scope_of_services_enum, project_type, contract_value_excl_vat, project_commencement_date, project_completion_date_planned, contract_duration, remarks) VALUES 
('New Corniche Hospital', 'RAFED', '2023.010.HLT.012', 'Abu Dhabi', 'Construction', 'Full Design & Construction Supervision', 'Healthcare', 57000000.00, '2022-01-01', '2028-12-31', '5 Years', 'The Project was on hold'),
('New Corniche Hospital - Royal Suites - V01', 'RAFED', '', 'Abu Dhabi', 'Tender Documents', 'Design Services', 'Healthcare', 1638308.00, '2024-05-01', '2026-01-01', '9 Months', ''),
('New Corniche Hospital - Royal Suites - V02', 'RAFED', '', 'Abu Dhabi', 'Tender Documents', 'Design Services', 'Healthcare', 1227096.00, '2025-06-01', '2026-01-01', '6 Months', ''),
('New Corniche Hospital - SKMC Retail / Mosque - V03', 'RAFED', '', 'Abu Dhabi', 'Awaiting Building Permit', 'Authority Approval / Permitting', 'Healthcare', 140000.00, '2025-06-01', '2026-01-01', '3 Months', ''),
('New Corniche Hospital - Biomed Tender Package - V04', 'RAFED', '', 'Abu Dhabi', 'Client Review', 'Design Services', 'Healthcare', 300000.00, '2025-08-01', '2025-12-31', '3 Months', ''),
('AD Police Saadiyat D2', 'AD POLICE', '', 'Abu Dhabi', 'Tender Stage', 'Full Design & Construction Supervision', 'Governmental', 1212522.64, '2026-01-01', '2027-01-01', '16 Months', ''),
('AD Police Saadiyat D3', 'AD POLICE', '', 'Abu Dhabi', 'Construction Ongoing', 'Full Design & Construction Supervision', 'Governmental', 1215976.88, '2025-11-01', '2026-09-01', '16 Months', ''),
('AD Police Training Hangar - Tarif', 'AD POLICE', '', 'Abu Dhabi', 'Construction Ongoing', 'Full Design & Construction Supervision', 'Governmental', 1248975.04, '2026-02-01', '2026-12-31', '16 Months', ''),
('Civil Defence Al Shawamekh - C', 'AD POLICE', '', 'Abu Dhabi', 'Tender Stage', 'Full Design & Construction Supervision', 'Governmental', 1928500.00, '2025-11-01', '2026-09-01', '16 Months', ''),
('AD Police Beda Mutawah', 'AD POLICE', '', 'Abu Dhabi', 'Tender Stage', 'Full Design & Construction Supervision', 'Governmental', 1465721.82, '2025-12-01', '2026-10-01', '16 Months', ''),
('AD Police, Emergency, and Civil Defence - Rahayel', 'AD POLICE', '', 'Abu Dhabi', 'Tender Stage', 'Full Design & Construction Supervision', 'Governmental', 1047290.40, '2026-01-01', '2027-01-01', '16 Months', ''),
('STMC Multi-Storey Parking', 'RAFED', '2024.004.HLT-002', 'Al Ain', 'Schematic Stage (Design)', 'Design Services', 'Healthcare', 985000.00, '2024-11-01', '2025-04-01', '6 months', ''),
('Long Term Care Center', 'Al Jalila Foundation', '', 'Dubai', 'Concept Stage (Design)', 'Full Design & Construction Supervision', 'Healthcare', 8016400.00, '2025-08-01', '2027-09-01', '35 Months', ''),
('Majlis (2) Al Dhafra', 'Presidential Court', '', 'Western Region', 'Construction Ongoing', 'Design Review & Supervision', 'Commercial', 1676000.00, '2025-02-01', '2026-04-01', '12 Months', ''),
('Majalis Phase 3 (No 5) Supervision', 'Presidential Court', '', 'Western Region', 'Construction Ongoing', 'Construction Supervision', 'Commercial', 3467000.00, '2025-02-01', '2026-03-01', '11 Months', ''),
('Abu Dhabi Stem Cell Research Lab & Hospital', 'Abu Dhabi Stem Cell Center', '', 'Abu Dhabi', 'Ongoing', 'Full Design & Supervision', 'Healthcare', 36249549.00, '2021-03-01', '2021-05-31', '16 Months', ''),
('Arab Monetary Fund Fitout & Façade', 'Arab Monetary Fund', '', 'Abu Dhabi', 'Construction Ongoing', 'Design & Supervision', 'Commercial', 2358333.00, '2024-05-01', '2026-05-01', '9 Months', ''),
('Al Kheiran Villa ', 'Presidential Court', '', 'Abu Dhabi', 'Ongoing', 'Full Design & Supervision', 'Residential', 3266300.00, '2025-09-30', '2026-04-01', '5 Months', ''),
('Al Ghurair Rehabilitation Center', 'Al Ghurair Centre', '', 'Dubai', 'Completed', 'Design & Supervision', 'Healthcare', 1784900.00, '2023-10-01', '2024-12-31', '1 Year', ''),
('Perla Towers 1', 'Emirates Limited ', '', 'Abu Dhabi', 'Completed', 'Supervision', 'Residential', 2608000.00, '2023-10-01', '2025-01-01', '24 Months', ''),
('SSMC Staff Parking Phase I', 'SSMC/RAFED', '', 'Abu Dhabi', 'Completed', 'Design Build', 'Healthcare', 3953012.00, '2024-02-01', '2024-08-31', '5 Months', ''),
('SSMC Staff Parking Phase II', 'SSMC/RAFED', '', 'Abu Dhabi', 'DLP Period', 'Design Build', 'Healthcare', 7915590.00, '2024-09-01', '2025-02-28', '6 Months', ''),
('Tawazun Industrial Park', 'Tawazun', '', 'Abu Dhabi', 'Upcoming', 'Design & Supervision', 'Industrial', 13573000.00, NULL, NULL, '', ''),
('Facelift Enhancement Projects at SKMC and Tawam Hospital', 'RAFED', '', 'Abu Dhabi & Al Ain', 'Pre-Award / Tender Stage', 'Design & Supervision', 'Healthcare', 23425855.74, NULL, NULL, '36 Months', ''),
('Abu Dhabi Plant Tissue Culture Lab', 'Presidential Court', '', 'Abu Dhabi', 'Pre-Award / Tender Stage', 'Design & Supervision', 'Institutional', 4753600.00, '2026-01-01', '2027-10-31', '21  Months', ''),
('New Hospital at Delma Island - Abu Dhabi', 'RAFED', '', 'Abu Dhabi', 'Pre-Award / Tender Stage', 'Design & Supervision', 'Healthcare', 11895097.00, '2026-03-01', '2030-03-31', '48 Months', ''),
('Agricultural Genome Bank Design', 'Abu Dhabi Agriculture & Food Safety Authority (ADAFSA)', '', 'Abu Dhabi', 'Pre-Award / Tender Stage', 'Design & Supervision', 'Institutional', 13149500.00, '2026-01-01', '2028-04-30', '27 Months', ''),
('The Farm house', 'ZAAD DEVELOPMENT LLC', '', 'Abu Dhabi', 'Pre-Award', 'Design & Supervision', 'Residential', 4966200.00, '2026-12-01', '2028-01-31', '25 Months', ''),
('The Beach House', 'ZAAD DEVELOPMENT LLC', '', 'Abu Dhabi', 'Tender Stage', 'Design & Supervision', 'Residential', 5514456.00, NULL, NULL, '21 Months', ''),
('Lusaili & Lahbab', 'Dubai Health', '', 'Abu Dhabi', 'Pre-Award / Tender Stage', 'Design & Supervision', 'Healthcare', 8002900.00, NULL, NULL, '36 Months', ''),
('Converting group of villas into a specialized hospital', 'AI Hospital - Private', '', 'Abu Dhabi', 'Tender Stage', 'Design', 'Healthcare', 540000.00, NULL, NULL, '', ''),
('80-Bed General Hospital ', 'Al Ghurair', '', 'Abu Dhabi', 'Pre-Award / Tender Stage', 'Full Design', 'Healthcare', 4298000.00, NULL, NULL, '30 Months', ''),
('Al Gurm Island Villa', 'ZAAD DEVELOPMENT LLC', '', 'Abu Dhabi', 'Pre-Award / Tender Stage', 'Design & Supervision', 'Residential', 6457665.50, NULL, NULL, '24 Months', ''),
('SSMC - Strategic Internal Expansion', 'RAFED', '', 'Abu Dhabi', 'Pre-Award / Tender Stage', 'Fit out', 'Healthcare', 15209806.00, '2025-04-01', NULL, '36 Months', ''),
('Majlis Al Amal Ground Floor, Building No: 12, DHCC, Dubai, UAE', 'Al Jalila Foundation', '', 'Abu Dhabi', 'Pre-Award / Tender Stage', 'Design & Build', 'Healthcare', 1018970.00, NULL, NULL, '3 Months', ''),
('Development of Up to Five (5) Clinics', 'Al Ghurair', '', 'Abu Dhabi', 'Pre-Award / Tender Stage', 'Pre concept', 'Healthcare', 21424000.00, NULL, NULL, '38 Months', ''),
('Central Honeybee Pest and Disease Laboratory ', 'Abu Dhabi Agriculture & Food Safety Authority (ADAFSA)', '', 'Abu Dhabi', 'Tender Stage', 'Full Design & Supervision', 'Healthcare', 5500000.00, NULL, NULL, '24 Months', ''),
('Specialized Rehab Hospital Extension', 'IMKAN Properties ', '', 'Abu Dhabi', 'Tender Stage', 'Design Consultancy Services', 'Healthcare', 3646000.00, NULL, NULL, '5 Months', '');
