from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from uuid import UUID

try:
    from src.database.session import get_db
except ImportError:
    def get_db():
        pass

from src.services.morning_brief_service import MorningBriefGeneratorService
from src.services.notification_service import NotificationService

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])

@router.get("/{user_id}/morning-brief")
def get_morning_brief(user_id: UUID, db: Session = Depends(get_db)):
    service = MorningBriefGeneratorService(db)
    return service.generate_brief(user_id)

@router.post("/{user_id}/send-test")
def send_test_notification(user_id: UUID, title: str, body: str, db: Session = Depends(get_db)):
    service = NotificationService(db)
    return service.send_notification(user_id, title, body, "test")
