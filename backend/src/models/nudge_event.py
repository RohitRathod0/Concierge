from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class NudgeEventBase(BaseModel):
    trigger_type: str
    nudge_copy: str
    channel: str
    clicked: bool = False
    converted: bool = False
    revenue_attributed: Optional[float] = None

class NudgeEventCreate(NudgeEventBase):
    user_id: UUID

class NudgeEventUpdate(BaseModel):
    clicked: Optional[bool] = None
    converted: Optional[bool] = None
    revenue_attributed: Optional[float] = None

class NudgeEventResponse(NudgeEventBase):
    nudge_id: UUID
    user_id: UUID
    shown_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
