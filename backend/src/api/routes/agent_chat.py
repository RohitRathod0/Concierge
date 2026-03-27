"""
ET AI Concierge — Agentic Chat Route v4 (LangGraph-powered)
============================================================
Every message goes through the LangGraph:
  classify_intent → route_by_intent → specialist_agent (with ReAct + tools) → response

The specialist agent fetches REAL data from the DB and formats a personalized answer.
Zero hardcoded strings in response generation.
"""
import uuid
import logging
import time
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List

from langchain_core.messages import HumanMessage, AIMessage

from src.database.connection import get_db
from src.database.models import User, UserProfile, Conversation, Message
from src.services.auth_service import SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat-agent"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ── Schemas ─────────────────────────────────────────────────────────────────
class AgentMessageRequest(BaseModel):
    message: str
    session_id: Optional[uuid.UUID] = None
    context: Optional[dict] = None  # {page, article, stock, ipo}


# ── Auth ─────────────────────────────────────────────────────────────────────
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
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


# ── Helpers ──────────────────────────────────────────────────────────────────
def _get_or_create_session(db: Session, user_id: uuid.UUID, session_id: Optional[uuid.UUID]) -> Conversation:
    if session_id:
        conv = db.query(Conversation).filter(
            Conversation.session_id == session_id,
            Conversation.user_id == user_id,
        ).first()
        if conv:
            return conv
    conv = Conversation(user_id=user_id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def _fetch_history(db: Session, session_id: uuid.UUID, limit: int = 10) -> List[dict]:
    msgs = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.timestamp.asc())
        .limit(limit)
        .all()
    )
    return [{"role": m.role, "content": m.content} for m in msgs]


def _build_initial_state(user: User, profile: Optional[UserProfile], history: List[dict], message: str, page_context: dict) -> dict:
    """Build the full ETAgentState dict from DB data."""
    # Convert history to LangChain messages
    lc_messages = []
    for m in history:
        if m["role"] == "user":
            lc_messages.append(HumanMessage(content=m["content"]))
        else:
            lc_messages.append(AIMessage(content=m["content"]))
    lc_messages.append(HumanMessage(content=message))

    state = {
        "messages": lc_messages,
        "user_id": str(user.user_id),
        "user_name": user.name or "Investor",
        "user_persona": getattr(profile, "primary_segment", None),
        "user_knowledge_level": None,
        "user_interests": getattr(profile, "interests", None) or [],
        "user_risk_appetite": getattr(profile, "risk_tolerance", None),
        "investment_experience": getattr(profile, "investment_experience", None),
        "age_group": getattr(profile, "age_group", None),
        "occupation": getattr(profile, "occupation", None),
        "income_level": getattr(profile, "income_level", None),
        "financial_goals": getattr(profile, "financial_goals", None) or [],
        "life_stage": getattr(profile, "life_stage", None),
        "has_et_prime": False,
        "has_demat_account": False,
        "detected_intent": None,
        "current_page": page_context.get("page"),
        "article_context": page_context.get("article") or page_context.get("ipo") or page_context.get("stock"),
        "tool_results": None,
        "product_to_recommend": None,
        "response_ready": False,
        "execution_trace": None,
    }
    return state


# ── Main endpoint ─────────────────────────────────────────────────────────────
@router.post("/agent-message")
def send_agent_message(
    request: AgentMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    TRUE AGENTIC CHAT — powered by LangGraph.
    Flow: classify_intent → route → specialist agent (ReAct + DB tools) → response.
    Every answer is generated from real DB data, not hardcoded templates.
    """
    t_start = time.time()

    # 1. Load profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.user_id).first()

    # 2. Session management
    conv = _get_or_create_session(db, current_user.user_id, request.session_id)
    session_id = conv.session_id

    # 3. Conversation history
    history = _fetch_history(db, session_id)

    # 4. Page context
    page_ctx = request.context or {}

    # 5. Build initial state
    initial_state = _build_initial_state(current_user, profile, history, request.message, page_ctx)

    # 6. Save user message to DB
    user_msg_obj = Message(
        session_id=session_id,
        role="user",
        content=request.message,
        intent_detected=None,
    )
    db.add(user_msg_obj)
    db.flush()

    # 7. Run the LangGraph
    answer_text = ""
    detected_intent = "general_question"
    cross_sell = None
    execution_trace = {
        "provider": "gemini",
        "framework": "langgraph",
        "mode": "langgraph_v4",
        "used_tools": False,
        "tools_used": [],
    }

    try:
        from src.agents.graph import et_graph
        if et_graph is None:
            raise RuntimeError("LangGraph failed to compile on startup")

        result = et_graph.invoke(initial_state)
        detected_intent = result.get("detected_intent") or "general_question"
        execution_trace = {
            **execution_trace,
            **(result.get("execution_trace") or {}),
        }

        # Extract last AI message
        for msg in reversed(result.get("messages", [])):
            if isinstance(msg, AIMessage) and msg.content:
                answer_text = msg.content
                break

        if not answer_text:
            answer_text = "I wasn't able to generate a response. Please try rephrasing your question."

    except Exception as e:
        logger.error(f"LangGraph invocation failed: {e}", exc_info=True)
        # Fallback to the reliable local agentic fallback
        try:
            from src.services.llm_service import _local_agentic_fallback
            profile_dict = {
                "name": current_user.name,
                "investment_experience": getattr(profile, "investment_experience", ""),
                "risk_tolerance": getattr(profile, "risk_tolerance", ""),
                "age_group": getattr(profile, "age_group", ""),
                "financial_goals": getattr(profile, "financial_goals", []) or [],
            } if profile else {}
            fallback = _local_agentic_fallback(request.message, profile_dict, page_ctx.get("page"))
            answer_text = fallback.get("answer", "I'm having trouble right now. Please try again.")
            cross_sell = fallback.get("cross_sell")
            execution_trace = {
                "provider": "local_fallback",
                "framework": "langgraph",
                "mode": "fallback_after_langgraph_error",
                "used_tools": False,
                "tools_used": [],
                "error": type(e).__name__,
            }
        except Exception as e2:
            logger.error(f"Fallback also failed: {e2}")
            answer_text = "I'm having trouble right now. Please try again in a moment."
            execution_trace = {
                "provider": "none",
                "framework": "langgraph",
                "mode": "fatal_error",
                "used_tools": False,
                "tools_used": [],
                "error": type(e2).__name__,
            }

    t_ms = int((time.time() - t_start) * 1000)

    # 8. Save assistant message
    ai_msg_obj = Message(
        session_id=session_id,
        role="assistant",
        content=answer_text,
        intent_detected=detected_intent,
        agent_used="langgraph_v4",
    )
    db.add(ai_msg_obj)
    conv.message_count = (conv.message_count or 0) + 2
    db.commit()
    db.refresh(ai_msg_obj)

    # 9. Analytics
    try:
        from src.analytics.event_tracker import event_tracker
        event_tracker.track(
            str(current_user.user_id),
            "langgraph_message",
            {"intent": detected_intent, "profile_loaded": bool(profile), "ms": t_ms},
            session_id=str(session_id),
        )
    except Exception:
        pass

    return {
        "session_id": str(session_id),
        "message_id": str(ai_msg_obj.message_id),
        "response": {
            "text": answer_text,
            "agent_used": "langgraph_v4",
            "intent": detected_intent,
            "cross_sell": cross_sell,
            "profile_used": bool(profile),
            "execution_ms": t_ms,
            "response_source": execution_trace.get("provider"),
            "tools_used": execution_trace.get("tools_used", []),
        },
        "agent_trace": {
            "mode": "langgraph_v4",
            "intent": detected_intent,
            "execution_time_ms": t_ms,
            "profile_complete": bool(profile),
            "provider": execution_trace.get("provider"),
            "framework": execution_trace.get("framework"),
            "model": execution_trace.get("model"),
            "used_tools": execution_trace.get("used_tools", False),
            "tools_used": execution_trace.get("tools_used", []),
            "raw_mode": execution_trace.get("mode"),
            "error": execution_trace.get("error"),
        },
    }
