"""
ET Concierge — Intent Classifier
Reads every user message and routes it to the right specialist agent.
This runs FIRST in the LangGraph — before any specialist sees the message.
"""
import os
import logging
import re
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from src.agents.agent_state import ETAgentState
from src.services.gemini_client import get_gemini_api_key, get_gemini_model_name

logger = logging.getLogger(__name__)

CLASSIFIER_PROMPT = """You are an intent classifier for ET (Economic Times) AI Concierge.
Classify the user message into EXACTLY ONE intent keyword. Reply with ONLY the keyword.

Intents:
- SERVICES: what products/services ET offers, what can I do here, what is ET Prime, platform discovery
- IPO: IPO, upcoming listings, listing gains, GMP, applying for IPO, allotment status
- MARKETS: stock prices, Nifty, Sensex, market performance, trending stocks, specific stock query
- MASTERCLASS: courses, learning, masterclass, how to invest, beginner guide, trading course
- PROFILE: my profile, my recommendations, what is best for me, my financial health, my score
- FINANCIAL_SERVICES: credit card, loan, insurance, demat account, mutual funds recommendation
- GENERAL: greetings, thank you, small talk, unclear intent

Examples:
'what services you have' → SERVICES
'what can I do here' → SERVICES
'tell me about ET Prime' → SERVICES
'any open IPO' → IPO
'Nifty today' → MARKETS
'RELIANCE stock price' → MARKETS
'I want to learn trading' → MASTERCLASS
'which course for beginners' → MASTERCLASS
'what do you recommend for me' → PROFILE
'my financial health' → PROFILE
'best credit card' → FINANCIAL_SERVICES
'hi' → GENERAL
'thank you' → GENERAL"""

# Fast keyword pre-classifier to avoid Gemini latency for obvious cases
_KEYWORD_MAP = {
    "SERVICES": ["et prime", "what service", "what product", "what do you offer", "what can i", "what is available", "services", "explore"],
    "IPO": ["ipo", "listing", "gmp", "grey market", "allotment", "apply ipo"],
    "MARKETS": ["nifty", "sensex", "banknifty", "bse", "nse", "stock price", "how is market", "market today", "trending stock", "reliance", "tcs", "infosys", "hdfc"],
    "MASTERCLASS": ["course", "masterclass", "learn", "beginner", "training", "how to invest", "how to trade"],
    "PROFILE": ["my profile", "recommend for me", "what should i", "my recommendation", "financial health", "my score", "best for me"],
    "FINANCIAL_SERVICES": ["credit card", "loan", "demat", "insurance", "mutual fund", "fd ", "fixed deposit"],
}


def _keyword_classify(message: str) -> str | None:
    msg = message.lower()
    for intent, keywords in _KEYWORD_MAP.items():
        if any(k in msg for k in keywords):
            return intent
    return None


def classify_intent(state: ETAgentState) -> ETAgentState:
    """
    LangGraph node: reads the last human message and sets detected_intent in state.
    Tries fast keyword matching first; falls back to Gemini for ambiguous messages.
    """
    messages = state.get("messages", [])
    last_human = ""
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            last_human = msg.content
            break

    if not last_human:
        return {**state, "detected_intent": "GENERAL"}

    # Try keyword classification first (fast, no API call)
    fast_intent = _keyword_classify(last_human)
    if fast_intent:
        logger.info(f"[intent_classifier] keyword → {fast_intent} for: {last_human[:60]}")
        return {**state, "detected_intent": fast_intent}

    # Fall back to Gemini for ambiguous messages
    try:
        llm = ChatGoogleGenerativeAI(
            model=get_gemini_model_name(),
            google_api_key=get_gemini_api_key(),
            temperature=0,
            max_retries=0,
        )
        resp = llm.invoke([
            SystemMessage(content=CLASSIFIER_PROMPT),
            HumanMessage(content=last_human),
        ])
        intent = resp.content.strip().upper()
        # Clean up — extract just the keyword
        for valid in ["SERVICES", "IPO", "MARKETS", "MASTERCLASS", "PROFILE", "FINANCIAL_SERVICES", "GENERAL"]:
            if valid in intent:
                logger.info(f"[intent_classifier] gemini → {valid} for: {last_human[:60]}")
                return {**state, "detected_intent": valid}
    except Exception as e:
        logger.warning(f"Intent classification failed: {e}")

    return {**state, "detected_intent": "GENERAL"}


def route_by_intent(state: ETAgentState) -> str:
    """
    LangGraph conditional edge: returns the name of the next node to run.
    """
    intent = state.get("detected_intent", "GENERAL")
    routing = {
        "SERVICES": "services_agent",
        "IPO": "ipo_agent",
        "MARKETS": "markets_agent",
        "MASTERCLASS": "masterclass_agent",
        "PROFILE": "profile_agent",
        "FINANCIAL_SERVICES": "financial_agent",
        "GENERAL": "general_agent",
    }
    target = routing.get(intent, "general_agent")
    logger.info(f"[router] {intent} → {target}")
    return target
