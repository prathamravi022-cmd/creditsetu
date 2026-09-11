"""Serializers for grievance ticketing."""
from rest_framework import serializers
from .models import GrievanceTicket


class GrievanceCreateSerializer(serializers.Serializer):
    """Create a grievance ticket."""
    application_id = serializers.UUIDField(required=False, allow_null=True)
    category = serializers.ChoiceField(choices=GrievanceTicket.CATEGORY_CHOICES)
    priority = serializers.ChoiceField(
        choices=GrievanceTicket.PRIORITY_CHOICES, default='medium'
    )
    language = serializers.CharField(max_length=10, default='en')
    message = serializers.CharField(min_length=10, max_length=2000)


class GrievanceSerializer(serializers.ModelSerializer):
    ticket_number = serializers.CharField(read_only=True)
    user_mobile = serializers.CharField(source='user.mobile', read_only=True)
    application_number = serializers.CharField(
        source='application.application_number', read_only=True, default=''
    )

    class Meta:
        model = GrievanceTicket
        fields = [
            'id', 'ticket_number', 'user_mobile',
            'application_number', 'category', 'priority',
            'language', 'message', 'admin_response',
            'status', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'ticket_number', 'admin_response',
            'created_at', 'updated_at',
        ]
