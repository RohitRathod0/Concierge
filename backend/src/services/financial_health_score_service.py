from sqlalchemy.orm import Session
from src.database.models import FinancialHealthScore, UserProfile
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
            
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        
        # If profile is severely incomplete, return zeros so UI prompts for completion
        if not profile or getattr(profile, 'profile_completeness', 0) < 50:
            score.total_score = 0
            score.diversification_score = 0
            score.protection_score = 0
            score.emergency_fund_score = 0
            score.knowledge_score = 0
            score.growth_trajectory_score = 0
            self.db.commit()
            return score
            
        # Base Points
        ps = 30  # protection
        ef = 30  # emergency fund
        ds = 30  # diversification / debt
        gt = 30  # growth trajectory
        ks = 30  # knowledge / planning

        # Vector: Financial Cushion -> EF & Protection
        cushion = profile.financial_cushion
        if cushion == "under_1m": ef += 10; ps += 10
        elif cushion == "1_to_3m": ef += 40; ps += 30
        elif cushion == "3_to_6m": ef += 80; ps += 60
        elif cushion == "over_6m": ef += 140; ps += 80

        # Vector: Protection Status -> Protection
        prot = profile.protection_status
        if prot == "both": ps += 60
        elif prot == "one": ps += 30
        
        # Vector: Debt Stress -> Knowledge / Diversification
        debt = profile.debt_stress
        if debt == "no_loans": ds += 50; ks += 40
        elif debt == "comfortable": ds += 30; ks += 30
        elif debt == "manageable": ds += 10; ks += 10
        elif debt == "stressful": ds += 0; ks += 0

        # Vector: Expense Pressure -> Emergency Fund / Growth
        exp = profile.expense_pressure
        if exp == "easily_save": gt += 70; ef += 30
        elif exp == "just_manage": gt += 30; ef += 10

        # Vector: Money Behavior -> Growth Trajectory
        beh = profile.money_behavior
        if beh == "invest_auto": gt += 70; ks += 30
        elif beh == "save_fixed": gt += 40; ks += 10

        # Vector: Wealth Stage -> Diversification / Growth
        ws = profile.wealth_stage
        if ws == "active_stocks": ds += 90; gt += 30
        elif ws == "invest_mf": ds += 60; gt += 20
        elif ws == "save_fd": ds += 30

        # Vector: Financial Direction -> Knowledge
        direc = profile.financial_direction
        if direc == "clear_long": ks += 100
        elif direc == "some_short": ks += 50
        
        score.diversification_score = min(170, ds)
        score.protection_score = min(170, ps)
        score.emergency_fund_score = min(170, ef)
        score.growth_trajectory_score = min(170, gt)
        score.knowledge_score = min(170, ks)
            
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
