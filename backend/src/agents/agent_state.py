"""
ETAgentState — the shared state that flows through every node in the LangGraph.
Every agent reads from this state and returns an updated copy.
"""
from typing import TypedDict, Annotated, Optional, List, Any
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class ETAgentState(TypedDict):
    # Core conversation (LangGraph handles message accumulation via add_messages)
    messages: Annotated[List[BaseMessage], add_messages]

    # User context — populated from DB at the start of every request
    user_id: Optional[str]
    user_name: Optional[str]
    user_persona: Optional[str]           # CURIOUS_BEGINNER, ACTIVE_TRADER, etc.
    user_knowledge_level: Optional[str]   # beginner, intermediate, advanced
    user_interests: Optional[List[str]]   # ['stocks', 'ipo', 'mutual_funds']
    user_risk_appetite: Optional[str]     # conservative, moderate, aggressive
    investment_experience: Optional[str]  # beginner, intermediate, advanced
    age_group: Optional[str]
    occupation: Optional[str]
    income_level: Optional[str]
    financial_goals: Optional[List[str]]
    life_stage: Optional[str]
    has_et_prime: Optional[bool]
    has_demat_account: Optional[bool]

    # Routing
    detected_intent: Optional[str]        # SERVICES, IPO, MARKETS, MASTERCLASS, PROFILE, etc.
    current_page: Optional[str]           # /ipo, /markets, /portfolio, etc.
    article_context: Optional[str]        # article title user is reading

    # Agent working memory
    tool_results: Optional[Any]
    product_to_recommend: Optional[str]
    response_ready: Optional[bool]
    execution_trace: Optional[dict]
