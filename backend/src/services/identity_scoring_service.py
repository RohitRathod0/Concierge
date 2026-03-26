from sqlalchemy.orm import Session
from src.database.models import UserIdentityScore, UserProfile
from typing import Dict, Any
from uuid import UUID
from datetime import datetime

class IdentityScoringService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_wealth_stage(self, age: int, stated_income: str) -> str:
        if age < 30:
            return "Wealth Builder (20-30, low savings)"
        elif age < 40:
            return "Accumulator (30-40, growing wealth)"
        elif age < 50:
            return "Preserver (40-50, protecting wealth)"
        return "Distributor (50+, passing wealth)"

    def calculate_risk_fingerprint(self, answers: Dict[str, Any]) -> str:
        # Logic to return one of 5 fingerprints
        return "Moderate"

    def calculate_knowledge_quotient(self, metrics: Dict[str, Any]) -> str:
        articles_read = metrics.get('articles_read', 0)
        if articles_read > 50:
            return "Informed Investor"
        elif articles_read > 10:
            return "Curious Learner"
        return "Financial Newbie"

    def update_identity_score(self, user_id: UUID, current_metrics: Dict[str, Any] = None) -> UserIdentityScore:
        if current_metrics is None:
            current_metrics = {}
            
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        
        score = self.db.query(UserIdentityScore).filter(UserIdentityScore.user_id == user_id).first()
        if not score:
            score = UserIdentityScore(user_id=user_id)
            self.db.add(score)
            
        # Extract features
        age = 25
        if profile and profile.age_group:
            try:
                # Basic parsing, e.g. "25-34"
                age = int(profile.age_group.split('-')[0])
            except:
                pass
                
        score.wealth_stage = self.calculate_wealth_stage(age, "medium")
        score.risk_fingerprint = self.calculate_risk_fingerprint({})
        score.knowledge_quotient = self.calculate_knowledge_quotient(current_metrics)
        score.product_readiness_json = {
            "ET Prime": 45, 
            "Masterclass": 30,
            "Demat": 80,
            "Mutual Fund": 60,
            "Insurance": 20,
            "Loan": 15
        }
        score.engagement_archetype = "News Reader"
        score.life_event_flags = {"First Job": False, "Marriage": False}
        score.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(score)
        return score
