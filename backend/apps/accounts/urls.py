"""URL configuration for accounts app."""
from django.urls import path
from . import views

urlpatterns = [
    path('send-otp/', views.send_otp, name='send-otp'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('profile/', views.user_profile, name='user-profile'),
    path('onboarding/', views.update_onboarding_step, name='onboarding'),
    # Admin OTP endpoints
    path('admin-send-otp/', views.admin_send_otp, name='admin-send-otp'),
    path('admin-verify-otp/', views.admin_verify_otp, name='admin-verify-otp'),
    path('admin-check-session/', views.admin_check_session, name='admin-check-session'),
]
