from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID

class FinancialHealthScoreBase(BaseModel):
    total_score: int = 0
    diversification_score: int = 0
    protection_score: int = 0
    emergency_fund_score: int = 0
    knowledge_score: int = 0
    growth_trajectory_score: int = 0

class FinancialHealthScoreCreate(FinancialHealthScoreBase):
    user_id: UUID

class FinancialHealthScoreResponse(FinancialHealthScoreBase):
    health_id: UUID
    user_id: UUID
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
