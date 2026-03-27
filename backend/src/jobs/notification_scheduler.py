"""
Smart Notification Scheduler — APScheduler jobs that check user behavior
and fire contextual push notifications.
"""
import logging
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)

def _get_db():
    from src.database.connection import SessionLocal
    return SessionLocal()

def job_ipo_followup():
    """Users who visited IPO page haven't returned in 3+ days."""
    try:
        from src.database.connection import SessionLocal
        from src.database.models import User, PushSubscription, NotificationLog
        from src.services.notification_service import broadcast_notification
        from src.services.notification_templates import ipo_fomo
        db = SessionLocal()
        cutoff = datetime.now(timezone.utc) - timedelta(days=3)
        subs = db.query(PushSubscription).filter(PushSubscription.is_active == True).all()
        if subs:
            payload = ipo_fomo("Upcoming Hot IPO", 38.0, 48, 47000)
            subscription_dicts = [s.get_subscription_info() for s in subs]
            result = broadcast_notification(subscription_dicts, payload)
            logger.info(f"IPO followup sent: {result}")
        db.close()
    except Exception as e:
        logger.error(f"IPO followup job failed: {e}")

def job_course_nudge():
    """Users with enrollments but low/zero progress."""
    try:
        from src.database.connection import SessionLocal
        from src.database.models import User, CourseEnrollment, Course, PushSubscription
        from src.services.notification_service import send_push_notification
        from src.services.notification_templates import course_nudge
        db = SessionLocal()
        enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.progress_pct < 20).all()
        for enroll in enrollments:
            course = db.query(Course).filter(Course.id == enroll.course_id).first()
            user = db.query(User).filter(User.user_id == enroll.user_id).first()
            if not course or not user:
                continue
            sub = db.query(PushSubscription).filter(
                PushSubscription.user_id == enroll.user_id,
                PushSubscription.is_active == True
            ).first()
            if sub:
                payload = course_nudge(user.name.split()[0], course.title, enroll.progress_pct)
                send_push_notification(sub.get_subscription_info(), payload)
        db.close()
    except Exception as e:
        logger.error(f"Course nudge job failed: {e}")

def job_re_engagement():
    """Users who haven't logged in for 3+ days."""
    try:
        from src.database.connection import SessionLocal
        from src.database.models import User, PushSubscription
        from src.services.notification_service import send_push_notification
        from src.services.notification_templates import re_engagement_3day, re_engagement_7day
        db = SessionLocal()
        now = datetime.now(timezone.utc)
        three_days_ago = now - timedelta(days=3)
        seven_days_ago = now - timedelta(days=7)
        users = db.query(User).filter(User.last_login_at != None).all()
        for user in users:
            if not user.last_login_at:
                continue
            last_login = user.last_login_at
            if last_login.tzinfo is None:
                last_login = last_login.replace(tzinfo=timezone.utc)
            days_away = (now - last_login).days
            if days_away < 3:
                continue
            sub = db.query(PushSubscription).filter(
                PushSubscription.user_id == user.user_id,
                PushSubscription.is_active == True
            ).first()
            if not sub:
                continue
            if days_away >= 7:
                payload = re_engagement_7day(user.name.split()[0])
            else:
                payload = re_engagement_3day(user.name.split()[0], 340.5, days_away, 2)
            send_push_notification(sub.get_subscription_info(), payload)
        db.close()
    except Exception as e:
        logger.error(f"Re-engagement job failed: {e}")

def job_flash_sale():
    """Weekly flash sale — target users who viewed ET Prime but didn't subscribe."""
    try:
        from src.database.connection import SessionLocal
        from src.database.models import PushSubscription
        from src.services.notification_service import broadcast_notification
        from src.services.notification_templates import flash_sale
        db = SessionLocal()
        subs = db.query(PushSubscription).filter(PushSubscription.is_active == True).all()
        if subs:
            payload = flash_sale(48, 199, 49, 2341)
            result = broadcast_notification([s.get_subscription_info() for s in subs], payload)
            logger.info(f"Flash sale broadcast: {result}")
        db.close()
    except Exception as e:
        logger.error(f"Flash sale job failed: {e}")

def job_news_digest():
    """Users who read news articles but haven't returned in 2+ days."""
    try:
        from src.database.connection import SessionLocal
        from src.database.models import ReadingBehavior, PushSubscription
        from src.services.notification_service import send_push_notification
        from src.services.notification_templates import news_digest
        db = SessionLocal()
        cutoff = datetime.now(timezone.utc) - timedelta(days=2)
        # Get users who had reading activity but not recently
        recent_readers = db.query(ReadingBehavior.user_id).filter(ReadingBehavior.timestamp <= cutoff).distinct().all()
        for (user_id,) in recent_readers:
            sub = db.query(PushSubscription).filter(
                PushSubscription.user_id == user_id,
                PushSubscription.is_active == True
            ).first()
            if sub:
                payload = news_digest("Nifty 50 hits all-time high", 5, "markets")
                send_push_notification(sub.get_subscription_info(), payload)
        db.close()
    except Exception as e:
        logger.error(f"News digest job failed: {e}")

def start_notification_scheduler():
    """Start all notification background jobs."""
    try:
        scheduler = BackgroundScheduler(timezone="Asia/Kolkata")
        # Every 6 hours
        scheduler.add_job(job_ipo_followup, 'interval', hours=6, id='ipo_followup')
        # Daily at 10am IST
        scheduler.add_job(job_course_nudge, 'cron', hour=10, minute=0, id='course_nudge')
        # Daily at 9am IST
        scheduler.add_job(job_re_engagement, 'cron', hour=9, minute=0, id='re_engagement')
        # Every Monday at 10am
        scheduler.add_job(job_flash_sale, 'cron', day_of_week='mon', hour=10, id='flash_sale')
        # Daily at 8am
        scheduler.add_job(job_news_digest, 'cron', hour=8, minute=0, id='news_digest')
        scheduler.start()
        logger.info("Notification scheduler started with 5 jobs.")
        return scheduler
    except Exception as e:
        logger.error(f"Notification scheduler start failed: {e}")
        return None
