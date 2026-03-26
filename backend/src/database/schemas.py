from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: UUID
    email: EmailStr
    name: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class MessageCreate(BaseModel):
    content: str
    session_id: Optional[UUID] = None

class MessageResponse(BaseModel):
    message_id: UUID
    role: str
    content: str
    timestamp: datetime
    product_recommendation: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    session_id: UUID
    started_at: datetime
    message_count: int
    status: str
    
    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    age_group: Optional[str] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    occupation: Optional[str] = None
    industry: Optional[str] = None
    income_level: Optional[str] = None
    investment_experience: Optional[str] = None
    risk_tolerance: Optional[str] = None
    financial_goals: Optional[List[str]] = None
    interests: Optional[List[str]] = None

class OnboardingStepSubmit(BaseModel):
    step: int
    answer: Any
    field: str

class BehavioralSignalCreate(BaseModel):
    signal_type: str
    signal_value: Dict[str, Any]
    page_context: Optional[str] = None

class ProfileResponse(BaseModel):
    profile_id: UUID
    user_id: UUID
    age_group: Optional[str] = None
    occupation: Optional[str] = None
    investment_experience: Optional[str] = None
    risk_tolerance: Optional[str] = None
    financial_goals: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    primary_segment: Optional[str] = None
    profile_completeness: int
    
    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    product_id: UUID
    product_code: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    pricing_model: Optional[str] = None
    price_inr: Optional[float] = None
    url: Optional[str] = None
    
    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    recommendation_id: UUID
    product_id: UUID
    score: float
    reason: Optional[str] = None
    product: Optional[ProductResponse] = None
    
    class Config:
        from_attributes = True
