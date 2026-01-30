import os
from langchain.tools import tool
from supabase import create_client, Client
from langchain_google_genai import GoogleGenerativeAIEmbeddings

@tool
def vector_search_tool(query: str) -> str:
    """
    Useful for searching company policies, documentation, and non-structured data.
    Use this when the user asks about "how to", "policies", "rules", or general knowledge
    that wouldn't be in a SQL table.
    """
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_SERVICE_KEY") # Use Service Key for AI capabilities

    if not url or not key:
        return "Error: vector_search_tool is not configured (SUPABASE_URL/KEY missing)."

    supabase: Client = create_client(url, key)

    # Embed the query (Using Gemini or OpenAI - matching your setup)
    # Ideally, we call the same embedding function used for ingestion.
    # For now, we will assume we call the 'match_documents' RPC we saw in rag_setup.sql
    
    # NOTE: Since we don't have a local embedding model running in this container yet,
    # we will rely on Supabase to handle the embedding OR we need to add VertexAIEmbeddings here.
    # To keep it simple for the 'VM' setup, we can use a raw text search fallback 
    # OR if you have the embedding API key, we use it. 
    
    # For this iteration, let's assume we are calling a Supabase Edge Function 
    # OR we are just doing a keyword search fallback if embeddings aren't ready.
    # BUT wait, the user wants "Hybrid". 
    
    try:
        # Initialize Gemini Embeddings
        # Uses text-embedding-004 to match frontend implementation
        embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        
        # Generate embedding for the query
        query_vector = embeddings.embed_query(query)
        
        # Pass the vector to Supabase RPC
        # RPC should be defined to handle [vector, text, threshold, count]
        rpc_params = {
            "query_embedding": query_vector, 
            "query_text": query,
            "match_threshold": 0.5,
            "match_count": 5
        }
        
        response = supabase.rpc("match_documents_hybrid", rpc_params).execute()
             
        if not response.data or len(response.data) == 0:
            return "I'm sorry, I couldn't find any specific evidence in the documents to answer that question accurately. (Refusal: No relevant context found)"
            
        # Format the results with Citations (as per Doc Pack v2)
        results = []
        for i, doc in enumerate(response.data):
            # Cite-or-Refuse Threshold: If top result is too weak, refuse.
            if i == 0 and doc.get('similarity', 0) < 0.1:
                return "The available documents mention related topics, but I don't have enough specific evidence to provide a confident answer. (Refusal: Low similarity)"

            source = doc.get('metadata', {}).get('source', 'Unknown Document')
            results.append(f"[Source {i+1}: {source}]\nContent: {doc['content']}")
            
        return "\n---\n".join(results)

    except Exception as e:
        return f"Error executing hybrid search: {str(e)}"
