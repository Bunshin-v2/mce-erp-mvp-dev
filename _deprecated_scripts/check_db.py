import sqlite3
import os

db_path = os.path.join(os.getcwd(), 'nexus_erp.db')
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print("Tables in database:")
    for table in tables:
        print(f"- {table[0]}")
        # Print columns for suspected tables
        if table[0] in ['tenders', 'projects_master', 'projects', 'tender']:
            cursor.execute(f"PRAGMA table_info({table[0]})")
            cols = cursor.fetchall()
            for col in cols:
                print(f"  {col[1]} ({col[2]})")
    conn.close()
