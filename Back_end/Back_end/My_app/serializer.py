from django.contrib.auth.models import User
from .models import Login
from rest_framework import serializers
from .models import Login
from My_admin.models import SQLQuestion
from .utils import validate_question_answer_match
from django.contrib.auth.hashers import make_password,check_password

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Login
        fields = ['Name','Email','Password']
        extra_kwargs = {
            'Name': {'required': True},
            'Email': {'required': True},
            'Password': {'required': True},
        }
    def validate_Email(self, value):
        if Login.objects.filter(Email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def createadmin(self,validation_data):
        user = Login.objects.create_user(
            Name= validation_data['Name'],
            Email= validation_data['Email'],
            Password= make_password(validation_data["Password"]),
            # role= validation_data['role'],            
        )
        return user
    

class LoginSerializer(serializers.Serializer):
    Email = serializers.CharField()
    Password = serializers.CharField()

    def validate(self, data):
        email = data["Email"]
        password = data["Password"]

        # Normal User Login
        try:
            user = Login.objects.get(Email=email)

            if user.Password != password:
                raise serializers.ValidationError(
                    "Invalid Credential"
                )

            return {
                "user": user,
                "user_type": "normal"
            }

        except Login.DoesNotExist:
            pass

        # Admin Login
        try:
            print("Admin Found username=email:", email)
            admin_user = User.objects.get(email=email)
            print("Admin Found:", admin_user.username)
            if not admin_user.check_password(password):
                raise serializers.ValidationError(
                    "Invalid Credential"
                )

            return {
                "user": admin_user,
                "user_type": "admin"
            }

        except User.DoesNotExist:
            print("Admin Not Found:", email)
            raise serializers.ValidationError(
                "User not found"
            )
            
class QuestionProgressSerializer(serializers.Serializer):
        questionId = serializers.IntegerField()
        isCorrect = serializers.BooleanField()
        
class UserdetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Login
        fields = "__all__"
        