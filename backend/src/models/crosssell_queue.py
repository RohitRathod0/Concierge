from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class CrossSellQueueBase(BaseModel):
    product_id: UUID
    readiness_score: float
    status: str = 'queued'

class CrossSellQueueCreate(CrossSellQueueBase):
    user_id: UUID

class CrossSellQueueUpdate(BaseModel):
    readiness_score: Optional[float] = None
    status: Optional[str] = None
    cooldown_until: Optional[datetime] = None

class CrossSellQueueResponse(CrossSellQueueBase):
    queue_id: UUID
    user_id: UUID
    cooldown_until: Optional[datetime] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
