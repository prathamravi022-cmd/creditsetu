"""
Serializers for User Authentication (OTP-based) and Profile.
"""
from rest_framework import serializers
from .models import User


class SendOTPSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=15)


class VerifyOTPSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6)


class UserProfileSerializer(serializers.ModelSerializer):
    is_eligible = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'mobile', 'first_name', 'last_name',
            'language_preference', 'gender', 'age',
            'state', 'district', 'pincode', 'location_type',
            'social_category', 'has_disability', 'disability_type',
            'is_bpl', 'family_annual_income', 'loan_purpose',
            'estimated_project_cost',
            'digilocker_verified',
            'onboarding_complete', 'is_eligible',
            'created_at',
        ]
        read_only_fields = ['id', 'mobile', 'onboarding_complete', 'created_at']


class OnboardingStepSerializer(serializers.Serializer):
    """Step-by-step onboarding update."""
    # Step 1 — Auth & Basics
    language_preference = serializers.ChoiceField(
        choices=User._meta.get_field('language_preference').choices,
        required=False
    )
    gender = serializers.ChoiceField(
        choices=User._meta.get_field('gender').choices,
        required=False
    )
    age = serializers.IntegerField(min_value=18, max_value=120, required=False)

    # Step 2 — Location
    state = serializers.CharField(max_length=100, required=False)
    district = serializers.CharField(max_length=100, required=False)
    pincode = serializers.CharField(max_length=10, required=False)
    location_type = serializers.ChoiceField(
        choices=[('urban', 'Urban'), ('rural', 'Rural')],
        required=False
    )

    # Step 3 — Social Category
    social_category = serializers.ChoiceField(
        choices=User._meta.get_field('social_category').choices,
        required=False
    )
    has_disability = serializers.BooleanField(required=False)
    disability_type = serializers.CharField(max_length=100, required=False)

    # Step 4 — Financial
    is_bpl = serializers.BooleanField(required=False)
    family_annual_income = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False
    )
    loan_purpose = serializers.ChoiceField(
        choices=[('business', 'Business'), ('education', 'Education')],
        required=False
    )
    estimated_project_cost = serializers.DecimalField(
        max_digits=14, decimal_places=2, required=False
    )
