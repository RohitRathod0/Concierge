from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict, Any, Optional

try:
    from src.database.session import get_db
except ImportError:
    def get_db():
        pass

from src.services.crosssell_orchestrator import CrossSellOrchestratorService
from src.services.playbook_executor import PlaybookExecutor

router = APIRouter(prefix="/api/v1/cross-sell", tags=["Cross-Sell"])

@router.get("/priority/{user_id}", response_model=Dict[str, Optional[str]])
def get_priority_cross_sell(user_id: UUID, db: Session = Depends(get_db)):
    orchestrator = CrossSellOrchestratorService(db)
    product = orchestrator.get_top_priority_cross_sell(user_id)
    return {"suggested_product": product}
