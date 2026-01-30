
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env.local"))

# Database connection parameters
DB_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") 
# Note: psycopg2 needs the postgres connection string, not the REST URL.
# Usually in Supabase projects, the connection string is provided as DATABASE_URL or POSTGRES_URL.
# Let's check if we have a direct connection string. If not, we might be stuck with REST API via supabase-py.
# However, for DDL (CREATE TABLE), we NEED a direct connection or the SQL Editor. 
# Let's look for DATABASE_URL in the .env file content I saw earlier? 
# I haven't seen the full .env content for security, but I saw .env.local exists.
# I will try to read the .env file to find a connection string. 
# If I can't find it, I'll try to use the 'supabase' python client's `rpc` specific to this project 
# (if they have a 'exec_sql' function exposed) OR just use the 'postgres' connection string format 
# derived from the project URL if it's a standard Supabase project (db.projectcheck.supabase.co).

# Let's attempt to construct the connection string if DATABASE_URL is missing.
# Standard Supabase: postgres://postgres:[PASSWORD]@[HOST]:5432/postgres
# I don't have the password.

# ALTERNATIVE: Use the `supabase` python client to run the seeding?
# No, seeding needs the table to exist.
#
# NEW PLAN: 
# Since I am an AI Agent on the user's machine, I can try to read the .env file to see if there is a DIRECT_URL or DATABASE_URL.

def apply_migration():
    print("🚀 Starting Migration Application (Python)...")
    
    # Try to find a connection string
    db_url = os.getenv("DATABASE_URL") or os.getenv("DIRECT_URL")
    
    if not db_url:
        print("❌ No DATABASE_URL or DIRECT_URL found in environment.")
        print("   Checking for creating tables via Supabase Client (only works if table already exists or via Edge Functions usually).")
        print("   ABORTING: Cannot apply DDL without direct database connection.")
        return

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Read the migration file
        migration_path = os.path.join(os.path.dirname(__file__), "../migrations/20260129_corporate_liabilities.sql")
        with open(migration_path, 'r') as f:
            sql_commands = f.read()

        print(f"📝 Applying SQL from {migration_path}...")
        cur.execute(sql_commands)
        conn.commit()
        
        print("✅ Migration applied successfully!")
        cur.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error applying migration: {e}")

if __name__ == "__main__":
    apply_migration()
