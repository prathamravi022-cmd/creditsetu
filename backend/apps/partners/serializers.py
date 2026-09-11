"""Serializers for Channel Partners."""
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import ChannelPartner


class ChannelPartnerSerializer(serializers.ModelSerializer):
    is_healthy = serializers.BooleanField(read_only=True)
    funds_remaining = serializers.DecimalField(
        max_digits=14, decimal_places=2, read_only=True
    )
    distance_km = serializers.FloatField(read_only=True, default=None)
    bank_type_display = serializers.CharField(
        source='get_bank_type_display', read_only=True
    )

    class Meta:
        model = ChannelPartner
        fields = [
            'id', 'name', 'bank_type', 'bank_type_display', 'branch_name',
            'address', 'state', 'district', 'pincode',
            'npa_percentage', 'funds_available', 'sanctioned_limit',
            'disbursed_amount', 'funds_remaining',
            'contact_phone', 'contact_email',
            'is_healthy', 'distance_km', 'is_active',
        ]


class NearbyPartnerSerializer(serializers.Serializer):
    """For nearby partner response with distance."""
    id = serializers.UUIDField()
    name = serializers.CharField()
    bank_type = serializers.CharField()
    bank_type_display = serializers.CharField()
    branch_name = serializers.CharField()
    district = serializers.CharField()
    distance_km = serializers.FloatField()
    npa_percentage = serializers.FloatField()
    funds_available = serializers.BooleanField()
    funds_remaining = serializers.DecimalField(max_digits=14, decimal_places=2)
    contact_phone = serializers.CharField()
    supported_schemes = serializers.SerializerMethodField()

    def get_supported_schemes(self, obj):
        return [
            {'id': str(s.id), 'name': s.name}
            for s in obj.supported_schemes.all()
        ]
