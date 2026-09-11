"""
Grievance views — create, list, and respond to user complaints.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import GrievanceTicket
from .serializers import GrievanceCreateSerializer, GrievanceSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_grievance(request):
    """Raise a grievance ticket."""
    serializer = GrievanceCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    application = None
    if data.get('application_id'):
        from apps.applications.models import Application
        try:
            application = Application.objects.get(
                id=data['application_id'], user=request.user
            )
        except Application.DoesNotExist:
            return Response(
                {'error': 'Application not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

    ticket = GrievanceTicket.objects.create(
        user=request.user,
        application=application,
        category=data['category'],
        priority=data['priority'],
        language=data['language'],
        message=data['message'],
    )

    return Response(
        GrievanceSerializer(ticket).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_grievances(request):
    """List all grievances for the authenticated user."""
    tickets = GrievanceTicket.objects.filter(user=request.user)
    serializer = GrievanceSerializer(tickets, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def grievance_detail(request, ticket_id):
    """Get grievance ticket details."""
    try:
        ticket = GrievanceTicket.objects.get(id=ticket_id, user=request.user)
    except GrievanceTicket.DoesNotExist:
        return Response(
            {'error': 'Ticket not found'},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(GrievanceSerializer(ticket).data)
