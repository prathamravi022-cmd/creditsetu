"""
Channel Finance Partner model — banks, MFIs, RRBs with PostGIS location.
Filtered by proximity, NPA, and fund availability.
"""
import uuid
from django.contrib.gis.db import models as gis_models
from django.db import models


class ChannelPartner(models.Model):
    """A bank / SCA / NBFC-MFI / RRB / PSB that processes scheme loans."""

    BANK_TYPE_CHOICES = [
        ('psb', 'Public Sector Bank'),
        ('rrb', 'Regional Rural Bank'),
        ('sca', 'State Channelizing Agency'),
        ('nbfc_mfi', 'NBFC-MFI'),
        ('private', 'Private Bank'),
        ('cooperative', 'Cooperative Bank'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    bank_type = models.CharField(max_length=20, choices=BANK_TYPE_CHOICES)
    branch_name = models.CharField(max_length=200, blank=True, default='')

    # --- Location ---
    address = models.TextField(blank=True, default='')
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    location = gis_models.PointField(
        srid=4326,
        help_text='PostGIS Point for geo queries'
    )

    # --- Financial Health ---
    npa_percentage = models.DecimalField(
        max_digits=5, decimal_places=2,
        help_text='Non-Performing Assets percentage'
    )
    funds_available = models.BooleanField(
        default=True,
        help_text='Whether this partner currently has funds to disburse'
    )
    sanctioned_limit = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        help_text='Total sanctioned limit in INR'
    )
    disbursed_amount = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        help_text='Already disbursed amount in INR'
    )

    # --- Contact ---
    contact_phone = models.CharField(max_length=15, blank=True, default='')
    contact_email = models.EmailField(blank=True, default='')

    # --- Supported Schemes ---
    supported_schemes = models.ManyToManyField(
        'schemes.Scheme', blank=True,
        help_text='Schemes this partner can process'
    )

    # --- Meta ---
    is_active = models.BooleanField(default=True)
    last_verified = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Channel Partners'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_bank_type_display()}) — {self.district}"

    @property
    def funds_remaining(self):
        return self.sanctioned_limit - self.disbursed_amount

    @property
    def is_healthy(self):
        """Partner is eligible if NPA < 10% and has funds."""
        return self.npa_percentage < 10 and self.funds_available
