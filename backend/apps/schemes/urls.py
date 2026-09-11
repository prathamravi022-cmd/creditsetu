"""URL configuration for schemes app."""
from django.urls import path
from . import views

urlpatterns = [
    path('', views.scheme_list, name='scheme-list'),
    path('<uuid:scheme_id>/', views.scheme_detail, name='scheme-detail'),
    path('recommend/', views.recommend_schemes, name='scheme-recommend'),
    path('calculate-emi/', views.calculate_emi_view, name='calculate-emi'),
]
