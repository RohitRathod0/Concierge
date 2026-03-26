"""
ET AI Concierge - Phase 2
Tool: Segment Classifier
Rule-based + confidence scoring classifier for 5 user segments.
"""
from typing import Optional


SEGMENTS = {
    "tech_professional_investor": {
        "description": "Tech industry professionals starting investment journey",
        "rules": {
            "industry": ["tech", "it", "software", "technology"],
            "occupation": ["engineer", "developer", "programmer", "data scientist", "product manager", "designer"],
            "investment_experience": ["beginner", "intermediate"],
            "age_group": ["26-30", "31-35", "36-40"],
        },
        "weights": {"industry": 0.35, "occupation": 0.35, "investment_experience": 0.2, "age_group": 0.1},
    },
    "experienced_trader": {
        "description": "Active traders with significant portfolio",
        "rules": {
            "investment_experience": ["advanced"],
            "risk_tolerance": ["aggressive"],
            "portfolio_size_range": ["10L-50L", "50L+"],
        },
        "weights": {"investment_experience": 0.45, "risk_tolerance": 0.35, "portfolio_size_range": 0.2},
    },
    "conservative_wealth_builder": {
        "description": "Risk-averse investors focused on long-term wealth",
        "rules": {
            "risk_tolerance": ["conservative"],
            "age_group": ["36-40", "41-50", "50+"],
            "income_level": ["high", "very_high"],
        },
        "weights": {"risk_tolerance": 0.5, "age_group": 0.3, "income_level": 0.2},
    },
    "learning_focused_beginner": {
        "description": "Knowledge seekers new to investing",
        "rules": {
            "investment_experience": ["beginner"],
            "age_group": ["18-25", "26-30"],
            "interests": ["mutual_funds", "equity", "etf"],
        },
        "weights": {"investment_experience": 0.5, "age_group": 0.3, "interests": 0.2},
    },
    "business_owner_investor": {
        "description": "Entrepreneurs investing business profits",
        "rules": {
            "occupation": ["business owner", "entrepreneur", "founder", "ceo", "director", "self-employed"],
            "income_level": ["high", "very_high"],
            "interests": ["real_estate", "fixed_income", "mutual_funds"],
        },
        "weights": {"occupation": 0.5, "income_level": 0.3, "interests": 0.2},
    },
}


def _score_segment(profile: dict, segment_key: str) -> float:
    """Score a profile against a segment definition (0.0 - 1.0)."""
    seg = SEGMENTS[segment_key]
    rules = seg["rules"]
    weights = seg["weights"]
    total_weight = 0.0
    matched_weight = 0.0

    for field, valid_values in rules.items():
        weight = weights.get(field, 0.1)
        total_weight += weight
        profile_val = profile.get(field)

        if profile_val is None:
            continue

        if isinstance(profile_val, list):
            # list intersection
            if any(v.lower() in [pv.lower() for pv in profile_val] for v in valid_values):
                matched_weight += weight
        elif isinstance(profile_val, str):
            if any(v.lower() in profile_val.lower() for v in valid_values):
                matched_weight += weight

    if total_weight == 0:
        return 0.0
    return matched_weight / total_weight


def classify_segment(profile: dict) -> dict:
    """
    Classify a user profile into segments.

    Returns:
        {
            "primary_segment": str,
            "confidence": float,
            "sub_segments": [{"segment": str, "score": float}],
        }
    """
    scores = {seg: _score_segment(profile, seg) for seg in SEGMENTS}
    sorted_segments = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    primary_segment, primary_score = sorted_segments[0]
    if primary_score == 0.0:
        primary_segment = "learning_focused_beginner"
        primary_score = 0.3

    sub_segments = [
        {"segment": seg, "score": round(score, 2)}
        for seg, score in sorted_segments
        if score >= 0.3
    ]

    return {
        "primary_segment": primary_segment,
        "confidence": round(primary_score, 2),
        "sub_segments": sub_segments,
    }
