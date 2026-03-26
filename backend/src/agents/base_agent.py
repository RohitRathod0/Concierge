"""
ET AI Concierge - Phase 2
Base Agent abstract class inherited by all specialized agents.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import logging
import time

logger = logging.getLogger(__name__)


class AgentState(dict):
    """
    TypedDict-compatible conversation state passed through the LangGraph.
    All agents read from and write to this shared state object.
    """
    # Required keys (set by orchestrator before any agent runs)
    # user_message: str
    # user_id: str
    # session_id: str
    # user_profile: dict
    # conversation_history: List[dict]  # [{role, content}, ...]
    # current_intent: str
    # intent_confidence: float
    # agent_outputs: Dict[str, Any]     # outputs keyed by agent name
    # retrieved_context: List[dict]     # RAG documents
    # final_response: str
    # metadata: dict                    # routing decisions, timings, etc.
    pass


class BaseAgent(ABC):
    """Abstract base class for all ET AI Concierge agents."""

    name: str = "base_agent"

    def __init__(self):
        self.logger = logging.getLogger(f"agents.{self.name}")

    @abstractmethod
    def process(self, state: AgentState) -> AgentState:
        """
        Main entry point: receives state, performs agent logic, returns updated state.
        Must be implemented by every agent subclass.
        """
        raise NotImplementedError

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        original_process = cls.process

        def wrapped_process(self, state: AgentState) -> AgentState:
            start_time = time.time()
            input_data = {'user_message': state.get('user_message'), 'intent': state.get('current_intent', ''), 'user_id': state.get('user_id')}
            session_id = state.get('session_id')
            try:
                result = original_process(self, state)
                execution_time_ms = int((time.time() - start_time) * 1000)
                output_data = {'response': result.get('final_response'), 'agent_outputs': result.get('agent_outputs', {}).get(self.name)}
                self._log_to_db(session_id, input_data, output_data, execution_time_ms, True, None)
                return result
            except Exception as error:
                execution_time_ms = int((time.time() - start_time) * 1000)
                self._log_to_db(session_id, input_data, None, execution_time_ms, False, str(error))
                raise

        cls.process = wrapped_process

    def _log_to_db(self, session_id, input_data, output_data, execution_time_ms, success, error_message):
        try:
            from src.database.connection import SessionLocal
            from src.database.models import AgentExecution
            from datetime import datetime
            
            db = SessionLocal()
            try:
                exec_log = AgentExecution(
                    session_id=session_id,
                    agent_name=self.name,
                    input_data=input_data or {},
                    output_data=output_data or {},
                    execution_time_ms=execution_time_ms,
                    success=success,
                    error_message=error_message,
                    timestamp=datetime.utcnow()
                )
                db.add(exec_log)
                db.commit()
            except Exception as e:
                self.logger.error(f"Failed to log execution to DB: {e}")
                db.rollback()
            finally:
                db.close()
        except Exception:
            pass

    def get_system_prompt(self) -> str:
        """Return the agent's system prompt. Override in subclasses."""
        return "You are an AI assistant."

    def initialize_tools(self) -> List[Any]:
        """Return a list of tool instances this agent uses. Override in subclasses."""
        return []

    def validate_state(self, state: AgentState) -> bool:
        """Validate that the state has required keys. Returns True if valid."""
        required = ["user_message", "user_id", "session_id", "user_profile",
                    "conversation_history", "current_intent", "agent_outputs"]
        for key in required:
            if key not in state:
                self.logger.warning(f"Missing state key: {key}")
                return False
        return True

    def _record_execution(self, state: AgentState, start_time: float, success: bool,
                          output: Optional[dict] = None, error: Optional[str] = None) -> None:
        """Record this agent's execution into state metadata for logging."""
        duration_ms = int((time.time() - start_time) * 1000)
        state.setdefault("metadata", {}).setdefault("agent_executions", []).append({
            "agent_name": self.name,
            "execution_time_ms": duration_ms,
            "success": success,
            "error": error,
        })
        if output is not None:
            state.setdefault("agent_outputs", {})[self.name] = output

    def _get_profile_summary(self, profile: dict) -> str:
        """Create a compact text summary of the user profile for use in prompts."""
        parts = []
        if profile.get("occupation"):
            parts.append(f"Occupation: {profile['occupation']}")
        if profile.get("investment_experience"):
            parts.append(f"Experience: {profile['investment_experience']}")
        if profile.get("risk_tolerance"):
            parts.append(f"Risk: {profile['risk_tolerance']}")
        if profile.get("primary_segment"):
            parts.append(f"Segment: {profile['primary_segment']}")
        return "; ".join(parts) if parts else "Profile not available"

    def _format_history(self, history: List[dict], last_n: int = 4) -> str:
        """Format last N history items as a readable string for LLM prompts."""
        recent = history[-last_n:] if len(history) > last_n else history
        lines = []
        for msg in recent:
            role = "User" if msg.get("role") == "user" else "Assistant"
            lines.append(f"{role}: {msg.get('content', '')[:200]}")
        return "\n".join(lines) if lines else "No history"
