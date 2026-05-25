import os
import django

# Setup django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Back_end.settings")
django.setup()

from My_app.ai_question_generator import generate_bulk_questions
import json

try:
    print("Generating bulk questions (2 items) to test options field...")
    res = generate_bulk_questions("easy", 2)
    print(json.dumps(res, indent=2))
except Exception as e:
    print("Error:", e)
