import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add backend directory to PYTHONPATH
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from src.database.models import UserProfile, Message, Conversation, UserEvent
from src.database.connection import SessionLocal
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    db_session = SessionLocal()
    try:
        events = []
        
        # Mapping session to user for message backfilling
        session_to_user = {}
        conversations = db_session.query(Conversation).all()
        for c in conversations:
            session_to_user[c.session_id] = c.user_id
            
        messages = db_session.query(Message).filter(Message.role == 'user').all()
        for message in messages:
            user_id = session_to_user.get(message.session_id)
            if not user_id: continue
            
            # Prevent duplicate backfill
            existing = db_session.query(UserEvent).filter_by(
                user_id=user_id, 
                event_type="message_sent",
                session_id=message.session_id
            ).first()
            if existing: continue

            events.append({
                "user_id": user_id,
                "event_type": "message_sent",
                "event_category": "interaction",
                "event_data": {
                    "message_id": str(message.message_id),
                    "session_id": str(message.session_id),
                    "content_length": len(message.content or "")
                },
                "session_id": message.session_id,
                "timestamp": message.timestamp or datetime.utcnow()
            })
            
        profiles = db_session.query(UserProfile).all()
        for profile in profiles:
            existing = db_session.query(UserEvent).filter_by(
                user_id=profile.user_id,
                event_type="profile_updated"
            ).first()
            if existing: continue

            events.append({
                "user_id": profile.user_id,
                "event_type": "profile_updated",
                "event_category": "user",
                "event_data": {
                    "profile_completeness": profile.profile_completeness
                },
                "session_id": None,
                "timestamp": profile.updated_at or datetime.utcnow()
            })
            
        if events:
            db_session.bulk_insert_mappings(UserEvent, events)
            db_session.commit()
            logger.info(f"Backfilled {len(events)} user events")
        else:
            logger.info("No events to backfill")
            
    except Exception as e:
        logger.error(f"Error: {e}")
        db_session.rollback()
    finally:
        db_session.close()

if __name__ == "__main__":
    main()
