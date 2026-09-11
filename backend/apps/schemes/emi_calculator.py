"""
EMI Calculator with moratorium support, subsidy deduction, and amortization schedule.

Formula: EMI = P × r × (1+r)^n / [(1+r)^n - 1]

Where:
  P = Principal (after subsidy/margin deduction)
  r = Monthly interest rate (annual / 12)
  n = Number of months
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Any


def calculate_emi(
    principal: float,
    annual_interest_rate: float,
    tenure_months: int,
    moratorium_months: int = 0,
    subsidy_percentage: float = 0,
    margin_money_percentage: float = 0,
) -> Dict[str, Any]:
    """
    Calculate EMI with full amortization schedule.

    Args:
        principal: Total project cost in INR
        annual_interest_rate: Annual interest rate (e.g., 8.0 for 8%)
        tenure_months: Loan tenure in months
        moratorium_months: EMI-free period at start
        subsidy_percentage: Government subsidy (% of principal)
        margin_money_percentage: User's upfront margin (% of principal)

    Returns:
        Dict with emi_amount, total_interest, total_payment,
        principal_after_deductions, and full amortization_schedule.
    """
    # --- Step 1: Deduct subsidy and margin money ---
    subsidy_amount = principal * (subsidy_percentage / 100)
    margin_amount = principal * (margin_money_percentage / 100)
    effective_principal = principal - subsidy_amount - margin_amount

    if effective_principal <= 0 or tenure_months <= 0:
        return {
            'emi_amount': 0,
            'total_interest': 0,
            'total_payment': 0,
            'principal_after_deductions': effective_principal,
            'subsidy_amount': subsidy_amount,
            'margin_amount': margin_amount,
            'moratorium_months': moratorium_months,
            'total_tenure_months': tenure_months,
            'amortization_schedule': [],
        }

    # --- Step 2: Calculate EMI ---
    r = annual_interest_rate / (12 * 100)  # Monthly rate
    n = tenure_months

    if r == 0:
        # Zero interest — simple division
        emi = effective_principal / n  # n is guaranteed > 0 here
    else:
        factor = (1 + r) ** n
        emi = effective_principal * r * factor / (factor - 1)

    emi = round(emi, 2)

    # --- Step 3: Generate amortization schedule ---
    schedule = _build_amortization_schedule(
        effective_principal, r, n, moratorium_months, emi
    )

    total_interest = sum(row['interest'] for row in schedule)
    total_payment = sum(row['emi'] for row in schedule)

    return {
        'emi_amount': emi,
        'total_interest': round(total_interest, 2),
        'total_payment': round(total_payment, 2),
        'principal_after_deductions': round(effective_principal, 2),
        'subsidy_amount': round(subsidy_amount, 2),
        'margin_amount': round(margin_amount, 2),
        'moratorium_months': moratorium_months,
        'total_tenure_months': tenure_months,
        'amortization_schedule': schedule,
    }


def _build_amortization_schedule(
    principal: float,
    monthly_rate: float,
    tenure_months: int,
    moratorium_months: int,
    emi: float,
) -> List[Dict[str, Any]]:
    """
    Build month-by-month amortization schedule.
    During moratorium, only interest accrues (no EMI payment).
    """
    schedule = []
    balance = principal
    cumulative_interest = 0

    for month in range(1, tenure_months + 1):
        interest_for_month = balance * monthly_rate

        if month <= moratorium_months:
            # Moratorium: interest accrues but user doesn't pay
            emi_payment = 0
            principal_component = 0
            balance += interest_for_month  # Capitalize interest
        else:
            # Normal EMI
            emi_payment = emi
            principal_component = emi_payment - interest_for_month
            if principal_component > balance:
                principal_component = balance
                emi_payment = principal_component + interest_for_month
            balance -= principal_component
            if balance < 0:
                balance = 0

        cumulative_interest += interest_for_month

        schedule.append({
            'month': month,
            'emi': round(emi_payment, 2),
            'principal': round(principal_component, 2),
            'interest': round(interest_for_month, 2),
            'balance': round(max(balance, 0), 2),
            'cumulative_interest': round(cumulative_interest, 2),
            'is_moratorium': month <= moratorium_months,
        })

    return schedule


def calculate_preapproved_emi(
    principal: float,
    annual_interest_rate: float,
    tenure_months: int,
) -> Dict[str, float]:
    """Quick EMI calculation without schedule — for preview cards."""
    if principal <= 0 or tenure_months <= 0:
        return {'emi': 0, 'total': 0, 'interest': 0}

    r = annual_interest_rate / (12 * 100)
    n = tenure_months

    if r == 0:
        emi = principal / n
    else:
        factor = (1 + r) ** n
        emi = principal * r * factor / (factor - 1)

    total = emi * n
    return {
        'emi': round(emi, 2),
        'total': round(total, 2),
        'interest': round(total - principal, 2),
    }
