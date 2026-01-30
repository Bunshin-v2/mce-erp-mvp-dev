
import os
from dotenv import load_dotenv
from supabase import create_client

# Ensure environment variables are loaded relative to the script location
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

supabase = create_client(url, key)

print("Checking 'documents' table columns...")

try:
    # Try to fetch one row to see structure
    res = supabase.table("documents").select("*").limit(1).execute()
    print("Select Result:", res)
    if res.data:
        print("Columns found in data:", res.data[0].keys())
    else:
        print("Table is empty. Cannot infer columns from data.")
        
    # Attempt to insert a dummy row to provoke a specific schema error if generic
    print("\nAttempting dry-run insert to check constraints...")
    try:
        supabase.table("documents").insert({}).execute()
    except Exception as e:
        print(f"Insert Error as expected: {e}")
        # often this will say "null value in column 'xyz' violates not-null constraint"

except Exception as main_e:
    print(f"Main Error: {main_e}")
