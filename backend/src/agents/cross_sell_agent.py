"""
ET AI Concierge - Phase 2
Cross-Sell Agent: rule-based opportunity detection and bundle recommendations.
Note: Phase 2 uses heuristics; Phase 3 will add ML propensity models.
"""
import time
import logging
from typing import List

from src.agents.base_agent import BaseAgent, AgentState
from src.tools.product_matcher import ET_PRODUCTS

logger = logging.getLogger(__name__)

# Products that naturally bundle well together
PRODUCT_BUNDLES = {
    ("ET_PRIME", "ET_MARKETS"): {
        "name": "Investor's Complete Bundle",
        "description": "Premium journalism + real-time market tools = complete investing edge",
        "discount_hint": "Often available as a combined subscription",
    },
    ("ET_PRIME", "ET_MASTERCLASS"): {
        "name": "Learn & Earn Bundle",
        "description": "Expert content + structured courses for accelerated financial growth",
        "discount_hint": "Perfect for knowledge-focused investors",
    },
    ("ET_WEALTH_SUMMIT", "ET_FINANCIAL_SERVICES"): {
        "name": "Wealth Builder Bundle",
        "description": "Exclusive events + professional advisor access for serious investors",
        "discount_hint": "Ideal for high-net-worth individuals",
    },
}

# Keywords that signal cross-sell readiness
READINESS_SIGNALS = {
    "ET_PRIME": ["prime", "subscription", "articles", "premium content", "analysis", "journalism"],
    "ET_MARKETS": ["market", "stocks", "portfolio", "trading", "data", "charts", "nifty", "sensex"],
    "ET_MASTERCLASS": ["learn", "course", "education", "masterclass", "how to invest", "beginner"],
    "ET_WEALTH_SUMMIT": ["event", "summit", "conference", "networking", "wealth"],
    "ET_FINANCIAL_SERVICES": ["advisor", "planner", "financial services", "manage my money"],
}


class CrossSellAgent(BaseAgent):
    name = "cross_sell"

    def process(self, state: AgentState) -> AgentState:
        start_time = time.time()
        try:
            message = state.get("user_message", "")
            profile = state.get("user_profile", {})
            history = state.get("conversation_history", [])

            # Detect readiness signals in current message + last 3 exchanges
            recent_text = self._format_history(history, last_n=3) + " " + message
            detected_signals = self._detect_signals(recent_text)

            # Build opportunities list
            opportunities = self._identify_opportunities(profile, detected_signals)

            # Suggest a bundle if 2+ products are relevant
            bundle = None
            if len(opportunities) >= 2:
                bundle = self._suggest_bundle(opportunities)

            # Only recommend if score is high enough (don't push too early)
            high_confidence = [o for o in opportunities if o["readiness_score"] >= 0.6]

            response = ""
            if high_confidence:
                product_names = [o["product"] for o in high_confidence[:2]]
                if bundle:
                    response = (
                        f"Based on your interests, you might also enjoy the **{bundle['name']}** - "
                        f"{bundle['description']}. {bundle['discount_hint']}."
                    )
                else:
                    response = (
                        f"You might also be interested in **{product_names[0]}** - "
                        f"{high_confidence[0]['reasoning']}."
                    )

            output = {
                "response": response,
                "opportunities": opportunities,
                "bundle": bundle,
                "signals_detected": detected_signals,
            }

            state.setdefault("agent_outputs", {})["cross_sell"] = output
            self._record_execution(state, start_time, True, output)
            logger.info(f"CrossSell done. Opportunities: {len(opportunities)}, High-conf: {len(high_confidence)}")
        except Exception as e:
            logger.error(f"CrossSellAgent error: {e}", exc_info=True)
            state.setdefault("agent_outputs", {})["cross_sell"] = {
                "response": "",
                "opportunities": [],
                "bundle": None,
                "signals_detected": [],
            }
            self._record_execution(state, start_time, False, error=str(e))

        return state

    def _detect_signals(self, text: str) -> List[str]:
        text_lower = text.lower()
        detected = []
        for product_code, signals in READINESS_SIGNALS.items():
            if any(sig in text_lower for sig in signals):
                detected.append(product_code)
        return detected

    def _identify_opportunities(self, profile: dict, signals: List[str]) -> List[dict]:
        opportunities = []
        segment = profile.get("primary_segment", "")
        experience = profile.get("investment_experience", "beginner") or "beginner"

        for product in ET_PRODUCTS:
            pcode = product["product_code"]
            score = 0.0
            reasons = []

            # Signal match
            if pcode in signals:
                score += 0.5
                reasons.append("mentioned in conversation")

            # Segment match
            if segment in product.get("target_segments", []):
                score += 0.3
                reasons.append(f"suits {segment.replace('_', ' ')}")

            # Experience filter
            from src.tools.product_matcher import EXPERIENCE_ORDER
            min_exp = product.get("min_experience", "beginner")
            if EXPERIENCE_ORDER.get(experience, 1) >= EXPERIENCE_ORDER.get(min_exp, 1):
                score += 0.2

            if score >= 0.3:
                opportunities.append({
                    "product": product["name"],
                    "product_code": pcode,
                    "readiness_score": round(score, 2),
                    "reasoning": "; ".join(reasons) if reasons else "profile match",
                })

        opportunities.sort(key=lambda x: x["readiness_score"], reverse=True)
        return opportunities[:4]

    def _suggest_bundle(self, opportunities: List[dict]) -> dict:
        top_codes = [o["product_code"] for o in opportunities[:2]]
        key = tuple(sorted(top_codes))
        return PRODUCT_BUNDLES.get(key, {
            "name": f"{opportunities[0]['product']} + {opportunities[1]['product']}",
            "description": "A powerful combination for your investment journey",
            "discount_hint": "Check ET website for bundle offers",
        })
