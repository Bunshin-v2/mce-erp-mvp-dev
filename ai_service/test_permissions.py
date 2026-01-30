
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import random

# Ensure environment variables are loaded relative to the script location
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

print(f"Key Start: {key[:5]}... Key End: ...{key[-5:]}")

# Explicit headers to ensure Service Role is used
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

# We use the raw Client constructor or create_client with strict options if available
# But standard create_client should work. Let's try forcing it via options if possible, 
# or just trust the headers param if supported.
# supabase-py create_client signature: (supabase_url, supabase_key, options=None)

try:
    supabase: Client = create_client(url, key)
    # Check if we can force headers
    supabase.postgrest.headers.update(headers)
    print("Client initialized with Service Key.")
except Exception as e:
    print(f"Client Init Error: {e}")
    exit(1)

TEST_ID = f"test_admin_{random.randint(10000,99999)}"

print(f"\n[TESTING INSERT] ID: {TEST_ID}")
try:
    data = {
        "document_id": TEST_ID,
        "content": "[ADMIN TEST] Bypassing RLS",
        "embedding": [0.0] * 768
    }
    # count='exact' forces a response that we can check
    res = supabase.table("document_embeddings").insert(data).execute()
    print("RESULT: INSERT SUCCESS")
except Exception as e:
    print("RESULT: INSERT FAILED")
    print(f"ERROR DETAILS: {e}")

print(f"\n[TESTING SELECT] ID: {TEST_ID}")
try:
    res = supabase.table("document_embeddings").select("*").eq("document_id", TEST_ID).execute()
    if res.data and len(res.data) > 0:
        print("RESULT: SELECT SUCCESS")
    else:
        print("RESULT: SELECT EMPTY (Should verify if INSERT worked)")
except Exception as e:
    print("RESULT: SELECT FAILED")
    print(f"ERROR DETAILS: {e}")
