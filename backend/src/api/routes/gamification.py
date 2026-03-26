from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

try:
    from src.database.session import get_db
except ImportError:
    def get_db():
        pass

from src.services.gamification_service import GamificationService
from src.models.gamification import XPEventRequest, XPEventResponse, StreakResponse

router = APIRouter(prefix="/api/v1/gamification", tags=["Gamification"])

@router.post("/{user_id}/xp", response_model=XPEventResponse)
def process_xp(user_id: UUID, request: XPEventRequest, db: Session = Depends(get_db)):
    service = GamificationService(db)
    result = service.process_xp_event(user_id, request.action)
    return result

@router.post("/{user_id}/streak", response_model=StreakResponse)
def process_streak(user_id: UUID, db: Session = Depends(get_db)):
    service = GamificationService(db)
    result = service.process_streak(user_id, "Learning Streak")
    return result
