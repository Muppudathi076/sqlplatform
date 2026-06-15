from django.db import models
from datetime import timedelta
from django.utils.timezone import now as timezone_now

class Login(models.Model): ## for register 
    Name = models.CharField(max_length=100, null=True, blank=True)
    Email = models.CharField(max_length=100)
    Password = models.CharField(max_length=100)
    role = models.CharField(max_length=100 ,default="user")
    last_login_time = models.DateTimeField(null=True, blank=True)
    total_spend_time = models.DurationField(default=timedelta(0))
    date_joined = models.DateTimeField(default=timezone_now)
    age = models.IntegerField(null=True, blank=True)
    sql_academy_level = models.IntegerField(default=0)
    # Assessment fields
    assessment_completed = models.BooleanField(default=False)
    assessment_level = models.CharField(
        max_length=20,
        choices=[('beginner','Beginner'),('intermediate','Intermediate'),('expert','Expert')],
        null=True, blank=True
    )
    assessment_score = models.IntegerField(default=0)
    @property
    def is_authenticated(self):
        return True

class UserProgress(models.Model):
    user = models.ForeignKey(Login, on_delete=models.CASCADE)
    question = models.ForeignKey('My_admin.SQLQuestion', on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    
class DailyUsage(models.Model):
    user = models.ForeignKey(Login, on_delete=models.CASCADE)
    date = models.DateField()
    spend_time = models.DurationField(default=timedelta)