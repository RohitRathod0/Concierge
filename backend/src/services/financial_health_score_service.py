from sqlalchemy.orm import Session
from src.database.models import FinancialHealthScore, UserIdentityScore
from uuid import UUID
from datetime import datetime

class FinancialHealthScoreService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_score(self, user_id: UUID) -> FinancialHealthScore:
        score = self.db.query(FinancialHealthScore).filter(FinancialHealthScore.user_id == user_id).first()
        if not score:
            score = FinancialHealthScore(user_id=user_id)
            self.db.add(score)
            
        identity = self.db.query(UserIdentityScore).filter(UserIdentityScore.user_id == user_id).first()
        
        # Simplified baseline scoring logic
        score.diversification_score = 120
        score.protection_score = 90
        score.emergency_fund_score = 110
        score.growth_trajectory_score = 130
        
        if identity and identity.knowledge_quotient == "Informed Investor":
            score.knowledge_score = 150
        else:
            score.knowledge_score = 80
            
        score.total_score = (
            score.diversification_score + 
            score.protection_score + 
            score.emergency_fund_score + 
            score.knowledge_score + 
            score.growth_trajectory_score
        )
        
        score.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(score)
        
        return score
