
import os
import asyncio
from dotenv import load_dotenv
from nexus_rag import get_rag_agent

# Ensure environment variables are loaded relative to the script location
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

def test_answer():
    print("--- 1. Initializing RAG Agent ---")
    try:
        agent = get_rag_agent()
        print("Agent initialized successfully.")
    except Exception as e:
        print(f"Failed to init agent: {e}")
        return

    # Question based on data we know exists (from ingestion logs)
    # We saw "Al Tawar" or similar in previous logs, or we can ask a generic one.
    question = "What is the status of the Villa project and what is its code??"
    
    print(f"\n--- 2. Asking: '{question}' ---")
    
    # Trace the steps manually for demonstration if possible, 
    # but the agent has an .invoke() method we can call directly.
    
    print("... Searching Knowledge Base (Vector Search) ...")
    context = agent.search_documents(question)
    
    if context:
        print(f"\n[FOUND CONTEXT]:\n{context[:300]}...\n(truncated)\n")
    else:
        print("\n[NO CONTEXT FOUND] - Search returned empty.\n")
        
    print("... Generatin Answer via Gemini ...")
    response = agent.invoke(question)
    
    print(f"\n--- 3. FINAL ANSWER ---\n")
    print(response.get("output"))
    print("\n-----------------------")

if __name__ == "__main__":
    test_answer()
