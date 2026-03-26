from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

try:
    from src.database.session import get_db
except ImportError:
    def get_db():
        pass

from src.services.financial_health_score_service import FinancialHealthScoreService
from src.models.financial_health_score import FinancialHealthScoreResponse

router = APIRouter(prefix="/api/v1/health-score", tags=["Health Score"])

@router.get("/{user_id}", response_model=FinancialHealthScoreResponse)
def get_user_health_score(user_id: UUID, db: Session = Depends(get_db)):
    service = FinancialHealthScoreService(db)
    score = service.calculate_score(user_id)
    return score
