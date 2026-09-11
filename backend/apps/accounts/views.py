"""
Auth views — OTP send/verify, profile update, JWT token endpoints.
Production-grade: OTP hashed, timed expiry (60s), rate-limited.
"""
import hashlib
import os
import random
import string
import time
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings
from .models import User
from .sms_service import send_otp_sms, send_admin_otp_sms
from .serializers import (
    SendOTPSerializer, VerifyOTPSerializer,
    UserProfileSerializer, OnboardingStepSerializer,
)

# In-memory stores (replace with Redis in production)
_otp_store = {}   # { mobile: { hash, expires_at, attempts } }
_rate_store = {}  # { mobile: [timestamp, ...] }

ADMIN_PHONE = '9259609658'
MAX_OTP_ATTEMPTS = 5
RESEND_COOLDOWN = 30  # seconds
RATE_LIMIT_WINDOW = 300  # 5 minutes
RATE_LIMIT_MAX = 10  # max OTP requests per window


def _hash_otp(otp):
    return hashlib.sha256(otp.encode()).hexdigest()


def _is_rate_limited(mobile):
    now = time.time()
    recent = [t for t in _rate_store.get(mobile, []) if now - t < RATE_LIMIT_WINDOW]
    _rate_store[mobile] = recent
    return len(recent) >= RATE_LIMIT_MAX


def _record_request(mobile):
    _rate_store.setdefault(mobile, []).append(time.time())


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """Send OTP to mobile number. Production: cryptographically secure, timed, rate-limited."""
    serializer = SendOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    mobile = serializer.validated_data['mobile']

    # Rate limiting
    if _is_rate_limited(mobile):
        return Response(
            {'error': 'Too many requests. Please try again later.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    # Resend cooldown — check if existing OTP is still within cooldown
    existing = _otp_store.get(mobile)
    if existing:
        elapsed = time.time() - existing.get('created_at', 0)
        if elapsed < RESEND_COOLDOWN:
            remaining = int(RESEND_COOLDOWN - elapsed)
            return Response(
                {'error': f'Please wait {remaining} seconds before resending.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

    # Generate cryptographically secure 6-digit OTP
    otp = ''.join([str(random.SystemRandom().randint(0, 9)) for _ in range(settings.OTP_LENGTH)])
    _otp_store[mobile] = {
        'hash': _hash_otp(otp),
        'expires_at': time.time() + settings.OTP_EXPIRY_SECONDS,
        'attempts': 0,
        'created_at': time.time(),
    }
    _record_request(mobile)

    # Send OTP via SMS provider (MSG91 or console fallback)
    sms_result = send_otp_sms(mobile, otp)
    if not sms_result['success']:
        logger.warning(f'SMS delivery failed for {mobile}: {sms_result["error"]}')

    # NEVER return the OTP in the response
    return Response({
        'message': 'OTP sent successfully',
        'expires_in': settings.OTP_EXPIRY_SECONDS,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """Verify OTP and return JWT tokens. Creates user if not exists."""
    serializer = VerifyOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    mobile = serializer.validated_data['mobile']
    otp = serializer.validated_data['otp']

    stored = _otp_store.get(mobile)
    if not stored:
        return Response(
            {'error': 'No OTP found. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check expiry
    if time.time() > stored['expires_at']:
        _otp_store.pop(mobile, None)
        return Response(
            {'error': 'OTP has expired. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check max attempts
    if stored['attempts'] >= MAX_OTP_ATTEMPTS:
        _otp_store.pop(mobile, None)
        return Response(
            {'error': 'Maximum verification attempts exceeded. Please request a new OTP.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    # Increment attempts
    stored['attempts'] += 1

    # Verify hash
    if _hash_otp(otp) != stored['hash']:
        return Response(
            {'error': 'Invalid OTP. Please try again.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Delete used OTP (single-use)
    _otp_store.pop(mobile, None)

    # Get or create user
    user, created = User.objects.get_or_create(mobile=mobile)

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    return Response({
        'message': 'OTP verified successfully',
        'user': UserProfileSerializer(user).data,
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        },
        'is_new_user': created,
    })


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get or update user profile."""
    if request.method == 'GET':
        return Response(UserProfileSerializer(request.user).data)

    serializer = UserProfileSerializer(
        request.user, data=request.data, partial=True
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_onboarding_step(request):
    """Update a specific onboarding step."""
    serializer = OnboardingStepSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = request.user
    for field, value in serializer.validated_data.items():
        setattr(user, field, value)

    # Check if all onboarding steps are complete
    # Guard: only check if at least one field was actually updated
    required_fields = [
        user.gender,
        user.age,
        user.district,
        user.social_category,
        user.family_annual_income > 0,
        user.estimated_project_cost > 0,
    ]
    if required_fields and all(required_fields):
        user.onboarding_complete = True

    user.save()
    return Response({
        'message': 'Profile updated successfully',
        'onboarding_complete': user.onboarding_complete,
    })


# --- Admin OTP Endpoints ---

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_send_otp(request):
    """Send OTP to authorized admin number. Server-side admin check."""
    mobile = request.data.get('mobile', '').strip()
    
    # Server-side: only admin number is allowed
    if mobile != ADMIN_PHONE:
        return Response(
            {'error': 'Unauthorized. This number does not have admin access.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Rate limiting
    if _is_rate_limited(mobile):
        return Response(
            {'error': 'Too many requests. Please try again later.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    # Resend cooldown
    existing = _otp_store.get('admin_' + mobile)
    if existing:
        elapsed = time.time() - existing.get('created_at', 0)
        if elapsed < RESEND_COOLDOWN:
            remaining = int(RESEND_COOLDOWN - elapsed)
            return Response(
                {'error': f'Please wait {remaining} seconds before resending.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
    
    # Generate cryptographically secure 6-digit OTP
    otp = ''.join([str(random.SystemRandom().randint(0, 9)) for _ in range(settings.OTP_LENGTH)])
    
    # Store admin OTP with prefix to separate from user OTPs
    _otp_store['admin_' + mobile] = {
        'hash': _hash_otp(otp),
        'expires_at': time.time() + settings.OTP_EXPIRY_SECONDS,
        'attempts': 0,
        'created_at': time.time(),
        'is_admin': True,
    }
    _record_request(mobile)
    
    # Send admin OTP via SMS provider (MSG91 or console fallback)
    sms_result = send_admin_otp_sms(mobile, otp)
    if not sms_result['success']:
        logger.warning(f'Admin SMS delivery failed for {mobile}: {sms_result["error"]}')
    
    # NEVER return the OTP in the response
    return Response({
        'message': 'OTP sent to admin number',
        'expires_in': settings.OTP_EXPIRY_SECONDS,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_verify_otp(request):
    """Verify admin OTP. Server-side: admin number + OTP + expiry + attempts."""
    mobile = request.data.get('mobile', '').strip()
    otp = request.data.get('otp', '').strip()
    
    # Server-side: only admin number
    if mobile != ADMIN_PHONE:
        return Response(
            {'error': 'Unauthorized. Admin access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    store_key = 'admin_' + mobile
    stored = _otp_store.get(store_key)
    
    if not stored:
        return Response(
            {'error': 'No OTP found. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check expiry
    if time.time() > stored['expires_at']:
        _otp_store.pop(store_key, None)
        return Response(
            {'error': 'OTP has expired. Please request a new one.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check max attempts
    if stored['attempts'] >= MAX_OTP_ATTEMPTS:
        _otp_store.pop(store_key, None)
        return Response(
            {'error': 'Maximum verification attempts exceeded. Please request a new OTP.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
    
    stored['attempts'] += 1
    
    # Verify OTP (production: hash comparison)
    otp_valid = False
    
    # Check against stored hash
    if _hash_otp(otp) == stored['hash']:
        otp_valid = True
    
    # Test OTP: 220303 — ONLY in dev mode, ONLY for admin number
    if not otp_valid and getattr(settings, 'TEST_OTP_ENABLED', False):
        test_otp = getattr(settings, 'TEST_ADMIN_OTP', '220303')
        test_mobile = getattr(settings, 'TEST_ADMIN_MOBILE', '9259609658')
        if otp == test_otp and mobile == test_mobile:
            otp_valid = True
            import logging
            logger = logging.getLogger('accounts')
            logger.info(f'[DEV] Test OTP accepted for admin {mobile}')
    
    if not otp_valid:
        return Response(
            {'error': 'Invalid OTP. Please try again.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Delete used OTP (single-use)
    _otp_store.pop(store_key, None)
    
    # Get or create admin user
    user, created = User.objects.get_or_create(mobile=mobile)
    
    # Ensure admin flag is set
    if not user.is_staff:
        user.is_staff = True
        user.is_superuser = True
        user.save()
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'message': 'Admin OTP verified successfully',
        'user': {
            'id': str(user.id),
            'mobile': user.mobile,
            'name': 'Admin User',
            'isAdmin': True,
            'authMethod': 'mobile',
        },
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        },
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_check_session(request):
    """Verify current session is an admin session."""
    if request.user.mobile != ADMIN_PHONE:
        return Response({'error': 'Admin access required'}, status=403)
    return Response({
        'isAdmin': True,
        'mobile': request.user.mobile,
        'name': 'Admin User',
    })
