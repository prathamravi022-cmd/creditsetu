"""
Custom User Profile model for Government Tech Platform.
Extends the default Django user with scheme-matching relevant fields.
Uses PostGIS for geolocation.
"""
import uuid
from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models as gis_models
from django.db import models


class User(AbstractUser):
    """
    Extended user model. Mobile number is the primary identifier
    for low-digital-literacy users.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None  # Remove username — mobile is primary
    mobile = models.CharField(max_length=15, unique=True, db_index=True)
    language_preference = models.CharField(
        max_length=10,
        choices=[('en', 'English'), ('hi', 'Hindi'), ('bn', 'Bengali'),
                 ('ta', 'Tamil'), ('te', 'Telugu'), ('mr', 'Marathi'),
                 ('gu', 'Gujarati'), ('kn', 'Kannada'), ('ml', 'Malayalam'),
                 ('pa', 'Punjabi')],
        default='en',
    )

    # --- Profile fields (collected during onboarding) ---
    gender = models.CharField(
        max_length=10,
        choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other'), ('', 'Prefer not to say')],
        blank=True,
        default='',
    )
    age = models.PositiveSmallIntegerField(null=True, blank=True)

    # --- Location (Step 2) ---
    state = models.CharField(max_length=100, default='Uttar Pradesh')
    district = models.CharField(max_length=100, blank=True, default='')
    pincode = models.CharField(max_length=10, blank=True, default='')
    location_type = models.CharField(
        max_length=10,
        choices=[('urban', 'Urban'), ('rural', 'Rural')],
        default='rural',
    )
    # Precise location for geo-queries
    geo_location = gis_models.PointField(null=True, blank=True, srid=4326)

    # --- Social Category (Step 3) ---
    SOCIAL_CATEGORY_CHOICES = [
        ('general', 'General'),
        ('obc', 'OBC'),
        ('sc', 'SC'),
        ('st', 'ST'),
    ]
    social_category = models.CharField(
        max_length=20, choices=SOCIAL_CATEGORY_CHOICES, default='general'
    )
    has_disability = models.BooleanField(default=False)
    disability_type = models.CharField(max_length=100, blank=True, default='')

    # --- Financial (Step 4) ---
    is_bpl = models.BooleanField(default=False, verbose_name='Below Poverty Line')
    family_annual_income = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        help_text='Family annual income in INR'
    )
    loan_purpose = models.CharField(
        max_length=20,
        choices=[('business', 'Business'), ('education', 'Education')],
        default='business',
    )
    estimated_project_cost = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        help_text='Estimated project cost in INR'
    )

    # --- DigiLocker ---
    digilocker_verified = models.BooleanField(default=False)
    aadhaar_number = models.CharField(
        max_length=20, blank=True, default='',
        help_text='Encrypted Aadhaar — placeholder only'
    )

    # --- Meta ---
    onboarding_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'mobile'
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.mobile} ({self.get_full_name() or 'No Name'})"

    @property
    def is_eligible(self):
        """Check basic eligibility for MoSJE schemes."""
        return (
            self.family_annual_income <= 500000
            and self.social_category in ('sc', 'st', 'obc')
        )
