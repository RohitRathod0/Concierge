from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.database.schemas import RecommendationResponse
from src.services import recommendation_service
from src.api.routes.chat import get_current_user
from src.database.models import User

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

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
