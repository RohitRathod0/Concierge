"""
ET AI Concierge - Phase 2
LangGraph State Machine Definition
"""
from typing import TypedDict, List, Optional, Any, Dict

try:
    from langgraph.graph import StateGraph, END
    _langgraph_available = True
except ImportError:
    _langgraph_available = False

from src.agents.base_agent import AgentState
from src.agents.coordinator_agent import CoordinatorAgent
from src.agents.profiling_agent import ProfilingAgent
from src.agents.navigator_agent import NavigatorAgent
from src.agents.cross_sell_agent import CrossSellAgent
from src.agents.analytics_agent import AnalyticsAgent


# Intent → agent routing map
INTENT_TO_AGENT = {
    "profiling_needed": "profiling",
    "product_inquiry": "navigator",
    "general_question": "navigator",
    "cross_sell_opportunity": "cross_sell",
    "feedback": "coordinator",  # Handle feedback directly in coordinator
}


def route_after_coordinator(state: AgentState) -> str:
    """
    Conditional edge: decides which specialized agent runs after the coordinator.
    Returns the agent node name or 'analytics' to skip straight to logging.
    """
    routing = state.get("metadata", {}).get("routing_decision", "general_question")

    # If coordinator already set a final response (e.g. clarification), skip agents
    if state.get("final_response"):
        return "analytics"

    agent = INTENT_TO_AGENT.get(routing, "navigator")
    return agent


def route_after_specialist(state: AgentState) -> str:
    """After any specialist agent, always return to coordinator for synthesis."""
    return "coordinator_synthesize"


def build_graph() -> Any:
    """
    Build and compile the LangGraph state machine.
    Falls back to None if LangGraph is not installed.
    """
    if not _langgraph_available:
        return None

    coordinator = CoordinatorAgent()
    profiling = ProfilingAgent()
    navigator = NavigatorAgent()
    cross_sell = CrossSellAgent()
    analytics = AnalyticsAgent()

    # We use two coordinator passes:
    # 1. coordinator_classify: classifies intent and decides routing
    # 2. coordinator_synthesize: synthesizes final response from agent outputs

    def coordinator_classify(state: AgentState) -> AgentState:
        """First coordinator pass: classification and routing."""
        return coordinator.process(state)

    def coordinator_synthesize(state: AgentState) -> AgentState:
        """Second coordinator pass: response synthesis after specialists ran."""
        # Force re-synthesis by clearing final_response from routing decision
        state["final_response"] = ""
        result = coordinator.process(state)
        return result

    graph = StateGraph(dict)

    graph.add_node("coordinator_classify", coordinator_classify)
    graph.add_node("coordinator_synthesize", coordinator_synthesize)
    graph.add_node("profiling", profiling.process)
    graph.add_node("navigator", navigator.process)
    graph.add_node("cross_sell", cross_sell.process)
    graph.add_node("analytics", analytics.process)

    # Entry point
    graph.set_entry_point("coordinator_classify")

    # After classify: route to specialist or analytics
    graph.add_conditional_edges(
        "coordinator_classify",
        route_after_coordinator,
        {
            "profiling": "profiling",
            "navigator": "navigator",
            "cross_sell": "cross_sell",
            "analytics": "analytics",
        }
    )

    # Specialists → synthesize
    graph.add_edge("profiling", "coordinator_synthesize")
    graph.add_edge("navigator", "coordinator_synthesize")
    graph.add_edge("cross_sell", "coordinator_synthesize")

    # Synthesize → analytics → end
    graph.add_edge("coordinator_synthesize", "analytics")
    graph.add_edge("analytics", END)

    return graph.compile()


# Singleton compiled graph (import once)
COMPILED_GRAPH = build_graph()
