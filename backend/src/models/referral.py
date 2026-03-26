from pydantic import BaseModel
from typing import Optional

class ReferralCodeResponse(BaseModel):
    referral_code: str

class ProcessReferralRequest(BaseModel):
    referral_code: str

class ProcessReferralResponse(BaseModel):
    success: bool
    message: Optional[str] = None
