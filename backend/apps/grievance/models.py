"""
Grievance / Complaint ticketing system.
Users can raise issues in their regional language.
"""
import uuid
from django.db import models


class GrievanceTicket(models.Model):
    """A user grievance linked to an application (optional)."""

    CATEGORY_CHOICES = [
        ('application_status', 'Application Status Issue'),
        ('document_upload', 'Document Upload Problem'),
        ('scheme_clarification', 'Scheme Clarification'),
        ('partner_behavior', 'Bank / Partner Behavior'),
        ('technical', 'Technical Issue'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(
        max_length=30, unique=True, editable=False,
        help_text='Auto-generated: GRV-YYYYMMDD-XXXX'
    )

    user = models.ForeignKey(
        'accounts.UserProfile', on_delete=models.CASCADE, related_name='grievances'
    )
    application = models.ForeignKey(
        'applications.Application', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='grievances'
    )

    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    language = models.CharField(
        max_length=10, default='en',
        help_text='Language the complaint was raised in'
    )
    message = models.TextField()
    admin_response = models.TextField(blank=True, default='')

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='open'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.ticket_number} — {self.user.mobile} — {self.get_category_display()}"

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            from django.utils import timezone
            today = timezone.now().strftime('%Y%m%d')
            count = GrievanceTicket.objects.filter(
                ticket_number__startswith=f'GRV-{today}'
            ).count()
            self.ticket_number = f'GRV-{today}-{count + 1:04d}'
        super().save(*args, **kwargs)
