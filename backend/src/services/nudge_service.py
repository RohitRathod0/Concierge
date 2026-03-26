from sqlalchemy.orm import Session
from src.database.models import NudgeEvent, UserIdentityScore
from src.services.trigger_classifier import TriggerClassifier
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta

class NudgeDeliveryEngine:
    def __init__(self, db: Session):
        self.db = db
        self.classifier = TriggerClassifier()
        self.MAX_DAILY_NUDGES = 8
        self.MAX_SESSION_NUDGES = 3

    def should_deliver_nudge(self, user_id: UUID, trigger_type: str) -> bool:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        recent_nudges = self.db.query(NudgeEvent).filter(
            NudgeEvent.user_id == user_id,
            NudgeEvent.shown_at >= today_start
        ).all()
        
        if len(recent_nudges) >= self.MAX_DAILY_NUDGES:
            return False
            
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        for nudge in recent_nudges:
            if nudge.trigger_type == trigger_type and nudge.shown_at >= one_hour_ago:
                return False
                
        return True

    def seed_initial_nudges_for_user(self, user_id: UUID):
        existing = self.db.query(NudgeEvent).filter(NudgeEvent.user_id == user_id).first()
        if existing:
            return
            
        profile = self.db.query(UserIdentityScore).filter(UserIdentityScore.user_id == user_id).first()
        if not profile:
            nudge = NudgeEvent(
                user_id=user_id,
                trigger_type="PROGRESS_NUDGE",
                nudge_copy="Complete your profile to unlock personalized recommendations",
                channel="TOAST"
            )
            self.db.add(nudge)
            self.db.commit()
            return
            
        segment = getattr(profile, 'engagement_archetype', '')
        if segment == "TECH_PROFESSIONAL_INVESTOR":
            nudge = NudgeEvent(
                user_id=user_id,
                trigger_type="IDENTITY_TRIGGER",
                nudge_copy="Tech investors like you use ET Prime for market edge",
                channel="TOAST"
            )
            self.db.add(nudge)
            self.db.commit()

    def process_event(self, user_id: UUID, event_type: str, context: Dict[str, Any]) -> Optional[NudgeEvent]:
        trigger_type = self.classifier.classify_event(event_type, context)
        if not trigger_type:
            return None
            
        if self.should_deliver_nudge(user_id, trigger_type):
            nudge = NudgeEvent(
                user_id=user_id,
                trigger_type=trigger_type,
                nudge_copy=self._generate_copy(trigger_type, context),
                channel=self._determine_channel(trigger_type)
            )
            self.db.add(nudge)
            self.db.commit()
            self.db.refresh(nudge)
            return nudge
        return None
        
    def _generate_copy(self, trigger_type: str, context: Dict[str, Any]) -> str:
        templates = {
            "FOMO_TRIGGER": "Your watchlist missed this. ET Prime would have alerted you 3 days earlier.",
            "LOSS_AVERSION_TRIGGER": "Protect your wealth. 3 ET users similar to you added these mutual funds.",
            "SOCIAL_PROOF_TRIGGER": "Professionals like you are enrolling. 234 enrolled this week.",
            "PROGRESS_NUDGE": "You're 40% away from becoming ET Certified Investor. Don't stop now.",
            "URGENCY_TRIGGER": "IPO subscription closes in 48h. Time is running out.",
            "RECIPROCITY_TRIGGER": "You've read 5 premium insights this week. Get unlimited for Rs.7/day.",
            "IDENTITY_TRIGGER": "Smart investors like you use ET Prime for edge over the market.",
            "COMEBACK_TRIGGER": "While you were away, Nifty moved. Your watchlist needs attention."
        }
        return templates.get(trigger_type, "Discover more on ET.")

    def _determine_channel(self, trigger_type: str) -> str:
        if trigger_type in ["COMEBACK_TRIGGER"]:
            return "Push notification"
        elif trigger_type in ["URGENCY_TRIGGER", "PROGRESS_NUDGE"]:
            return "In-app toast notification"
        return "Inline contextual banner"
