import json
from django.db.models import Count, Max, Q
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from My_app.utils import CustomJWTAuthentication
from My_app.models import Login, UserProgress
from .models import SQLQuestion
from .serializers import QuestionSerializer, QuestionallSerializer
from My_app.ai_question_generator import generate_question_metadata, generate_bulk_questions

def sanitize_options(option_str: str) -> str:
    if not option_str:
        return option_str
    parts = [p.strip() for p in option_str.split(",")]
    seen = set()
    unique = []
    for part in parts:
        if not part:
            continue
        key = part.lower()
        if key not in seen:
            seen.add(key)
            unique.append(part)
    return ",".join(unique)

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
        difficulty_map = {"easy": 1, "medium": 2, "hard": 3}
        if "difficulty" in data:
            difficulty_value = data["difficulty"].lower()
            if difficulty_value in difficulty_map:
                data["model_no"] = difficulty_map[difficulty_value]
        serializer = QuestionSerializer(question, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success":True, "message":"Update successfully"},status=200)
        return Response({"success": False, "errors": serializer.errors}, status=400)
    except SQLQuestion.DoesNotExist:
        return Response({"success":False, "message":"Question Not found"},status=404)

@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])  
@permission_classes([IsAuthenticated])
def questionDelete(request,questionId):
    try:
        question = SQLQuestion.objects.filter(id= questionId)
        if not question.exists():
            return Response({"success":False, "message":"Question Not found"},status=404)
        question.delete()
        return Response({"success":True, "message":"Delete successfully"},status=200)
    except Exception as e:
        return Response({"success":False, "message":str(e)},status=500)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])  
@permission_classes([IsAuthenticated])
def questionAdd(request):
    data = request.data.copy()
    difficulty_map = {"easy": 1, "medium": 2, "hard": 3}
    difficulty = data.get("difficulty", "").lower()
    question = data.get("question", "")

    data["model_no"] = difficulty_map.get(difficulty)
    ai_result = generate_question_metadata(question, difficulty)

    data["answer"] = ai_result.get("answer", "")
    data["schema"] = ai_result.get("schema", "")
    raw_option = ai_result.get("option", "")
    data["option"] = sanitize_options(raw_option)
    data["sample_data"] = ai_result.get("sample_data", [])
    serializer = QuestionSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response({
            "success": True,
            "message": "Question added successfully",
            "data": serializer.data
        }, status=200)
    return Response({"success": False, "errors": serializer.errors}, status=400)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def bulk_import_questions(request):
    questions_data = request.data.get("questions", [])
    if not questions_data or not isinstance(questions_data, list):
        return Response({"error": "No questions provided"}, status=400)

    created = 0
    errors = []
    for i, item in enumerate(questions_data):
        try:
            question_text = item.get("question", "").strip()
            methods = item.get("methods", "").strip()
            difficulty = str(item.get("difficulty", "easy")).lower().strip()
            model_no = item.get("model_no")
            answer = item.get("answer", "").strip()
            option = item.get("option", "").strip()
            sample_data = item.get("sample_data", [])

            if not question_text or not answer or not model_no:
                errors.append(f"Row {i+1}: Missing required fields")
                continue

            if difficulty not in ["easy", "medium", "hard"]:
                difficulty = "easy"

            if isinstance(sample_data, str):
                try:
                    sample_data = json.loads(sample_data)
                except Exception:
                    sample_data = []

            clean_option = sanitize_options(option)

            if methods.lower() == "choose the best answer":
                opt_count = len([o for o in clean_option.split(",") if o.strip()])
                if opt_count < 4:
                    errors.append(f"Row {i+1}: Skipped — need 4 options.")
                    continue

            SQLQuestion.objects.create(
                question=question_text,
                methods=methods,
                difficulty=difficulty,
                model_no=int(model_no),
                answer=answer,
                option=clean_option,
                sample_data=sample_data,
            )
            created += 1
        except Exception as e:
            errors.append(f"Row {i+1}: {str(e)}")

    return Response({
        "success": True,
        "created": created,
        "errors": errors,
        "message": f"{created} question(s) imported successfully."
    }, status=200)

@api_view(['DELETE'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def bulk_delete_questions(request):
    ids = request.data.get("ids", [])
    if not ids or not isinstance(ids, list):
        return Response({"error": "No IDs provided"}, status=400)
    deleted_count, _ = SQLQuestion.objects.filter(id__in=ids).delete()
    return Response({
        "success": True,
        "deleted": deleted_count,
        "message": f"{deleted_count} question(s) deleted successfully."
    }, status=200)

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def ai_bulk_generate(request):
    difficulty = request.data.get("difficulty", "easy")
    count = int(request.data.get("count", 10))
    
    max_model_no = SQLQuestion.objects.aggregate(Max('model_no'))['model_no__max']
    next_model_no = (max_model_no or 0) + 1
    
    questions_data = generate_bulk_questions(difficulty, count)
    
    if not questions_data:
        return Response({"success": False, "message": "Failed to generate questions from AI"}, status=500)
        
    created = 0
    skipped = 0
    for item in questions_data:
        try:
            question_text = item.get("question", "")
            if SQLQuestion.objects.filter(question=question_text).exists():
                skipped += 1
                continue
                
            SQLQuestion.objects.create(
                question=question_text,
                methods=item.get("methods", ""),
                difficulty=item.get("difficulty", difficulty),
                model_no=next_model_no,
                answer=item.get("answer", ""),
                option=item.get("option", ""),
                sample_data=item.get("sample_data", [])
            )
            created += 1
        except Exception as e:
            print(f"Error saving AI question: {e}")
            
    return Response({
        "success": True,
        "message": f"Successfully generated {created} questions (Skipped {skipped} duplicates)",
        "created": created,
        "skipped": skipped
    }, status=200)
