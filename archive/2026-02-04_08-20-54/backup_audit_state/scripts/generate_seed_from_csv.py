
import csv
import datetime
import uuid

# Configuration
INPUT_CSV = r"c:/Users/t1glish/Downloads/nexus-construct-erp (2)/Ongoing, Completed & Upcoming Projects FV(20-11-2025)(JMUPD) - - Sheet1.csv"
OUTPUT_SQL = r"c:/Users/t1glish/Downloads/nexus-construct-erp (2)/SEED_REAL_DATA.sql"

def clean_currency(value):
    if not value or value.lower() == 'nan':
        return 'NULL'
    cleaned = value.replace(',', '').replace('AED', '').strip()
    try:
        float(cleaned)
        return cleaned
    except ValueError:
        return 'NULL'

def parse_date(value):
    if not value or value.strip() == '' or value.lower() == 'tbd':
        return 'NULL'
    # Try multiple formats
    formats = [
        '%d-%b-%y', '%b-%y', '%d-%b', '%Y', '%b-%Y'
    ]
    for fmt in formats:
        try:
            dt = datetime.datetime.strptime(value.strip(), fmt)
            # If year is missing (e.g. 30-Sep), assume 2024 or next year? 
            # Actually dashboard shows 'May-24', so '%b-%y' is common.
            # If just year '2022', assume Jan 1
            if fmt == '%Y':
                dt = dt.replace(month=1, day=1)
            # If no year in '%d-%b', assume 2025? Let's just use what we have, mostly 'May-24'
            return f"'{dt.strftime('%Y-%m-%d')}'"
        except ValueError:
            continue
    # If explicit year integer 2022
    if value.strip().isdigit() and len(value.strip()) == 4:
         return f"'{value.strip()}-01-01'"
         
    return 'NULL'

def escape_sql(value):
    if not value: return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"

def main():
    print(f"Reading {INPUT_CSV}...")
    
    sql_statements = [
        "-- REAL DATA SEED FILE GENERATED FROM CSV",
        "-- 1. SCHEMA REPAIR: Ensure columns exist",
        "CREATE TABLE IF NOT EXISTS public.projects_master (id uuid PRIMARY KEY DEFAULT uuid_generate_v4());",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_name text;",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS client_name text;",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_code text;",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_location_city text;",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS scope_of_services_enum text;",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_type text;",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS contract_value_excl_vat numeric(18,2);",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS contract_duration text;",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_status text;",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_commencement_date timestamptz;",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS project_completion_date_planned timestamptz;",
        "ALTER TABLE public.projects_master ADD COLUMN IF NOT EXISTS remarks text;",
        
        "-- 2. DATA INSERTION",
        "TRUNCATE TABLE public.projects_master CASCADE;", 
        "DELETE FROM public.projects_master WHERE project_code LIKE '20%' OR project_name IS NOT NULL;" 
    ]
    
    try:
        with open(INPUT_CSV, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # Skip empty rows (Project Name is required)
                p_name_1 = row.get('Project Name', '').strip()
                # The csv has "Project Name" twice? DictReader handles duplicate keys by suffixing or overwriting? 
                # Let's inspect keys printed below if needed. usually last one wins or it handles mapped names.
                # Actually provided row header: Project Name,Client Name,Project Name...
                # Python DictReader might handle duplicate keys awkwardly. 
                # Let's use simple reader to be safe if headers are duplicated.
                pass
    except Exception as e:
        print(f"Error initializing DictReader: {e}")

    # Re-reading with index-based approach because of duplicate headers
    with open(INPUT_CSV, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        header = next(reader) # skip header
        # 0: Project Name (1?), 1: Client Name, 2: Project Name (Real?), 3: Project Code, 4: Location, 5: Scope, 6: Type, 7: Value, 8: Duration, 9: Status, 10: Commence, 11: Completion, 12: Remark
        
        # Row 1 in CSV (line 2) is header.
        # Line 1 is "MCE- PROJECTS,,,,,,,,,," - handled by skipping?
        # Let's just loop and check content.
        
        for i, row in enumerate(reader):
            if not row or len(row) < 5: continue
            
            # Identify columns by index based on file view in Step 1027
            # Line 2: Project Name,Client Name,Project Name,Project Code,Project Location,Scope of Work,Project Type,Contract Value (AED),Contract Duration,Project Status,Commencement Date,Estimated Completion Date,Remark
            
            # row[2] seems to be the real Project Name (e.g. "Design and Supervision...")
            # row[0] is short name ("New Corniche Hospital")
            # Let's use row[0] as title/name? Or row[2]?
            # row[2] descriptions look like scope sometimes. 
            # checking sample:
            # row[0]="New Corniche Hospital", row[1]="RAFED", row[2]="Design and Supervision..."
            # row[0]="AD Police Saadiyat D2", row[1]="AD POLICE", row[2]="Saadiyat Island - D2 "
            # It seems row[0] is "Project Name" (Short), row[2] is "Project Description/Title".
            # I will use row[0] for `project_name` and row[2] for `description` or just ignore row[2] if it's redundant.
            # Actually row[2] is useful. Let's map row[0] -> `project_name`.
            
            client = row[1]
            p_name = row[0]
            if not p_name and row[2]: p_name = row[2] # Fallback
            
            if not p_name or "Project Name" in p_name or "MCE-" in p_name: continue
            if "ONGOING" in p_name or "RECENTLY" in p_name or "UPCOMING" in p_name: continue
            
            p_code = row[3]
            location = row[4]
            scope = row[5]
            p_type = row[6]
            val_raw = row[7]
            duration = row[8]
            status = row[9]
            start_date = row[10]
            end_date = row[11]
            remark = row[12] if len(row) > 12 else ''

            # Construct SQL
            val_sql = clean_currency(val_raw)
            start_sql = parse_date(start_date)
            end_sql = parse_date(end_date)
            
            # Generate UUID
            uid = str(uuid.uuid4())
            
            sql = f"""
INSERT INTO public.projects_master 
(id, project_name, client_name, project_code, project_location_city, scope_of_services_enum, project_type, contract_value_excl_vat, contract_duration, project_status, project_commencement_date, project_completion_date_planned, remarks)
VALUES (
    '{uid}',
    {escape_sql(p_name)},
    {escape_sql(client)},
    {escape_sql(p_code)},
    {escape_sql(location)},
    {escape_sql(scope)},
    {escape_sql(p_type)},
    {val_sql},
    {escape_sql(duration)},
    {escape_sql(status)},
    {start_sql},
    {end_sql},
    {escape_sql(remark)}
);
"""
            sql_statements.append(sql.strip())

    print(f"Generated {len(sql_statements)} INSERT statements.")
    
    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))

if __name__ == "__main__":
    main()
