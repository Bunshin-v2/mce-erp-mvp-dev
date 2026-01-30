
import os
from dotenv import load_dotenv
from supabase import create_client

# Ensure environment variables are loaded relative to the script location
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

supabase = create_client(url, key)

print("Checking 'document_embeddings' table structure...")

res = supabase.table("document_embeddings").select("*").limit(1).execute()

if res.data:
    row = res.data[0]
    print("--- COLUMNS FOUND ---")
    for key in row.keys():
        print(f"COLUMN: {key}")
    print("---------------------")
else:
    print("Table is empty. Cannot infer columns.")
    # Try inserting a dummy row with just ID to see what fails
    print("Attempts insert with just ID...")
    try:
        supabase.table("documents").insert({"id": "00000000-0000-0000-0000-000000000000", "content": "test"}).execute()
    except Exception as e:
        print(f"Insert Error: {e}")
