from sqlalchemy.orm import Session
from src.database.models import Conversation, Message, UserProfile
from src.services.llm_service import generate_response, classify_intent
from src.analytics.event_tracker import event_tracker
import uuid
import os
import logging

logger = logging.getLogger(__name__)

USE_AGENT_ORCHESTRATION = os.getenv("USE_AGENT_ORCHESTRATION", "false").lower() == "true"


def create_session(db: Session, user_id: uuid.UUID) -> Conversation:
    conversation = Conversation(user_id=user_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    # Initialize journey on first session
    _ensure_journey_exists(db, user_id)
    # Track event
    try:
        event_tracker.track(str(user_id), "message_sent", {"action": "session_created"}, session_id=str(conversation.session_id))
    except Exception as e:
        logger.error(f"Error tracking {e}")
    return conversation


def get_session_messages(db: Session, session_id: uuid.UUID):
    return db.query(Message).filter(Message.session_id == session_id).order_by(Message.timestamp.asc()).all()


def add_message(
    db: Session,
    session_id: uuid.UUID,
    role: str,
    content: str,
    intent: str = None,
    agent_used: str = None,
    context_used: dict = None,
    metadata: dict = None,
) -> Message:
    message = Message(
        session_id=session_id,
        role=role,
        content=content,
        intent_detected=intent,
        agent_used=agent_used,
        context_used=context_used,
        message_metadata=metadata,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def process_chat_message(db: Session, user_id: uuid.UUID, session_id: uuid.UUID, content: str):
    """Phase 1 conversation path (direct LLM). Preserved for backward compatibility."""
    conversation = db.query(Conversation).filter(
        Conversation.session_id == session_id,
        Conversation.user_id == user_id,
    ).first()
    if not conversation:
        return None

    intent = classify_intent(content)
    user_msg = add_message(db, session_id, "user", content, intent=intent)

    history = []
    messages = get_session_messages(db, session_id)
    for msg in messages[-10:]:
        history.append({"role": msg.role, "content": msg.content})

    ai_response_text = generate_response(content, history[:-1])
    ai_msg = add_message(db, session_id, "assistant", ai_response_text, agent_used="llm_direct")

    conversation.message_count += 2
    db.commit()

    # Track event
    try:
        event_tracker.track(str(user_id), "message_sent", {"intent": intent, "mode": "phase1"}, session_id=str(session_id))
        _check_first_conversation_milestone(db, user_id)
    except Exception:
        pass

    return {"user_message": user_msg, "assistant_message": ai_msg}


def process_agent_message(db: Session, user_id: uuid.UUID, session_id: uuid.UUID, content: str):
    """Phase 2 conversation path (multi-agent orchestration)."""
    from src.orchestration.orchestrator import get_orchestrator

    conversation = db.query(Conversation).filter(
        Conversation.session_id == session_id,
        Conversation.user_id == user_id,
    ).first()
    if not conversation:
        return None

    # Load user profile for agent context
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    profile_dict = _profile_to_dict(profile) if profile else {}

    # Get conversation history
    messages = get_session_messages(db, session_id)
    history = [{"role": m.role, "content": m.content} for m in messages[-10:]]

    # Save user message first
    user_msg = add_message(db, session_id, "user", content, intent="pending")

    # Run orchestration
    orchestrator = get_orchestrator()
    orch_result = orchestrator.process_message(
        user_id=str(user_id),
        session_id=str(session_id),
        message=content,
        user_profile=profile_dict,
        conversation_history=history,
    )

    # Update user message with classified intent
    user_msg.intent_detected = orch_result.get("intent", "general_question")
    user_msg.confidence_score = orch_result.get("intent_confidence", 0.0)
    db.commit()

    # Save AI response with agent metadata
    ai_response_text = orch_result.get("response", "I'm here to help!")
    context_sources = orch_result.get("context_sources", [])
    ai_msg = add_message(
        db,
        session_id,
        "assistant",
        ai_response_text,
        intent=orch_result.get("intent"),
        agent_used=orch_result.get("agent_used", "coordinator"),
        context_used={"sources": context_sources} if context_sources else None,
        metadata={
            "agents_invoked": orch_result.get("agents_invoked", []),
            "execution_time_ms": orch_result.get("execution_time_ms", 0),
            "quality_score": orch_result.get("quality_score", 0),
        },
    )

    # Log agent execution to DB
    try:
        from src.database.models import AgentExecution
        for agent_name in orch_result.get("agents_invoked", []):
            exec_log = AgentExecution(
                session_id=session_id,
                agent_name=agent_name,
                input_data={"message": content[:200]},
                output_data={"response": ai_response_text[:200]},
                execution_time_ms=orch_result.get("execution_time_ms", 0),
                success=True,
            )
            db.add(exec_log)
    except Exception as e:
        logger.warning(f"Agent execution log failed: {e}")

    # Update profile if enriched by profiling agent
    updated_profile = orch_result.get("updated_profile", {})
    if updated_profile and profile:
        _update_profile_from_agent(db, profile, updated_profile)

    conversation.message_count += 2
    db.commit()

    # Milestones & events
    try:
        event_tracker.track(str(user_id), "agent_orchestration_completed",
                    {"agents": orch_result.get("agents_invoked", []), "intent": orch_result.get("intent")},
                    session_id=str(session_id))
        _check_first_conversation_milestone(db, user_id)
    except Exception:
        pass

    return {
        "user_message": user_msg,
        "assistant_message": ai_msg,
        "orchestration_result": orch_result,
    }


def _profile_to_dict(profile) -> dict:
    if not profile:
        return {}
    return {
        "age_group": profile.age_group,
        "occupation": profile.occupation,
        "industry": profile.industry,
        "income_level": profile.income_level,
        "investment_experience": profile.investment_experience,
        "risk_tolerance": profile.risk_tolerance,
        "financial_goals": profile.financial_goals or [],
        "interests": profile.interests or [],
        "primary_segment": profile.primary_segment,
        "segment_confidence": float(profile.segment_confidence) if profile.segment_confidence else 0.0,
        "life_stage": profile.life_stage,
    }


def _update_profile_from_agent(db: Session, profile, updated: dict):
    """Apply profiling agent's enriched data back to the DB profile."""
    updatable = ["age_group", "occupation", "industry", "income_level",
                 "investment_experience", "risk_tolerance", "primary_segment",
                 "life_stage", "financial_goals", "interests"]
    for field in updatable:
        if updated.get(field) is not None:
            setattr(profile, field, updated[field])
    if updated.get("segment_confidence"):
        from decimal import Decimal
        profile.segment_confidence = Decimal(str(updated["segment_confidence"]))
    if updated.get("sub_segments_scores"):
        profile.sub_segments_scores = updated["sub_segments_scores"]
    from datetime import datetime
    profile.last_enriched_at = datetime.utcnow()
    db.commit()


def _ensure_journey_exists(db: Session, user_id: uuid.UUID):
    """Initialize a journey stage for the user if not present (feature-flagged)."""
    if os.getenv("ENABLE_JOURNEY_SYSTEM", "true").lower() != "true":
        return
    try:
        from src.journey.journey_manager import JourneyManager
        jm = JourneyManager(db)
        jm.get_or_create_journey(user_id)
    except Exception as e:
        logger.warning(f"Journey init failed for {user_id}: {e}")


def _check_first_conversation_milestone(db: Session, user_id: uuid.UUID):
    """Auto-complete 'first_conversation' milestone on first message."""
    if os.getenv("ENABLE_JOURNEY_SYSTEM", "true").lower() != "true":
        return
    try:
        from src.journey.journey_manager import JourneyManager
        jm = JourneyManager(db)
        jm.complete_milestone(user_id, "first_conversation")
    except Exception:
        pass
