"""
Scheme views — recommendation engine, EMI calculator, scheme listing.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Scheme
from .serializers import (
    SchemeSerializer, RecommendRequestSerializer,
    EMICalculationRequestSerializer,
)
from .recommender import match_schemes
from .emi_calculator import calculate_emi


@api_view(['GET'])
@permission_classes([AllowAny])
def scheme_list(request):
    """List all active schemes with optional filters."""
    qs = Scheme.objects.filter(is_active=True)

    scheme_type = request.query_params.get('type')
    if scheme_type:
        qs = qs.filter(scheme_type=scheme_type)

    serializer = SchemeSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def scheme_detail(request, scheme_id):
    """Get detailed info about a specific scheme."""
    try:
        scheme = Scheme.objects.get(id=scheme_id, is_active=True)
    except Scheme.DoesNotExist:
        return Response(
            {'error': 'Scheme not found'}, status=status.HTTP_404_NOT_FOUND
        )
    return Response(SchemeSerializer(scheme).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def recommend_schemes(request):
    """
    Core endpoint: Accept user profile data and return matched schemes
    ranked by approval probability score.
    """
    serializer = RecommendRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    # Create a simple object with the needed attributes for the recommender
    class UserProxy:
        pass

    user_proxy = UserProxy()
    for key, value in data.items():
        setattr(user_proxy, key, value)

    recommendations = match_schemes(user_proxy)

    return Response({
        'count': len(recommendations),
        'recommendations': recommendations,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_emi_view(request):
    """
    Calculate EMI with full amortization schedule for a given scheme.
    Applies subsidy and margin money deductions automatically.
    """
    serializer = EMICalculationRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    try:
        scheme = Scheme.objects.get(
            id=data['scheme_id'], is_active=True
        )
    except Scheme.DoesNotExist:
        return Response(
            {'error': 'Scheme not found'}, status=status.HTTP_404_NOT_FOUND
        )

    result = calculate_emi(
        principal=float(data['project_cost']),
        annual_interest_rate=float(scheme.interest_rate),
        tenure_months=data['tenure_months'],
        moratorium_months=data.get('moratorium_months', scheme.moratorium_months),
        subsidy_percentage=float(scheme.subsidy_percentage),
        margin_money_percentage=float(scheme.margin_money_percentage),
    )

    result['scheme'] = {
        'name': scheme.name,
        'scheme_code': scheme.scheme_code,
        'interest_rate': float(scheme.interest_rate),
    }

    return Response(result)
