from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

try:
    from src.database.session import get_db
except ImportError:
    def get_db():
        pass

from src.services.referral_service import ReferralService
from src.models.referral import ReferralCodeResponse, ProcessReferralRequest, ProcessReferralResponse

router = APIRouter(prefix="/api/v1/referral", tags=["Referral"])

@router.get("/{user_id}/code", response_model=ReferralCodeResponse)
def get_referral_code(user_id: UUID, db: Session = Depends(get_db)):
    service = ReferralService(db)
    code = service.generate_referral_code(user_id)
    return {"referral_code": code}

@router.post("/{user_id}/process", response_model=ProcessReferralResponse)
def process_referral(user_id: UUID, request: ProcessReferralRequest, db: Session = Depends(get_db)):
    service = ReferralService(db)
    success = service.process_referral(user_id, request.referral_code)
    if not success:
        return {"success": False, "message": "Invalid referral code"}
    return {"success": True, "message": "Referral processed and 500 ET Coins awarded"}
