import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add backend directory to PYTHONPATH so imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from src.database.models import User, UserProfile
from src.database.connection import SessionLocal
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    db_session = SessionLocal()
    try:
        users = db_session.query(User).outerjoin(UserProfile).filter(UserProfile.profile_id == None).all()
        count = 0
        for user in users:
            profile = UserProfile(
                user_id=user.user_id,
                profile_completeness=0,
                primary_segment="unknown",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db_session.add(profile)
            db_session.flush()
            count += 1
        db_session.commit()
        logger.info(f"Created {count} missing profiles")
    except Exception as e:
        logger.error(f"Error: {e}")
        db_session.rollback()
    finally:
        db_session.close()

if __name__ == "__main__":
    main()
