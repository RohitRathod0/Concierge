from sqlalchemy.orm import Session
from src.database.models import UserProfile
from src.tools.segment_classifier import classify_segment
from fastapi import HTTPException
import uuid
import logging
from datetime import datetime
from decimal import Decimal

logger = logging.getLogger(__name__)


def calculate_completeness(profile: UserProfile) -> int:
    fields = [
        profile.age_group, profile.gender, profile.occupation,
        profile.investment_experience, profile.risk_tolerance,
        profile.financial_goals, profile.interests,
    ]
    filled = sum(1 for f in fields if f is not None)
    return int((filled / len(fields)) * 100)


def classify_segment_and_confidence(profile: UserProfile) -> dict:
    """Phase 2: segment classification with confidence scores."""
    profile_dict = {
        "age_group": profile.age_group,
        "occupation": profile.occupation,
        "industry": profile.industry,
        "income_level": profile.income_level,
        "investment_experience": profile.investment_experience,
        "risk_tolerance": profile.risk_tolerance,
        "financial_goals": profile.financial_goals or [],
        "interests": profile.interests or [],
    }
    return classify_segment(profile_dict)


def detect_life_stage(profile: UserProfile, recent_message: str = "") -> str:
    """Heuristic life stage detection from profile fields."""
    age = profile.age_group or ""
    occupation = (profile.occupation or "").lower()
    goals = profile.financial_goals or []

    if "50+" in age or "41-50" in age:
        if any(g in ["retirement_planning", "pension"] for g in goals):
            return "retirement_planning"

    if any(g in ["education_planning"] for g in goals):
        return "parenthood"

    if "business" in occupation or "entrepreneur" in occupation:
        return "business_start"

    return profile.life_stage or ""


def get_profile(db: Session, user_id: uuid.UUID):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.profile_completeness = calculate_completeness(profile)
    # Phase 2: enriched segmentation
    seg_result = classify_segment_and_confidence(profile)
    profile.primary_segment = seg_result["primary_segment"]
    profile.segment_confidence = Decimal(str(seg_result["confidence"]))
    profile.sub_segments_scores = seg_result["sub_segments"]

    db.commit()
    return profile


def update_profile(db: Session, user_id: uuid.UUID, data: dict):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    old_completeness = profile.profile_completeness

    for key, value in data.items():
        if hasattr(profile, key) and value is not None:
            setattr(profile, key, value)

    profile.profile_completeness = calculate_completeness(profile)

    # Phase 2: updated segmentation
    seg_result = classify_segment_and_confidence(profile)
    profile.primary_segment = seg_result["primary_segment"]
    profile.segment_confidence = Decimal(str(seg_result["confidence"]))
    profile.sub_segments_scores = seg_result["sub_segments"]

    # Life stage detection
    life_stage = detect_life_stage(profile)
    if life_stage:
        profile.life_stage = life_stage

    profile.last_enriched_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)

    # Check profile completeness milestone
    if profile.profile_completeness >= 70:
        _check_profile_milestone(db, user_id)
        
    try:
        from src.analytics.event_tracker import event_tracker
        event_tracker.track(str(user_id), 'profile_updated', {
            'fields_updated': list(data.keys()), 
            'completeness_before': old_completeness, 
            'completeness_after': profile.profile_completeness
        })
    except Exception:
        pass

    return profile


def enrich_from_behavioral_signals(
    db: Session,
    user_id: uuid.UUID,
    signals: dict,
) -> bool:
    """
    Update profile behavioral_signals from external behavior events.
    Called by analytics pipeline when content interactions occur.
    
    signals example:
    {
        "article_topics_read": ["mutual_funds", "equity"],
        "products_explored": ["ET_PRIME"],
        "session_duration_minutes": 12,
    }
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return False

    existing = profile.behavioral_signals or {}
    # Merge signal arrays
    for key, val in signals.items():
        if isinstance(val, list):
            existing[key] = list(set(existing.get(key, []) + val))
        else:
            existing[key] = val

    profile.behavioral_signals = existing
    profile.last_enriched_at = datetime.utcnow()
    db.commit()
    return True


def _check_profile_milestone(db: Session, user_id: uuid.UUID):
    """Auto-complete 'profile_completed' milestone when completeness >= 70%."""
    import os
    if os.getenv("ENABLE_JOURNEY_SYSTEM", "true").lower() != "true":
        return
    try:
        from src.journey.journey_manager import JourneyManager
        jm = JourneyManager(db)
        jm.complete_milestone(user_id, "profile_completed")
    except Exception:
        pass
