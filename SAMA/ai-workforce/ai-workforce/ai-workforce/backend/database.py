import sqlite3
import os

BASE_DIR = os.path.dirname(__file__)
db_path = os.path.join(BASE_DIR, "career.db")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Using DB at:", db_path)

cursor.execute("SELECT * FROM results")
rows = cursor.fetchall()

print("ROWS:", rows)

for row in rows:
    print(row)

conn.close()