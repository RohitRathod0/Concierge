"""
ET Concierge — Real @tool functions
Every tool fetches REAL data from the database or returns static catalogue data.
These are the only places agents get factual information — no hallucination.
"""
import json
import logging
from typing import Optional
from langchain_core.tools import tool

logger = logging.getLogger(__name__)


# ── ET Services Catalogue (static — doesn't need DB) ─────────────────────────
@tool
def get_et_services(category: Optional[str] = None) -> str:
    """
    Returns the full list of ET (Economic Times) products and services.
    Call this when user asks: 'what services do you offer', 'what can I do here',
    'tell me about ET Prime', 'what is available', or any platform discovery query.
    Optional category: 'premium', 'learning', 'markets', 'ipo', 'financial', 'events', 'sme'
    """
    services = {
        "premium": {
            "name": "ET Prime",
            "description": "Premium subscription — exclusive stock analysis, IPO ratings, mutual fund reports, ad-free reading, CEO interviews",
            "price": "₹99/month or ₹999/year",
            "url": "/et-prime",
            "best_for": "Investors who want institutional-grade research and market edge",
        },
        "learning": {
            "name": "ET Masterclass",
            "description": "Expert-led online courses: stocks, F&O trading, mutual funds, IPOs, personal finance, portfolio building",
            "price": "₹999 – ₹2,499 per course",
            "url": "/masterclass",
            "best_for": "Anyone who wants structured learning from top market practitioners",
        },
        "markets": {
            "name": "ET Markets",
            "description": "Live NSE/BSE prices, indices, F&O chain, technical charts, AI stock signals, sector heatmap, portfolio tracker",
            "price": "Free (advanced features with ET Prime)",
            "url": "/markets",
            "best_for": "Active investors and traders tracking markets daily",
        },
        "ipo": {
            "name": "ET IPO Hub",
            "description": "All upcoming and open IPOs — ET ratings, live GMP, subscription numbers, allotment status, apply alerts",
            "price": "Free",
            "url": "/ipo",
            "best_for": "Investors looking for listing gain opportunities and IPO analysis",
        },
        "financial": {
            "name": "ET Financial Services",
            "description": "AI-matched credit cards, personal loans, home loans, insurance, mutual funds, zero-brokerage demat account",
            "price": "Free comparison (commission basis)",
            "url": "/financial-services",
            "best_for": "Users wanting the best financial products matched to their profile",
        },
        "events": {
            "name": "ET Wealth Summit",
            "description": "Premium live events and webinars with top investors, fund managers, and industry leaders",
            "price": "Varies by event (₹500–₹5,000)",
            "url": "/wealth-summit",
            "best_for": "Investors wanting actionable insights directly from industry leaders",
        },
        "sme": {
            "name": "ET SME Hub",
            "description": "Resources for SME/MSME owners: GST tools, export guidance, funding options, MSME awards",
            "price": "Free",
            "url": "/sme",
            "best_for": "Business owners and entrepreneurs growing their companies",
        },
    }
    if category and category in services:
        return json.dumps({"service": services[category]}, indent=2)
    return json.dumps({"services": list(services.values()), "total": len(services)}, indent=2)


# ── IPO Data from DB ──────────────────────────────────────────────────────────
@tool
def get_ipo_list(status: Optional[str] = "open") -> str:
    """
    Fetches real IPO data from the database.
    Call this when user asks: 'IPO', 'upcoming IPO', 'IPO this week',
    'listing gains', 'GMP', 'should I apply for IPO', 'apply IPO'.
    status: 'open', 'upcoming', 'listed', 'all'
    """
    try:
        from src.database.connection import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        try:
            if status == "all":
                where = ""
            else:
                where = f"WHERE status = '{status}'"
            rows = db.execute(text(f"""
                SELECT company_name, sector, price_band_low, price_band_high,
                       open_date, close_date, gmp_percent, et_rating, et_verdict,
                       status, lot_size, min_investment
                FROM ipos {where}
                ORDER BY open_date ASC
                LIMIT 6
            """)).fetchall()
            if not rows:
                return json.dumps({"message": f"No {status} IPOs found right now. Check back soon for updates.", "ipos": []})
            ipos = []
            for r in rows:
                ipos.append({
                    "company": r.company_name,
                    "sector": r.sector or "—",
                    "price_band": f"₹{r.price_band_low}–₹{r.price_band_high}" if r.price_band_low else "TBA",
                    "open_date": str(r.open_date) if r.open_date else "TBA",
                    "close_date": str(r.close_date) if r.close_date else "TBA",
                    "gmp": f"{float(r.gmp_percent):+.1f}%" if r.gmp_percent is not None else "No GMP",
                    "et_rating": f"{r.et_rating}/5" if r.et_rating else "No rating",
                    "et_verdict": r.et_verdict or "Pending",
                    "status": r.status,
                    "min_investment": f"₹{int(r.min_investment):,}" if r.min_investment else "TBA",
                })
            return json.dumps({"ipos": ipos, "count": len(ipos), "filter": status}, indent=2)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"get_ipo_list failed: {e}")
        return json.dumps({"error": f"IPO data unavailable: {e}", "ipos": []})


# ── Market Data from DB ───────────────────────────────────────────────────────
@tool
def get_market_data(symbols: Optional[str] = "indices") -> str:
    """
    Fetches live market prices from the database cache.
    Call this when user asks: 'how is market today', 'Nifty', 'Sensex',
    'trending stocks', 'stock price', 'what is RELIANCE price'.
    symbols: 'indices' (Nifty/Sensex/BankNifty), 'trending' (top movers),
             or a stock ticker like 'RELIANCE.NS'
    """
    try:
        from src.database.connection import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        try:
            if symbols == "indices":
                rows = db.execute(text("""
                    SELECT symbol, price, change_amount, change_percent, last_updated
                    FROM market_data_cache
                    WHERE symbol IN ('NSEI', 'BSESN', 'NSEBANK')
                    ORDER BY symbol
                """)).fetchall()
                display = {'NSEI': 'Nifty 50', 'BSESN': 'Sensex', 'NSEBANK': 'Bank Nifty'}
                indices = []
                for r in rows:
                    indices.append({
                        "name": display.get(r.symbol, r.symbol),
                        "price": f"{float(r.price):,.2f}",
                        "change": f"{float(r.change_percent):+.2f}%",
                        "direction": "UP ↑" if float(r.change_percent) > 0 else "DOWN ↓",
                    })
                if not indices:
                    return json.dumps({"message": "Market data not cached yet. Market opens at 9:15 AM IST.", "indices": []})
                return json.dumps({"indices": indices, "as_of": "latest cached"}, indent=2)
            elif symbols == "trending":
                rows = db.execute(text("""
                    SELECT symbol, price, change_percent
                    FROM market_data_cache
                    WHERE symbol LIKE '%.NS'
                    ORDER BY ABS(change_percent) DESC
                    LIMIT 5
                """)).fetchall()
                stocks = [{"symbol": r.symbol.replace('.NS', ''), "price": f"{float(r.price):,.2f}", "change": f"{float(r.change_percent):+.2f}%"} for r in rows]
                return json.dumps({"trending_stocks": stocks}, indent=2)
            else:
                row = db.execute(text("SELECT * FROM market_data_cache WHERE symbol = :sym"), {"sym": symbols}).fetchone()
                if not row:
                    return json.dumps({"message": f"No data for {symbols}. Try adding .NS suffix (e.g., RELIANCE.NS)"})
                return json.dumps({"symbol": symbols, "price": float(row.price), "change_percent": float(row.change_percent)}, indent=2)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"get_market_data failed: {e}")
        return json.dumps({"error": f"Market data unavailable: {e}"})


# ── Courses from DB ───────────────────────────────────────────────────────────
@tool
def get_courses(category: Optional[str] = None, level: Optional[str] = None) -> str:
    """
    Fetches real ET Masterclass courses from the database.
    Call this when user asks: 'course', 'masterclass', 'learn investing',
    'how to trade', 'beginner course', 'F&O course', 'mutual fund course'.
    category: 'equities', 'trading', 'mutual_funds', 'derivatives', 'personal_finance', 'ipo'
    level: 'beginner', 'intermediate', 'advanced'
    """
    try:
        from src.database.connection import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        try:
            where_parts = ["is_active = true"]
            params = {}
            if category:
                where_parts.append("category = :category")
                params["category"] = category
            if level:
                where_parts.append("level = :level")
                params["level"] = level
            rows = db.execute(text(f"""
                SELECT title, short_description, category, level,
                       instructor_name, duration_hours, total_learners, rating,
                       price, is_free, badge_label
                FROM courses
                WHERE {' AND '.join(where_parts)}
                ORDER BY total_learners DESC
                LIMIT 6
            """), params).fetchall()
            if not rows:
                # Fallback: show all active courses
                rows = db.execute(text("""
                    SELECT title, short_description, category, level,
                           instructor_name, duration_hours, total_learners, rating,
                           price, is_free, badge_label
                    FROM courses WHERE is_active = true
                    ORDER BY total_learners DESC LIMIT 6
                """)).fetchall()
            courses = []
            for r in rows:
                courses.append({
                    "title": r.title,
                    "description": r.short_description or "",
                    "category": r.category,
                    "level": r.level,
                    "instructor": r.instructor_name,
                    "duration": f"{r.duration_hours}h" if r.duration_hours else "Self-paced",
                    "learners": f"{int(r.total_learners):,} enrolled" if r.total_learners else "New",
                    "rating": f"{float(r.rating):.1f}/5" if r.rating else "New",
                    "price": "FREE" if r.is_free else f"₹{int(r.price):,}",
                    "badge": r.badge_label or "",
                })
            return json.dumps({"courses": courses, "count": len(courses)}, indent=2)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"get_courses failed: {e}")
        # Meaningful static fallback
        return json.dumps({
            "courses": [
                {"title": "Stock Market Mastery 2026", "level": "beginner", "price": "₹1,499", "instructor": "ET Expert Faculty"},
                {"title": "F&O Trading Strategies", "level": "advanced", "price": "₹2,499", "instructor": "ET Expert Faculty"},
                {"title": "Personal Finance for the 30s", "level": "intermediate", "price": "₹999", "instructor": "ET Expert Faculty"},
            ],
            "note": f"Live data unavailable ({e}). Showing sample courses.",
        }, indent=2)


# ── User Profile from DB ──────────────────────────────────────────────────────
@tool
def get_user_financial_profile(user_id: str) -> str:
    """
    Fetches the user's complete financial profile from the database.
    Call this when user asks about: 'my profile', 'my recommendations',
    'what should I invest in', 'what is best for me', 'my financial health'.
    """
    if not user_id or user_id in ("unknown", "None", ""):
        return json.dumps({"message": "User not logged in or no profile found. Please sign in."})
    try:
        from src.database.connection import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        try:
            row = db.execute(text("""
                SELECT up.financial_persona, up.knowledge_level, up.primary_goal,
                       up.risk_appetite, up.interested_sectors, up.profile_completeness,
                       up.has_demat_account, up.has_et_prime, up.life_stage,
                       up.monthly_investment_capacity,
                       fhs.score as health_score
                FROM user_profiles up
                LEFT JOIN financial_health_scores fhs ON fhs.user_id = up.user_id::uuid
                WHERE up.user_id = :uid
            """), {"uid": user_id}).fetchone()
            if not row:
                return json.dumps({"message": "Profile not set up yet. Complete onboarding for personalized recommendations.", "profile_completeness": 0})
            return json.dumps({
                "persona": row.financial_persona,
                "knowledge_level": row.knowledge_level,
                "primary_goal": row.primary_goal,
                "risk_appetite": row.risk_appetite,
                "interested_sectors": row.interested_sectors,
                "profile_completeness": row.profile_completeness,
                "has_demat_account": row.has_demat_account,
                "has_et_prime": row.has_et_prime,
                "life_stage": row.life_stage,
                "monthly_investment_capacity": str(row.monthly_investment_capacity) if row.monthly_investment_capacity else None,
                "health_score": float(row.health_score) if row.health_score else None,
            }, indent=2)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"get_user_financial_profile failed: {e}")
        return json.dumps({"error": f"Could not fetch profile: {e}"})


# ── Personalized Recommendation from DB ──────────────────────────────────────
@tool
def get_personalized_recommendation(user_id: str, context: Optional[str] = None) -> str:
    """
    Returns the top ET product recommendation for this specific user
    based on their profile readiness score.
    Call this when user asks: 'what should I do next', 'what do you recommend for me',
    'where should I start', 'best product for me'.
    context: optional page context like 'ipo', 'masterclass', 'markets'
    """
    if not user_id or user_id in ("unknown", "None", ""):
        return json.dumps({"recommendation": "Sign in to get personalized recommendations tailored to your financial profile."})
    try:
        from src.database.connection import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        try:
            rows = db.execute(text("""
                SELECT product_id, readiness_score
                FROM et_product_readiness
                WHERE user_id = :uid
                ORDER BY readiness_score DESC
                LIMIT 3
            """), {"uid": user_id}).fetchall()
            if not rows:
                return json.dumps({
                    "recommendation": "ET Masterclass: Stock Market Mastery",
                    "reason": "Best starting point for most new investors",
                    "price": "₹1,499",
                    "url": "/masterclass",
                })
            product_map = {
                "et_prime": {"name": "ET Prime", "pitch": "Get exclusive analysis before anyone else — try FREE for 7 days.", "price": "₹99/month", "url": "/et-prime"},
                "masterclass_beginner": {"name": "Stock Market Mastery Masterclass", "pitch": "Learn to invest confidently with Indian market examples.", "price": "₹1,499", "url": "/masterclass"},
                "demat_account": {"name": "Free Demat Account", "pitch": "Open a zero-brokerage Demat account to start investing.", "price": "Free", "url": "/financial-services"},
                "ipo_alerts": {"name": "ET IPO Tracker", "pitch": "Never miss a high-potential IPO — get alerts before subscription opens.", "price": "Free with ET Prime", "url": "/ipo"},
                "term_insurance": {"name": "Term Insurance Comparison", "pitch": "Protect your family. Compare best term plans in 2 minutes.", "price": "Free comparison", "url": "/financial-services"},
            }
            top = rows[0]
            rec = product_map.get(top.product_id, product_map["masterclass_beginner"])
            return json.dumps({
                "top_recommendation": rec,
                "readiness_score": float(top.readiness_score),
                "other_options": [r.product_id for r in rows[1:]],
            }, indent=2)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"get_personalized_recommendation failed: {e}")
        return json.dumps({"recommendation": "ET Masterclass — start learning to invest today.", "url": "/masterclass"})


# ── All tools list for import elsewhere ──────────────────────────────────────
ALL_TOOLS = [
    get_et_services,
    get_ipo_list,
    get_market_data,
    get_courses,
    get_user_financial_profile,
    get_personalized_recommendation,
]
