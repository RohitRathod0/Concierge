import logging
from typing import Dict, Any, Optional
from datetime import datetime
import uuid
from sqlalchemy import func
from sqlalchemy.orm import Session
from src.database.connection import SessionLocal
from src.database.models import Conversation, UserEvent
import json

logger = logging.getLogger(__name__)

VALID_EVENT_TYPES = {
    "message_sent", "agent_message_sent", "profile_viewed", "profile_updated",
    "recommendations_viewed", "recommendation_clicked", "journey_viewed",
    "user_logged_in", "article_viewed", "product_trial_started", "product_subscribed",
    "attended_webinar", "shared_content", "referred_friend", "community_participation",
    "agent_orchestration_completed"
}

# Late import or explicit import to avoid circular dep if needed
from src.journey.milestone_detector import milestone_detector

class EventTracker:
    def __init__(self):
        self.event_batch = []
        self.batch_size = 100
        self.last_flush = datetime.utcnow()

    def track(self, user_id: str, event_type: str, event_data: dict = None, session_id: str = None) -> None:
        if event_type not in VALID_EVENT_TYPES:
            logger.warning(f"Invalid event type tracked: {event_type}")
        
        event = {
            "user_id": user_id,
            "event_type": event_type,
            "event_category": self._infer_category(event_type),
            "event_data": event_data or {},
            "session_id": session_id,
            "timestamp": datetime.utcnow()
        }
        
        self.event_batch.append(event)
        
        try:
            milestone_detector.trigger_on_event(user_id, event_type)
        except Exception as e:
            logger.error(f"Error triggering milestone detector: {e}")

        if len(self.event_batch) >= self.batch_size or (datetime.utcnow() - self.last_flush).seconds >= 60:
            self.flush()

    def _infer_category(self, event_type: str) -> str:
        if "message" in event_type: return "interaction"
        if "profile" in event_type: return "user"
        if "recommendation" in event_type or "product" in event_type: return "commerce"
        if "journey" in event_type or "milestone" in event_type: return "gamification"
        return "system"

    def flush(self):
        if not self.event_batch:
            return
            
        db_session = SessionLocal()
        try:
            db_session.bulk_insert_mappings(UserEvent, self.event_batch)
            db_session.commit()
            self.event_batch = []
            self.last_flush = datetime.utcnow()
        except Exception as e:
            logger.error(f"Failed to flush events: {e}")
            db_session.rollback()
        finally:
            db_session.close()

event_tracker = EventTracker()


def get_engagement_metrics(db: Session, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    events_query = db.query(UserEvent).filter(
        UserEvent.timestamp >= start_date,
        UserEvent.timestamp <= end_date,
    )

    daily_active_users = db.query(func.count(func.distinct(UserEvent.user_id))).filter(
        UserEvent.timestamp >= start_date,
        UserEvent.timestamp <= end_date,
    ).scalar() or 0

    total_sessions = db.query(func.count(Conversation.session_id)).filter(
        Conversation.started_at >= start_date,
        Conversation.started_at <= end_date,
    ).scalar() or 0

    events_fired = events_query.count()
    avg_messages = db.query(func.avg(Conversation.message_count)).filter(
        Conversation.started_at >= start_date,
        Conversation.started_at <= end_date,
    ).scalar() or 0

    return {
        "daily_active_users": int(daily_active_users),
        "total_sessions": int(total_sessions),
        "events_fired": int(events_fired),
        "avg_messages_per_session": round(float(avg_messages), 2),
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
    }
