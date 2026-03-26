from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Dict, Any

try:
    from src.database.session import get_db
except ImportError:
    def get_db():
        pass

from src.services.feed_ranking_service import FeedRankingService
from src.services.content_diversity_service import ContentDiversityService

router = APIRouter(prefix="/api/v1/feed", tags=["Feed"])

@router.get("/{user_id}")
def get_personalized_feed(user_id: UUID, time_of_day: str = Query("morning"), db: Session = Depends(get_db)):
    ranking_service = FeedRankingService(db)
    diversity_service = ContentDiversityService()
    
    # 1. Rank raw cards
    raw_feed = ranking_service.generate_feed(user_id, time_of_day)
    
    # 2. Apply diversity constraints
    diverse_feed = diversity_service.apply_diversity_rules(raw_feed)
    
    return {"feed": diverse_feed}
