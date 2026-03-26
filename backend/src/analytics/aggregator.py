from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.database.models import User, AgentExecution, Milestone, JourneyStage, Recommendation
from src.analytics.event_tracker import get_engagement_metrics

def compute_engagement_metrics(db: Session, days: int):
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    try:
        metrics = get_engagement_metrics(db, start_date, end_date)
        if not metrics:
            raise ValueError("No metrics")
        return metrics
    except Exception:
        return {
            "daily_active_users": 0,
            "total_sessions": 0,
            "events_fired": 0,
            "avg_messages_per_session": 0.0,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }

def compute_agent_metrics(db: Session, days: int):
    cutoff = datetime.utcnow() - timedelta(days=days)
    try:
        results = (
            db.query(
                AgentExecution.agent_name,
                func.count(AgentExecution.execution_id).label("total_calls"),
                func.avg(AgentExecution.execution_time_ms).label("avg_time_ms"),
                func.sum(
                    func.cast(AgentExecution.success == True, db.bind.dialect.name == 'postgresql' and 'integer' or 'integer')
                ).label("success_count"),
            )
            .filter(AgentExecution.timestamp >= cutoff)
            .group_by(AgentExecution.agent_name)
            .all()
        )
        agents = []
        for row in results:
            total = row.total_calls or 1
            agents.append({
                "agent_name": row.agent_name,
                "total_calls": row.total_calls,
                "avg_response_time_ms": round(float(row.avg_time_ms or 0), 1),
                "success_rate": round((row.success_count or 0) / total, 3),
            })
        return agents
    except Exception:
        return []

def compute_journey_metrics(db: Session):
    try:
        stage_counts = (
            db.query(JourneyStage.current_stage, func.count(JourneyStage.journey_id).label("count"))
            .group_by(JourneyStage.current_stage)
            .all()
        )
        total_users = db.query(func.count(User.user_id)).scalar() or 0
        total_users_with_journey = db.query(func.count(JourneyStage.journey_id)).scalar() or 0
        total_milestones = db.query(func.count(Milestone.milestone_id)).scalar() or 0
        completed_milestones = db.query(func.count(Milestone.milestone_id)).filter(Milestone.completed == True).scalar() or 0

        return {
            "users_by_stage": {row.current_stage: row.count for row in stage_counts} if stage_counts else {},
            "total_users": total_users,
            "milestone_completion_rate": round(completed_milestones / max(total_milestones, 1), 3),
            "total_milestones": total_milestones,
            "completed_milestones": completed_milestones,
        }
    except Exception:
        return {
            "users_by_stage": {},
            "total_users": 0,
            "milestone_completion_rate": 0.0,
            "total_milestones": 0,
            "completed_milestones": 0,
        }

def compute_recommendation_metrics(db: Session, days: int):
    cutoff = datetime.utcnow() - timedelta(days=days)
    try:
        total_shown = db.query(func.count(Recommendation.recommendation_id)).filter(
            Recommendation.shown_at >= cutoff
        ).scalar() or 0

        total_interacted = db.query(func.count(Recommendation.recommendation_id)).filter(
            Recommendation.shown_at >= cutoff,
            Recommendation.interacted_at != None,
        ).scalar() or 0

        return {
            "recommendations_shown": total_shown,
            "recommendations_interacted": total_interacted,
            "ctr": round(total_interacted / max(total_shown, 1), 3)
        }
    except Exception:
        return {
            "recommendations_shown": 0,
            "recommendations_interacted": 0,
            "ctr": 0.0
        }
