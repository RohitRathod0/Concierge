from sqlalchemy.orm import Session
from src.database.models import Referral, ETCoin
from typing import Dict, Any
from uuid import UUID
import uuid
from datetime import datetime

class ReferralService:
    def __init__(self, db: Session):
        self.db = db

    def generate_referral_code(self, user_id: UUID) -> str:
        # Check if already exists
        referral = self.db.query(Referral).filter(Referral.referrer_id == user_id).first()
        if referral:
            return referral.referral_code
            
        short_uuid = str(uuid.uuid4())[:8].upper()
        code = f"ETWEALTH-{short_uuid}"
        
        new_referral = Referral(referrer_id=user_id, referral_code=code, status="pending")
        self.db.add(new_referral)
        self.db.commit()
        return code

    def process_referral(self, new_user_id: UUID, referral_code: str) -> bool:
        referral = self.db.query(Referral).filter(Referral.referral_code == referral_code).first()
        if not referral:
            return False
            
        referral.referred_user_id = new_user_id
        referral.status = "verified"
        referral.verified_at = datetime.utcnow()
        
        # Award 500 ET Coins to referrer
        wallet = self.db.query(ETCoin).filter(ETCoin.user_id == referral.referrer_id).first()
        if not wallet:
            wallet = ETCoin(user_id=referral.referrer_id, balance=500, total_earned=500)
            self.db.add(wallet)
        else:
            wallet.balance += 500
            wallet.total_earned += 500
            wallet.updated_at = datetime.utcnow()
            
        self.db.commit()
        return True
