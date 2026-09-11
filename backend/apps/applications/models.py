"""
Application model — tracks loan applications from submission to disbursement.
"""
import uuid
from django.db import models


class Application(models.Model):
    """A loan application linking a user to a scheme and partner."""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('documents_needed', 'Documents Needed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('disbursed', 'Disbursed'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application_number = models.CharField(
        max_length=30, unique=True, editable=False,
        help_text='Auto-generated: APP-YYYYMMDD-XXXX'
    )

    # --- Relationships ---
    user = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE, related_name='applications'
    )
    scheme = models.ForeignKey(
        'schemes.Scheme', on_delete=models.PROTECT, related_name='applications'
    )
    partner = models.ForeignKey(
        'partners.ChannelPartner', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='applications'
    )

    # --- Loan Details ---
    requested_amount = models.DecimalField(max_digits=14, decimal_places=2)
    approved_amount = models.DecimalField(
        max_digits=14, decimal_places=2, null=True, blank=True
    )
    tenure_months = models.PositiveIntegerField(default=12)
    interest_rate_applied = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text='Final interest rate after negotiation/subsidy'
    )

    # --- EMI Schedule ---
    emi_schedule = models.JSONField(
        default=list, blank=True,
        help_text='Full amortization schedule: [{month, emi, principal, interest, balance}]'
    )
    moratorium_months = models.PositiveIntegerField(
        default=0, help_text='Moratorium period for this application'
    )

    # --- Status ---
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='draft'
    )
    rejection_reason = models.TextField(blank=True, default='')

    # --- Documents ---
    uploaded_documents = models.JSONField(
        default=list, blank=True,
        help_text='List of uploaded document references'
    )

    # --- Meta ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.application_number} — {self.user.mobile} — {self.scheme.name}"

    def save(self, *args, **kwargs):
        if not self.application_number:
            from django.utils import timezone
            today = timezone.now().strftime('%Y%m%d')
            count = Application.objects.filter(
                application_number__startswith=f'APP-{today}'
            ).count()
            self.application_number = f'APP-{today}-{count + 1:04d}'
        super().save(*args, **kwargs)
