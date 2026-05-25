from rest_framework import serializers
from .models import SQLQuestion
from My_app.utils import validate_question_answer_match

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SQLQuestion
        fields = "__all__"
        
    def validate(self, data):
        question_text = data.get("question", "")
        answer_sql = data.get("answer", "")

        error = validate_question_answer_match(
            question_text,
            answer_sql
        )
        if error:
            raise serializers.ValidationError(error)

        return data
        
class QuestionallSerializer(serializers.ModelSerializer):
    class Meta:
        model = SQLQuestion
        fields = ['id','question', 'difficulty', 'model_no', 'answer'] 
