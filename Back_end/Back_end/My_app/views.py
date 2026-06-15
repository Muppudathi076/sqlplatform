from datetime import date
from django.db.models import F
import sqlite3
import os
import json
import re
from rest_framework.decorators import api_view,permission_classes,authentication_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializer import LoginSerializer,RegisterSerializer,UserdetailsSerializer,QuestionProgressSerializer
from My_admin.serializers import QuestionallSerializer, QuestionSerializer
from .utils import generate_custom_access_token,CustomJWTAuthentication,validate_query
from .models import Login,UserProgress,DailyUsage
from My_admin.models import SQLQuestion
from django.db import connection 
from django.utils.timezone import now
from django.db.models import Count, Sum,Q
from datetime import datetime, timedelta
from .ai_question_generator import generate_question_metadata, evaluate_assessment_answers, explain_sql_error, chat_with_sql_ai

# ── Static Assessment Questions (10 questions, mixed difficulty) ──
ASSESSMENT_QUESTIONS = [
    {"id": 1, "question": "What SQL command is used to retrieve data from a database?", "options": ["SELECT", "GET", "FETCH", "RETRIEVE"], "correct": "SELECT", "difficulty": "beginner", "type": "mcq"},
    {"id": 2, "question": "Which clause filters rows in a SELECT statement?", "options": ["HAVING", "WHERE", "FILTER", "LIMIT"], "correct": "WHERE", "difficulty": "beginner", "type": "mcq"},
    {"id": 3, "question": "Which SQL function counts the number of rows?", "options": ["SUM()", "AVG()", "COUNT()", "MAX()"], "correct": "COUNT()", "difficulty": "beginner", "type": "mcq"},
    {"id": 4, "question": "Write a SQL query to select all columns from a table named 'employees'.", "correct": "SELECT * FROM employees;", "difficulty": "beginner", "type": "query"},
    {"id": 5, "question": "What does JOIN do in SQL?", "options": ["Combines rows from two or more tables", "Splits a table into parts", "Deletes duplicate rows", "Sorts data alphabetically"], "correct": "Combines rows from two or more tables", "difficulty": "intermediate", "type": "mcq"},
    {"id": 6, "question": "Which JOIN returns only matching rows from both tables?", "options": ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], "correct": "INNER JOIN", "difficulty": "intermediate", "type": "mcq"},
    {"id": 7, "question": "Which clause is used with aggregate functions to filter groups?", "options": ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], "correct": "HAVING", "difficulty": "intermediate", "type": "mcq"},
    {"id": 8, "question": "Write a SQL query to get the average salary grouped by department from table 'employees' (columns: department, salary).", "correct": "SELECT department, AVG(salary) FROM employees GROUP BY department;", "difficulty": "intermediate", "type": "query"},
    {"id": 9, "question": "What is a subquery in SQL?", "options": ["A query nested inside another query", "A backup of the main query", "A stored procedure call", "A database view"], "correct": "A query nested inside another query", "difficulty": "expert", "type": "mcq"},
    {"id": 10, "question": "Write a SQL query to find the top 3 highest paid employees from table 'employees' (columns: name, salary).", "correct": "SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;", "difficulty": "expert", "type": "query"},
]

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def register_view (requst):
    serizlizer = RegisterSerializer(data = requst.data)
    
    if serizlizer.is_valid():
        serizlizer.save() 
        return Response(
            {"message":"User register successfull"},
            status=200
        )
    return Response(serizlizer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():

        data = serializer.validated_data
        user = data["user"]
        user_type = data["user_type"]

        if user_type == "normal":
            user.last_login_time = now()
            user.save()
            tokens = generate_custom_access_token(user)
            print("aceesss token valles ",tokens)
            return Response({
                "message": "User Login Success",
                "role": user.role,
                "name": user.Name,
                "email": user.Email,
                "access": tokens,
                "assessment_completed": getattr(user, 'assessment_completed', False)
            })

        if user_type == "admin":
            user.last_login_time = now()
            user.save()
            tokens = generate_custom_access_token(user)
            print("aceesss token valles ",tokens)
            return Response({
                "message": "Admin Login Success",
                "role": "admin",
                "name": user.username,
                "email": user.email,
                "access": tokens,
            })
    print(serializer.errors) 
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def logout_view(request):
    user = request.user

    try:
        # Admin users (Django User model) don't have last_login_time or spend_time
        if not hasattr(user, 'last_login_time'):
            return Response({"message": "Admin Logout success"})

        if user.last_login_time:
            logout_time = now()
            session_time = logout_time - user.last_login_time

            user.total_spend_time += session_time
            user.last_login_time = None
            user.save()

            today = date.today()
            usage, created = DailyUsage.objects.get_or_create(
                user=user,
                date=today,
                defaults={"spend_time": session_time}
            )

            if not created:
                usage.spend_time += session_time
                usage.save()

        return Response({"message": "Logout success"})

    except Exception as e:
        return Response({"error": str(e)}, status=400)
    
@api_view(['PUT'])
@authentication_classes([CustomJWTAuthentication])
def change_password(request):

    user = request.user 
    new_password = request.data.get("new_password")

    if not new_password:
        return Response({"error": "All fields required"}, status=400)
    user.Password = new_password
    user.save()
    return Response({"message": "Password updated successfully"},status=200)

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])  
@permission_classes([IsAuthenticated])
def get_user_details(request):

    user = request.user   

    serializer = UserdetailsSerializer(user)

    return Response(serializer.data)
    
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_questions(request, model_id):

    completed_question_ids = UserProgress.objects.filter(
        user=request.user,
        is_completed=True
    ).values_list("question_id", flat=True)

    questions = SQLQuestion.objects.filter(
        model_no=model_id
    ).exclude(
        id__in=completed_question_ids
    )

    serializer = QuestionallSerializer(questions, many=True)
    return Response({
        "status": "success",
        "questions": serializer.data
    })

def get_table_name(schema):
    match = re.search(r'create table (\w+)', schema.lower())
    return match.group(1) if match else None

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication]) 
@permission_classes([IsAuthenticated])
def answer_checking(request, questionId):

    query = request.data.get("query", "").strip()

    try:
        question = SQLQuestion.objects.get(id=questionId)
    except SQLQuestion.DoesNotExist:
        return Response({"success": False, "message": "Question not found"})

    validation = validate_query(query, question.answer)
    if not validation["success"]:
        return Response(validation)

    try:
        conn = sqlite3.connect(":memory:")
        cursor = conn.cursor()

        query_lower = query.lower()

        if query_lower.startswith("create"):
            cursor.execute(query)

            UserProgress.objects.update_or_create(
                user=request.user,
                question=question,
                defaults={"is_completed": True}
            )

            return Response({
                "success": True,
                "message": "Table created successfully"
            })

        elif query_lower.startswith("select"):

            if question.schema:
                cursor.executescript(question.schema)

            if question.sample_data and len(question.sample_data) > 0:
                table_name = get_table_name(question.schema)

                placeholders = ",".join(["?"] * len(question.sample_data[0]))
                insert_query = f"INSERT INTO {table_name} VALUES ({placeholders})"

                cursor.executemany(insert_query, question.sample_data)

            cursor.execute(query)

            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

            data = [dict(zip(columns, row)) for row in rows]

            UserProgress.objects.update_or_create(
                user=request.user,
                question=question,
                defaults={"is_completed": True}
            )

            return Response({
                "success": True,
                "data": data,
                "message":"Query is correct"
            })

        else:
            return Response({
                "success": False,
                "message": "Only SELECT / CREATE queries allowed"
            })

    except Exception as e:
        error_str = str(e)
        ai_hint = explain_sql_error(query, error_str)
        return Response({
            "success": False,
            "message": error_str,
            "ai_hint": ai_hint
        })
                
@api_view(['POST'])
def run_query(request):
    user_query = request.data.get("query")

    try:
        with connection.cursor() as cursor:
            cursor.execute(user_query)

            if user_query.lower().startswith("select"):
                result = cursor.fetchall()
                return Response({
                    "status": "success",
                    "data": result
                })
            else:
                return Response({
                    "status": "success",
                    "message": "Query executed successfully"
                })

    except Exception as e:
        error_str = str(e)
        ai_hint = explain_sql_error(user_query, error_str)
        return Response({
            "status": "error",
            "message": error_str,
            "ai_hint": ai_hint
        })

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    user = request.user

    total_score = UserProgress.objects.filter(
        user=user,
        is_completed=True
    ).count()
    
    total_questions = SQLQuestion.objects.count()
    
    if total_questions > 0:
        score_percentage = round((total_score / total_questions) * 100, 2)
    else:
        score_percentage = 0.0
    
    total_time = user.total_spend_time  

    total_minutes = int(total_time.total_seconds() / 60)

    if total_minutes >= 60:
        hours = total_minutes // 60   
        formatted_time = f"{hours} hr"
    else:
        formatted_time = f"{total_minutes} min"
        
    users = Login.objects.annotate(
        score=Count('userprogress', filter=Q(userprogress__is_completed=True))
    ).order_by('-score')

    user_list = list(users)

    global_rank = next(
        (i + 1 for i, u in enumerate(user_list) if u.id == user.id),
        0
    )

    total_questions = SQLQuestion.objects.count()
    total_courses = total_questions // 10

    cards = {
        "total_score": score_percentage,
        "total_time": formatted_time,
        "global_rank": global_rank,
        "total_courses": total_courses
    }
    today = datetime.today().date()

    weekly_data = []

    for i in range(6, -1, -1):
        day = today - timedelta(days=i)

        usage = DailyUsage.objects.filter(
            user=user,
            date=day
        ).first()

        time_spent = usage.spend_time.total_seconds() / 60 if usage else 0

        weekly_data.append({
            "day": day.strftime("%a"),
            "time": round(time_spent, 2)
        })

        monthly_data = []

        for i in range(29, -1, -1):
            day = today - timedelta(days=i)

            usage = DailyUsage.objects.filter(
                user=user,
                date=day
            ).first()

            time_spent = usage.spend_time.total_seconds() / 60 if usage else 0

            monthly_data.append({
                "date": day.strftime("%d"),
                "time": round(time_spent, 2)
            })

    table_data = []

    models = SQLQuestion.objects.values('model_no').annotate(
        total=Count('id')
    )

    for m in models:
        model_no = m['model_no']
        total = m['total']

        solved = UserProgress.objects.filter(
            user=user,
            question__model_no=model_no,
            is_completed=True
        ).count()

        remaining = total - solved
        progress = int((solved / total) * 100) if total > 0 else 0

        table_data.append({
            "topic": f"Level {model_no}",
            "total": total,
            "solved": solved,
            "remaining": remaining,
            "progress": f"{progress}%"
        })

    total_solved = UserProgress.objects.filter(
        user=user,
        is_completed=True
    ).count()

    total_questions = SQLQuestion.objects.count()

    in_process = total_questions - total_solved

    pie_chart = [
        {"name": "Process", "value": total_solved},
        {"name": "In process", "value": in_process}
    ]

    return Response({
        "cards": cards,
        "weekly_chart": weekly_data,
        "monthly_chart": monthly_data,
        "table": table_data,
        "pie_chart": pie_chart,
        "assessment": {
            "completed": getattr(user, 'assessment_completed', False),
            "level": getattr(user, 'assessment_level', None),
            "score": getattr(user, 'assessment_score', 0)
        }
    })
    
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def all_user_details(request):

    users = Login.objects.filter(role="user")

    user_list = []

    for user in users:
        total_score = UserProgress.objects.filter(
            user=user,
            is_completed=True
        ).count()
        
        total_questions = SQLQuestion.objects.count()
        
        if total_questions > 0:
            score_percentage = round((total_score / total_questions) * 100, 2)
            score = f"{score_percentage}%"   
        else:
            score_percentage = 0
            score = "0%"

        level = f"Level {total_score // 10 + 1}"  

        total_time = user.total_spend_time
        total_minutes = int(total_time.total_seconds() / 60)

        if total_minutes >= 60:
            time = f"{total_minutes // 60} hr"
        else:
            time = f"{total_minutes} min"

        user_list.append({
            "id": user.id,
            "name": user.Name,
            "score": score,
            "model": level,
            "total_time": time,
            "sql_academy_level": getattr(user, 'sql_academy_level', 0)
        })

    return Response({
        "success": True,
        "data": user_list
    })
    
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])  
@permission_classes([IsAuthenticated])
def get_all_question(request):

    questions = SQLQuestion.objects.all().order_by("id")   

    serializer = QuestionallSerializer(questions,many=True)

    return Response({
        "success": True,
        "data": serializer.data
    })
    
@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])  
@permission_classes([IsAuthenticated])
def delete_user_byid(request,userId):
    try:
        users = Login.objects.get(id=userId)   
        question = UserProgress.objects.filter(user=userId)   
        users.delete()
        question.delete()
        return Response({
            "success": True,
            "message": "Data Delete Successfully"
        })
    except Login.DoesNotExist:
        return Response({
            "success":False,
            "message":"User Not Found"
        },status=404)
        
@api_view(['PATCH'])
@authentication_classes([CustomJWTAuthentication])  
@permission_classes([IsAuthenticated])
def questionUpdated(request,questionId):
    try:
        question = SQLQuestion.objects.get(id= questionId)
        data = request.data.copy()

        difficulty_map = {
            "easy": 1,
            "medium": 2,
            "hard": 3
        }

        if "difficulty" in data:
            difficulty_value = data["difficulty"].lower()

            if difficulty_value in difficulty_map:
                data["model_no"] = difficulty_map[difficulty_value]
        serializer = QuestionSerializer(
           question,
           data= request.data,
           partial= True 
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success":True,
                "message":"Update successfully"
            },status=200)
            
        return Response({
            "success": False,
            "errors": serializer.errors
        }, status=400)
        
    except SQLQuestion.DoesNotExist:
        return Response({
            "success":False,
            "message":"Qustion Not found"
        },status=404)

@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])  
@permission_classes([IsAuthenticated])
def questionDelete(request,questionId):
    try:
        question = SQLQuestion.objects.filter(id= questionId)
        question.delete()
        return Response({
                "success":True,
                "message":"Update successfully"
            },status=200)
        
    except SQLQuestion.DoesNotExist:
        return Response({
            "success":False,
            "message":"Qustion Not found"
        },status=404)
        
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])  
@permission_classes([IsAuthenticated])
def questionAdd(request):
    try:    
        data = request.data.copy()

        difficulty_map = {
            "easy": 1,
            "medium": 2,
            "hard": 3
        }

        difficulty = data.get("difficulty", "").lower()
        question = data.get("question", "")

        data["model_no"] = difficulty_map.get(difficulty)
        ai_result = generate_question_metadata(question, difficulty)

        data["answer"] = ai_result.get("answer", "")
        data["schema"] = ai_result.get("schema", "")
        data["sample_data"] = ai_result.get("sample_data", [])
        serializer = QuestionSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": "Question added successfully",
                "data": serializer.data
            }, status=200)
            
        return Response({
                "success": False,
                "errors": serializer.errors
            }, status=400)
    except SQLQuestion.DoesNotExist:
        return Response({
            "success":False,
            "message":"Qustion Not found"
        },status=404)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def question_progress(request):
    serializer = QuestionProgressSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },status=400)

    question_id = serializer.validated_data["questionId"]
    is_correct = serializer.validated_data["isCorrect"]

    try:
        question = SQLQuestion.objects.get(id=question_id)

        UserProgress.objects.update_or_create(
            user=request.user,
            question=question,
            defaults={
                "is_completed": is_correct
            }
        )

        return Response(
            {
                "success": True,
                "message": "Question progress saved successfully",
                "questionId": question_id,
                "isCorrect": is_correct
            },status=200)

    except SQLQuestion.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Question not found"
            },status=404)

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": str(e)
            },status=500)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def model_complete(request, model_id):
    results = request.data.get("results", [])
    
    for result in results:
        question_id = result.get("questionId")
        is_correct = result.get("isCorrect")
        
        if is_correct and question_id:
            try:
                question = SQLQuestion.objects.get(id=question_id)
                UserProgress.objects.update_or_create(
                    user=request.user,
                    question=question,
                    defaults={"is_completed": True}
                )
            except SQLQuestion.DoesNotExist:
                continue

    return Response({
        "success": True,
        "message": "Progress saved successfully in UserProgress table"
    })

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_sql_dictionary(request):
    try:
        from My_admin.models import SqlDictionary
        entries = SqlDictionary.objects.all().order_by('id')
        if entries.exists():
            data = list(entries.values(
                'id', 'keyword', 'meaning', 'analogy', 'syntax',
                'example_query', 'icon', 'color', 'questions'
            ))
            return Response({
                "success": True,
                "data": data
            }, status=200)
        # Fallback to JSON file if DB is empty
        file_path = os.path.join(os.path.dirname(__file__), 'sql_dictionary.json')
        with open(file_path, 'r') as f:
            data = json.load(f)
        return Response({
            "success": True,
            "data": data
        }, status=200)
    except Exception as e:
        return Response({
            "success": False,
            "message": "Dictionary could not be loaded.",
            "error": str(e)
        }, status=500)

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_sql_academy(request):
    try:
        user = request.user
        
        # Try DB first
        from My_admin.models import SqlAcademy
        entries = SqlAcademy.objects.all().order_by('id')
        if entries.exists():
            data = list(entries.values(
                'id', 'title', 'instruction', 'expectedQuery', 'columns',
                'tableData', 'successMsg', 'hint'
            ))
        else:
            # Fallback
            file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'academy_questions.json')
            if not os.path.exists(file_path):
                file_path = os.path.join(os.path.dirname(__file__), 'academy_questions.json')
            with open(file_path, 'r') as f:
                data = json.load(f)

        return Response({
            "success": True,
            "data": data,
            "currentLevel": getattr(user, 'sql_academy_level', 0)
        }, status=200)
    except Exception as e:
        return Response({
            "success": False,
            "message": "Academy data could not be loaded.",
            "error": str(e)
        }, status=500)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_sql_academy(request):
    try:
        user = request.user
        level = request.data.get('level')
        if level is not None:
            # Update the user directly in database using QuerySet for instant persistence
            Login.objects.filter(id=user.id).update(sql_academy_level=int(level))
            return Response({"success": True, "saved_level": int(level)}, status=200)
        return Response({"success": False, "message": "No level provided"}, status=400)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)

@api_view(['PUT'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        user = request.user
        data = request.data
        if 'name' in data:
            user.Name = data['name']
        if 'email' in data:
            user.Email = data['email']
        if 'password' in data:
            user.Password = data['password']
        if 'age' in data:
            user.age = data['age']
        user.save()
        return Response({"success": True, "message": "Profile updated successfully"}, status=200)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


# ═══════════════════════  ASSESSMENT VIEWS  ═══════════════════════

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_assessment_questions(request):
    """Returns assessment questions (without correct answers) for the frontend."""
    questions_for_frontend = []
    for q in ASSESSMENT_QUESTIONS:
        item = {
            "id": q["id"],
            "question": q["question"],
            "difficulty": q["difficulty"],
            "type": q["type"],
        }
        if q["type"] == "mcq":
            item["options"] = q["options"]
        questions_for_frontend.append(item)
    return Response({"success": True, "questions": questions_for_frontend})


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def submit_assessment(request):
    """
    Accepts user's answers, evaluates via AI, saves level to user profile.
    Body: { answers: { "1": "SELECT", "2": "WHERE", ... } }
    """
    user = request.user

    # Admin users don't need assessment
    if not hasattr(user, 'assessment_completed'):
        return Response({"success": False, "message": "Admins do not take assessment"}, status=400)

    answers = request.data.get("answers", {})
    if not answers:
        return Response({"success": False, "message": "No answers provided"}, status=400)

    # Build Q&A pairs for AI evaluation
    qa_pairs = []
    for q in ASSESSMENT_QUESTIONS:
        user_ans = str(answers.get(str(q["id"]), "")).strip()
        qa_pairs.append({
            "question": q["question"],
            "user_answer": user_ans,
            "correct_answer": q["correct"],
            "difficulty": q["difficulty"],
        })

    # Call AI evaluator
    result = evaluate_assessment_answers(qa_pairs)
    level = result.get("level", "beginner")
    score = result.get("score", 0)
    feedback = result.get("feedback", "Assessment complete!")

    # Save to user profile
    Login.objects.filter(id=user.id).update(
        assessment_completed=True,
        assessment_level=level,
        assessment_score=score
    )

    return Response({
        "success": True,
        "level": level,
        "score": score,
        "total": len(ASSESSMENT_QUESTIONS),
        "feedback": feedback,
    })

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def ai_chat_view(request):
    message = request.data.get("message", "")
    if not message:
        return Response({"error": "Message is required"}, status=400)
    
    reply = chat_with_sql_ai(message)
    return Response({"reply": reply})
