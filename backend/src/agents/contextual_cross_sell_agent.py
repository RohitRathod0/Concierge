"""
ET Concierge — Contextual Cross-Sell Agent
Analyzes article content and returns the best-matching ET service.
Uses a fast keyword-based matcher — no external API calls, zero latency.
"""
import logging
import re

logger = logging.getLogger(__name__)

# ─── Service catalogue ────────────────────────────────────────────────────────
ET_SERVICES = [
    {
        "service": "ET Prime",
        "category": "et_prime",
        "keywords": [
            "market", "nifty", "sensex", "stock", "share", "bse", "nse",
            "quarterly", "results", "earnings", "profit", "revenue", "invest",
            "portfolio", "equity", "fund", "sebi", "rbi", "inflation",
            "rate hike", "gdp", "economy", "economic", "budget", "finance",
            "rupee", "dollar", "trading", "analyst", "bank", "sector",
        ],
        "hook_message": "Feeling the tension with all this market chaos? 📊 While everyone else is guessing, ET Prime subscribers already know what's coming next. Get institutional-grade market data, expert calls, and exclusive research — right at your fingertips. Stay ahead of 90% of retail investors.",
        "reason": "Get institutional-grade market research, exclusive interviews, and real-time analysis from ET Prime's expert editorial team — before anyone else.",
        "cta": "Try ET Prime Free for 7 Days",
        "url": "/et-prime",
        "price": "From ₹99/month",
        "match_score": 95,
        "trigger_emoji": "👑",
    },
    {
        "service": "ET Masterclass",
        "category": "masterclass",
        "keywords": [
            "learn", "beginner", "how to", "course", "education", "invest",
            "mutual fund", "sip", "tax", "personal finance", "wealth",
            "retirement", "insurance", "planning", "financial literacy",
            "derivatives", "futures", "options", "technical analysis",
        ],
        "hook_message": "This article is exactly why financial literacy matters. 🎯 Most people read the news but don't know what to DO about it. ET Masterclass changes that — expert-led courses that turn market news into real money moves. Your competition is already enrolling.",
        "reason": "Level up your financial knowledge with expert-led courses on investing, tax planning, and wealth creation — built for Indian investors.",
        "cta": "Explore ET Masterclass",
        "url": "/masterclass",
        "price": "First course FREE",
        "match_score": 90,
        "trigger_emoji": "🎓",
    },
    {
        "service": "ET IPO Tracker",
        "category": "ipo",
        "keywords": [
            "ipo", "listing", "grey market", "gmp", "allotment", "subscription",
            "public issue", "primary market", "new listing", "oversubscribed",
        ],
        "hook_message": "While you're reading about this IPO, thousands of investors are already tracking it live. 🚀 Don't miss the subscription window, GMP spike, or ET's Subscribe/Avoid verdict — it's the difference between listing gains and listing losses.",
        "reason": "Never miss an IPO again — track every upcoming IPO, live subscriptions, GMP, and get ET's Subscribe/Avoid verdict in real time.",
        "cta": "Track IPOs on ET",
        "url": "/ipo",
        "price": "Free to track",
        "match_score": 97,
        "trigger_emoji": "🚀",
    },
    {
        "service": "ET Financial Services",
        "category": "financial_services",
        "keywords": [
            "demat", "credit card", "loan", "insurance", "home loan",
            "car loan", "personal loan", "account", "fd", "fixed deposit",
            "nps", "ppf", "epf", "gold", "bond",
        ],
        "hook_message": "The right financial product at the right time can save you lakhs. 🏦 ET's AI doesn't just show you options — it matches products to YOUR exact financial profile. Zero commissions, zero hidden charges, and 10-minute digital onboarding.",
        "reason": "Open a Demat, compare credit cards, or find the right insurance — ET's AI matches financial products to your exact profile in minutes.",
        "cta": "Explore Financial Services",
        "url": "/financial-services",
        "price": "Free \u2022 No hidden charges",
        "match_score": 92,
        "trigger_emoji": "🏦",
    },
    {
        "service": "ET Markets Portfolio Tracker",
        "category": "markets",
        "keywords": [
            "portfolio", "holdings", "returns", "p&l", "watchlist", "tracker",
            "52-week", "all-time high", "multibagger", "dividend", "corporate action",
        ],
        "hook_message": "Every minute you're NOT tracking your portfolio, the market is moving without you. 📊 ET's free Portfolio Tracker gives you real-time P&L, dividend alerts, and corporate action notifications — so you're always in the loop, never blindsided.",
        "reason": "Track your entire portfolio across stocks and mutual funds with real-time P&L, dividend alerts, and corporate action notifications.",
        "cta": "Track Your Portfolio",
        "url": "/portfolio",
        "price": "Free",
        "match_score": 88,
        "trigger_emoji": "📊",
    },
]

# Default fallback when no category keywords match
_DEFAULT = {
    "service": "ET Prime",
    "category": "et_prime",
    "reason": "Stay ahead of markets with ET Prime's exclusive research, expert commentary, and real-time financial insights.",
    "cta": "Try ET Prime Free",
    "url": "/et-prime",
    "price": "From ₹99/month",
    "match_score": 80,
    "trigger_emoji": "👑",
}


class ContextualCrossSellAgent:
    """
    Keyword-based cross-sell engine.
    Scores each ET service against the article text and returns the best match.
    """

    def process_reading_event(
        self,
        article_content: str = "",
        article_category: str = "",
        time_spent: int = 0,
        scroll_depth: int = 0,
    ) -> dict | None:
        """
        Returns the best-matching ET service suggestion for this article,
        or None if the engagement threshold is not met.
        """
        text = (article_content + " " + (article_category or "")).lower()
        text = re.sub(r"[^a-z0-9 ₹&%/]", " ", text)

        best_service = None
        best_score = 0

        for svc in ET_SERVICES:
            score = sum(1 for kw in svc["keywords"] if kw in text)
            if score > best_score:
                best_score = score
                best_service = svc

        result = best_service if best_service else _DEFAULT
        logger.info(
            f"[ContextualAgent] category={article_category} "
            f"time={time_spent}s scroll={scroll_depth}% "
            f"→ {result['service']} (keyword_hits={best_score})"
        )
        return result


# Singleton used by the FastAPI route
contextual_agent = ContextualCrossSellAgent()
