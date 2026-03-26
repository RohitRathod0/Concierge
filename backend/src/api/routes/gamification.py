from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

try:
    from src.database.session import get_db
except ImportError:
    def get_db():
        pass

from src.database.models import UserXP
from src.services.gamification_service import GamificationService
from src.models.gamification import XPEventRequest, XPEventResponse, StreakResponse

router = APIRouter(prefix="/api/v1/gamification", tags=["Gamification"])

@router.get("/xp/{user_id}")
def get_xp_status(user_id: UUID, db: Session = Depends(get_db)):
    service = GamificationService(db)
    user_xp = db.query(UserXP).filter(UserXP.user_id == user_id).first()

    if not user_xp:
        user_xp = UserXP(user_id=user_id, total_xp=0, current_level=1)
        db.add(user_xp)
        db.commit()
        db.refresh(user_xp)

    current_level = next(
        (level for level in service.LEVELS if level["level"] == user_xp.current_level),
        service.LEVELS[0],
    )
    next_level = next(
        (level for level in service.LEVELS if level["level"] == user_xp.current_level + 1),
        None,
    )

    return {
        "current_xp": user_xp.total_xp,
        "level_xp_min": current_level["xp_required"],
        "level_xp_max": next_level["xp_required"] if next_level else current_level["xp_required"],
        "level_name": f"Level {current_level['level']}: {current_level['name']}",
    }

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
