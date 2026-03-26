from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class ActivityEventBase(BaseModel):
    event_type: str
    anonymized_name: str
    city: Optional[str] = None
    action_text: str
    entity_name: Optional[str] = None

class ActivityEventCreate(ActivityEventBase):
    pass

class ActivityEventResponse(ActivityEventBase):
    event_id: UUID
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)
