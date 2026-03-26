from sqlalchemy.orm import Session
from src.database.models import CrossSellQueue, ETProduct
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime

class CrossSellOrchestratorService:
    def __init__(self, db: Session):
        self.db = db

    def get_top_priority_cross_sell(self, user_id: UUID) -> Optional[str]:
        # Finds the highest readiness score product not on cooldown
        now = datetime.utcnow()
        queue_item = self.db.query(CrossSellQueue, ETProduct).join(
            ETProduct, CrossSellQueue.product_id == ETProduct.product_id
        ).filter(
            CrossSellQueue.user_id == user_id,
            CrossSellQueue.readiness_score > 70.0,
            (CrossSellQueue.cooldown_until == None) | (CrossSellQueue.cooldown_until < now)
        ).order_by(CrossSellQueue.readiness_score.desc()).first()

        if not queue_item:
            return None
            
        queue, product = queue_item
        return f"{product.name} (Relevance: {queue.readiness_score}/100)"

    def update_queue(self, user_id: UUID, context: Dict[str, Any]):
        """Runs the 5 playbooks based on user activity to update product readiness scores in the queue."""
        pass
