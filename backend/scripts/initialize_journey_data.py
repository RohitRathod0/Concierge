import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add backend directory to PYTHONPATH
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from src.database.models import User, UserProfile, JourneyStage, Milestone, Conversation, Message, UserEvent
from src.database.connection import SessionLocal
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def evaluate_milestone_check(user, milestone_check_str, db_session):
    if milestone_check_str == 'profile_completeness >= 70':
        profile = db_session.query(UserProfile).filter_by(user_id=user.user_id).first()
        return profile is not None and profile.profile_completeness >= 70
    elif milestone_check_str == 'user_messages_count >= 1':
        count = db_session.query(Message).filter(
            Message.session_id.in_(db_session.query(Conversation.session_id).filter_by(user_id=user.user_id))
        ).count()
        return count >= 1
    elif milestone_check_str == 'article_events_count >= 1':
        count = db_session.query(UserEvent).filter_by(user_id=user.user_id, event_type='article_viewed').count()
        return count >= 1
    elif milestone_check_str == 'article_events_count >= 5':
        count = db_session.query(UserEvent).filter_by(user_id=user.user_id, event_type='article_viewed').count()
        return count >= 5
    elif milestone_check_str == 'profile_completeness >= 80':
        profile = db_session.query(UserProfile).filter_by(user_id=user.user_id).first()
        return profile is not None and profile.profile_completeness >= 80
    return False

def main():
    db_session = SessionLocal()
    try:
        milestone_definitions = {
            "discovery": [
                {"name": "profile_completed", "reward_points": 100, "check": "profile_completeness >= 70"},
                {"name": "first_conversation", "reward_points": 50, "check": "user_messages_count >= 1"},
                {"name": "first_article_read", "reward_points": 25, "check": "article_events_count >= 1"}
            ],
            "exploration": [
                {"name": "product_trial_started", "reward_points": 200, "check": None},
                {"name": "5_articles_read", "reward_points": 100, "check": "article_events_count >= 5"},
                {"name": "attended_webinar", "reward_points": 150, "check": None}
            ],
            "commitment": [
                {"name": "first_paid_subscription", "reward_points": 500, "check": None},
                {"name": "profile_enrichment_80", "reward_points": 100, "check": "profile_completeness >= 80"},
                {"name": "shared_content", "reward_points": 50, "check": None}
            ],
            "advocacy": [
                {"name": "3_products_active", "reward_points": 1000, "check": None},
                {"name": "referred_friend", "reward_points": 500, "check": None},
                {"name": "community_participation", "reward_points": 200, "check": None}
            ]
        }

        users = db_session.query(User).filter(User.is_active == True).all()
        stages_created = 0
        milestones_created = 0

        for user in users:
            days_since_signup = (datetime.utcnow() - user.created_at).days if user.created_at else 0
            if days_since_signup <= 7:
                stage = 'discovery'
            elif days_since_signup <= 30:
                stage = 'exploration'
            elif days_since_signup <= 60:
                stage = 'commitment'
            else:
                stage = 'advocacy'

            existing_stage = db_session.query(JourneyStage).filter_by(user_id=user.user_id).first()
            if not existing_stage:
                journey_stage = JourneyStage(
                    user_id=user.user_id,
                    current_stage=stage,
                    stage_started_at=user.created_at or datetime.utcnow(),
                    velocity_score=0.0
                )
                db_session.add(journey_stage)
                stages_created += 1

            for stg, milestones in milestone_definitions.items():
                for milestone_def in milestones:
                    milestone_name = milestone_def["name"]
                    existing_m = db_session.query(Milestone).filter_by(user_id=user.user_id, milestone_name=milestone_name).first()
                    if not existing_m:
                        check_str = milestone_def.get("check")
                        completed = evaluate_milestone_check(user, check_str, db_session) if check_str else False
                        m = Milestone(
                            user_id=user.user_id,
                            milestone_name=milestone_name,
                            journey_stage=stg,
                            completed=completed,
                            completed_at=datetime.utcnow() if completed else None,
                            reward_points=milestone_def["reward_points"]
                        )
                        db_session.add(m)
                        milestones_created += 1
            
            db_session.flush()

        db_session.commit()
        logger.info(f"Created {stages_created} journey stages and {milestones_created} milestones for {len(users)} users")
    except Exception as e:
        logger.error(f"Error: {e}")
        db_session.rollback()
    finally:
        db_session.close()

if __name__ == "__main__":
    main()
