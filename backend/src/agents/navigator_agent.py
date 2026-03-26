"""
ET AI Concierge - Phase 2
Navigator Agent: RAG-powered product guidance and discovery.
"""
import os
import time
import logging
from typing import List, Optional
import google.generativeai as genai

from src.agents.base_agent import BaseAgent, AgentState
from src.tools.product_matcher import match_products

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    _model = genai.GenerativeModel('gemini-1.5-flash')
else:
    _model = None

USE_RAG = os.getenv("USE_RAG_NAVIGATION", "false").lower() == "true"

SYSTEM_PROMPT = """You are the Navigator Agent for ET AI Concierge.
You are an expert on the Economic Times ecosystem:
- ET Prime: Premium business journalism and analysis (₹1,499/year)
- ET Markets: Real-time market data, portfolio tools (free + premium tiers)
- ET Masterclass: Expert-led financial education courses (₹3,999-₹8,999)
- ET Wealth Summit: Exclusive wealth management events (₹5,000-₹15,000)
- ET Financial Services: Curated financial advisor network

Guide users to the right ET products based on their needs.
Be specific, helpful, and cite information naturally.
If you use retrieved context, cite sources with [Source: ...]."""

RAG_RESPONSE_PROMPT = """Answer this product/finance question using the context and your knowledge.

User Profile: {profile_summary}
User Question: "{question}"

Retrieved Context:
{retrieved_context}

Provide accurate, helpful answer (3-5 sentences). Include:
- Direct answer to the question
- Relevant ET product recommendation if applicable
- 1-2 source citations if context was retrieved

Answer:"""

DIRECT_RESPONSE_PROMPT = """Answer this question about ET products and financial investing.

User Profile: {profile_summary}
User Question: "{question}"
Recent Conversation: {history}

Provide a helpful, accurate answer (3-5 sentences) drawing on your knowledge of:
- ET ecosystem products
- General financial concepts
- User's specific situation based on their profile

Answer:"""


class NavigatorAgent(BaseAgent):
    name = "navigator"

    def process(self, state: AgentState) -> AgentState:
        start_time = time.time()
        try:
            message = state.get("user_message", "")
            profile = state.get("user_profile", {})
            history = state.get("conversation_history", [])
            retrieved_context = state.get("retrieved_context", [])

            profile_summary = self._get_profile_summary(profile)
            history_text = self._format_history(history, last_n=4)

            # Get product recommendations
            primary_segment = profile.get("primary_segment")
            product_matches = match_products(profile, primary_segment=primary_segment, top_n=3)

            # Generate response
            if retrieved_context and USE_RAG:
                response = self._rag_response(message, profile_summary, retrieved_context)
            else:
                response = self._direct_response(message, profile_summary, history_text)

            output = {
                "response": response,
                "product_recommendations": product_matches,
                "context_sources": [doc.get("title", "ET Content") for doc in retrieved_context[:3]],
                "rag_used": bool(retrieved_context and USE_RAG),
            }

            state.setdefault("agent_outputs", {})["navigator"] = output
            self._record_execution(state, start_time, True, output)
            logger.info(f"Navigator done. RAG used: {output['rag_used']}, Recommendations: {len(product_matches)}")
        except Exception as e:
            logger.error(f"NavigatorAgent error: {e}", exc_info=True)
            state.setdefault("agent_outputs", {})["navigator"] = {
                "response": "I can help guide you through ET's ecosystem. What are you most interested in - market data, premium content, or financial education?",
                "product_recommendations": [],
                "context_sources": [],
                "rag_used": False,
            }
            self._record_execution(state, start_time, False, error=str(e))

        return state

    def _rag_response(self, question: str, profile_summary: str, retrieved_context: List[dict]) -> str:
        if not _model:
            return self._fallback_response(question)

        context_text = "\n\n".join([
            f"[Source: {doc.get('title', 'ET Content')}]\n{doc.get('content', '')[:500]}"
            for doc in retrieved_context[:3]
        ])

        prompt = RAG_RESPONSE_PROMPT.format(
            profile_summary=profile_summary,
            question=question,
            retrieved_context=context_text,
        )
        try:
            response = _model.generate_content(f"System: {SYSTEM_PROMPT}\n\n{prompt}")
            return response.text.strip()
        except Exception as e:
            logger.error(f"RAG response generation failed: {e}")
            return self._fallback_response(question)

    def _direct_response(self, question: str, profile_summary: str, history_text: str) -> str:
        if not _model:
            return self._fallback_response(question)

        prompt = DIRECT_RESPONSE_PROMPT.format(
            profile_summary=profile_summary,
            question=question,
            history=history_text,
        )
        try:
            response = _model.generate_content(f"System: {SYSTEM_PROMPT}\n\n{prompt}")
            return response.text.strip()
        except Exception as e:
            logger.error(f"Direct response generation failed: {e}")
            return self._fallback_response(question)

    def _fallback_response(self, question: str) -> str:
        return (
            "ET offers a range of products to suit your investment journey: ET Prime for premium business journalism, "
            "ET Markets for real-time data and tools, and ET Masterclass for expert-led financial education. "
            "Which of these sounds most relevant to your needs?"
        )
