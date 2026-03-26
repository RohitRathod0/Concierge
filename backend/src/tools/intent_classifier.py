"""
ET AI Concierge - Phase 2
Tool: Intent Classifier
"""
import os
import json
import logging
from typing import Optional
import google.generativeai as genai

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    _model = genai.GenerativeModel('gemini-1.5-flash')
else:
    _model = None

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
    if not _model:
        return {"intent": "general_question", "confidence": 0.5, "reasoning": "LLM unavailable"}

    prompt = CLASSIFICATION_PROMPT.format(
        message=message,
        profile_summary=profile_summary,
        recent_history=recent_history,
        examples=FEW_SHOT_EXAMPLES,
    )

    try:
        response = _model.generate_content(prompt)
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
        return {"intent": "general_question", "confidence": 0.5, "reasoning": "classification_error"}


def needs_clarification(confidence: float, threshold: float = 0.75) -> bool:
    """Returns True if the confidence is below threshold, meaning clarification is needed."""
    return confidence < threshold
