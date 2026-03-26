from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.database.schemas import ProfileUpdate, ProfileResponse
from src.services import profile_service
from src.api.routes.chat import get_current_user
from src.database.models import User

router = APIRouter(prefix="/profile", tags=["profile"])

from src.database.schemas import ProfileUpdate, ProfileResponse
from pydantic import BaseModel

class ProfileWrapper(BaseModel):
    profile: ProfileResponse

@router.get("", response_model=ProfileWrapper)
def get_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = profile_service.get_profile(db, current_user.user_id)
    return {"profile": profile}

@router.patch("", response_model=ProfileWrapper)
def update_user_profile(profile_data: ProfileUpdate, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    update_data = profile_data.model_dump(exclude_unset=True)
    profile = profile_service.update_profile(db, current_user.user_id, update_data)
    
    try:
        from src.services.identity_scoring_service import IdentityScoringService
        scorer = IdentityScoringService(db)
        background_tasks.add_task(scorer.calculate_and_store, current_user.user_id)
    except Exception as e:
        print("Identity scoring background task failed:", e)
        
    return {"profile": profile}
