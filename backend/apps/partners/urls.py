"""URL configuration for partners app."""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.partner_list, name='partner-list'),
    path('nearby/', views.nearby_partners, name='partner-nearby'),
    path('<uuid:partner_id>/', views.partner_detail, name='partner-detail'),
]
