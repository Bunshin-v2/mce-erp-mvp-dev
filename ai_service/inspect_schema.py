
import os
import psycopg2
from dotenv import load_dotenv

# Ensure environment variables are loaded relative to the script location
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not found")
    exit(1)

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    # Check table columns
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'document_embeddings';
    """)
    columns = cur.fetchall()
    print("Table 'document_embeddings' columns:")
    for col in columns:
        print(f" - {col[0]} ({col[1]})")

    # Check for functions
    cur.execute("""
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_type = 'FUNCTION' 
        AND specific_schema = 'public'
        AND routine_name LIKE 'match_%';
    """)
    funcs = cur.fetchall()
    print("\nMatching Functions:")
    for f in funcs:
        print(f" - {f[0]}")

    conn.close()

except Exception as e:
    print(f"Error: {e}")
