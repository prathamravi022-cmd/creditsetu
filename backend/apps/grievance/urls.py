"""URL configuration for grievance app."""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.user_grievances, name='grievance-list'),
    path('create/', views.create_grievance, name='grievance-create'),
    path('<uuid:ticket_id>/', views.grievance_detail, name='grievance-detail'),
]
