from typing import Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from src.database.models import CrossSellQueue, FinancialHealthScore

class PlaybookExecutor:
    def __init__(self, db: Session):
        self.db = db
        
    def execute_playbooks(self, user_id: UUID, event_type: str, context: Dict[str, Any]):
        """Executes the 5 Cross-Sell Playbooks to update queue readiness."""
        # Playbook 1: News-to-Prime Pipeline
        if event_type == "read_premium_preview" and context.get("count", 0) >= 3:
            self._boost_readiness(user_id, "ET Prime", 20.0)
            
        # Playbook 2: Market Signal -> Masterclass
        if event_type == "search_sector" and context.get("count", 0) >= 3:
            self._boost_readiness(user_id, "Masterclass", 25.0)
            
        # Playbook 3: IPO Interest -> Demat Account
        if event_type == "view_ipo":
            self._boost_readiness(user_id, "Demat", 30.0)
            
        # Playbook 4: Salary Article -> Loan/Credit Card
        if event_type == "read_article" and context.get("tag") in ["salary", "emi", "loan"]:
            self._boost_readiness(user_id, "Loan", 15.0)
            
        # Playbook 5: Learner -> Wealth Manager
        if event_type == "course_progress" and context.get("completed_count", 0) >= 2:
            self._boost_readiness(user_id, "Wealth Management", 20.0)

    def connect_health_gaps(self, user_id: UUID, health_score: FinancialHealthScore):
        """Connects health score gaps to cross-sell triggers."""
        if health_score.protection_score < 50:
            self._boost_readiness(user_id, "Insurance", 25.0)
        if health_score.knowledge_score < 50:
            self._boost_readiness(user_id, "Masterclass", 15.0)
        if health_score.diversification_score < 50:
            self._boost_readiness(user_id, "Mutual Fund", 20.0)

    def _boost_readiness(self, user_id: UUID, product_name: str, amount: float):
        # Implementation to fetch product and update CrossSellQueue
        pass
