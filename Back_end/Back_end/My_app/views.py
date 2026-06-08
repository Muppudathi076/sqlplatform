from datetime import date
from django.db.models import F
import sqlite3
import os
import json
import re
from rest_framework.decorators import api_view,permission_classes,authentication_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializer import LoginSerializer,RegisterSerializer,UserdetailsSerializer,QuestionProgressSerializer
from My_admin.serializers import QuestionallSerializer, QuestionSerializer
from .utils import generate_custom_access_token,CustomJWTAuthentication,validate_query
from .models import Login,UserProgress,DailyUsage
from My_admin.models import SQLQuestion
from django.db import connection 
from django.utils.timezone import now
from django.db.models import Count, Sum,Q
from datetime import datetime, timedelta
from .ai_question_generator import generate_question_metadata

@api_view(['POST'])
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
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    # print( SQLQuestion.objects.all())
    # # print(SQLQuestion.objects.count())
    if serializer.is_valid():
        user = serializer.validated_data
        user.last_login_time = now()
        user.save()
        tokens = generate_custom_access_token(user)

        return Response({
            "message": "Login success",
            "access": tokens,
            "name": user.Name,
            "admin_name": user.Email,
            "role": user.role,
        }, status=200)

    return Response(serializer.errors, status=400)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def logout_view(request):
    user = request.user

    try:
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
        return Response({
            "success": False,
            "message": str(e)
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
        return Response({
            "status": "error",
            "message": str(e)
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
        "pie_chart": pie_chart
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
