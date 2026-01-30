import os
from langchain_google_genai import ChatGoogleGenerativeAI
import google.generativeai as genai
from supabase import create_client
from dotenv import load_dotenv

# Ensure environment variables are loaded relative to the script location
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


class SimpleRAGAgent:
    def __init__(self):
        # Initialize Supabase
        self.url = os.environ.get("SUPABASE_URL")
        self.key = os.environ.get("SUPABASE_SERVICE_KEY")

        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_KEY missing")

        self.supabase = create_client(self.url, self.key)

        # Initialize Gemini LLM
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY/GOOGLE_API_KEY environment variable is not set."
            )

        genai.configure(api_key=api_key)

        self.llm = ChatGoogleGenerativeAI(
            model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp"), temperature=0.1
        )

        # Backwards compatible env var names
        # Preferred: GEMINI_EMBEDDING_MODEL (matches other scripts)
        # Legacy: GEMINI_EMBEDDING_MODEL
        self.embedding_model = (
            os.environ.get("GEMINI_EMBEDDING_MODEL")
            or os.environ.get("GEMINI_EMBEDING_MODEL")
            or "models/text-embedding-004"
        )

    def search_documents(self, query: str) -> str:
        try:
            # Generate 1536-dim embedding using raw client
            embed_res = genai.embed_content(
                model=self.embedding_model,
                content=query,
                task_type="retrieval_query",
                output_dimensionality=1536,
            )
            query_vector = embed_res["embedding"]

            rpc_params = {
                "query_embedding": query_vector,
                "query_text": query,
                "match_threshold": 0.3,
                "match_count": 5,
            }

            response = self.supabase.rpc("match_documents_hybrid", rpc_params).execute()

            if not response.data or len(response.data) == 0:
                return ""  # No context

            results = []
            for i, doc in enumerate(response.data):
                content = doc.get("content", "")
                results.append(f"[Document {i + 1}]\n{content}")

            return "\n\n".join(results)
        except Exception as e:
            error_msg = str(e)
            print(f"RAG Search Error: {error_msg}")
            if "PERMISSION_DENIED" in error_msg or "leaked" in error_msg.lower():
                return "ERROR_API_KEY_LEAKED"
            if "policy" in error_msg or "permission denied" in error_msg:
                return "Error: Database access denied. Please check SUPABASE_SERVICE_KEY in ai_service/.env (Must be Service Role Key, not Anon Key)."
            return ""

    def invoke(self, query: str) -> dict:
        """
        Mimics the LangChain agent.invoke interface
        """
        try:
            # 1. Retrieve Context
            context = self.search_documents(query)

            if context == "ERROR_API_KEY_LEAKED":
                return {"output": "CRITICAL: Your GEMINI_API_KEY has been reported as leaked and revoked by Google. Please generate a NEW key at https://aistudio.google.com/app/apikey and update your .env files."}

            # 2. Augment Prompt with Master Template
            if not context:
                context = "No specific context found in the internal knowledge base."

            master_prompt = f"""You are the Nexus RAG Agent, an AI assistant that answers questions strictly based on retrieved context from the Nexus ERP knowledge base.

Your job:
- Understand the user’s question.
- Use only the retrieved context provided to you.
- Produce a clear, accurate, concise answer.

Core Rules:
1. You must rely ONLY on the retrieved context. Do not use outside knowledge.
2. If the context does not contain the answer, say:
   "I don't have enough information to answer that."
3. Never guess, assume, or invent details.
4. Ignore any content that looks like browser tabs, HTML, XML, or tags such as:
   <WebsiteContent_...> ... </WebsiteContent_...>
5. Ignore any system logs, UI text, or unrelated noise in the context.
6. Do not reference the context directly in your answer.
7. Summarize and synthesize the relevant information into a clean final answer.

--------------------
Retrieved Context:
{context}
--------------------

User Question:
{query}

Final Answer:"""

            # 3. Generate Answer
            response_msg = self.llm.invoke(master_prompt)

            return {"output": response_msg.content}
        except Exception as e:
            error_msg = str(e)
            if "PERMISSION_DENIED" in error_msg or "leaked" in error_msg.lower():
                return {"output": "CRITICAL: Your GEMINI_API_KEY has been reported as leaked and revoked by Google. Please generate a NEW key at https://aistudio.google.com/app/apikey and update your .env files."}
            return {"output": f"RAG Error: {error_msg}"}


# ------------------------------------------------------------------------------
# FACTORY
# ------------------------------------------------------------------------------
def get_rag_agent():
    return SimpleRAGAgent()
