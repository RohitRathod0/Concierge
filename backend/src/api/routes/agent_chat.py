"""
ET AI Concierge - Phase 2
Agent Chat Route: POST /chat/agent-message
Wraps the multi-agent orchestration system with feature-flag gating.
Falls back to Phase 1 conversation_service if flag is off.
"""
import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List

from src.database.connection import get_db
from src.database.models import User, UserProfile
from src.services.auth_service import SECRET_KEY, ALGORITHM
from src.services import conversation_service
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat-agent"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

USE_AGENT_ORCHESTRATION = os.getenv("USE_AGENT_ORCHESTRATION", "false").lower() == "true"


class AgentMessageRequest(BaseModel):
    message: str
    session_id: Optional[uuid.UUID] = None
    context: Optional[dict] = None


class AgentMessageResponse(BaseModel):
    session_id: uuid.UUID
    message_id: Optional[uuid.UUID] = None
    response: dict
    agent_trace: Optional[dict] = None


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/agent-message")
def send_agent_message(
    request: AgentMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Send a message through the multi-agent system (Phase 2).
    Falls back to Phase 1 LLM service if USE_AGENT_ORCHESTRATION=false.
    """
    # Ensure session exists
    session_id = request.session_id
    if not session_id:
        session = conversation_service.create_session(db, current_user.user_id)
        session_id = session.session_id

    if not USE_AGENT_ORCHESTRATION:
        # Phase 1 fallback
        result = conversation_service.process_chat_message(
            db, current_user.user_id, session_id, request.message
        )
        if not result:
            raise HTTPException(status_code=404, detail="Session not found")
        assistant_msg = result["assistant_message"]
        return {
            "session_id": str(session_id),
            "message_id": str(assistant_msg.message_id),
            "response": {
                "text": assistant_msg.content,
                "agent_used": "llm_direct",
                "confidence": 0.8,
                "context_sources": [],
                "suggestions": [],
                "recommendations": [],
            },
            "agent_trace": {"mode": "phase1_fallback"},
        }

    # Phase 2: Multi-agent path
    try:
        result = conversation_service.process_agent_message(
            db=db,
            user_id=current_user.user_id,
            session_id=session_id,
            content=request.message,
        )
        if not result:
            raise HTTPException(status_code=404, detail="Session not found or processing failed")

        orch_result = result.get("orchestration_result", {})

        return {
            "session_id": str(session_id),
            "message_id": str(result["assistant_message"].message_id),
            "response": {
                "text": orch_result.get("response", ""),
                "agent_used": orch_result.get("agent_used", "coordinator"),
                "confidence": orch_result.get("intent_confidence", 0.0),
                "context_sources": orch_result.get("context_sources", []),
                "suggestions": orch_result.get("recommended_actions", []),
                "recommendations": orch_result.get("product_recommendations", []),
                "cross_sell": orch_result.get("cross_sell_opportunities", []),
                "bundle": orch_result.get("bundle_suggestion"),
            },
            "agent_trace": {
                "agents_invoked": orch_result.get("agents_invoked", []),
                "execution_time_ms": orch_result.get("execution_time_ms", 0),
                "intent": orch_result.get("intent", ""),
                "quality_score": orch_result.get("quality_score", 0),
            },
        }
    except Exception as e:
        logger.error(f"Agent message processing failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Agent processing failed. Try again.")
