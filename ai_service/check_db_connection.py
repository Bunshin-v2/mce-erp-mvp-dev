
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
print(f"Checking connection to: {db_url}")

try:
    conn = psycopg2.connect(db_url)
    print("Connection SUCCESS")
    conn.close()
except Exception as e:
    print(f"Connection FAILED: {e}")
