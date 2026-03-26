from sqlalchemy.orm import Session
from src.database.models import ActivityEvent, UserProfile
from typing import List, Dict, Any, Optional
from uuid import UUID

class SocialProofService:
    def __init__(self, db: Session):
        self.db = db

    def get_recent_activity(self, limit: int = 5, city: Optional[str] = None) -> List[ActivityEvent]:
        query = self.db.query(ActivityEvent).order_by(ActivityEvent.timestamp.desc())
        if city:
            query = query.filter(ActivityEvent.city == city)
        return query.limit(limit).all()

    def get_peer_benchmarks(self, user_id: UUID) -> Dict[str, Any]:
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        segment = profile.primary_segment if profile else "Investor"
        city = profile.location if profile else "India"
        
        # Simulated benchmark computation as required by spec
        return {
            "peer_segment": segment,
            "peer_city": city,
            "avg_products_used": 2.3,
            "user_products_used": 1,
            "top_percentile": 23,
            "suggested_product": "ET Prime"
        }

    def get_testimonial(self, user_id: UUID, product_id: str) -> Dict[str, str]:
        # Return matched testimonial based on demographic matching (simulated)
        return {
            "author": "Rahul from Pune",
            "content": "This completely changed how I track IPOs and cut down research time by 80%.",
            "rating": "5/5"
        }
