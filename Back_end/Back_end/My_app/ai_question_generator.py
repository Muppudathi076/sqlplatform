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
