"""URL configuration for admin dashboard."""
from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.dashboard_summary, name='admin-summary'),
    path('heatmap/', views.heatmap_data, name='admin-heatmap'),
    path('partner-trends/', views.partner_npa_trends, name='admin-partner-trends'),
    path('scheme-popularity/', views.scheme_popularity, name='admin-scheme-popularity'),
]
