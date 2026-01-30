from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Ensure environment variables are loaded relative to the script location
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI(title="Nexus ERP AI Service", version="1.0.0")

# Configure CORS to allow requests from the Next.js frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel
from nexus_rag import get_rag_agent

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    response: str

@app.get("/")
async def root():
    return {"message": "Nexus ERP AI Service is online (RAG Enabled)", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Process natural language queries using the RAG Agent.
    """
    try:
        agent = get_rag_agent()
        result = agent.invoke(request.query)
        # LangChain agent result is typically a dict with 'output' key
        return ChatResponse(response=result.get("output", "I couldn't generate a response."))
    except Exception as e:
        return ChatResponse(response=f"Error processing request: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
