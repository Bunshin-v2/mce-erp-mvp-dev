
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Ensure environment variables are loaded from root .env.local
root_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
load_dotenv(root_env)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Try GOOGLE_API_KEY as fallback
    api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY/GOOGLE_API_KEY not found.")
    exit(1)

genai.configure(api_key=api_key)

print("Listing models to models_dump.txt...")
try:
    with open("models_dump.txt", "w") as f:
        for m in genai.list_models():
            line = f"Model: {m.name} | Methods: {m.supported_generation_methods}"
            print(f"Found: {m.name}")
            f.write(line + "\n")
    print("Done.")
except Exception as e:
    print(f"Error listing models: {e}")
