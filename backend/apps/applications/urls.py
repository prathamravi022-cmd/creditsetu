"""URL configuration for applications app."""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.user_applications, name='application-list'),
    path('create/', views.create_application, name='application-create'),
    path('<uuid:app_id>/', views.application_detail, name='application-detail'),
    path('<uuid:app_id>/status/', views.update_application_status, name='application-status'),
]
