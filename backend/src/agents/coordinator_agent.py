"""
ET AI Concierge - Phase 2
Coordinator Agent: intent classification, routing, response synthesis.
"""
import os
import json
import time
import logging
from typing import Optional
import google.generativeai as genai

from src.agents.base_agent import BaseAgent, AgentState
from src.tools.intent_classifier import classify_intent

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    _model = genai.GenerativeModel('gemini-1.5-flash')
else:
    _model = None

SYSTEM_PROMPT = """You are ET Advisor — India's smartest AI financial guide, powered by The Economic Times. You're like a knowledgeable friend who happens to know everything about finance, markets, and investing.

Your job has TWO parts:
1. Genuinely help users with their financial questions
2. Naturally introduce ET products when they solve the user's problem. You never hard-sell. You plant seeds, give value first, then make the offer.

Personality: Warm, confident, specific. Never vague. Always give a real recommendation, not 'it depends'. If user asks about stocks, name a sector. If they ask about learning, name a specific course.

Selling Rules:
- Never mention a product in the first message — build trust first
- After 2 exchanges, you can mention ONE ET product if it genuinely solves what they asked
- Always frame as: 'By the way, ET Prime covers exactly this — want me to show you?'
- If user shows interest in IPO -> mention Demat account need
- If user asks about a topic that has a masterclass -> 'Actually, we have a masterclass on this'
- If user has been talking for 5+ exchanges without converting -> offer free trial"""

SYNTHESIS_PROMPT = """Synthesize a final response for the user.

User Message: "{message}"

Agent Insights:
{agent_outputs}

User Profile: {profile_summary}

Cross-Sell Priority: {cross_sell_priority}
If there is a high-priority cross-sell product listed above, naturally weave a mention of it into your response.
Never hard-sell or interrupt the conversation flow. Instead, say something like: 'By the way, since you're interested in X, our Y covers exactly this.'

Create a coherent, natural response (2-4 sentences) that:
- Directly answers the user's question
- Incorporates relevant insights from agents
- Suggests next steps or ET products naturally
- Maintains warm, professional tone

Response:"""

CLARIFICATION_PROMPT = """The user asked: "{message}"

I need a confidence score > 0.75 to route accurately. 
Generate ONE short clarifying question to better understand their intent.
Examples: "Are you asking about investing or about ET Prime subscription features?"
Keep it brief and conversational.

Clarifying question:"""


class CoordinatorAgent(BaseAgent):
    name = "coordinator"

    def process(self, state: AgentState) -> AgentState:
        start_time = time.time()
        try:
            message = state.get("user_message", "")
            profile = state.get("user_profile", {})
            history = state.get("conversation_history", [])

            profile_summary = self._get_profile_summary(profile)
            history_text = self._format_history(history, last_n=4)

            # Classify intent
            classification = classify_intent(
                message=message,
                profile_summary=profile_summary,
                recent_history=history_text,
            )
            state["current_intent"] = classification["intent"]
            state["intent_confidence"] = classification["confidence"]
            state.setdefault("metadata", {})["intent_reasoning"] = classification.get("reasoning", "")

            logger.info(f"Intent: {classification['intent']} ({classification['confidence']:.2f})")

            # If very low confidence, ask for clarification
            if classification["confidence"] < 0.55:
                clarification = self._generate_clarification(message)
                state["final_response"] = clarification
                state["metadata"]["routing_decision"] = "clarification_needed"
                self._record_execution(state, start_time, True, {"clarification": clarification})
                return state

            state["metadata"]["routing_decision"] = classification["intent"]

            # Synthesis happens after specialized agents run (in orchestrator)
            # This first pass sets up routing; synthesis runs after agent_outputs are populated
            if not state["agent_outputs"]:
                # First pass: no agent outputs yet, set empty final_response as placeholder
                state["final_response"] = ""
            else:
                # Second pass: synthesize from agent outputs
                state["final_response"] = self._synthesize_response(state)

            self._record_execution(state, start_time, True, {"intent": state["current_intent"]})
        except Exception as e:
            logger.error(f"CoordinatorAgent error: {e}", exc_info=True)
            state["final_response"] = "I'm here to help! Could you tell me more about what you're looking for?"
            self._record_execution(state, start_time, False, error=str(e))

        return state

    def _generate_clarification(self, message: str) -> str:
        if not _model:
            return "Could you clarify what you're looking for?"
        try:
            response = _model.generate_content(CLARIFICATION_PROMPT.format(message=message))
            return response.text.strip()
        except Exception:
            return "Could you tell me a bit more about what you're looking for?"

    def _get_profile_summary(self, profile: dict) -> str:
        if not profile:
            return "No profile available."
        
        persona = profile.get("financial_persona", "CURIOUS_BEGINNER")
        knowledge_level = profile.get("knowledge_level", "beginner")
        primary_goal = profile.get("primary_goal", "Not specified")
        risk_appetite = profile.get("risk_appetite", "moderate")
        interests = profile.get("interested_products", [])
        
        return f"""USER PROFILE CONTEXT:
- Persona: {persona}
- Knowledge level: {knowledge_level}
- Primary goal: {primary_goal}
- Interests: {interests}
- Risk appetite: {risk_appetite}

GUIDELINES:
- Match complexity to knowledge_level ({knowledge_level})
- If knowledge_level=beginner: explain terms, use simple analogies, never assume prior knowledge
- If primary_goal=GROW_WEALTH: frame everything as wealth building opportunity
- If persona=ACTIVE_TRADER: Use technical terms (RSI, MACD). Be peer-level.
- If persona=PASSIVE_INVESTOR: Focus on safety. Give cautious advice.
- If persona=SME_OWNER: Connect concepts to business impact.
- If persona=WEALTH_MANAGER: Talk about portfolio allocation, tax harvesting."""

    def _synthesize_response(self, state: AgentState) -> str:
        if not _model:
            # Fallback: return first agent's text output
            for agent_key, agent_out in state.get("agent_outputs", {}).items():
                if isinstance(agent_out, dict) and agent_out.get("response"):
                    return agent_out["response"]
            return "Here's what I found for you."

        agent_outputs_text = ""
        for agent_name, output in state.get("agent_outputs", {}).items():
            if isinstance(output, dict) and output.get("response"):
                agent_outputs_text += f"\n[{agent_name}]: {output['response']}"

        if not agent_outputs_text.strip():
            return "Is there anything specific about ET's products or services I can help you with?"

        prompt = SYNTHESIS_PROMPT.format(
            message=state.get("user_message", ""),
            agent_outputs=agent_outputs_text,
            profile_summary=self._get_profile_summary(state.get("user_profile", {})),
            cross_sell_priority=state.get("cross_sell_priority", "None at this time"),
        )
        try:
            response = _model.generate_content(f"System: {SYSTEM_PROMPT}\n\n{prompt}")
            return response.text.strip()
        except Exception as e:
            logger.error(f"Response synthesis failed: {e}")
            # Return the first available agent response
            for _, output in state.get("agent_outputs", {}).items():
                if isinstance(output, dict) and output.get("response"):
                    return output["response"]
            return "I found some relevant information for you. How can I assist further?"
