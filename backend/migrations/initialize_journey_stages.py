"""
ET AI Concierge - Phase 2
Migration: Backfill journey stages for all existing users.
Run once after deploying Phase 2 to initialize journey records.
Usage: python -m backend.migrations.initialize_journey_stages
"""
import sys
import os
import logging

# Add backend/src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)


def run():
    from src.database.connection import SessionLocal
    from src.database.models import User, JourneyStage
    from src.journey.journey_manager import JourneyManager

    db = SessionLocal()
    try:
        # Get all existing users without a journey record
        users_with_journey = {j.user_id for j in db.query(JourneyStage).all()}
        all_users = db.query(User).filter(User.is_active == True).all()
        to_initialize = [u for u in all_users if u.user_id not in users_with_journey]

        logger.info(f"Found {len(to_initialize)} users without journey records")

        jm = JourneyManager(db)
        success, failed = 0, 0
        for user in to_initialize:
            try:
                jm.get_or_create_journey(user.user_id)
                logger.info(f"  ✓ Initialized journey for {user.email}")
                success += 1
            except Exception as e:
                logger.error(f"  ✗ Failed for {user.email}: {e}")
                failed += 1
                db.rollback()

        logger.info(f"\nDone. Success: {success}, Failed: {failed}")
    finally:
        db.close()


if __name__ == '__main__':
    run()
