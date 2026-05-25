from django.db import models

class SQLQuestion(models.Model):
    question = models.TextField()
    methods = models.TextField()
    difficulty = models.CharField(max_length=10)
    model_no = models.IntegerField()  
    answer = models.TextField()
    option = models.TextField() 
    sample_data = models.JSONField()

    class Meta:
        db_table = 'My_app_sqlquestion'
