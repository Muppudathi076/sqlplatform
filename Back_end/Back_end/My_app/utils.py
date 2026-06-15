import re
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import Login
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken,RefreshToken
from datetime import timedelta
import jwt
from datetime import datetime, timedelta

SECRET_KEY = "5467365_sql_platform_admin_secret_key_32bytes"

def generate_custom_access_token(user):
    
    payload = {
        "user_id": user.id,
        "email": getattr(user, "Email", None) or getattr(user, "email", ""),
        "role": getattr(user, "role", "admin"),
        "name": getattr(user, "Name", None) or getattr(user, "username", ""),
        "exp": datetime.utcnow() + timedelta(hours=2),
        "iat": datetime.utcnow(),
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def decode_token(raw_token):
    print("entery okken")
    try:
        token = AccessToken(raw_token)
        return token.payload
    except Exception as e:
        return {"error": str(e)}


class CustomJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        try:
            prefix, token = auth_header.split()
        except ValueError:
            raise AuthenticationFailed("Invalid token format")

        if prefix.lower() != "bearer":
            raise AuthenticationFailed("Invalid token prefix")

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token expired")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token")

        role = payload.get('role', 'user')

        # Admin users are stored in Django's built-in User table
        if role == 'admin':
            try:
                user = User.objects.get(id=payload['user_id'])
                # Attach role & is_authenticated for permission checks
                user.role = 'admin'
                return (user, None)
            except User.DoesNotExist:
                raise AuthenticationFailed("Admin user not found")

        # Normal users are stored in the custom Login table
        try:
            user = Login.objects.get(id=payload['user_id'])
        except Login.DoesNotExist:
            raise AuthenticationFailed("User not found")

        return (user, None)
    

def validate_query(user_query: str, correct_query: str):
    user_query = user_query.strip()
    correct_query = correct_query.strip()

    def normalize(q):
        q = q.replace(";", "").replace(" ", "").lower() 
        q = re.sub(r"'+", "'", q) 
        return q
    if not user_query.endswith(";"):
        return {
            "success": False,
            "message": "Semicolon (;) is missing"
        }

    valid_keywords = ["select", "insert", "update", "delete", "create"]
    if not any(user_query.lower().startswith(k) for k in valid_keywords):
        return {
            "success": False,
            "message": "SQL keyword mistake"
        }

    def extract_table(query):
        match = re.search(r'create\s+table\s+(\w+)\s*\((.*?)\)', query.lower())
        if not match:
            return None, []

        table_name = match.group(1)
        columns = match.group(2).split(",")

        columns = [col.strip().replace(" ", "") for col in columns]

        return table_name, sorted(columns)

    user_table = extract_table(user_query)
    correct_table = extract_table(correct_query)

    if correct_table and user_table != correct_table:
        return {
            "success": False,
            "message": f"Table name mistake (expected: {correct_table})"
        }

    if normalize(user_query) != normalize(correct_query):
        return {
            "success": False,
            "message": "Query is incorrect"
        }

    return {
        "success": True,
        "message": "Query is valid"
    }
    
def validate_question_answer_match(question_text: str, answer_sql: str):
    sql_keywords = [
        "create table",
        "select",
        "insert into",
        "update",
        "delete",
        "alter table",
        "drop table"
    ]

    is_sql_question = any(
        keyword in answer_sql.lower()
        for keyword in sql_keywords
    )

    if not is_sql_question:
        return None

    q_table_match = re.search(
        r"table named\s+(\w+)\s+with columns\s+(.+)",
        question_text,
        re.IGNORECASE
    )

    a_table_match = re.search(
        r"CREATE\s+TABLE\s+(\w+)\s*\((.*?)\)",
        answer_sql,
        re.IGNORECASE | re.DOTALL
    )

    if not q_table_match or not a_table_match:
        return None

    q_table = q_table_match.group(1).lower()
    q_fields = [
        f.strip().lower()
        for f in q_table_match.group(2).split(",")
    ]

    a_table = a_table_match.group(1).lower()
    a_fields_raw = a_table_match.group(2).split(",")

    a_fields = [
        field.strip().split()[0].lower()
        for field in a_fields_raw
    ]

    if q_table != a_table:
        return (
            f"Table name mismatch! "
            f"Question uses '{q_table}' but answer uses '{a_table}'. "
            f"Please change the answer table name."
        )

    if set(q_fields) != set(a_fields):
        return (
            f"Column mismatch! "
            f"Question columns {q_fields} but answer columns {a_fields}. "
            f"Please correct the answer fields."
        )
    return None 