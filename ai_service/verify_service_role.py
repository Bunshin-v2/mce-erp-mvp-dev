import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not key or not key.startswith("eyJ"):
    print("ERROR: Invalid Key Format. Must be Service Role Key (JWT).")
    exit(1)

print(f"Key Prefix: {key[:6]}...")

try:
    # Explicitly force headers to ensure Service Role is used
    options = {"headers": {"Authorization": f"Bearer {key}", "apikey": key}}

    # Direct client
    supabase: Client = create_client(url, key)
    # Patch headers just in case implementation varies
    supabase.postgrest.headers.update(options["headers"])

    print("Attempting Service Role SELECT...")

    # Minimal query: specific columns, limit 1, explicit schema if needed (usually defaults to public)
    res = (
        supabase.table("document_embeddings")
        .select("document_id", count="exact")
        .limit(1)
        .execute()
    )

    print("--- RESULT ---")
    print(f"Status Code: {200}")  # If we got here, it's a success response structure
    print(f"Count: {res.count}")
    print(f"Data Length: {len(res.data)}")
    if res.data:
        print(f"Sample ID: {res.data[0].get('document_id')}")

except Exception as e:
    print("\n--- CRITICAL ERROR ---")
    print(str(e))
