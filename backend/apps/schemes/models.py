"""
Scheme model — stores government credit schemes with eligibility rules.
The recommender engine parses the eligibility_rules JSON to match users.
"""
import uuid
from django.db import models


class Scheme(models.Model):
    """A government credit scheme (Micro Finance, Term Loan, Education Loan, etc.)."""

    SCHEME_TYPE_CHOICES = [
        ('micro_finance', 'Micro Finance'),
        ('term_loan', 'Term Loan'),
        ('education_loan', 'Education Loan'),
        ('housing_loan', 'Housing Loan'),
        ('startup_loan', 'Startup Loan'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    scheme_code = models.CharField(max_length=50, unique=True, help_text='E.g., NSFDC-MF-001')
    scheme_type = models.CharField(max_length=30, choices=SCHEME_TYPE_CHOICES)
    description = models.TextField(blank=True, default='')

    # --- Amount & Interest ---
    min_amount = models.DecimalField(
        max_digits=14, decimal_places=2,
        help_text='Minimum loan amount in INR'
    )
    max_amount = models.DecimalField(
        max_digits=14, decimal_places=2,
        help_text='Maximum loan amount in INR'
    )
    interest_rate = models.DecimalField(
        max_digits=5, decimal_places=2,
        help_text='Annual interest rate in %'
    )
    subsidy_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        help_text='Government subsidy % of principal'
    )
    margin_money_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        help_text='Margin money % (user pays this upfront)'
    )

    # --- Tenure ---
    min_tenure_months = models.PositiveIntegerField(default=12)
    max_tenure_months = models.PositiveIntegerField(default=120)
    moratorium_months = models.PositiveIntegerField(
        default=0,
        help_text='EMI-free moratorium period in months'
    )

    # --- Eligibility Rules (JSON) ---
    eligibility_rules = models.JSONField(
        default=dict,
        help_text='JSON rules: {\"max_income\": 500000, \"categories\": [\"sc\",\"st\"], ...}'
    )

    # --- Documents ---
    required_documents = models.JSONField(
        default=list,
        help_text='List of required document names'
    )

    # --- Active ---
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scheme_type', 'min_amount']

    def __str__(self):
        return f"{self.scheme_code}: {self.name}"

    @property
    def amount_range_display(self):
        return f"₹{self.min_amount:,.0f} – ₹{self.max_amount:,.0f}"
