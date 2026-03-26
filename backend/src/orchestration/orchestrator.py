"""
ET AI Concierge - Phase 2
AgentOrchestrator: main entry point for multi-agent message processing.
"""
import asyncio
import time
import uuid
import logging
import os
from typing import Optional

from src.agents.base_agent import AgentState
from src.agents.coordinator_agent import CoordinatorAgent
from src.agents.profiling_agent import ProfilingAgent
from src.agents.navigator_agent import NavigatorAgent
from src.agents.cross_sell_agent import CrossSellAgent
from src.agents.analytics_agent import AnalyticsAgent

logger = logging.getLogger(__name__)

TIMEOUT_SECONDS = 30


class AgentOrchestrator:
    """
    Orchestrates the multi-agent conversation pipeline.
    Falls back to a simple linear agent chain if LangGraph is unavailable.
    """

    def __init__(self):
        self.coordinator = CoordinatorAgent()
        self.profiling = ProfilingAgent()
        self.navigator = NavigatorAgent()
        self.cross_sell = CrossSellAgent()
        self.analytics = AnalyticsAgent()

        # Try to use compiled LangGraph
        try:
            from src.orchestration.agent_graph import COMPILED_GRAPH
            self.graph = COMPILED_GRAPH
        except Exception:
            self.graph = None

        if self.graph:
            logger.info("AgentOrchestrator: LangGraph mode")
        else:
            logger.warning("AgentOrchestrator: fallback linear chain mode (LangGraph unavailable)")

    def process_message(
        self,
        user_id: str,
        session_id: str,
        message: str,
        user_profile: Optional[dict] = None,
        conversation_history: Optional[list] = None,
    ) -> dict:
        """
        Main entry point. Runs the agent pipeline synchronously.

        Returns:
            {
                "response": str,
                "agent_used": str,
                "intent": str,
                "intent_confidence": float,
                "product_recommendations": list,
                "context_sources": list,
                "quality_score": float,
                "agents_invoked": list,
                "execution_time_ms": int,
            }
        """
        start_time = time.time()

        initial_state: AgentState = {
            "user_message": message,
            "user_id": str(user_id),
            "session_id": str(session_id),
            "user_profile": user_profile or {},
            "conversation_history": conversation_history or [],
            "current_intent": "general_question",
            "intent_confidence": 0.0,
            "agent_outputs": {},
            "retrieved_context": [],
            "final_response": "",
            "metadata": {},
        }

        try:
            if self.graph:
                final_state = self._run_graph(initial_state)
            else:
                final_state = self._run_linear_chain(initial_state)
        except Exception as e:
            logger.error(f"Orchestration failed: {e}", exc_info=True)
            final_state = initial_state
            final_state["final_response"] = (
                "I'm your ET AI Concierge! I had a brief issue but I'm here to help. "
                "What would you like to know about investing or ET's products?"
            )

        elapsed_ms = int((time.time() - start_time) * 1000)
        
        try:
            from src.analytics.event_tracker import event_tracker
            agents_used = list(final_state.get('agent_outputs', {}).keys())
            event_tracker.track(str(user_id), 'agent_orchestration_completed', 
                {'agents_used': agents_used, 'total_duration_ms': elapsed_ms},
                session_id=str(session_id))
            logger.info(f'Graph execution completed in {elapsed_ms}ms, agents invoked: {agents_used}')
        except Exception as e:
            logger.error(f"Failed to track orchestration event: {e}")
            
        return self._build_response(final_state, elapsed_ms)

    def _run_graph(self, state: AgentState) -> AgentState:
        """Run through the LangGraph compiled graph."""
        result = self.graph.invoke(state)
        return result

    def _run_linear_chain(self, state: AgentState) -> AgentState:
        """
        Fallback linear chain (no LangGraph):
        coordinator_classify → specialist → coordinator_synthesize → analytics
        """
        # Pass 1: classify
        state = self.coordinator.process(state)

        # If coordinator already has a response (clarification case), skip specialists
        if state.get("final_response"):
            state = self.analytics.process(state)
            return state

        # Route to specialist based on intent
        intent = state.get("current_intent", "general_question")
        if intent == "profiling_needed":
            state = self.profiling.process(state)
        elif intent == "cross_sell_opportunity":
            state = self.cross_sell.process(state)
        else:
            state = self.navigator.process(state)

        # Cross-sell always runs in parallel (simplified: sequential here)
        cross_sell_state = dict(state)
        cross_sell_state = self.cross_sell.process(cross_sell_state)
        # Merge cross-sell output only
        state["agent_outputs"]["cross_sell"] = cross_sell_state["agent_outputs"].get("cross_sell", {})

        # Pass 2: synthesize
        state["final_response"] = ""
        state = self.coordinator.process(state)

        # Analytics last
        state = self.analytics.process(state)
        return state

    def _build_response(self, state: AgentState, elapsed_ms: int) -> dict:
        """Transform final state into clean API response dict."""
        agent_outputs = state.get("agent_outputs", {})
        nav_output = agent_outputs.get("navigator", {})
        cs_output = agent_outputs.get("cross_sell", {})
        analytics_output = agent_outputs.get("analytics", {})

        # Determine which agent was primary
        intent = state.get("current_intent", "general_question")
        agent_map = {
            "profiling_needed": "profiling",
            "product_inquiry": "navigator",
            "general_question": "navigator",
            "cross_sell_opportunity": "cross_sell",
            "feedback": "coordinator",
        }
        primary_agent = agent_map.get(intent, "coordinator")

        return {
            "response": state.get("final_response", "How can I help you?"),
            "agent_used": primary_agent,
            "intent": intent,
            "intent_confidence": state.get("intent_confidence", 0.0),
            "product_recommendations": nav_output.get("product_recommendations", []),
            "context_sources": nav_output.get("context_sources", []),
            "cross_sell_opportunities": cs_output.get("opportunities", []),
            "bundle_suggestion": cs_output.get("bundle"),
            "quality_score": analytics_output.get("quality", {}).get("quality_score", 0.0),
            "agents_invoked": list(agent_outputs.keys()),
            "execution_time_ms": elapsed_ms,
            "updated_profile": state.get("user_profile", {}),
        }


# Singleton orchestrator
_orchestrator_instance: Optional[AgentOrchestrator] = None


def get_orchestrator() -> AgentOrchestrator:
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = AgentOrchestrator()
    return _orchestrator_instance
