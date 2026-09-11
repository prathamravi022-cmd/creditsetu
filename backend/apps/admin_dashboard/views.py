"""
Admin Dashboard API — heatmap data, NPA trends, application analytics.
Production: requires admin authentication.
"""
from django.db.models import Count, Avg, Sum, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.applications.models import Application
from apps.partners.models import ChannelPartner
from apps.schemes.models import Scheme
from apps.accounts.models import User
from .models import AuditLog

ADMIN_PHONE = '9259609658'


def _require_admin(request):
    """Verify the authenticated user is the authorized admin."""
    if not request.user or not request.user.is_authenticated:
        return False
    return request.user.mobile == ADMIN_PHONE


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    if not _require_admin(request):
        AuditLog.log('admin_access_denied', user=request.user,
                     details={'endpoint': 'dashboard_summary'},
                     ip=request.META.get('REMOTE_ADDR'))
        return Response({'error': 'Admin access required'}, status=403)
    """Overall dashboard KPIs."""
    return Response({
        'total_users': User.objects.count(),
        'total_applications': Application.objects.count(),
        'applications_by_status': {
            status_val: Application.objects.filter(status=status_val).count()
            for status_val, _ in Application.STATUS_CHOICES
        },
        'approved_count': Application.objects.filter(status='approved').count(),
        'approval_rate': _calc_approval_rate(),
        'total_partners': ChannelPartner.objects.filter(is_active=True).count(),
        'avg_npa': float(
            ChannelPartner.objects.filter(is_active=True).aggregate(
                avg=Avg('npa_percentage')
            )['avg'] or 0
        ),
        'total_schemes': Scheme.objects.filter(is_active=True).count(),
        'total_disbursed': float(
            Application.objects.filter(status='disbursed').aggregate(
                total=Sum('approved_amount')
            )['total'] or 0
        ),
    })


def _calc_approval_rate():
    """Calculate approval rate as percentage."""
    total = Application.objects.exclude(status='draft').count()
    approved = Application.objects.filter(status__in=['approved', 'disbursed']).count()
    return round((approved / total * 100), 1) if total > 0 else 0


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def heatmap_data(request):
    if not _require_admin(request):
        return Response({'error': 'Admin access required'}, status=403)
    """
    District-wise heatmap data for demand visualization.
    Returns application counts and approval rates by district.
    """
    # Applications by district
    district_data = (
        Application.objects
        .exclude(user__district='')
        .values('user__district', 'user__state')
        .annotate(
            total_applications=Count('id'),
            approved=Count('id', filter=Q(status__in=['approved', 'disbursed'])),
            total_amount=Sum('requested_amount'),
        )
        .order_by('-total_applications')
    )

    results = []
    for item in district_data:
        total = item['total_applications']
        approved = item['approved']
        results.append({
            'district': item['user__district'],
            'state': item['user__state'],
            'total_applications': total,
            'approved': approved,
            'approval_rate': round(approved / total * 100, 1) if total > 0 else 0,
            'total_amount': float(item['total_amount'] or 0),
        })

    return Response(results)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def partner_npa_trends(request):
    if not _require_admin(request):
        return Response({'error': 'Admin access required'}, status=403)
    """
    Partner NPA trends by bank type.
    For the admin to monitor partner health.
    """
    from django.db.models.functions import Round

    partners = (
        ChannelPartner.objects
        .filter(is_active=True)
        .values('bank_type')
        .annotate(
            avg_npa=Avg('npa_percentage'),
            count=Count('id'),
            total_funds=Sum('sanctioned_limit'),
            total_disbursed=Sum('disbursed_amount'),
            unhealthy_count=Count(
                'id', filter=Q(npa_percentage__gte=10) | Q(funds_available=False)
            ),
        )
        .order_by('bank_type')
    )

    results = []
    for p in partners:
        results.append({
            'bank_type': p['bank_type'],
            'bank_type_display': dict(ChannelPartner.BANK_TYPE_CHOICES).get(
                p['bank_type'], p['bank_type']
            ),
            'partner_count': p['count'],
            'avg_npa': round(float(p['avg_npa']), 2),
            'total_funds': float(p['total_funds'] or 0),
            'total_disbursed': float(p['total_disbursed'] or 0),
            'unhealthy_partners': p['unhealthy_count'],
        })

    return Response(results)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def scheme_popularity(request):
    if not _require_admin(request):
        return Response({'error': 'Admin access required'}, status=403)
    """Most applied schemes — for demand analysis."""
    scheme_stats = (
        Application.objects
        .values('scheme__name', 'scheme__scheme_code', 'scheme__scheme_type')
        .annotate(
            total_applications=Count('id'),
            total_requested=Sum('requested_amount'),
        )
        .order_by('-total_applications')
    )

    return Response([
        {
            'name': s['scheme__name'],
            'code': s['scheme__scheme_code'],
            'type': s['scheme__scheme_type'],
            'applications': s['total_applications'],
            'total_amount': float(s['total_requested'] or 0),
        }
        for s in scheme_stats
    ])
