from django.urls import path 
from .import views

urlpatterns = [
    path('register/',views.register_view),
    path('login/',views.login_view),
    path('logout/',views.logout_view),
    path('questions/<int:model_id>/', views.get_questions),
    path('run-query/', views.run_query),
    path('value/checking/<int:questionId>', views.answer_checking),
    path('change/password/', views.change_password),
    path('user/details/', views.get_user_details),
    path('user/update/profile/', views.update_profile),
    path('user/dashboard/', views.user_dashboard),
    path("model/complete/<int:model_id>/", views.model_complete),
    path("sql-dictionary/", views.get_sql_dictionary),
    path("sql-academy/", views.get_sql_academy),
    path("update-sql-academy/", views.update_sql_academy),
    path("model/question-progress/",views.question_progress),
    path("assessment/questions/", views.get_assessment_questions),
    path("assessment/submit/", views.submit_assessment),
    path("ai/chat/", views.ai_chat_view),
]