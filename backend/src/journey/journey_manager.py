"""
ET AI Concierge - Phase 2
Journey Manager: manages user journey progression through 4 stages.
Stages: discovery → exploration → commitment → advocacy
"""
import logging
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from sqlalchemy.orm import Session
from src.database.models import JourneyStage, Milestone, User, UserProfile

logger = logging.getLogger(__name__)

# Journey stage definitions
STAGES = ["discovery", "exploration", "commitment", "advocacy"]

STAGE_MILESTONES = {
    "discovery": [
        {"name": "profile_completed", "required": True, "reward_points": 100},
        {"name": "first_conversation", "required": True, "reward_points": 50},
        {"name": "first_article_read", "required": False, "reward_points": 25},
    ],
    "exploration": [
        {"name": "product_trial_started", "required": False, "reward_points": 200},
        {"name": "attended_webinar", "required": False, "reward_points": 150},
        {"name": "5_articles_read", "required": False, "reward_points": 100},
    ],
    "commitment": [
        {"name": "first_paid_subscription", "required": False, "reward_points": 500},
        {"name": "profile_enrichment_80", "required": False, "reward_points": 100},
        {"name": "shared_content", "required": False, "reward_points": 50},
    ],
    "advocacy": [
        {"name": "3_products_active", "required": False, "reward_points": 1000},
        {"name": "referred_friend", "required": False, "reward_points": 500},
        {"name": "community_participation", "required": False, "reward_points": 200},
    ],
}

# Transition conditions (milestones required to advance)
TRANSITION_CONDITIONS = {
    "discovery_to_exploration": {"required": ["profile_completed", "first_conversation"]},
    "exploration_to_commitment": {"any_of": ["product_trial_started", "5_articles_read"]},
    "commitment_to_advocacy": {"any_of": ["first_paid_subscription"]},
}


class JourneyManager:
    """Manages user journey progression and milestone tracking."""

    def __init__(self, db: Session):
        self.db = db

    def get_or_create_journey(self, user_id: uuid.UUID) -> JourneyStage:
        """Get or initialize a user's journey stage."""
        journey = self.db.query(JourneyStage).filter(JourneyStage.user_id == user_id).first()
        if not journey:
            journey = JourneyStage(
                user_id=user_id,
                current_stage="discovery",
                stage_started_at=datetime.utcnow(),
            )
            self.db.add(journey)
            # Initialize all milestones for discovery stage
            self._initialize_stage_milestones(user_id, "discovery")
            self.db.commit()
            self.db.refresh(journey)
            logger.info(f"Created journey for user {user_id}")
        return journey

    def get_current_stage(self, user_id: uuid.UUID) -> dict:
        """Return full journey status for a user."""
        journey = self.get_or_create_journey(user_id)
        stage = journey.current_stage
        days_in_stage = (datetime.utcnow() - journey.stage_started_at).days

        milestones = self._get_stage_milestones(user_id, stage)
        next_stage = self._get_next_stage(stage)
        next_milestones = self._get_stage_milestones(user_id, next_stage) if next_stage else []

        velocity = self._calculate_velocity(user_id)

        return {
            "current_stage": stage,
            "stage_started_at": journey.stage_started_at.isoformat(),
            "days_in_stage": days_in_stage,
            "velocity_score": float(journey.velocity_score or 0),
            "milestones": milestones,
            "next_milestones": next_milestones,
            "next_stage": next_stage,
            "recommended_actions": self._get_recommended_actions(stage, milestones),
            "total_points": self._get_total_points(user_id),
        }

    def complete_milestone(self, user_id: uuid.UUID, milestone_name: str) -> dict:
        """Mark a milestone as completed and check for stage progression."""
        milestone = (
            self.db.query(Milestone)
            .filter(Milestone.user_id == user_id, Milestone.milestone_name == milestone_name)
            .first()
        )

        if not milestone:
            # Auto-create if missing (edge case for existing users)
            journey = self.get_or_create_journey(user_id)
            for stage_def in STAGE_MILESTONES.get(journey.current_stage, []):
                if stage_def["name"] == milestone_name:
                    milestone = Milestone(
                        user_id=user_id,
                        milestone_name=milestone_name,
                        journey_stage=journey.current_stage,
                        reward_points=stage_def["reward_points"],
                    )
                    self.db.add(milestone)
                    break

        if milestone and not milestone.completed:
            milestone.completed = True
            milestone.completed_at = datetime.utcnow()
            self.db.commit()
            logger.info(f"Milestone '{milestone_name}' completed for user {user_id}")

            # Check for stage progression
            progression = self.check_stage_progression(user_id)
            return {
                "milestone_completed": milestone_name,
                "reward_points": milestone.reward_points,
                "stage_progressed": progression.get("progressed", False),
                "new_stage": progression.get("new_stage"),
            }

        return {"milestone_completed": milestone_name, "reward_points": 0, "stage_progressed": False}

    def check_stage_progression(self, user_id: uuid.UUID) -> dict:
        """Check if user qualifies to advance to the next stage."""
        journey = self.get_or_create_journey(user_id)
        current = journey.current_stage
        next_stage = self._get_next_stage(current)

        if not next_stage:
            return {"progressed": False, "reason": "already_at_final_stage"}

        transition_key = f"{current}_to_{next_stage}"
        condition = TRANSITION_CONDITIONS.get(transition_key, {})

        completed = {
            m.milestone_name for m in
            self.db.query(Milestone).filter(
                Milestone.user_id == user_id,
                Milestone.completed == True,
            ).all()
        }

        # Check required milestones
        required = condition.get("required", [])
        if required and not all(m in completed for m in required):
            return {"progressed": False, "reason": "required_milestones_incomplete"}

        # Check any_of milestones
        any_of = condition.get("any_of", [])
        if any_of and not any(m in completed for m in any_of):
            return {"progressed": False, "reason": "no_any_of_milestones_completed"}

        # Advance the stage!
        journey.previous_stage = current
        journey.current_stage = next_stage
        journey.stage_started_at = datetime.utcnow()
        journey.updated_at = datetime.utcnow()
        journey.velocity_score = self._calculate_velocity(user_id)
        self._initialize_stage_milestones(user_id, next_stage)
        self.db.commit()
        logger.info(f"User {user_id} advanced from {current} to {next_stage}")
        return {"progressed": True, "new_stage": next_stage, "previous_stage": current}

    def _initialize_stage_milestones(self, user_id: uuid.UUID, stage: str):
        """Create milestone rows for a new stage."""
        for ms_def in STAGE_MILESTONES.get(stage, []):
            existing = self.db.query(Milestone).filter(
                Milestone.user_id == user_id,
                Milestone.milestone_name == ms_def["name"],
            ).first()
            if not existing:
                milestone = Milestone(
                    user_id=user_id,
                    milestone_name=ms_def["name"],
                    journey_stage=stage,
                    reward_points=ms_def["reward_points"],
                )
                self.db.add(milestone)

    def _get_stage_milestones(self, user_id: uuid.UUID, stage: str) -> List[dict]:
        milestones = (
            self.db.query(Milestone)
            .filter(Milestone.user_id == user_id, Milestone.journey_stage == stage)
            .all()
        )
        return [
            {
                "name": m.milestone_name,
                "completed": m.completed,
                "completed_at": m.completed_at.isoformat() if m.completed_at else None,
                "reward_points": m.reward_points,
            }
            for m in milestones
        ]

    def _get_next_stage(self, current: str) -> Optional[str]:
        idx = STAGES.index(current) if current in STAGES else -1
        return STAGES[idx + 1] if 0 <= idx < len(STAGES) - 1 else None

    def _calculate_velocity(self, user_id: uuid.UUID) -> float:
        """Milestones completed per week since journey start."""
        journey = self.db.query(JourneyStage).filter(JourneyStage.user_id == user_id).first()
        if not journey:
            return 0.0
        completed_count = self.db.query(Milestone).filter(
            Milestone.user_id == user_id,
            Milestone.completed == True,
        ).count()
        days_elapsed = max((datetime.utcnow() - journey.stage_started_at).days, 1)
        return round(completed_count / (days_elapsed / 7), 2)

    def _get_total_points(self, user_id: uuid.UUID) -> int:
        total = sum(
            m.reward_points for m in
            self.db.query(Milestone).filter(
                Milestone.user_id == user_id,
                Milestone.completed == True,
            ).all()
        )
        return total

    def _get_recommended_actions(self, stage: str, milestones: List[dict]) -> List[str]:
        incomplete = [m["name"] for m in milestones if not m["completed"]]
        actions = []
        action_map = {
            "profile_completed": "Complete your profile to unlock personalized recommendations",
            "first_conversation": "Start a conversation with ET AI Concierge",
            "first_article_read": "Read your first ET Prime article",
            "product_trial_started": "Try ET Prime for free—30 days no charge",
            "attended_webinar": "Attend an ET Wealth Summit online event",
            "5_articles_read": "Read 5 ET Prime articles to unlock ET Markets Pro",
            "first_paid_subscription": "Subscribe to ET Prime to continue your learning journey",
            "3_products_active": "Explore ET Markets and ET Masterclass alongside ET Prime",
            "referred_friend": "Invite a friend and earn 500 reward points",
        }
        for name in incomplete[:3]:
            if name in action_map:
                actions.append(action_map[name])
        return actions
