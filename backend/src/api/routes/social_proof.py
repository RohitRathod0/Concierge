from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Dict, Any, Optional

try:
    from src.database.session import get_db
except ImportError:
    def get_db():
        pass

from src.services.social_proof_service import SocialProofService
from src.models.activity_event import ActivityEventResponse

router = APIRouter(prefix="/api/v1/social-proof", tags=["Social Proof"])

@router.get("/activity", response_model=List[ActivityEventResponse])
def get_activity_feed(city: Optional[str] = None, limit: int = Query(5, le=20), db: Session = Depends(get_db)):
    service = SocialProofService(db)
    return service.get_recent_activity(limit, city)

@router.get("/{user_id}/benchmarks")
def get_peer_benchmarks(user_id: UUID, db: Session = Depends(get_db)):
    service = SocialProofService(db)
    return service.get_peer_benchmarks(user_id)

@router.get("/{user_id}/testimonial")
def get_testimonial(user_id: UUID, product_id: str, db: Session = Depends(get_db)):
    service = SocialProofService(db)
    return service.get_testimonial(user_id, product_id)
