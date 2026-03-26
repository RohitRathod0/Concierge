from datetime import datetime
import logging
from src.database.connection import SessionLocal
from src.database.models import Milestone, UserProfile, Message, Conversation, UserEvent

logger = logging.getLogger(__name__)

class MilestoneDetector:
    def __init__(self):
        self.event_to_milestone_mapping = {
            "message_sent": ["first_conversation"],
            "profile_updated": ["profile_completed", "profile_enrichment_80"],
            "article_viewed": ["first_article_read", "5_articles_read"],
            "product_trial_started": ["product_trial_started"],
            "product_subscribed": ["first_paid_subscription"],
            "attended_webinar": ["attended_webinar"],
            "shared_content": ["shared_content"],
            "referred_friend": ["referred_friend"],
            "community_participation": ["community_participation"]
        }

    def _check_first_conversation(self, db, user_id):
        count = db.query(Message).filter(Message.session_id.in_(
            db.query(Conversation.session_id).filter_by(user_id=user_id)
        )).count()
        return count >= 1

    def _check_profile_completed(self, db, user_id):
        profile = db.query(UserProfile).filter_by(user_id=user_id).first()
        return profile and profile.profile_completeness >= 70

    def _check_profile_enrichment_80(self, db, user_id):
        profile = db.query(UserProfile).filter_by(user_id=user_id).first()
        return profile and profile.profile_completeness >= 80

    def _check_first_article_read(self, db, user_id):
        return db.query(UserEvent).filter_by(user_id=user_id, event_type='article_viewed').count() >= 1

    def _check_5_articles_read(self, db, user_id):
        return db.query(UserEvent).filter_by(user_id=user_id, event_type='article_viewed').count() >= 5

    def _check_product_trial_started(self, db, user_id):
        return db.query(UserEvent).filter_by(user_id=user_id, event_type='product_trial_started').count() >= 1

    def _check_first_paid_subscription(self, db, user_id):
        count = db.query(UserEvent).filter(
            UserEvent.user_id == user_id,
            UserEvent.event_type == 'product_subscribed'
        ).count()
        return count >= 1
        
    def _run_check(self, milestone_name, db, user_id):
        if milestone_name == "first_conversation": return self._check_first_conversation(db, user_id)
        if milestone_name == "profile_completed": return self._check_profile_completed(db, user_id)
        if milestone_name == "profile_enrichment_80": return self._check_profile_enrichment_80(db, user_id)
        if milestone_name == "first_article_read": return self._check_first_article_read(db, user_id)
        if milestone_name == "5_articles_read": return self._check_5_articles_read(db, user_id)
        if milestone_name == "product_trial_started": return self._check_product_trial_started(db, user_id)
        if milestone_name == "first_paid_subscription": return self._check_first_paid_subscription(db, user_id)
        return True

    def check_and_mark_milestone(self, user_id: str, milestone_name: str) -> bool:
        db_session = SessionLocal()
        try:
            milestone = db_session.query(Milestone).filter_by(user_id=user_id, milestone_name=milestone_name).first()
            if not milestone or milestone.completed:
                return False
                
            completed = self._run_check(milestone_name, db_session, user_id)
            if completed:
                milestone.completed = True
                milestone.completed_at = datetime.utcnow()
                db_session.commit()
                logger.info(f"User {user_id} achieved milestone: {milestone_name}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error checking milestone: {e}")
            db_session.rollback()
            return False
        finally:
            db_session.close()

    def trigger_on_event(self, user_id: str, event_type: str):
        milestones = self.event_to_milestone_mapping.get(event_type, [])
        for m in milestones:
            self.check_and_mark_milestone(user_id, m)

milestone_detector = MilestoneDetector()
