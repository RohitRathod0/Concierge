import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.database.models import ETProductReadiness

logger = logging.getLogger(__name__)

SCORING_RULES = {
    "et_prime": {
        "PREPARED_MIND": 70,
        "DYNAMIC_INVESTOR": 85,
        "STEADY_BUILDER": 60,
        "SECURITY_SEEKER": 30,
        "WEALTH_ACCUMULATOR": 90,
        "BUSINESS_OWNER": 80
    },
    "masterclass_beginner": {
        "PREPARED_MIND": 80,
        "DYNAMIC_INVESTOR": 40,
        "STEADY_BUILDER": 85,
        "SECURITY_SEEKER": 90,
        "WEALTH_ACCUMULATOR": 30,
        "BUSINESS_OWNER": 50
    },
    "demat_account": {
        "PREPARED_MIND": 60,
        "DYNAMIC_INVESTOR": 95,
        "STEADY_BUILDER": 50,
        "SECURITY_SEEKER": 20,
        "WEALTH_ACCUMULATOR": 45,
        "BUSINESS_OWNER": 65
    },
    "ipo_alerts": {
        "PREPARED_MIND": 65,
        "DYNAMIC_INVESTOR": 95,
        "STEADY_BUILDER": 55,
        "SECURITY_SEEKER": 10,
        "WEALTH_ACCUMULATOR": 75,
        "BUSINESS_OWNER": 70
    },
    "term_insurance": {
        "PREPARED_MIND": 90,
        "DYNAMIC_INVESTOR": 40,
        "STEADY_BUILDER": 80,
        "SECURITY_SEEKER": 95,
        "WEALTH_ACCUMULATOR": 70,
        "BUSINESS_OWNER": 85
    },
    "wealth_summit": {
        "PREPARED_MIND": 40,
        "DYNAMIC_INVESTOR": 75,
        "STEADY_BUILDER": 50,
        "SECURITY_SEEKER": 20,
        "WEALTH_ACCUMULATOR": 95,
        "BUSINESS_OWNER": 90
    }
}

def calculate_readiness_scores(db: Session, user_id: str, profile_data: Dict[str, Any], signals: List[Dict[str, Any]] = None):
    """
    Recalculates product readiness scores based on persona and behavioral signals.
    Saves scores to et_product_readiness table.
    """
    if signals is None:
        signals = []
        
    persona = profile_data.get("financial_persona", "CURIOUS_BEGINNER")
    
    # Track signal history for boosts
    read_premium_count = 0
    active_days = set()
    clicked_et_prime = False
    searched_investing = False
    masterclass_time = 0
    clicked_ipo = False
    asked_ipo = False
    read_insurance = False
    
    for sig in signals:
        stype = sig.get("signal_type", "")
        sval = sig.get("signal_value", {})
        ts = sig.get("created_at")
        if ts:
            active_days.add(str(ts).split(" ")[0])
            
        if stype == "ARTICLE_READ" and sval.get("is_premium"):
            read_premium_count += 1
        elif stype == "PRODUCT_CLICK" and sval.get("product") == "et_prime":
            clicked_et_prime = True
        elif stype == "SEARCH_QUERY" and "invest" in str(sval.get("query", "")).lower():
            searched_investing = True
        elif stype == "PAGE_VIEW" and sval.get("page") == "masterclass":
            masterclass_time += int(sval.get("time_spent_seconds", 0))
        elif stype == "PRODUCT_CLICK" and sval.get("section") == "ipo":
            clicked_ipo = True
        elif stype == "CHAT_TOPIC" and sval.get("topic") == "ipo":
            asked_ipo = True
        elif stype == "ARTICLE_READ" and sval.get("category") == "insurance":
            read_insurance = True

    scores = {}
    for product_id, base_scores in SCORING_RULES.items():
        score = base_scores.get(persona, 30)
        
        # Apply behavioral boosts
        if product_id == "et_prime":
            if read_premium_count >= 3: score += 10
            if len(active_days) >= 7: score += 15
            if clicked_et_prime: score += 20
        elif product_id == "masterclass_beginner":
            if searched_investing: score += 20
            if masterclass_time >= 120: score += 15
            if profile_data.get("wealth_stage") == "no_invest": score += 10
        elif product_id == "demat_account":
            if clicked_ipo and not profile_data.get("has_demat_account"): score += 30
            if asked_ipo: score += 20
        elif product_id == "ipo_alerts":
            if clicked_ipo: score += 25
            if asked_ipo: score += 15
        elif product_id == "term_insurance":
            if profile_data.get("responsibility_load") in ["1_to_2", "3_plus"]: score += 20
            if read_insurance: score += 15
        elif product_id == "wealth_summit":
            if profile_data.get("income_stability") == "business": score += 20
            
        # Clamp to 0-100
        scores[product_id] = max(0, min(100, score))

    for product_id, final_score in scores.items():
        try:
            record = db.query(ETProductReadiness).filter_by(user_id=user_id, product_id=product_id).first()
            if not record:
                record = ETProductReadiness(user_id=user_id, product_id=product_id)
                db.add(record)
            record.readiness_score = int(final_score)
        except Exception as e:
            logger.error(f"Failed to update readiness for {product_id}: {e}")
            
    db.commit()
    return scores
