from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict, Any, List
# Ensure this import matches the project's db session dependency
# Assuming standard FastAPI structure
try:
    from src.database.session import get_db
except ImportError:
    # Fallback if structure is different
    def get_db():
        pass

from src.services.nudge_service import NudgeDeliveryEngine
from src.models.nudge_event import NudgeEventResponse

router = APIRouter(prefix="/api/v1/nudges", tags=["Nudges"])

@router.post("/process-event", response_model=NudgeEventResponse)
def process_user_event(
    user_id: UUID,
    event_type: str,
    context: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Processes a user event and optionally returns a nudge to display."""
    engine = NudgeDeliveryEngine(db)
    nudge = engine.process_event(user_id, event_type, context)
    if not nudge:
        raise HTTPException(status_code=204, detail="No nudge generated for this event.")
    return nudge

from src.database.models import NudgeEvent
from datetime import datetime

@router.get("/pending/{user_id}")
def get_pending_nudges(user_id: UUID, db: Session = Depends(get_db)):
    from src.services.nudge_service import NudgeDeliveryEngine
    engine = NudgeDeliveryEngine(db)
    engine.seed_initial_nudges_for_user(user_id)

    nudge = db.query(NudgeEvent).filter(
        NudgeEvent.user_id == user_id,
        NudgeEvent.shown_at == None,
        NudgeEvent.channel.in_(["TOAST", "BOTTOM_SHEET"])
    ).order_by(NudgeEvent.shown_at.desc()).first()

    if not nudge:
        return {"nudges": []}

    return {
        "nudges": [
            {
                "id": str(nudge.nudge_id),
                "nudge_id": str(nudge.nudge_id),
                "trigger_type": nudge.trigger_type,
                "nudge_copy": nudge.nudge_copy,
                "channel": nudge.channel,
                "clicked": nudge.clicked,
                "converted": nudge.converted,
                "shown_at": nudge.shown_at.isoformat() if nudge.shown_at else None,
            }
        ]
    }

@router.post("/{nudge_id}/impression")
def track_impression(nudge_id: UUID, db: Session = Depends(get_db)):
    nudge = db.query(NudgeEvent).filter(NudgeEvent.nudge_id == nudge_id).first()
    if nudge:
        nudge.shown_at = datetime.utcnow()
        db.commit()
    return {"status": "ok"}

@router.post("/{nudge_id}/dismiss")
def track_dismiss(nudge_id: UUID, db: Session = Depends(get_db)):
    nudge = db.query(NudgeEvent).filter(NudgeEvent.nudge_id == nudge_id).first()
    if nudge:
        nudge.clicked = False
        db.commit()
    return {"status": "ok"}

@router.post("/{nudge_id}/convert")
def track_convert(nudge_id: UUID, db: Session = Depends(get_db)):
    nudge = db.query(NudgeEvent).filter(NudgeEvent.nudge_id == nudge_id).first()
    if nudge:
        nudge.converted = True
        nudge.clicked = True
        db.commit()
    return {"status": "ok"}
