"""
Application views — create, list, track loan applications.
"""
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Application
from .serializers import ApplicationCreateSerializer, ApplicationSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_application(request):
    """Submit a new loan application."""
    serializer = ApplicationCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    from apps.schemes.models import Scheme
    from apps.partners.models import ChannelPartner

    try:
        scheme = Scheme.objects.get(id=data['scheme_id'], is_active=True)
    except Scheme.DoesNotExist:
        return Response(
            {'error': 'Scheme not found'}, status=status.HTTP_404_NOT_FOUND
        )

    partner = None
    if data.get('partner_id'):
        try:
            partner = ChannelPartner.objects.get(id=data['partner_id'])
        except ChannelPartner.DoesNotExist:
            return Response(
                {'error': 'Partner not found'}, status=status.HTTP_404_NOT_FOUND
            )

    application = Application.objects.create(
        user=request.user,
        scheme=scheme,
        partner=partner,
        requested_amount=data['requested_amount'],
        tenure_months=data['tenure_months'],
        moratorium_months=data.get('moratorium_months', 0),
        status='submitted',
        submitted_at=timezone.now(),
    )

    return Response(
        ApplicationSerializer(application).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_applications(request):
    """List all applications for the authenticated user."""
    applications = Application.objects.filter(user=request.user)
    serializer = ApplicationSerializer(applications, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def application_detail(request, app_id):
    """Get details of a specific application."""
    try:
        application = Application.objects.get(id=app_id, user=request.user)
    except Application.DoesNotExist:
        return Response(
            {'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND
        )
    return Response(ApplicationSerializer(application).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_application_status(request, app_id):
    """
    Update application status (mock admin action).
    In production, this would be admin-only.
    """
    try:
        application = Application.objects.get(id=app_id, user=request.user)
    except Application.DoesNotExist:
        return Response(
            {'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND
        )

    new_status = request.data.get('status')
    valid_transitions = {
        'submitted': ['under_review'],
        'under_review': ['approved', 'rejected', 'documents_needed'],
        'documents_needed': ['under_review', 'rejected'],
        'approved': ['disbursed'],
        'rejected': ['submitted'],
    }

    allowed = valid_transitions.get(application.status, [])
    if new_status not in allowed:
        return Response(
            {'error': f'Cannot transition from {application.status} to {new_status}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    application.status = new_status
    if new_status == 'approved':
        application.approved_at = timezone.now()
    application.save()

    # Trigger SMS notification
    from apps.notifications.sms_service import send_status_update
    send_status_update(
        request.user.mobile,
        application.application_number,
        new_status,
    )

    return Response(ApplicationSerializer(application).data)
