
import os
import psycopg2
from dotenv import load_dotenv

# Load env from current directory
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DB_URL = os.getenv("DATABASE_URL")
SCHEMA_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "../supabase/00_consolidated_schema_clean.sql"))

def apply_schema():
    print(f"Connecting to database: {DB_URL}")
    print(f"Reading schema from: {SCHEMA_FILE}")
    
    if not os.path.exists(SCHEMA_FILE):
        print("Error: Schema file not found!")
        return

    try:
        with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
            sql_content = f.read()

        conn = psycopg2.connect(DB_URL)
        conn.autocommit = True
        cur = conn.cursor()

        print("Executing schema...")
        cur.execute(sql_content)
        
        print("✅ Schema applied successfully!")
        
        cur.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error applying schema: {e}")

if __name__ == "__main__":
    apply_schema()
