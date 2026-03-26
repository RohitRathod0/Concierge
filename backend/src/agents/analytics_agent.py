"""
ET AI Concierge - Phase 2
Analytics Agent: event logging, performance tracking, conversation quality monitoring.
Rule-based (no LLM) for efficiency.
"""
import time
import logging
from datetime import datetime

from src.agents.base_agent import BaseAgent, AgentState

logger = logging.getLogger(__name__)

# Try importing Prometheus client; graceful fallback if not installed
try:
    from prometheus_client import Counter, Histogram
    _prom_available = True

    agent_invocations = Counter(
        "et_agent_invocations_total",
        "Total agent invocations",
        ["agent_name", "intent"],
    )
    response_latency = Histogram(
        "et_agent_response_seconds",
        "Agent response time in seconds",
        ["agent_name"],
    )
    intent_classification = Counter(
        "et_intent_classifications_total",
        "Intent classification counts",
        ["intent"],
    )
except ImportError:
    _prom_available = False
    logger.warning("prometheus_client not available; metrics export disabled")


class AnalyticsAgent(BaseAgent):
    name = "analytics"

    def process(self, state: AgentState) -> AgentState:
        start_time = time.time()
        try:
            intent = state.get("current_intent", "unknown")
            confidence = state.get("intent_confidence", 0.0)
            agent_outputs = state.get("agent_outputs", {})
            metadata = state.get("metadata", {})

            # Build analytics event
            event = {
                "event_type": "conversation_processed",
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": state.get("user_id"),
                "session_id": state.get("session_id"),
                "intent": intent,
                "intent_confidence": confidence,
                "agents_invoked": list(agent_outputs.keys()),
                "rag_used": any(
                    out.get("rag_used") for out in agent_outputs.values()
                    if isinstance(out, dict)
                ),
                "cross_sell_opportunities": len(
                    agent_outputs.get("cross_sell", {}).get("opportunities", [])
                ),
                "execution_summary": metadata.get("agent_executions", []),
            }

            # Prometheus metrics export
            if _prom_available:
                agent_invocations.labels(agent_name="coordinator", intent=intent).inc()
                intent_classification.labels(intent=intent).inc()

                for exec_record in metadata.get("agent_executions", []):
                    agent_name = exec_record.get("agent_name", "unknown")
                    exec_ms = exec_record.get("execution_time_ms", 0)
                    response_latency.labels(agent_name=agent_name).observe(exec_ms / 1000)

            # Conversation quality signals
            quality = self._assess_quality(state)
            event["quality_signals"] = quality

            state.setdefault("agent_outputs", {})["analytics"] = {
                "event_logged": True,
                "event": event,
                "quality": quality,
            }

            logger.info(f"Analytics captured: intent={intent}, agents={list(agent_outputs.keys())}")
            self._record_execution(state, start_time, True)
        except Exception as e:
            logger.error(f"AnalyticsAgent error: {e}", exc_info=True)
            state.setdefault("agent_outputs", {})["analytics"] = {"event_logged": False}
            self._record_execution(state, start_time, False, error=str(e))

        return state

    def _assess_quality(self, state: AgentState) -> dict:
        """Rule-based conversation quality assessment."""
        final_response = state.get("final_response", "")
        confidence = state.get("intent_confidence", 0.0)
        agent_outputs = state.get("agent_outputs", {})

        has_recommendation = bool(
            agent_outputs.get("navigator", {}).get("product_recommendations")
        )
        has_rag_context = bool(
            agent_outputs.get("navigator", {}).get("rag_used")
        )
        response_length = len(final_response)

        quality_score = 0.0
        if confidence >= 0.8:
            quality_score += 0.3
        if has_recommendation:
            quality_score += 0.3
        if has_rag_context:
            quality_score += 0.2
        if 100 <= response_length <= 1000:
            quality_score += 0.2

        return {
            "quality_score": round(quality_score, 2),
            "high_confidence_intent": confidence >= 0.8,
            "has_recommendation": has_recommendation,
            "has_rag_context": has_rag_context,
            "response_length": response_length,
        }
