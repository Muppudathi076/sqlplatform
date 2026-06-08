from django.urls import path 
from . import views

urlpatterns = [
    path('admins/user/list/', views.all_user_details),
    path('admins/delete/userbyid/<int:userId>', views.delete_user_byid),
    path('admins/models/', views.get_all_question),
    path("admins/question/update/<int:questionId>", views.questionUpdated),
    path("admins/question/delete/<int:questionId>", views.questionDelete),
    path("admins/question/create/", views.questionAdd),
    path("admins/question/bulk-import/", views.bulk_import_questions),
    path("admins/question/bulk-delete/", views.bulk_delete_questions),
    path("admins/ai/bulk-generate/", views.ai_bulk_generate),
    # SQL Dictionary CRUD
    path("admins/dictionary/", views.get_all_dictionary),
    path("admins/dictionary/create/", views.create_dictionary),
    path("admins/dictionary/update/<int:entryId>", views.update_dictionary),
    path("admins/dictionary/delete/<int:entryId>", views.delete_dictionary),
    path("admins/dictionary/bulk-delete/", views.bulk_delete_dictionary),
    path("admins/dictionary/seed/", views.seed_dictionary_from_json),
    # SQL Academy CRUD
    path("admins/academy/", views.get_all_academy),
    path("admins/academy/create/", views.create_academy),
    path("admins/academy/update/<int:entryId>", views.update_academy),
    path("admins/academy/delete/<int:entryId>", views.delete_academy),
    path("admins/academy/bulk-delete/", views.bulk_delete_academy),
    path("admins/academy/seed/", views.seed_academy_from_json),
    # AI Generation
    path("admins/ai/generate/dictionary/", views.ai_bulk_generate_dictionary),
    path("admins/ai/generate/academy/", views.ai_bulk_generate_academy),
]
