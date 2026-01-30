import pandas as pd
import os

def generate_sql():
    # 1. Read Dictionary
    # Note: Header is on row 1 (0-indexed), skipping row 0
    dict_df = pd.read_csv('data_exports/dictionary.csv', skiprows=1)
    dict_df = dict_df[dict_df['ColumnName'].notna()]

    # 2. Read Projects Data
    # Note: Skipping the header row
    proj_df = pd.read_csv('data_exports/projects_sheet1.csv', skiprows=1)
    # Filter valid project rows
    proj_df = proj_df[proj_df['Project Name'].notna()]
    ignore_list = ['ONGOING', 'RECENTLY COMPLETED CONTRACTS', 'UPCOMING PROJECTS', 'Total']
    proj_df = proj_df[~proj_df['Project Name'].isin(ignore_list)]

    type_map = {
        'uuid': 'uuid',
        'string': 'text',
        'text': 'text',
        'enum': 'text',
        'ref': 'uuid',
        'date': 'timestamptz',
        'int': 'integer',
        'json': 'jsonb',
        'bool': 'boolean',
        'decimal(18,2)': 'numeric(18,2)',
        'decimal(5,2)': 'numeric(5,2)'
    }

    sql = []
    sql.append('-- Master SQL Setup for MCE Command Center')
    sql.append('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    sql.append('\n-- 1. Create Projects Table')
    sql.append('CREATE TABLE IF NOT EXISTS projects_master (')
    sql.append('    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),')

    created_cols = set(['id'])
    for _, row in dict_df.iterrows():
        col = str(row['ColumnName']).strip()
        if not col or col == 'nan' or col in created_cols:
            continue
            
        raw_type = str(row['DataType']).lower()
        sql_type = 'text'
        for k, v in type_map.items():
            if k in raw_type:
                sql_type = v
                break
        
        sql.append(f'    {col} {sql_type},')
        created_cols.add(col)

    sql.append('    created_at timestamptz DEFAULT now(),')
    sql.append('    updated_at timestamptz DEFAULT now()')
    sql.append(');')

    sql.append('\n-- 2. Enable Realtime')
    sql.append('alter publication supabase_realtime add table projects_master;')

    sql.append('\n-- 3. Seed Data')
    for _, row in proj_df.iterrows():
        name = str(row['Project Name']).replace("'", "''")
        client = str(row['Client Name']).replace("'", "''")
        code = str(row['Project Code']).replace("'", "''") if pd.notna(row['Project Code']) else ''
        location = str(row['Project Location']).replace("'", "''")
        status = str(row['Project Status']).replace("'", "''")
        
        # Parse value
        val_raw = str(row['Contract Value (AED)'])
        val_clean = ''.join(c for c in val_raw if c.isdigit() or c == '.')
        try:
            val_num = float(val_clean)
        except:
            val_num = 0
            
        sql.append(f"INSERT INTO projects_master (PROJECT_NAME, CLIENT_NAME, PROJECT_CODE, PROJECT_LOCATION_CITY, PROJECT_STATUS, CONTRACT_VALUE_EXCL_VAT) VALUES ('{name}', '{client}', '{code}', '{location}', '{status}', {val_num});")

    with open('master_setup.sql', 'w') as f:
        f.write('\n'.join(sql))
    
    print("Successfully generated master_setup.sql")

if __name__ == "__main__":
    generate_sql()
