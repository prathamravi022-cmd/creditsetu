"""
Scheme Recommender Engine
Parses eligibility rules and matches user profiles to schemes.
Returns ranked recommendations with approval probability scores.
"""
from decimal import Decimal
from typing import List, Dict, Any, Optional
from .models import Scheme


def calculate_approval_probability(user: Any, scheme: Scheme) -> int:
    """
    Calculate an approval probability score (0-100) based on how well
    the user matches the scheme's eligibility criteria.

    Factors:
      - Income within range          (30 points)
      - Social category match        (25 points)
      - Project cost within range    (20 points)
      - BPL status                   (10 points)
      - Location match               (10 points)
      - Loan purpose match            (5 points)
    """
    score = 0
    rules = scheme.eligibility_rules

    # --- Income (30 pts) ---
    user_income = float(user.family_annual_income)
    max_income = float(rules.get('max_income', 500000))
    min_income = float(rules.get('min_income', 0))

    if user_income <= max_income:
        # Full points if income is well within range
        income_ratio = 1 - (user_income / max_income) if max_income > 0 else 1
        score += int(30 * (0.5 + 0.5 * income_ratio))
    elif user_income <= max_income * 1.2:
        # Slightly over — partial credit
        score += 10

    # --- Social Category (25 pts) ---
    allowed_categories = rules.get('categories', ['sc', 'st', 'obc', 'general'])
    if user.social_category in allowed_categories:
        # Extra boost for scheme-specific target groups
        if scheme.scheme_type in ('micro_finance',) and user.social_category in ('sc', 'st'):
            score += 25
        else:
            score += 20
    else:
        score += 0

    # --- Project Cost (20 pts) ---
    user_cost = float(user.estimated_project_cost)
    if scheme.min_amount <= user_cost <= scheme.max_amount:
        cost_midpoint = (float(scheme.min_amount) + float(scheme.max_amount)) / 2
        distance = abs(user_cost - cost_midpoint) / (float(scheme.max_amount) - float(scheme.min_amount) + 1)
        score += int(20 * (1 - distance * 0.5))
    elif user_cost < scheme.min_amount:
        score += 5  # Under min but could be adjusted
    # Over max = 0 points for this factor

    # --- BPL Status (10 pts) ---
    if rules.get('prefer_bpl', False) and user.is_bpl:
        score += 10
    elif not rules.get('prefer_bpl', False):
        score += 7  # BPL not required, still decent

    # --- Location (10 pts) ---
    preferred_states = rules.get('states', [])
    if not preferred_states or user.state in preferred_states:
        score += 10
    elif user.state in rules.get('secondary_states', []):
        score += 5

    # --- Loan Purpose (5 pts) ---
    preferred_purpose = rules.get('loan_purpose', None)
    if preferred_purpose is None or user.loan_purpose in preferred_purpose:
        score += 5

    return min(score, 100)


def match_schemes(user: Any) -> List[Dict[str, Any]]:
    """
    Match user profile against all active schemes.
    Returns a ranked list of recommendations sorted by probability score.
    """
    schemes = Scheme.objects.filter(is_active=True)
    recommendations = []

    for scheme in schemes:
        probability = calculate_approval_probability(user, scheme)

        # Only recommend schemes with probability > 15%
        if probability <= 15:
            continue

        # Build recommendation payload
        rec = {
            'scheme_id': str(scheme.id),
            'scheme_code': scheme.scheme_code,
            'name': scheme.name,
            'scheme_type': scheme.scheme_type,
            'description': scheme.description,
            'amount_range': {
                'min': float(scheme.min_amount),
                'max': float(scheme.max_amount),
                'display': scheme.amount_range_display,
            },
            'interest_rate': float(scheme.interest_rate),
            'subsidy_percentage': float(scheme.subsidy_percentage),
            'margin_money_percentage': float(scheme.margin_money_percentage),
            'tenure_range': {
                'min_months': scheme.min_tenure_months,
                'max_months': scheme.max_tenure_months,
            },
            'moratorium_months': scheme.moratorium_months,
            'required_documents': scheme.required_documents,
            'approval_probability': probability,
            'recommendation_label': _get_label(probability),
        }
        recommendations.append(rec)

    # Sort by approval probability (highest first)
    recommendations.sort(key=lambda x: x['approval_probability'], reverse=True)
    return recommendations


def _get_label(probability: int) -> str:
    """Human-readable recommendation label."""
    if probability >= 80:
        return 'Highly Recommended'
    elif probability >= 60:
        return 'Recommended'
    elif probability >= 40:
        return 'Possible Match'
    else:
        return 'Low Match'
