"""Serializers for schemes app."""
from rest_framework import serializers
from .models import Scheme
from .recommender import match_schemes
from .emi_calculator import calculate_emi


class SchemeSerializer(serializers.ModelSerializer):
    amount_range_display = serializers.CharField(read_only=True)

    class Meta:
        model = Scheme
        fields = '__all__'


class RecommendRequestSerializer(serializers.Serializer):
    """Accepts user profile data to run scheme matching."""
    social_category = serializers.ChoiceField(
        choices=[('general', 'General'), ('obc', 'OBC'), ('sc', 'SC'), ('st', 'ST')]
    )
    family_annual_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    estimated_project_cost = serializers.DecimalField(max_digits=14, decimal_places=2)
    loan_purpose = serializers.ChoiceField(
        choices=[('business', 'Business'), ('education', 'Education')]
    )
    is_bpl = serializers.BooleanField(default=False)
    state = serializers.CharField(max_length=100, default='Uttar Pradesh')
    district = serializers.CharField(max_length=100, default='')
    location_type = serializers.ChoiceField(
        choices=[('urban', 'Urban'), ('rural', 'Rural')], default='rural'
    )


class EMICalculationRequestSerializer(serializers.Serializer):
    """Request payload for EMI calculation."""
    scheme_id = serializers.UUIDField()
    project_cost = serializers.DecimalField(max_digits=14, decimal_places=2)
    tenure_months = serializers.IntegerField(min_value=1, max_value=360)
    moratorium_months = serializers.IntegerField(min_value=0, max_value=24, default=0)
