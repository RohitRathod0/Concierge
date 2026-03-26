from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class UserIdentityScoreBase(BaseModel):
    wealth_stage: Optional[str] = None
    risk_fingerprint: Optional[str] = None
    knowledge_quotient: Optional[str] = None
    product_readiness_json: Optional[Dict[str, Any]] = None
    engagement_archetype: Optional[str] = None
    life_event_flags: Optional[Dict[str, Any]] = None
    identity_vector: Optional[Dict[str, Any]] = None

class UserIdentityScoreCreate(UserIdentityScoreBase):
    user_id: UUID

class UserIdentityScoreUpdate(UserIdentityScoreBase):
    pass

class UserIdentityScoreResponse(UserIdentityScoreBase):
    score_id: UUID
    user_id: UUID
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
