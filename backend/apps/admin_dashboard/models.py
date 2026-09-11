"""
Admin session tracking and audit logging.
Records all admin access attempts and activities for security.
"""
import uuid
from django.db import models


class AdminSession(models.Model):
    """Tracks admin login sessions tied to the verified phone number."""

    ADMIN_PHONE = '9259609658'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE, related_name='admin_sessions'
    )
    phone_verified = models.BooleanField(
        default=False,
        help_text='Whether the admin phone was verified via OTP'
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    started_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"Admin session: {self.user.mobile} — {self.started_at}"

    @classmethod
    def verify_admin_access(cls, mobile):
        """Check if the given phone number is the authorized admin number."""
        return mobile == cls.ADMIN_PHONE


class AuditLog(models.Model):
    """Audit trail for all significant actions in the platform."""

    ACTION_CHOICES = [
        ('admin_login', 'Admin Login'),
        ('admin_access_denied', 'Admin Access Denied'),
        ('scheme_view', 'Scheme Viewed'),
        ('application_submit', 'Application Submitted'),
        ('application_status_change', 'Application Status Changed'),
        ('grievance_submit', 'Grievance Submitted'),
        ('data_export', 'Data Exported'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'accounts.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='audit_logs'
    )
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.get_action_display()} — {self.timestamp}"

    @classmethod
    def log(cls, action, user=None, details=None, ip=None):
        """Create an audit log entry."""
        return cls.objects.create(
            user=user,
            action=action,
            details=details or {},
            ip_address=ip,
        )
