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


class SqlDictionary(models.Model):
    keyword = models.CharField(max_length=200)
    meaning = models.TextField()
    analogy = models.TextField(blank=True, default='')
    syntax = models.TextField(blank=True, default='')
    example_query = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=100, blank=True, default='BookOpen')
    color = models.CharField(max_length=200, blank=True, default='from-blue-400 to-indigo-600')
    questions = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = 'My_admin_sqldictionary'
        ordering = ['id']

    def __str__(self):
        return self.keyword


class SqlAcademy(models.Model):
    title = models.CharField(max_length=255)
    instruction = models.TextField()
    expectedQuery = models.TextField()
    columns = models.JSONField(default=list, blank=True)
    tableData = models.JSONField(default=list, blank=True)
    successMsg = models.TextField()
    hint = models.TextField()

    class Meta:
        db_table = 'My_admin_sqlacademy'
        ordering = ['id']

    def __str__(self):
        return self.title

