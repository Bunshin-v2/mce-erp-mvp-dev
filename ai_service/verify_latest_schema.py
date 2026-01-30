
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
DB_URL = os.getenv("DATABASE_URL")

def verify_schema_features():
    print("Verifying schema application...")
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Check if vector extension exists
        cur.execute("SELECT * FROM pg_extension WHERE extname = 'vector';")
        if cur.fetchone():
            print("✅ 'vector' extension is installed.")
        else:
            print("❌ 'vector' extension MISSING.")

        # Check document_embeddings column type
        cur.execute("""
            SELECT data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'document_embeddings' AND column_name = 'embedding';
        """)
        col_type = cur.fetchone()
        if col_type and col_type[1] == 'vector':
            print("✅ 'document_embeddings.embedding' column is type 'vector'.")
        else:
            print(f"❌ 'document_embeddings.embedding' is {col_type}.")

        # Check for hybrid search function
        cur.execute("""
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_name = 'match_documents_hybrid';
        """)
        if cur.fetchone():
             print("✅ 'match_documents_hybrid' function exists.")
        else:
             print("❌ 'match_documents_hybrid' function MISSING.")

        conn.close()

    except Exception as e:
        print(f"Verification failed: {e}")

if __name__ == "__main__":
    verify_schema_features()
