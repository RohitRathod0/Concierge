"""
ET AI Concierge - Phase 2
Journey API Route: GET /journey/current, GET /journey/milestones
"""
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.connection import get_db
from src.database.models import User
from src.journey.journey_manager import JourneyManager
from src.services.auth_service import SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/journey", tags=["journey"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


@router.get("/current")
def get_current_journey(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the user's current journey stage, milestones, and recommended actions."""
    jm = JourneyManager(db)
    return jm.get_current_stage(current_user.user_id)


@router.get("/milestones")
def get_all_milestones(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all milestones for the user across all stages."""
    from src.database.models import Milestone
    from sqlalchemy import func

    milestones = (
        db.query(Milestone)
        .filter(Milestone.user_id == current_user.user_id)
        .order_by(Milestone.created_at.asc())
        .all()
    )

    total_completed = sum(1 for m in milestones if m.completed)
    total_points = sum(m.reward_points for m in milestones if m.completed)

    return {
        "milestones": [
            {
                "milestone_id": str(m.milestone_id),
                "name": m.milestone_name,
                "stage": m.journey_stage,
                "completed": m.completed,
                "completed_at": m.completed_at.isoformat() if m.completed_at else None,
                "reward_points": m.reward_points,
            }
            for m in milestones
        ],
        "total_completed": total_completed,
        "total_points": total_points,
        "completion_rate": round(total_completed / max(len(milestones), 1), 2),
    }


@router.post("/milestone/{milestone_name}/complete")
def complete_milestone(
    milestone_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a milestone as completed (for internal / webhook use)."""
    jm = JourneyManager(db)
    result = jm.complete_milestone(current_user.user_id, milestone_name)
    return result
