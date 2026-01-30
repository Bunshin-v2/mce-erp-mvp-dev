
# AI Service Status
The AI service is now successfully integrated using a `SimpleRAGAgent`.
- **RAG Retrieval**: Functional (queries Supabase `document_embeddings` hybrid search).
- **Backend API**: Running on port 8000.
- **Agent**: Uses `nexus_rag.py` (custom implementation) to bypass LangChain import issues.

## Next Steps
1. **Frontend Integration**: Update `NexusCopilot.tsx` to hit `http://localhost:8000/chat`.
2. **Data Ingestion**: Use the "Ingest RAG" button in Project Detail to populate data.
