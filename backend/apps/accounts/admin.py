from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = (
        'mobile', 'first_name', 'social_category',
        'state', 'district', 'is_bpl', 'onboarding_complete', 'created_at',
    )
    list_filter = ('social_category', 'state', 'is_bpl', 'location_type')
    search_fields = ('mobile', 'first_name', 'last_name', 'district')
    ordering = ('-created_at',)
    fieldsets = (
        (None, {'fields': ('mobile', 'password')}),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'gender', 'age', 'language_preference'),
        }),
        ('Location', {
            'fields': ('state', 'district', 'pincode', 'location_type'),
        }),
        ('Social Category', {
            'fields': ('social_category', 'has_disability', 'disability_type'),
        }),
        ('Financial', {
            'fields': ('is_bpl', 'family_annual_income', 'loan_purpose', 'estimated_project_cost'),
        }),
        ('DigiLocker', {
            'fields': ('digilocker_verified', 'aadhaar_number'),
        }),
        ('Status', {
            'fields': ('onboarding_complete', 'is_active'),
        }),
    )
