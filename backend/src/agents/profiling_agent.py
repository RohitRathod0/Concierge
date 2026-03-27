"""
ET AI Concierge - Phase 2
Profiling Agent: entity extraction, segmentation, profile enrichment.
"""
import os
import time
import json
import logging
from typing import Optional

from src.agents.base_agent import BaseAgent, AgentState
from src.tools.entity_extractor import extract_entities, merge_extractions
from src.tools.segment_classifier import classify_segment
from src.services.gemini_client import get_gemini_model

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Profiling Agent for ET AI Concierge.
Your role is to understand users deeply through natural conversation.
Extract demographic and financial information without being interrogative.
Ask ONE natural follow-up question at a time when key information is missing.
Always be warm, empathetic, and avoid making users feel like they're filling out a form."""

QUESTION_PROMPT = """Based on the current user profile, generate the next profiling question.

Current Profile:
{current_profile}

Recent Conversation:
{conversation}

Missing key fields: {missing_fields}

Generate ONE natural, conversational question that would help fill the most important missing field.
The question must feel like a natural continuation of the conversation.
Ask about: {priority_field}

Question:"""

LIFE_STAGE_TRANSITIONS = {
    "career_change": ["changing job", "new role", "switching career", "industry change"],
    "marriage": ["getting married", "joint account", "spouse", "wedding"],
    "parenthood": ["child", "baby", "education planning", "school fees"],
    "retirement_planning": ["retire", "pension", "60 years", "post-retirement"],
    "business_start": ["starting business", "startup", "founding", "my own company"],
}


class ProfilingAgent(BaseAgent):
    name = "profiling"

    def process(self, state: AgentState) -> AgentState:
        start_time = time.time()
        try:
            message = state.get("user_message", "")
            profile = state.get("user_profile", {})
            history = state.get("conversation_history", [])

            # Build conversation text for extraction
            conv_text = self._format_history(history, last_n=6) + f"\nUser: {message}"

            # Extract entities from conversation
            extraction = extract_entities(conv_text)
            
            # Merge into existing profile
            updated_profile = merge_extractions(profile, extraction)

            # Reclassify segment
            segment_result = classify_segment(updated_profile)
            updated_profile["primary_segment"] = segment_result["primary_segment"]
            updated_profile["segment_confidence"] = segment_result["confidence"]
            updated_profile["sub_segments_scores"] = segment_result["sub_segments"]

            # Detect life stage signals
            life_stage = self._detect_life_stage(message, history)
            if life_stage:
                updated_profile["life_stage"] = life_stage

            # Generate a profiling question or acknowledgement response
            response = self._generate_response(updated_profile, message, history)

            # Update state
            state["user_profile"] = updated_profile
            state.setdefault("agent_outputs", {})["profiling"] = {
                "response": response,
                "extracted_entities": extraction,
                "segment": segment_result,
                "life_stage": life_stage,
                "profile_updated": True,
            }

            self._record_execution(state, start_time, True, state["agent_outputs"]["profiling"])
            logger.info(f"Profiling done. Segment: {segment_result['primary_segment']} ({segment_result['confidence']})")
        except Exception as e:
            logger.error(f"ProfilingAgent error: {e}", exc_info=True)
            state.setdefault("agent_outputs", {})["profiling"] = {
                "response": "Tell me more about your financial goals and I can personalize your experience.",
                "profile_updated": False,
            }
            self._record_execution(state, start_time, False, error=str(e))

        return state

    def _detect_life_stage(self, message: str, history: list) -> Optional[str]:
        message_lower = message.lower()
        for stage, signals in LIFE_STAGE_TRANSITIONS.items():
            if any(sig in message_lower for sig in signals):
                return stage
        return None

    def _get_missing_fields(self, profile: dict) -> list:
        key_fields = ["age_group", "occupation", "investment_experience", "risk_tolerance",
                      "income_level", "financial_goals", "interests"]
        return [f for f in key_fields if not profile.get(f)]

    def _generate_response(self, profile: dict, message: str, history: list) -> str:
        missing = self._get_missing_fields(profile)
        
        if not missing:
            return "Thanks for sharing! I have a good picture of what you're looking for."

        model = get_gemini_model()
        if not model:
            priority = missing[0].replace("_", " ")
            return f"To personalize your experience better, could you tell me about your {priority}?"

        priority_field = missing[0]
        prompt = QUESTION_PROMPT.format(
            current_profile=json.dumps({k: v for k, v in profile.items() if v and k != "confidence_scores"}, indent=2),
            conversation=self._format_history(history, last_n=4) + f"\nUser: {message}",
            missing_fields=", ".join(missing[:3]),
            priority_field=priority_field.replace("_", " "),
        )

        try:
            response = model.generate_content(f"System: {SYSTEM_PROMPT}\n\n{prompt}")
            return response.text.strip()
        except Exception as e:
            logger.error(f"Question generation failed: {e}")
            return f"Could you tell me more about your {priority_field.replace('_', ' ')}?"
