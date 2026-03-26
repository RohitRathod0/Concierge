from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.database.schemas import RecommendationResponse
from src.services import recommendation_service
from src.api.routes.chat import get_current_user
from src.database.models import User, UserProfile, ETProductReadiness

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])

@router.get("", response_model=list[RecommendationResponse])
def get_user_recommendations(limit: int = 3, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recs = recommendation_service.get_recommendations(db, current_user.user_id, limit)
    
    result = []
    for r in recs:
        db_rec = recommendation_service.ensure_recommendation_record(
            db, current_user.user_id, r["product"].product_id, r["score"], r["reason"]
        )
        result.append({
            "recommendation_id": db_rec.recommendation_id,
            "product_id": db_rec.product_id,
            "score": db_rec.score,
            "reason": db_rec.reason,
            "product": r["product"]
        })
    return result

@router.get("/for-me")
def get_personalized_recommendations(limit: int = 5, context: str = "dashboard", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter_by(user_id=current_user.user_id).first()
    if not profile:
        return {"recommendations": [], "profile_completeness": 0}

    readiness = db.query(ETProductReadiness).filter_by(user_id=current_user.user_id).all()
    valid_recs = [r for r in readiness if r.readiness_score >= 30]
    
    if context == "ipo_page":
        for r in valid_recs:
            if r.product_id in ["ipo_alerts", "demat_account"]:
                r.readiness_score += 20
                
    valid_recs.sort(key=lambda x: x.readiness_score, reverse=True)
    top_recs = valid_recs[:limit]

    results = []
    for r in top_recs:
        results.append({
            "product_id": r.product_id,
            "product_name": r.product_id.replace("_", " ").title(),
            "match_score": min(100, int(r.readiness_score)),
            "match_reason": f"Active traders like you use this for exclusive insights." if r.product_id == "et_prime" else "Highly requested by users in your profile.",
            "price_display": "Explore",
            "cta_text": "View Offer",
            "cta_url": f"/{r.product_id.split('_')[0]}"
        })

    return {
        "recommendations": results,
        "persona": profile.financial_persona or "CURIOUS_BEGINNER",
        "persona_description": profile.financial_persona or "Start building your wealth profile.",
        "profile_completeness": profile.profile_completeness or 0
    }

@router.get("/for-chat")
def get_chat_recommendations(topic: str = "", intent: str = "", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    readiness = db.query(ETProductReadiness).filter_by(user_id=current_user.user_id).all()
    valid_recs = [r for r in readiness if r.readiness_score >= 60]
    valid_recs.sort(key=lambda x: x.readiness_score, reverse=True)
    
    if not valid_recs:
        return None
        
    best = valid_recs[0]
    return {
        "product_id": best.product_id,
        "match_score": best.readiness_score
    }
