"""
ET AI Concierge - Phase 2
Tool: Product Matcher
Scores ET products against user profile using weighted features.
"""
from typing import List, Optional

# Static ET product catalog with matching attributes
ET_PRODUCTS = [
    {
        "product_code": "ET_PRIME",
        "name": "ET Prime",
        "category": "premium_content",
        "target_segments": ["tech_professional_investor", "experienced_trader", "conservative_wealth_builder", "learning_focused_beginner"],
        "min_experience": "beginner",
        "interests_match": ["equity", "mutual_funds", "etf", "real_estate"],
        "price_tier": "mid",
        "description": "Curated premium business and financial journalism",
    },
    {
        "product_code": "ET_MARKETS",
        "name": "ET Markets",
        "category": "market_data",
        "target_segments": ["experienced_trader", "tech_professional_investor"],
        "min_experience": "intermediate",
        "interests_match": ["equity", "derivatives", "commodities", "etf"],
        "price_tier": "low",
        "description": "Real-time market data, analysis tools, and portfolio tracker",
    },
    {
        "product_code": "ET_MASTERCLASS",
        "name": "ET Masterclass",
        "category": "education",
        "target_segments": ["learning_focused_beginner", "tech_professional_investor"],
        "min_experience": "beginner",
        "interests_match": ["mutual_funds", "equity", "fixed_income"],
        "price_tier": "mid",
        "description": "Expert-led financial education courses",
    },
    {
        "product_code": "ET_WEALTH_SUMMIT",
        "name": "ET Wealth Summit",
        "category": "events",
        "target_segments": ["conservative_wealth_builder", "business_owner_investor", "experienced_trader"],
        "min_experience": "intermediate",
        "interests_match": ["real_estate", "fixed_income", "mutual_funds"],
        "price_tier": "high",
        "description": "Exclusive wealth management conferences and networking",
    },
    {
        "product_code": "ET_FINANCIAL_SERVICES",
        "name": "ET Financial Services",
        "category": "financial_services",
        "target_segments": ["business_owner_investor", "conservative_wealth_builder"],
        "min_experience": "intermediate",
        "interests_match": ["fixed_income", "real_estate", "mutual_funds"],
        "price_tier": "high",
        "description": "Access to curated financial advisors and investment platforms",
    },
]

EXPERIENCE_ORDER = {"beginner": 1, "intermediate": 2, "advanced": 3}
PRICE_BUDGET_MAP = {"low": ["low", "mid", "high", "very_high"], "mid": ["low", "high", "very_high"], "high": ["high", "very_high"]}


def match_products(profile: dict, primary_segment: Optional[str] = None, top_n: int = 3) -> List[dict]:
    """
    Score and rank ET products for a given user profile.

    Returns top_n products as list of dicts with score and reason.
    """
    scored = []
    user_exp = profile.get("investment_experience", "beginner") or "beginner"
    user_interests = profile.get("interests") or []
    user_income = profile.get("income_level", "mid") or "mid"

    for product in ET_PRODUCTS:
        score = 0.0
        reasons = []

        # Segment alignment (40% weight)
        if primary_segment and primary_segment in product["target_segments"]:
            score += 0.4
            reasons.append(f"matches your {primary_segment.replace('_', ' ')} profile")

        # Interest overlap (30% weight)
        overlap = set(user_interests) & set(product["interests_match"])
        if overlap:
            interest_score = min(len(overlap) / len(product["interests_match"]), 1.0) * 0.3
            score += interest_score
            reasons.append(f"aligns with your interest in {', '.join(list(overlap)[:2])}")

        # Experience fit (20% weight)
        min_exp = product["min_experience"]
        if EXPERIENCE_ORDER.get(user_exp, 1) >= EXPERIENCE_ORDER.get(min_exp, 1):
            score += 0.2
            reasons.append("matches your experience level")

        # Price fit (10% weight)
        budget_tiers = PRICE_BUDGET_MAP.get(user_income, [])
        if product["price_tier"] in budget_tiers:
            score += 0.1

        if score > 0.1:
            scored.append({
                "product_code": product["product_code"],
                "name": product["name"],
                "category": product["category"],
                "description": product["description"],
                "score": round(score, 2),
                "reason": "; ".join(reasons) if reasons else "recommended based on your profile",
            })

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_n]
