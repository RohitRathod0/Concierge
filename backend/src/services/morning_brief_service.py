from sqlalchemy.orm import Session
from src.database.models import UserProfile
from typing import Dict, Any
from uuid import UUID

class MorningBriefGeneratorService:
    def __init__(self, db: Session):
        self.db = db

    def generate_brief(self, user_id: UUID) -> Dict[str, Any]:
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        segment = getattr(profile, 'primary_segment', "Investor")
        
        brief = {
            "greeting": f"Good morning, {profile.name if profile else 'Investor'}! ☕",
            "market_summary": "Nifty is expected to open flat today after US markets closed in the red.",
            "portfolio_impact": "Your IT holdings might see some pressure due to Nasdaq's overnight fall.",
            "suggested_action": "Consider checking your SIP dates, as market dips offer good entry points.",
            "audio_url": "https://example.com/audio/brief_123.mp3"
        }
        
        return brief
