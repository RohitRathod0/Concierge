from pydantic import BaseModel, ConfigDict
from enum import Enum
from datetime import datetime
from uuid import UUID

class InteractionType(str, Enum):
    IMPRESSION = "impression"
    CLICK = "click"
    SWIPE = "swipe"
    LIKE = "like"
    DISLIKE = "dislike"

class FeedInteractionBase(BaseModel):
    card_id: str
    card_type: str
    interaction_type: InteractionType

class FeedInteractionCreate(FeedInteractionBase):
    user_id: UUID

class FeedInteractionResponse(FeedInteractionBase):
    interaction_id: UUID
    user_id: UUID
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)
