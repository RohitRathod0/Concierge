"""
ET AI Concierge — Agentic Chat Route (FULLY REWRITTEN)
=======================================================
This is the MAIN chat endpoint. Every message goes through:
1. Profile loading from DB (so the AI knows who it's talking to)
2. Conversation history loading (context memory)
3. Gemini LLM call with FULL profile-injected system prompt
4. Returns: answer + LLM-generated personalized cross_sell recommendation
"""
import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List

from src.database.connection import get_db
from src.database.models import User, UserProfile, Conversation, Message
from src.services.auth_service import SECRET_KEY, ALGORITHM
from src.services.llm_service import generate_response_agentic, classify_intent
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat-agent"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ── Schemas ────────────────────────────────────────────────────────────────
class AgentMessageRequest(BaseModel):
    message: str
    session_id: Optional[uuid.UUID] = None
    context: Optional[dict] = None   # e.g. {"page": "/news", "article": "Nifty hits ATH"}


class AgentMessageResponse(BaseModel):
    session_id: str
    message_id: Optional[str] = None
    response: dict
    agent_trace: Optional[dict] = None


# ── Auth helper ────────────────────────────────────────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise exc
    except JWTError:
        raise exc
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise exc
    return user


# ── Helper: build profile dict from ORM model ──────────────────────────────
def _profile_to_dict(user: User, profile: Optional[UserProfile]) -> dict:
    base = {"name": user.name or "Investor"}
    if not profile:
        return base
    return {
        **base,
        "age_group": profile.age_group or "",
        "occupation": profile.occupation or "",
        "industry": profile.industry or "",
        "income_level": profile.income_level or "",
        "investment_experience": profile.investment_experience or "",
        "risk_tolerance": profile.risk_tolerance or "",
        "financial_goals": profile.financial_goals or [],
        "interests": profile.interests or [],
        "life_stage": profile.life_stage or "",
        "primary_segment": profile.primary_segment or "",
    }


# ── Helper: get or create conversation session ─────────────────────────────
def _get_or_create_session(db: Session, user_id: uuid.UUID, session_id: Optional[uuid.UUID]) -> Conversation:
    if session_id:
        conv = db.query(Conversation).filter(
            Conversation.session_id == session_id,
            Conversation.user_id == user_id,
        ).first()
        if conv:
            return conv
    # Create new
    conv = Conversation(user_id=user_id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


# ── Helper: fetch history ──────────────────────────────────────────────────
def _get_history(db: Session, session_id: uuid.UUID, limit: int = 12) -> List[dict]:
    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.timestamp.asc())
        .limit(limit)
        .all()
    )
    return [{"role": m.role, "content": m.content} for m in messages]


# ── Main agentic chat endpoint ─────────────────────────────────────────────
@router.post("/agent-message")
def send_agent_message(
    request: AgentMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    TRUE AGENTIC CHAT:
    - Loads user profile from DB
    - Injects profile into Gemini system prompt
    - Gets LLM-generated personalized answer + cross-sell
    - Returns dynamic structured response
    """
    import time
    t_start = time.time()

    # 1. Get user profile
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.user_id
    ).first()
    user_profile_dict = _profile_to_dict(current_user, profile)

    # 2. Get or create conversation session
    conv = _get_or_create_session(db, current_user.user_id, request.session_id)
    session_id = conv.session_id

    # 3. Load conversation history
    history = _get_history(db, session_id)

    # 4. Extract page context from request
    page_context = None
    if request.context:
        parts = []
        if request.context.get("page"):
            parts.append(f"Page: {request.context['page']}")
        if request.context.get("article"):
            parts.append(f"Article being read: {request.context['article']}")
        if request.context.get("stock"):
            parts.append(f"Stock being viewed: {request.context['stock']}")
        if request.context.get("ipo"):
            parts.append(f"IPO being viewed: {request.context['ipo']}")
        if request.context.get("query"):
            parts.append(f"Search query: {request.context['query']}")
        page_context = " | ".join(parts) if parts else None

    # 5. Classify intent (async, non-blocking label for analytics)
    intent = "general_question"
    try:
        intent = classify_intent(request.message)
    except Exception:
        pass

    # 6. Save user message
    user_msg = Message(
        session_id=session_id,
        role="user",
        content=request.message,
        intent_detected=intent,
    )
    db.add(user_msg)
    db.flush()  # get message_id without committing

    # 7. Add user msg to history for context
    history.append({"role": "user", "content": request.message})

    # 8. CALL THE AGENTIC LLM — this is the brain
    try:
        llm_result = generate_response_agentic(
            message=request.message,
            history=history,
            user_profile=user_profile_dict,
            page_context=page_context,
        )
    except Exception as e:
        logger.error(f"Gemini call failed: {e}", exc_info=True)
        llm_result = {
            "answer": "I'm having trouble right now. Could you please rephrase your question?",
            "cross_sell": None,
        }

    answer_text = llm_result.get("answer", "")
    cross_sell = llm_result.get("cross_sell")

    t_ms = int((time.time() - t_start) * 1000)

    # 9. Save assistant message
    ai_msg = Message(
        session_id=session_id,
        role="assistant",
        content=answer_text,
        intent_detected=intent,
        agent_used="gemini_agentic_v3",
    )
    db.add(ai_msg)
    conv.message_count = (conv.message_count or 0) + 2
    db.commit()
    db.refresh(ai_msg)

    # 10. Log analytics event
    try:
        from src.analytics.event_tracker import event_tracker
        event_tracker.track(
            str(current_user.user_id),
            "agentic_message_sent",
            {"intent": intent, "has_cross_sell": bool(cross_sell), "profile_complete": bool(profile)},
            session_id=str(session_id),
        )
    except Exception:
        pass

    return {
        "session_id": str(session_id),
        "message_id": str(ai_msg.message_id),
        "response": {
            "text": answer_text,
            "agent_used": "gemini_agentic_v3",
            "intent": intent,
            "cross_sell": cross_sell,
            "profile_used": bool(profile),
            "page_context_used": bool(page_context),
            "execution_ms": t_ms,
        },
        "agent_trace": {
            "mode": "agentic_v3",
            "profile_complete": bool(profile),
            "intent": intent,
            "execution_time_ms": t_ms,
        },
    }
