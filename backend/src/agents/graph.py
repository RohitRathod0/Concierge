"""
ET Concierge — Main LangGraph
Flow: START → classify_intent → route_by_intent (conditional) → specialist_agent → END
Each specialist agent uses ReAct loop with real DB tools.
"""
import logging
from langgraph.graph import StateGraph, START, END
from src.agents.agent_state import ETAgentState
from src.agents.intent_classifier import classify_intent, route_by_intent
from src.agents.specialist_agents import (
    services_agent,
    ipo_agent,
    markets_agent,
    masterclass_agent,
    profile_agent,
    financial_agent,
    general_agent,
)

logger = logging.getLogger(__name__)

_AGENT_NODES = [
    "services_agent",
    "ipo_agent",
    "markets_agent",
    "masterclass_agent",
    "profile_agent",
    "financial_agent",
    "general_agent",
]


def build_et_graph():
    """
    Compiles the ET Concierge LangGraph.

    Topology:
        START
          ↓
        classify_intent   ← reads last human message, sets detected_intent
          ↓ (conditional edge: route_by_intent)
        services_agent | ipo_agent | markets_agent | masterclass_agent
        profile_agent  | financial_agent           | general_agent
          ↓ (each agent ends independently)
        END
    """
    graph = StateGraph(ETAgentState)

    # ── Nodes ─────────────────────────────────────────────────────────────────
    graph.add_node("classify_intent", classify_intent)
    graph.add_node("services_agent", services_agent)
    graph.add_node("ipo_agent", ipo_agent)
    graph.add_node("markets_agent", markets_agent)
    graph.add_node("masterclass_agent", masterclass_agent)
    graph.add_node("profile_agent", profile_agent)
    graph.add_node("financial_agent", financial_agent)
    graph.add_node("general_agent", general_agent)

    # ── Edges ─────────────────────────────────────────────────────────────────
    graph.add_edge(START, "classify_intent")

    graph.add_conditional_edges(
        "classify_intent",
        route_by_intent,
        {
            "services_agent": "services_agent",
            "ipo_agent": "ipo_agent",
            "markets_agent": "markets_agent",
            "masterclass_agent": "masterclass_agent",
            "profile_agent": "profile_agent",
            "financial_agent": "financial_agent",
            "general_agent": "general_agent",
        },
    )

    for node in _AGENT_NODES:
        graph.add_edge(node, END)

    compiled = graph.compile()
    logger.info("[et_graph] LangGraph compiled successfully — 7 specialist agents ready")
    return compiled


# Singleton — import this in API routes
try:
    et_graph = build_et_graph()
except Exception as e:
    logger.error(f"[et_graph] Failed to build graph: {e}", exc_info=True)
    et_graph = None
