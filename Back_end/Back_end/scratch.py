import os
import sys
import django

# Setup django
sys.path.append(r"c:\Users\Admin\Desktop\platform\Back_end\Back_end")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Back_end.settings")
django.setup()

from My_app.ai_question_generator import generate_ai_academy_entries
print("Generating...")
res = generate_ai_academy_entries(2)
print(f"Result: {res}")
