"""
Root URL configuration for the Government Tech Platform.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # App APIs
    path('api/auth/', include('apps.accounts.urls')),
    path('api/schemes/', include('apps.schemes.urls')),
    path('api/partners/', include('apps.partners.urls')),
    path('api/applications/', include('apps.applications.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/grievance/', include('apps.grievance.urls')),
    path('api/admin-dashboard/', include('apps.admin_dashboard.urls')),
]
