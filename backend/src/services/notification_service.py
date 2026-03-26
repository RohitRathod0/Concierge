from sqlalchemy.orm import Session
from src.database.models import NotificationPreference, NotificationLog
from typing import Dict, Any, List
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def send_notification(self, user_id: UUID, title: str, body: str, notification_type: str = "general") -> Dict[str, Any]:
        prefs = self.db.query(NotificationPreference).filter(NotificationPreference.user_id == user_id).first()
        if not prefs:
             return {"sent": False, "reason": "No preferences set"}
             
        channels_sent = []
        
        if prefs.push_enabled:
            logger.info(f"FCM Push -> {user_id}: {title}")
            self._log_notification(user_id, notification_type, "push")
            channels_sent.append("push")
            
        if prefs.whatsapp_enabled:
            logger.info(f"WhatsApp -> {user_id}: {body}")
            self._log_notification(user_id, notification_type, "whatsapp")
            channels_sent.append("whatsapp")
            
        return {"sent": len(channels_sent) > 0, "channels": channels_sent}
        
    def _log_notification(self, user_id: UUID, n_type: str, channel: str):
        log = NotificationLog(user_id=user_id, notification_type=n_type, channel=channel, status="sent")
        self.db.add(log)
        self.db.commit()
