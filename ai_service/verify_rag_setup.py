import os
from dotenv import load_dotenv
from supabase import create_client, Client

import google.generativeai as genai

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")


if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY missing in .env")
    exit(1)

print(f"Connecting to {url}...")
try:
    supabase: Client = create_client(url, key)

    # 2. Check document_embeddings count
    print("\n[2] Checking document_embeddings table...")
    count_res = (
        supabase.table("document_embeddings")
        .select("*", count="exact", head=True)
        .execute()
    )
    print(f" -> Total Embeddings: {count_res.count}")

    if count_res.count > 0:
        # 3. Test Vector Search
        print("\n[3] Testing Hybrid Search RPC 'match_documents_hybrid'...")
        if not api_key:
            raise Exception("Missing GEMINI_API_KEY/GOOGLE_API_KEY for embeddings")

        genai.configure(api_key=api_key)

        query = "project status"
        model_name = os.environ.get(
            "GEMINI_EMBEDDING_MODEL", "models/gemini-embedding-001"
        )
        embed_res = genai.embed_content(
            model=model_name,
            content=query,
            task_type="retrieval_query",
            output_dimensionality=1536,
        )
        vector = embed_res["embedding"]

        params = {
            "query_embedding": vector,
            "query_text": query,
            "match_threshold": 0.1,  # Very low threshold to ensure hits
            "match_count": 3,
        }
        rpc_res = supabase.rpc("match_documents_hybrid", params).execute()
        print(f" -> Search Results: {len(rpc_res.data)} found")
        for doc in rpc_res.data:
            print(f"    - {doc.get('content')[:100]}...")
    else:
        print(" -> Table is EMPTY. RAG will not work.")

except Exception as e:
    print(f"Error: {e}")
    raise
