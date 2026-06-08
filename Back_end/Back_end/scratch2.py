import os
import sys
import django
import json

sys.path.append(r"c:\Users\Admin\Desktop\platform\Back_end\Back_end")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Back_end.settings")
django.setup()

from rest_framework.test import APIRequestFactory
from My_admin.views import ai_bulk_generate_academy
from My_app.models import Login

factory = APIRequestFactory()
request = factory.post('/admins/ai/generate/academy/', {'count': 1}, format='json')

user = Login.objects.first()
if user:
    print(f"Using user: {user.Email}")
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
    
    response = ai_bulk_generate_academy(request)
    print(f"Status Code: {response.status_code}")
    print(f"Data: {response.data}")
else:
    print("No user found")
