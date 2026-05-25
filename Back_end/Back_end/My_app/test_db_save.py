import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Back_end.settings")
django.setup()

from My_app.models import SQLQuestion
from My_app.ai_question_generator import generate_bulk_questions
from django.db.models import Max

try:
    print("Generating bulk questions (2 items)...")
    questions_data = generate_bulk_questions("easy", 2)
    print("AI Output:", questions_data)
    
    max_model_no = SQLQuestion.objects.aggregate(Max('model_no'))['model_no__max']
    next_model_no = (max_model_no or 0) + 1
    
    for item in questions_data:
        question_text = item.get("question", "")
        print(f"Saving question with option: '{item.get('option')}'")
        
        q = SQLQuestion.objects.create(
            question=question_text,
            methods=item.get("methods", ""),
            difficulty=item.get("difficulty", "easy"),
            model_no=next_model_no,
            answer=item.get("answer", ""),
            option=item.get("option", ""),
            sample_data=item.get("sample_data", [])
        )
        print(f"Saved DB ID {q.id}. Option from DB: '{q.option}'")

except Exception as e:
    print("Error:", e)
