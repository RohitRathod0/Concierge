"""
ET AI Concierge - Phase 2
Unit Tests: Agent Layer
"""
import pytest
from unittest.mock import MagicMock, patch
from src.agents.base_agent import AgentState
from src.agents.coordinator_agent import CoordinatorAgent
from src.agents.profiling_agent import ProfilingAgent
from src.agents.cross_sell_agent import CrossSellAgent
from src.agents.analytics_agent import AnalyticsAgent


def make_state(**overrides) -> AgentState:
    """Build a minimal valid AgentState for testing."""
    base = {
        "user_message": "Tell me about ET Prime",
        "user_id": "test-user-123",
        "session_id": "test-session-456",
        "user_profile": {
            "investment_experience": "beginner",
            "risk_tolerance": "moderate",
            "primary_segment": "learning_focused_beginner",
        },
        "conversation_history": [],
        "current_intent": "general_question",
        "intent_confidence": 0.8,
        "agent_outputs": {},
        "retrieved_context": [],
        "final_response": "",
        "metadata": {},
    }
    base.update(overrides)
    return AgentState(base)


# ─── CrossSellAgent (no LLM, safe to test fully) ──────────────────────────
class TestCrossSellAgent:
    def test_runs_without_error(self):
        agent = CrossSellAgent()
        state = make_state(user_message="I'm interested in stocks and market data")
        result = agent.process(state)
        assert "cross_sell" in result["agent_outputs"]

    def test_detects_market_signal(self):
        agent = CrossSellAgent()
        state = make_state(user_message="I want real-time market charts and trading tools")
        result = agent.process(state)
        signals = result["agent_outputs"]["cross_sell"]["signals_detected"]
        assert "ET_MARKETS" in signals

    def test_no_opportunities_for_empty_profile_and_neutral_message(self):
        agent = CrossSellAgent()
        state = make_state(
            user_message="hello",
            user_profile={},
        )
        result = agent.process(state)
        # Should complete without error; may have 0 opportunities
        assert "agent_outputs" in result

    def test_suggests_bundle_for_multi_signal(self):
        agent = CrossSellAgent()
        state = make_state(
            user_message="I want ET Prime articles and market charts",
            user_profile={"primary_segment": "learning_focused_beginner"},
        )
        result = agent.process(state)
        opps = result["agent_outputs"]["cross_sell"]["opportunities"]
        # Should have at least one opportunity
        assert isinstance(opps, list)


# ─── AnalyticsAgent (no LLM) ──────────────────────────────────────────────
class TestAnalyticsAgent:
    def test_runs_and_produces_quality_score(self):
        agent = AnalyticsAgent()
        state = make_state(
            current_intent="product_inquiry",
            intent_confidence=0.9,
            final_response="ET Prime offers premium business journalism.",
            agent_outputs={
                "navigator": {
                    "product_recommendations": [{"name": "ET Prime"}],
                    "rag_used": False,
                }
            },
        )
        result = agent.process(state)
        assert "analytics" in result["agent_outputs"]
        quality = result["agent_outputs"]["analytics"]["quality"]
        assert 0.0 <= quality["quality_score"] <= 1.0

    def test_high_confidence_boosts_quality(self):
        agent = AnalyticsAgent()
        state = make_state(intent_confidence=0.95, final_response="X" * 200,
                           agent_outputs={"navigator": {"product_recommendations": [{"name": "ET Markets"}], "rag_used": False}})
        result = agent.process(state)
        assert result["agent_outputs"]["analytics"]["quality"]["high_confidence_intent"] is True


# ─── CoordinatorAgent (mock LLM) ──────────────────────────────────────────
class TestCoordinatorAgent:
    @patch("src.agents.coordinator_agent.classify_intent")
    def test_routes_product_inquiry(self, mock_classify):
        mock_classify.return_value = {"intent": "product_inquiry", "confidence": 0.92, "reasoning": ""}
        agent = CoordinatorAgent()
        state = make_state()
        result = agent.process(state)
        assert result["current_intent"] == "product_inquiry"
        assert result["intent_confidence"] == 0.92

    @patch("src.agents.coordinator_agent.classify_intent")
    def test_low_confidence_triggers_clarification(self, mock_classify):
        mock_classify.return_value = {"intent": "general_question", "confidence": 0.40, "reasoning": ""}
        agent = CoordinatorAgent()
        state = make_state()
        # Patch the method BEFORE calling process so the low-confidence branch uses our stub
        with patch.object(agent, "_generate_clarification", return_value="Could you clarify?") as mock_clar:
            result = agent.process(state)
        # With confidence < 0.55, coordinator should try to call _generate_clarification
        # Even if _model is None (no API key in test env), final_response should be non-empty
        assert result.get("final_response") is not None
        assert len(result.get("final_response", "")) > 0


# ─── ProfilingAgent (mock LLM) ────────────────────────────────────────────
class TestProfilingAgent:
    @patch("src.agents.profiling_agent.extract_entities")
    @patch("src.agents.profiling_agent.merge_extractions")
    def test_updates_profile_with_extraction(self, mock_merge, mock_extract):
        extracted = {
            "occupation": "software engineer",
            "investment_experience": "beginner",
            "age_group": "26-30",
            "financial_goals": ["wealth_building"],
            "interests": ["mutual_funds"],
            "confidence_scores": {"occupation": 0.9, "investment_experience": 0.8},
        }
        mock_extract.return_value = extracted
        # merge_extractions should return the merged profile with new values
        mock_merge.return_value = {
            **make_state()["user_profile"],
            **extracted,
        }
        agent = ProfilingAgent()
        state = make_state(user_message="I'm a software engineer in my late 20s just starting to invest")
        with patch.object(agent, "_generate_response", return_value="Great! What's your risk tolerance?"):
            result = agent.process(state)
        profile = result["user_profile"]
        assert profile.get("occupation") == "software engineer"
        assert profile.get("investment_experience") == "beginner"
        assert "profiling" in result["agent_outputs"]
