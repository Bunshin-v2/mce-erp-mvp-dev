import os
from dotenv import load_dotenv

# Ensure environment variables are loaded relative to the script location
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

print("1. Checking Environment Variables...")
db_url = os.getenv("DATABASE_URL")
supa_url = os.getenv("SUPABASE_URL")
google_key = os.getenv("GOOGLE_API_KEY")

if db_url: print(f"   [OK] DATABASE_URL found")
else: print(f"   [FAIL] DATABASE_URL missing")

if supa_url: print(f"   [OK] SUPABASE_URL found")
else: print(f"   [FAIL] SUPABASE_URL missing")

if google_key: print(f"   [OK] GOOGLE_API_KEY found")
else: print(f"   [FAIL] GOOGLE_API_KEY missing")

print("\n2. Connection Test...")
try:
    from tools.vector_search import vector_search_tool
    print("   [OK] Vector Tool Imported")
except Exception as e:
    print(f"   [FAIL] Vector Tool Error: {e}")

try:
    # We won't fully initialize the SQL agent as it requires a real DB connection which might be slow/fail in this isolated script context if standard postgres port isn't open locally
    # But we can try to import it.
    from agents.sql_agent import get_sql_agent
    print("   [OK] SQL Agent Module Imported")
    
    print("\n   [INFO] To fully test the agent, run: uvicorn main:app --reload")
    
except Exception as e:
    print(f"   [FAIL] SQL Agent Error: {e}")

print("\nSystem Check Complete.")
