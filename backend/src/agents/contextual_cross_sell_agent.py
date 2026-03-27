from typing import Dict, List, Optional
import logging
import re

logger = logging.getLogger(__name__)

KEYWORD_SERVICE_MAP = [
    {
        "keywords": ["stock", "share", "equity", "ipo", "listing", "nse", "bse", "sensex", "nifty"],
        "suggestions": [
            {
                "service": "ET Prime - Stock Analysis Reports",
                "reason": "You're reading about stocks. Get expert analysis on 500+ companies.",
                "cta": "Get Stock Reports - ₹99/month",
                "category": "et_prime",
                "trigger_emoji": "📈"
            },
            {
                "service": "Masterclass: Stock Picking Strategies",
                "reason": "Learn how to identify multibagger stocks before they rally.",
                "cta": "Join Masterclass - ₹1499",
                "category": "masterclass",
                "trigger_emoji": "🎓"
            }
        ]
    },
    {
        "keywords": ["mutual fund", "sip", "elss", "index fund", "nav", "aum", "folio"],
        "suggestions": [
            {
                "service": "ET Prime - Best Mutual Funds 2026",
                "reason": "Expert-rated funds that beat the benchmark by 4–6%.",
                "cta": "See Top Funds - FREE Preview",
                "category": "et_prime",
                "trigger_emoji": "💰"
            }
        ]
    },
    {
        "keywords": ["tax", "80c", "itr", "deduction", "financial year", "f&o tax", "ltcg", "stcg"],
        "suggestions": [
            {
                "service": "ET Prime - Complete Tax Saving Guide FY26",
                "reason": "Save up to ₹46,800 in taxes legally.",
                "cta": "Get Tax Guide - ₹99 Only",
                "category": "et_prime",
                "trigger_emoji": "🧾"
            }
        ]
    },
    {
        "keywords": ["ipo", "grey market", "gmp", "subscription", "allotment", "listing gain"],
        "suggestions": [
            {
                "service": "ET Prime - IPO Analysis & Ratings",
                "reason": "Expert view on every IPO — Subscribe or Skip?",
                "cta": "Get IPO Reports - ₹99/month",
                "category": "et_prime",
                "trigger_emoji": "🚀"
            }
        ]
    },
    {
        "keywords": ["bitcoin", "crypto", "blockchain", "web3", "ethereum", "defi"],
        "suggestions": [
            {
                "service": "ET Prime - Crypto Investing Guide",
                "reason": "Navigate crypto safely. Avoid scams, find opportunities.",
                "cta": "Get Crypto Guide - ₹149",
                "category": "et_prime",
                "trigger_emoji": "₿"
            }
        ]
    },
    {
        "keywords": ["insurance", "term plan", "health insurance", "risk cover", "premium", "claim"],
        "suggestions": [
            {
                "service": "ET Prime - Insurance Buying Guide 2026",
                "reason": "Get right insurance at right price. Save ₹20K annually.",
                "cta": "Read Insurance Guide - FREE",
                "category": "et_prime",
                "trigger_emoji": "🛡️"
            }
        ]
    },
    {
        "keywords": ["budget", "savings", "emergency fund", "financial planning", "goal", "corpus"],
        "suggestions": [
            {
                "service": "ET Prime - Personal Finance Toolkit",
                "reason": "Calculators, templates, guides for every financial goal.",
                "cta": "Access Toolkit - FREE Trial",
                "category": "et_prime",
                "trigger_emoji": "🏦"
            }
        ]
    }
]

def extract_keywords(text: str) -> List[str]:
    text_lower = text.lower()
    words = re.findall(r'\b\w+\b', text_lower)
    return words + [f"{words[i]} {words[i+1]}" for i in range(len(words)-1)]

def get_contextual_suggestion(article_content: str, article_category: Optional[str] = None, user_profile: Optional[Dict] = None, time_spent: int = 0, scroll_depth: int = 0) -> Optional[Dict]:
    """Return contextual suggestion based on article content and reading behavior."""
    
    # Only trigger after meaningful engagement
    if time_spent < 20 and scroll_depth < 30:
        return None
    
    extracted = extract_keywords(article_content)
    
    best_match = None
    best_score = 0
    
    for mapping in KEYWORD_SERVICE_MAP:
        score = sum(1 for kw in mapping['keywords'] if kw in extracted or kw in article_content.lower())
        if score > best_score:
            best_score = score
            best_match = mapping
    
    if not best_match or best_score == 0:
        # Fallback generic suggestion
        return {
            "service": "ET Prime - India's Most Trusted Financial Platform",
            "reason": "Stay ahead of the market with expert analysis and insights.",
            "cta": "Start ET Prime — ₹99 First Month",
            "category": "et_prime",
            "trigger_emoji": "👑",
            "context_score": 0
        }
    
    suggestion = best_match["suggestions"][0].copy()
    suggestion["context_score"] = best_score
    return suggestion

class ContextualCrossSellAgent:
    def process_reading_event(self, article_content: str, article_category: str = None, time_spent: int = 0, scroll_depth: int = 0, user_profile: dict = None) -> Optional[Dict]:
        return get_contextual_suggestion(article_content, article_category, user_profile, time_spent, scroll_depth)

contextual_agent = ContextualCrossSellAgent()
