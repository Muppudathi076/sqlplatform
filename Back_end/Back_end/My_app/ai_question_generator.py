from google import genai
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Gemini
# The API key should be set in .env file or environment variables
api_key = os.environ.get("GEMINI_API_KEY", "")

def get_gemini_client():
    if api_key:
        return genai.Client(api_key=api_key)
    return None


def _validate_and_fix_options(data: list) -> list:
    """
    Post-process AI output:
    - Deduplicate options (case-insensitive)
    - Remove empty/blank option entries
    - Drop questions that end up with fewer than 2 unique options
      (for 'choose the best answer' we require at least 4 unique options)
    """
    valid = []
    for item in data:
        option_raw = item.get("option", "")
        methods = item.get("methods", "").strip().lower()

        # Parse option string into list
        if isinstance(option_raw, list):
            opts = [str(o).strip() for o in option_raw]
        else:
            opts = [o.strip() for o in str(option_raw).split(",")]

        # Remove blank entries
        opts = [o for o in opts if o]

        # Deduplicate while preserving order (case-insensitive comparison)
        seen = set()
        unique_opts = []
        for o in opts:
            key = o.lower()
            if key not in seen:
                seen.add(key)
                unique_opts.append(o)

        # Enforce minimum unique option count per method
        min_required = 4 if methods == "choose the best answer" else 2
        if len(unique_opts) < min_required:
            print(f"[AI Validator] Skipping question due to insufficient unique options "
                  f"({len(unique_opts)}/{min_required}): {item.get('question', '')[:60]}")
            continue

        # Ensure the correct answer is among the unique options
        answer = item.get("answer", "").strip()
        answer_in_opts = any(o.lower() == answer.lower() for o in unique_opts)
        if not answer_in_opts and methods != "drag and drop":
            # Append answer if missing (shouldn't happen but safety net)
            unique_opts.append(answer)

        item["option"] = ",".join(unique_opts)
        valid.append(item)

    return valid


def generate_bulk_questions(difficulty: str, count: int = 10):
    client = get_gemini_client()
    if not client:
        print("GEMINI_API_KEY is not set in environment variables!")
        return []
    
    prompt = f"""
You are an expert SQL training data generator. Generate exactly {count} distinct SQL practice questions for a learning platform.
Difficulty level: {difficulty}

Generate valid JSON ONLY. The output must be a JSON array of objects in this exact format:
[
  {{
    "question": "Write a query to select all employees from the employees table",
    "methods": "choose the best answer",
    "difficulty": "{difficulty}",
    "answer": "SELECT * FROM employees",
    "option": "SELECT * FROM employees,SELECT name FROM employees,SELECT employee_id FROM employees,SELECT * FROM users",
    "sample_data": [["Alice", 30], ["Bob", 28]]
  }}
]

Rules:
1. Provide exactly {count} objects in the array.
2. "methods" MUST BE EXACTLY ONE OF THESE FOUR STRINGS: "choose the best answer", "true or false", "fill the missing query", "drag and drop". Do not use SQL keywords for this field. Randomly distribute the questions among these 4 methods.
3. "sample_data" must be a valid JSON array of arrays representing table rows.
4. "option" generation MUST depend on the "methods":
   - If "choose the best answer": provide EXACTLY 4 multiple-choice options separated by a comma (including the correct answer). ALL 4 OPTIONS MUST BE COMPLETELY DIFFERENT FROM EACH OTHER — no repeated or similar text.
   - If "true or false": provide exactly 2 options: "True,False". The answer must be True or False.
   - If "fill the missing query": the "question" should contain blanks (e.g., "___ * FROM employees"), and "option" should contain 4 UNIQUE choices for the blank separated by comma. The answer is the correct missing snippet.
   - If "drag and drop": "option" should contain multiple draggable code fragments separated by comma that can be combined to form the correct answer.
5. CRITICAL — UNIQUENESS OF OPTIONS: Every option within a single question MUST be unique. Never repeat the same text or a near-identical fragment as two different options for the same question.
6. Provide ONLY the JSON array. Do not include any text, explanations, or markdown formatting blocks.
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        ai_text = response.text.strip()
        
        # Clean up markdown if the model returns it
        if ai_text.startswith("```json"):
            ai_text = ai_text[7:]
        if ai_text.startswith("```"):
            ai_text = ai_text[3:]
        if ai_text.endswith("```"):
            ai_text = ai_text[:-3]
        ai_text = ai_text.strip()
        
        data = json.loads(ai_text)
        if isinstance(data, list):
            return _validate_and_fix_options(data)
        return []
    except Exception as e:
        print(f"Gemini API Error (Bulk): {e}")
        return []

def generate_question_metadata(question: str, difficulty: str):
    client = get_gemini_client()
    if not client:
        print("GEMINI_API_KEY is not set in environment variables!")
        return {"answer": "", "schema": "", "sample_data": []}
    
    prompt = f"""
You are an SQL training data generator.

Question: {question}
Difficulty: {difficulty}

Generate valid JSON only in this exact format:
{{
  "answer": "SQL answer or theory answer",
  "schema": "CREATE TABLE statement if SQL question else empty string",
  "option": "SELECT * FROM employees,SELECT name FROM employees,SELECT employee_id FROM employees,SELECT * FROM users",
  "sample_data": []
}}

Rules:
- If theory question, keep schema="" and sample_data=[]
- If SQL question, create valid schema and realistic sample_data
- "option" MUST contain exactly 4 plausible multiple-choice options separated by a comma (including the correct answer). Do NOT leave it empty.
- Return only JSON, no explanation
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        ai_text = response.text.strip()
        return json.loads(ai_text)
    except Exception as e:
        print(f"Gemini Metadata Error: {e}")
        return {
            "answer": "",
            "schema": "",
            "sample_data": []
        }

def generate_ai_dictionary_entries(count: int = 5):
    client = get_gemini_client()
    if not client:
        print("GEMINI_API_KEY is not set in environment variables!")
        return []
    
    prompt = f"""
You are an expert SQL training data generator. Generate exactly {count} distinct SQL dictionary entries for a learning platform. Choose fundamental or advanced SQL keywords (e.g. SELECT, WHERE, JOIN, GROUP BY, HAVING, CTE, WINDOW FUNCTIONS).
Ensure the chosen keywords are distinct.

Generate valid JSON ONLY. The output must be a JSON array of objects in this exact format:
[
  {{
    "keyword": "SELECT",
    "meaning": "Used to retrieve data from a database.",
    "analogy": "Like choosing an item from a menu.",
    "syntax": "SELECT column1, column2 FROM table_name;",
    "example_query": "SELECT first_name, last_name FROM employees;",
    "icon": "Database", 
    "color": "from-blue-400 to-indigo-600",
    "questions": [
      {{
        "question": "Which SQL statement is used to extract data from a database?",
        "options": ["EXTRACT", "SELECT", "GET", "OPEN"],
        "answer": "SELECT"
      }},
      {{
        "question": "Can you use SELECT without a FROM clause in some databases?",
        "options": ["Yes, for simple expressions", "No, FROM is always required", "Only in MySQL", "Only if there are no tables"],
        "answer": "Yes, for simple expressions"
      }},
      {{
        "question": "What does SELECT * mean?",
        "options": ["Select all tables", "Select all columns", "Select unique values", "Select specific rows"],
        "answer": "Select all columns"
      }}
    ]
  }}
]

Rules:
1. Provide exactly {count} objects in the array.
2. The "questions" array MUST contain exactly 3 multiple-choice questions for each keyword.
3. The "options" array in each question MUST contain exactly 4 distinct choices.
4. "icon" can be one of: "Database", "Table", "Filter", "Layers", "Code", "BookOpen", "Zap", "Search".
5. "color" should be a valid tailwind gradient string (e.g. "from-red-400 to-rose-600", "from-green-400 to-emerald-600").
6. Provide ONLY the JSON array.
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        ai_text = response.text.strip()
        
        if ai_text.startswith("```json"):
            ai_text = ai_text[7:]
        elif ai_text.startswith("```"):
            ai_text = ai_text[3:]
        if ai_text.endswith("```"):
            ai_text = ai_text[:-3]
        ai_text = ai_text.strip()

        data = json.loads(ai_text)
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"Gemini AI Dictionary Error: {e}")
        return []

def generate_ai_academy_entries(count: int = 5):
    client = get_gemini_client()
    if not client:
        print("GEMINI_API_KEY is not set in environment variables!")
        return []
    
    prompt = f"""
You are an expert SQL training data generator. Generate exactly {count} distinct SQL Academy interactive missions for a learning platform.
Missions should represent practical, real-world scenario queries (e.g. finding high earners, filtering active users, calculating averages).

Generate valid JSON ONLY. The output must be a JSON array of objects in this exact format:
[
  {{
    "title": "Find the High Earners",
    "instruction": "Write a query to retrieve the names and salaries of all employees earning more than 50000.",
    "expectedQuery": "SELECT name, salary FROM employees WHERE salary > 50000",
    "columns": ["id", "name", "salary"],
    "tableData": [
      {{"id": 1, "name": "Alice", "salary": 60000}},
      {{"id": 2, "name": "Bob", "salary": 45000}},
      {{"id": 3, "name": "Charlie", "salary": 75000}}
    ],
    "successMsg": "Great job! You successfully filtered the high earners.",
    "hint": "Use the WHERE clause to filter based on the salary column."
  }}
]

Rules:
1. Provide exactly {count} objects in the array.
2. The "tableData" array must contain realistic JSON objects matching the "columns". It should contain 3 to 6 rows.
3. "columns" is an array of strings representing the table columns.
4. "expectedQuery" should be a standard, valid SQL query that solves the instruction. It should not end with a semicolon in the answer check.
5. Provide ONLY the JSON array.
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        ai_text = response.text.strip()
        
        if ai_text.startswith("```json"):
            ai_text = ai_text[7:]
        elif ai_text.startswith("```"):
            ai_text = ai_text[3:]
        if ai_text.endswith("```"):
            ai_text = ai_text[:-3]
        ai_text = ai_text.strip()

        data = json.loads(ai_text)
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"Gemini AI Academy Error: {e}")
        return []


def evaluate_assessment_answers(questions_and_answers: list) -> dict:
    """
    Takes a list of {question, user_answer, correct_answer, difficulty} dicts
    and uses Gemini AI to evaluate and determine skill level.
    Returns: {level: 'beginner'|'intermediate'|'expert', score: int, feedback: str}
    """
    client = get_gemini_client()
    if not client:
        correct = sum(1 for q in questions_and_answers
                      if str(q.get('user_answer', '')).strip().lower() ==
                         str(q.get('correct_answer', '')).strip().lower())
        total = len(questions_and_answers)
        pct = correct / total if total else 0
        level = 'expert' if pct >= 0.8 else ('intermediate' if pct >= 0.5 else 'beginner')
        return {"level": level, "score": correct, "feedback": "Assessment complete."}

    qa_text = "\n".join([
        f"Q{i+1} [{q.get('difficulty','').upper()}]: {q.get('question','')}\n"
        f"  User Answer: {q.get('user_answer', '(no answer)')}\n"
        f"  Correct Answer: {q.get('correct_answer', '')}"
        for i, q in enumerate(questions_and_answers)
    ])

    prompt = f"""You are an expert SQL skill evaluator. Evaluate these {len(questions_and_answers)} SQL assessment answers.

{qa_text}

Based on correctness and quality of answers, determine:
1. Score (number of correct/acceptable answers out of {len(questions_and_answers)})
2. Skill level: "beginner" (0-4 correct), "intermediate" (5-7 correct), "expert" (8-10 correct)
3. Brief encouraging feedback (1-2 sentences)

For query answers, be lenient — accept semantically equivalent SQL even if formatting differs.

Return ONLY valid JSON in this exact format:
{{
  "score": 7,
  "level": "intermediate",
  "feedback": "Great SQL foundation! You handle SELECT and WHERE well but JOINs need more practice."
}}"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        ai_text = response.text.strip()
        if ai_text.startswith("```json"):
            ai_text = ai_text[7:]
        if ai_text.startswith("```"):
            ai_text = ai_text[3:]
        if ai_text.endswith("```"):
            ai_text = ai_text[:-3]
        result = json.loads(ai_text.strip())
        if result.get("level") not in ["beginner", "intermediate", "expert"]:
            result["level"] = "beginner"
        return result
    except Exception as e:
        print(f"Gemini Assessment Evaluation Error: {e}")
        correct = sum(1 for q in questions_and_answers
                      if str(q.get('user_answer', '')).strip().lower() ==
                         str(q.get('correct_answer', '')).strip().lower())
        total = len(questions_and_answers)
        pct = correct / total if total else 0
        level = 'expert' if pct >= 0.8 else ('intermediate' if pct >= 0.5 else 'beginner')
        return {"level": level, "score": correct, "feedback": "Assessment complete. Keep practicing!"}


def explain_sql_error(query: str, error_msg: str) -> str:
    """
    Takes a failed SQL query and the database error message,
    and returns a beginner-friendly explanation of what went wrong and how to fix it.
    """
    client = get_gemini_client()
    if not client:
        return "Syntax error or invalid table/column. Check your spelling."
        
    prompt = f"""
You are an expert SQL teacher. A student executed the following query and got an error:

Query:
{query}

Error Message:
{error_msg}

Explain in 2-3 short, friendly sentences what went wrong and give a hint on how to fix it. Do NOT give the exact corrected query, just guide them.
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"response_mime_type": "text/plain"}
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini SQL Error Explainer failed: {e}")
        return "There was an error in your SQL syntax or a missing column/table. Please double check your code."

def generate_admin_insights(student_data: list) -> str:
    """
    Takes an overview of student progress/scores and returns AI insights for the admin.
    """
    client = get_gemini_client()
    if not client:
        return "AI Insights are currently unavailable. Check your API key."

    prompt = f"""
You are an expert Educational Data Analyst. Review the following brief summary of students' SQL learning progress:

{student_data}

Provide a very short, punchy 1-2 line summary of how the students are doing overall. Write it in simple English so an admin can read it in 2 seconds. Mention one quick observation (e.g. "Most are beginners") and one actionable tip. Keep it extremely brief and do not use markdown.
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"response_mime_type": "text/plain"}
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Admin Insights Error: {e}")
        return "Students are actively practicing. Monitor their assessment levels to provide targeted support."

def chat_with_sql_ai(user_message: str, chat_history: list = None) -> str:
    """
    A simple SQL AI assistant that answers SQL-related queries.
    """
    client = get_gemini_client()
    if not client:
        return "Chatbot is currently offline."
        
    prompt = f"""
You are an expert, friendly SQL tutor assisting a student with a question.
CRITICAL RULES:
1. DO NOT provide the correct answer directly under any circumstances.
2. If the user explicitly asks for the correct answer, you MUST reply exactly with: "I don't have access to provide the correct answer."
3. Explain the question step by step so the user fully understands what is being asked.
4. Explain each of the options step by step and guide the user on how to think about them, but let the user figure out the final answer themselves.
5. If their question is NOT about SQL or databases, kindly steer them back to SQL topics.

Student: {user_message}
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={"response_mime_type": "text/plain"}
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Chat Error: {e}")
        return "I'm having trouble thinking right now. Please try again later!"

