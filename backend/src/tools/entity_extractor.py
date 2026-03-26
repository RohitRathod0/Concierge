"""
ET AI Concierge - Phase 2
Tool: Entity Extractor
Extracts user profile entities from conversation text using LLM + heuristics.
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

EXTRACTION_PROMPT = """Extract user profile information from this conversation.

Conversation:
{conversation}

Extract ONLY information explicitly stated or clearly implied. Return JSON:
{{
  "age_group": "18-25|26-30|31-35|36-40|41-50|50+|null",
  "occupation": "string or null",
  "industry": "string or null",
  "income_level": "low|mid|high|very_high|null",
  "investment_experience": "beginner|intermediate|advanced|null",
  "risk_tolerance": "conservative|moderate|aggressive|null",
  "portfolio_size_range": "under_1L|1L-10L|10L-50L|50L+|null",
  "financial_goals": ["array", "of", "goals"],
  "interests": ["array", "of", "interests"],
  "confidence_scores": {{
    "age_group": 0.0,
    "occupation": 0.0,
    "income_level": 0.0,
    "investment_experience": 0.0,
    "risk_tolerance": 0.0
  }}
}}

Rules:
- Only include fields with confidence > 0.6
- financial_goals options: wealth_building, retirement_planning, education_planning, tax_saving, emergency_fund, passive_income
- interests options: equity, mutual_funds, etf, real_estate, crypto, fixed_income, derivatives, commodities
- Set fields to null if not extractable
"""


def extract_entities(conversation_text: str) -> dict:
    """
    Extract profile entities from a conversation string.

    Returns a dict with extracted entity fields and confidence_scores.
    Fields with confidence < 0.6 will be null.
    """
    if not _model:
        return _empty_extraction()

    prompt = EXTRACTION_PROMPT.format(conversation=conversation_text)

    try:
        response = _model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        result = json.loads(text)
        # Validate enums
        result = _validate_extraction(result)
        return result
    except Exception as e:
        logger.error(f"Entity extraction failed: {e}")
        return _empty_extraction()


def _validate_extraction(result: dict) -> dict:
    valid_age_groups = {"18-25", "26-30", "31-35", "36-40", "41-50", "50+"}
    valid_income = {"low", "mid", "high", "very_high"}
    valid_experience = {"beginner", "intermediate", "advanced"}
    valid_risk = {"conservative", "moderate", "aggressive"}
    valid_portfolio = {"under_1L", "1L-10L", "10L-50L", "50L+"}

    if result.get("age_group") not in valid_age_groups:
        result["age_group"] = None
    if result.get("income_level") not in valid_income:
        result["income_level"] = None
    if result.get("investment_experience") not in valid_experience:
        result["investment_experience"] = None
    if result.get("risk_tolerance") not in valid_risk:
        result["risk_tolerance"] = None
    if result.get("portfolio_size_range") not in valid_portfolio:
        result["portfolio_size_range"] = None
    if not isinstance(result.get("financial_goals"), list):
        result["financial_goals"] = []
    if not isinstance(result.get("interests"), list):
        result["interests"] = []
    return result


def _empty_extraction() -> dict:
    return {
        "age_group": None,
        "occupation": None,
        "industry": None,
        "income_level": None,
        "investment_experience": None,
        "risk_tolerance": None,
        "portfolio_size_range": None,
        "financial_goals": [],
        "interests": [],
        "confidence_scores": {},
    }


def merge_extractions(existing: dict, new_extraction: dict) -> dict:
    """
    Merge new extraction into existing profile data.
    Only overwrite with higher-confidence values.
    """
    merged = {**existing}
    new_scores = new_extraction.get("confidence_scores", {})
    existing_scores = existing.get("confidence_scores", {})

    for field in ["age_group", "occupation", "industry", "income_level",
                  "investment_experience", "risk_tolerance", "portfolio_size_range"]:
        new_val = new_extraction.get(field)
        new_conf = new_scores.get(field, 0.0)
        old_conf = existing_scores.get(field, 0.0)
        if new_val is not None and new_conf >= old_conf:
            merged[field] = new_val
            merged.setdefault("confidence_scores", {})[field] = new_conf

    # Merge lists
    for list_field in ["financial_goals", "interests"]:
        existing_list = existing.get(list_field) or []
        new_list = new_extraction.get(list_field) or []
        merged[list_field] = list(set(existing_list + new_list))

    return merged
