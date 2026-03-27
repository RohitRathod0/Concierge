from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.agents.contextual_cross_sell_agent import contextual_agent
from src.database.models import ReadingBehavior
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter(prefix="/contextual", tags=["contextual"])

class ContextualRequest(BaseModel):
    article_id: str
    article_content: str
    article_category: Optional[str] = None
    time_spent: Optional[int] = 0
    scroll_depth: Optional[int] = 0
    user_id: Optional[str] = None

@router.post("/suggest")
def get_contextual_suggestion(request: ContextualRequest, db: Session = Depends(get_db)):
    suggestion = contextual_agent.process_reading_event(
        article_content=request.article_content,
        article_category=request.article_category,
        time_spent=request.time_spent,
        scroll_depth=request.scroll_depth,
    )
    
    # Log reading behavior (optional, no auth required for this endpoint)
    try:
        behavior = ReadingBehavior(
            user_id=uuid.UUID(request.user_id) if request.user_id else uuid.UUID('00000000-0000-0000-0000-000000000000'),
            article_id=request.article_id,
            article_category=request.article_category,
            time_spent_seconds=request.time_spent,
            scroll_depth_percentage=request.scroll_depth,
        )
        db.add(behavior)
        db.commit()
    except Exception:
        pass
    
    return {"suggestion": suggestion}
