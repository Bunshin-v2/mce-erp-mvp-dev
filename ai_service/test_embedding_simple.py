
import os
import sys
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

# Ensure environment variables are loaded relative to the script location
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Error: GOOGLE_API_KEY not set")
    sys.exit(1)

model_name = "models/gemini-embedding-001"
print(f"Testing Embedding Generation with {model_name}...")

try:
    embeddings = GoogleGenerativeAIEmbeddings(model=model_name, google_api_key=api_key)
    vector = embeddings.embed_query("Test string")
    print(f"SUCCESS: Generated vector of length {len(vector)}")
except Exception as e:
    print(f"FAILED with {model_name}: {e}")
