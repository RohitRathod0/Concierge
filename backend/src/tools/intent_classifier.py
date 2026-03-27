"""
ET AI Concierge - Phase 2
Tool: Intent Classifier
"""
import os
import json
import logging
from typing import Optional

from src.services.gemini_client import get_gemini_model

logger = logging.getLogger(__name__)

VALID_INTENTS = [
    "profiling_needed",
    "product_inquiry",
    "general_question",
    "cross_sell_opportunity",
    "feedback",
]

FEW_SHOT_EXAMPLES = """
Examples:
- "I'm a software engineer new to investing" → {"intent": "profiling_needed", "confidence": 0.95}
- "What is ET Prime?" → {"intent": "product_inquiry", "confidence": 0.92}
- "Tell me about mutual funds" → {"intent": "general_question", "confidence": 0.85}
- "Can I get ET Prime alongside ET Markets?" → {"intent": "cross_sell_opportunity", "confidence": 0.88}
- "The app is slow today" → {"intent": "feedback", "confidence": 0.91}
"""

CLASSIFICATION_PROMPT = """Classify the user message intent.

User Message: "{message}"
User Profile Summary: {profile_summary}
Recent History (last 2 exchanges): {recent_history}

Intents:
1. profiling_needed - User shares/updates personal/financial info
2. product_inquiry - User asks about a specific ET product/service  
3. general_question - General finance/investing question
4. cross_sell_opportunity - User expresses interest in multiple products
5. feedback - Complaint, praise, or app feedback

{examples}

Respond ONLY with valid JSON: {{"intent": "...", "confidence": 0.0-1.0, "reasoning": "..."}}"""


def classify_intent(
    message: str,
    profile_summary: str = "Unknown",
    recent_history: str = "None",
) -> dict:
    """
    Classify user message intent using Gemini LLM.

    Returns:
        dict with keys: intent, confidence, reasoning
    """
    heuristic = _heuristic_classification(message)
    if heuristic:
        return heuristic

    model = get_gemini_model()
    if not model:
        return {"intent": "general_question", "confidence": 0.8, "reasoning": "heuristic fallback without LLM"}

    prompt = CLASSIFICATION_PROMPT.format(
        message=message,
        profile_summary=profile_summary,
        recent_history=recent_history,
        examples=FEW_SHOT_EXAMPLES,
    )

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        result = json.loads(text)
        intent = result.get("intent", "general_question")
        confidence = float(result.get("confidence", 0.7))
        if intent not in VALID_INTENTS:
            intent = "general_question"
        return {"intent": intent, "confidence": confidence, "reasoning": result.get("reasoning", "")}
    except Exception as e:
        logger.error(f"Intent classification failed: {e}")
        return {"intent": "general_question", "confidence": 0.8, "reasoning": "classification_error_fallback"}


def _heuristic_classification(message: str) -> Optional[dict]:
    message_lower = (message or "").lower()

    if not message_lower.strip():
        return {"intent": "general_question", "confidence": 0.8, "reasoning": "empty_message"}

    product_terms = [
        "et prime", "et markets", "masterclass", "course", "subscription",
        "wealth summit", "financial services", "portfolio", "watchlist",
    ]
    finance_terms = [
        "sip", "mutual fund", "mutual funds", "stock", "stocks", "ipo",
        "tax", "invest", "investing", "market", "nifty", "sensex", "elss",
    ]
    feedback_terms = ["bug", "error", "slow", "not working", "broken", "issue", "problem", "crash"]
    profiling_terms = [
        "my profile", "according to my profile", "i am ", "i'm ", "my age",
        "my income", "salary", "risk tolerance", "beginner", "experienced",
    ]

    product_hits = sum(term in message_lower for term in product_terms)
    finance_hits = sum(term in message_lower for term in finance_terms)

    if any(term in message_lower for term in feedback_terms):
        return {"intent": "feedback", "confidence": 0.92, "reasoning": "feedback keywords detected"}

    if (" and " in message_lower or "alongside" in message_lower or "bundle" in message_lower) and product_hits >= 2:
        return {"intent": "cross_sell_opportunity", "confidence": 0.9, "reasoning": "multiple product references detected"}

    if product_hits >= 1 or ("et" in message_lower and ("best course" in message_lower or "course" in message_lower)):
        return {"intent": "product_inquiry", "confidence": 0.9, "reasoning": "product-related keywords detected"}

    if any(term in message_lower for term in profiling_terms) and finance_hits == 0:
        return {"intent": "profiling_needed", "confidence": 0.82, "reasoning": "profile-sharing keywords detected"}

    if finance_hits >= 1:
        return {"intent": "general_question", "confidence": 0.88, "reasoning": "finance question keywords detected"}

    return None


def needs_clarification(confidence: float, threshold: float = 0.75) -> bool:
    """Returns True if the confidence is below threshold, meaning clarification is needed."""
    return confidence < threshold
