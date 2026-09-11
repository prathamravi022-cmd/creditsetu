"""Serializers for loan applications."""
from rest_framework import serializers
from .models import Application


class ApplicationCreateSerializer(serializers.Serializer):
    """Create a new application."""
    scheme_id = serializers.UUIDField()
    partner_id = serializers.UUIDField(required=False, allow_null=True)
    requested_amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    tenure_months = serializers.IntegerField(min_value=1, max_value=360)
    moratorium_months = serializers.IntegerField(min_value=0, max_value=24, default=0)


class ApplicationSerializer(serializers.ModelSerializer):
    user_mobile = serializers.CharField(source='user.mobile', read_only=True)
    scheme_name = serializers.CharField(source='scheme.name', read_only=True)
    scheme_code = serializers.CharField(source='scheme.scheme_code', read_only=True)
    partner_name = serializers.CharField(source='partner.name', read_only=True, default='')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'application_number', 'user_mobile',
            'scheme_name', 'scheme_code', 'partner_name',
            'requested_amount', 'approved_amount', 'tenure_months',
            'interest_rate_applied', 'moratorium_months',
            'emi_schedule', 'status', 'status_display',
            'rejection_reason', 'uploaded_documents',
            'created_at', 'submitted_at', 'approved_at',
        ]
        read_only_fields = [
            'id', 'application_number', 'approved_amount',
            'interest_rate_applied', 'emi_schedule',
            'created_at', 'submitted_at', 'approved_at',
        ]
