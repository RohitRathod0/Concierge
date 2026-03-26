from pydantic import BaseModel
from typing import Dict, Any, Optional

class XPEventRequest(BaseModel):
    action: str

class XPEventResponse(BaseModel):
    added: bool
    reason: Optional[str] = None
    xp_added: Optional[int] = None
    total_xp: Optional[int] = None
    leveled_up: Optional[bool] = None
    new_level: Optional[int] = None

class StreakResponse(BaseModel):
    streak_active: bool
    count: int
    already_logged: Optional[bool] = False
    shields_left: Optional[int] = None
