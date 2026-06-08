import os
import sys
import django
import json

sys.path.append(r"c:\Users\Admin\Desktop\platform\Back_end\Back_end")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Back_end.settings")
django.setup()

from My_admin.models import SqlAcademy
from My_app.ai_question_generator import get_gemini_client

client = get_gemini_client()
prompt = """
You are an expert SQL training data generator. Generate exactly 2 distinct SQL Academy interactive missions for a learning platform.
Missions should represent practical, real-world scenario queries (e.g. finding high earners, filtering active users, calculating averages).

Generate valid JSON ONLY. The output must be a JSON array of objects in this exact format:
[
  {
    "title": "Find the High Earners",
    "instruction": "Write a query to retrieve the names and salaries of all employees earning more than 50000.",
    "expectedQuery": "SELECT name, salary FROM employees WHERE salary > 50000",
    "columns": ["id", "name", "salary"],
    "tableData": [
      {"id": 1, "name": "Alice", "salary": 60000},
      {"id": 2, "name": "Bob", "salary": 45000},
      {"id": 3, "name": "Charlie", "salary": 75000}
    ],
    "successMsg": "Great job! You successfully filtered the high earners.",
    "hint": "Use the WHERE clause to filter based on the salary column."
  }
]

Rules:
1. Provide exactly 2 objects in the array.
2. The "tableData" array must contain realistic JSON objects matching the "columns". It should contain 3 to 6 rows.
3. "columns" is an array of strings representing the table columns.
4. "expectedQuery" should be a standard, valid SQL query that solves the instruction. It should not end with a semicolon in the answer check.
5. Provide ONLY the JSON array.
"""

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt,
    config={"response_mime_type": "application/json"}
)

try:
    data = json.loads(response.text.strip())
    print(f"Parsed {len(data)} items")
    for item in data:
        title = item.get("title", "")
        print(f"Saving {title}...")
        SqlAcademy.objects.create(
            title=title,
            instruction=item.get("instruction", ""),
            expectedQuery=item.get("expectedQuery", ""),
            columns=item.get("columns", []),
            tableData=item.get("tableData", []),
            successMsg=item.get("successMsg", ""),
            hint=item.get("hint", "")
        )
        print("Success")
except Exception as e:
    print(f"ERROR: {e}")

