"""
Partner views — geo-spatial queries using PostGIS.
Finds nearest eligible partners based on Haversine distance,
NPA threshold, and fund availability.
"""
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.db.models import F, Value
from django.db.models.functions import Cos, Radians, Sin, ACos
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import ChannelPartner
from .serializers import ChannelPartnerSerializer, NearbyPartnerSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_partners(request):
    """
    Find eligible channel partners near a location.

    Query params:
        lat: Latitude of user
        lng: Longitude of user
        radius_km: Search radius (default 50)
    """
    lat = request.query_params.get('lat')
    lng = request.query_params.get('lng')
    radius_km = float(request.query_params.get('radius_km', 50))

    if not lat or not lng:
        return Response(
            {'error': 'lat and lng query parameters are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user_point = Point(float(lng), float(lat), srid=4326)

    # Filter: active partners with NPA < 10% and funds available
    partners = ChannelPartner.objects.filter(
        is_active=True,
        npa_percentage__lt=10,
        funds_available=True,
    )

    # PostGIS distance lookup — filter by radius
    partners = partners.filter(
        location__distance_lte=(user_point, D(km=radius_km))
    )

    # Annotate with distance and order by closest
    partners = partners.annotate(
        distance_km=F('location').distance(user_point)
    ).order_by('distance_km')[:20]

    results = []
    for p in partners:
        # Convert distance from degrees to km (approximate at equator)
        distance_deg = p.distance_km
        distance_km = round(distance_deg * 111.32, 2)  # 1 degree ≈ 111.32 km

        results.append({
            'id': str(p.id),
            'name': p.name,
            'bank_type': p.bank_type,
            'bank_type_display': p.get_bank_type_display(),
            'branch_name': p.branch_name,
            'district': p.district,
            'pincode': p.pincode,
            'address': p.address,
            'distance_km': distance_km,
            'npa_percentage': float(p.npa_percentage),
            'funds_available': p.funds_available,
            'funds_remaining': float(p.funds_remaining),
            'contact_phone': p.contact_phone,
            'supported_schemes': [
                {'id': str(s.id), 'name': s.name}
                for s in p.supported_schemes.all()
            ],
        })

    return Response({
        'count': len(results),
        'radius_km': radius_km,
        'partners': results,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def partner_detail(request, partner_id):
    """Get detailed info about a specific partner."""
    try:
        partner = ChannelPartner.objects.get(id=partner_id, is_active=True)
    except ChannelPartner.DoesNotExist:
        return Response(
            {'error': 'Partner not found'}, status=status.HTTP_404_NOT_FOUND
        )

    serializer = ChannelPartnerSerializer(partner)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def partner_list(request):
    """List all active partners with optional filters."""
    qs = ChannelPartner.objects.filter(is_active=True)

    bank_type = request.query_params.get('bank_type')
    if bank_type:
        qs = qs.filter(bank_type=bank_type)

    state = request.query_params.get('state')
    if state:
        qs = qs.filter(state=state)

    district = request.query_params.get('district')
    if district:
        qs = qs.filter(district=district)

    # Only healthy partners
    only_healthy = request.query_params.get('healthy_only', 'false')
    if only_healthy.lower() == 'true':
        qs = qs.filter(npa_percentage__lt=10, funds_available=True)

    serializer = ChannelPartnerSerializer(qs[:50], many=True)
    return Response(serializer.data)
