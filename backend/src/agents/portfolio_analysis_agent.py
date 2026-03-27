import yfinance as yf
import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Cross-sell messages mapped to gaps
CROSS_SELL_TEMPLATES = {
    "sector_concentration": {
        "et_prime": "🎯 **Want to diversify your portfolio?** ET Prime's 'Diversification Masterplan' shows exactly which sectors to add based on your current holdings.",
        "masterclass": "📚 **Masterclass Recommendation:** 'Sector Rotation Strategy' — Learn when to shift money between sectors for maximum gains. ₹1499 only.",
    },
    "no_defensive_stocks": {
        "et_prime": "🛡️ **Protect your portfolio from downturns.** ET Prime's defensive stock picks have historically preserved capital during market crashes.",
        "masterclass": "📚 **Masterclass:** 'Building All-Weather Portfolios' — How top fund managers protect ₹1Cr+ portfolios in bad markets.",
    },
    "overvalued_holdings": {
        "et_prime": "⚠️ **Know when to sell.** ET Prime sends real-time valuation alerts so you never hold an overvalued stock too long.",
        "masterclass": "📚 **Masterclass:** 'When to Buy, Hold, and Sell Stocks' — The exact indicators experienced traders use.",
    },
    "missing_growth_sectors": {
        "et_prime": "🚀 **Don't miss the next growth wave.** ET Prime covers AI, EV, and Green Energy stocks before they become mainstream.",
        "masterclass": "📚 **Masterclass:** 'Emerging Sectors of the Decade' — Identify the next Nifty 50 stocks early. ₹999.",
    }
}

def get_stock_info(symbol: str) -> Optional[Dict]:
    """Fetch stock data from Yahoo Finance."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="1y")
        
        if hist.empty:
            return None
            
        current_price = info.get('currentPrice') or info.get('regularMarketPrice') or float(hist['Close'].iloc[-1])
        prev_close = info.get('previousClose') or info.get('regularMarketPreviousClose') or current_price
        
        return {
            "symbol": symbol,
            "name": info.get('longName') or info.get('shortName') or symbol,
            "current_price": float(current_price),
            "sector": info.get('sector', 'Unknown'),
            "industry": info.get('industry', 'Unknown'),
            "pe_ratio": info.get('forwardPE') or info.get('trailingPE'),
            "market_cap": info.get('marketCap'),
            "52w_high": info.get('fiftyTwoWeekHigh') or float(hist['High'].max()),
            "52w_low": info.get('fiftyTwoWeekLow') or float(hist['Low'].min()),
            "dividend_yield": info.get('dividendYield'),
            "beta": info.get('beta'),
            "debt_to_equity": info.get('debtToEquity'),
            "analyst_recommendation": info.get('recommendationKey', 'none'),
            "change_pct": ((current_price - prev_close) / prev_close * 100) if prev_close else 0,
        }
    except Exception as e:
        logger.warning(f"Could not fetch data for {symbol}: {e}")
        return None

def analyze_portfolio(stocks: List[Dict]) -> Dict[str, Any]:
    """
    Main analysis function.
    stocks: [{"symbol": "RELIANCE.NS", "quantity": 100, "average_price": 2450.0}]
    """
    enriched = []
    total_investment = 0.0
    current_value = 0.0
    
    for s in stocks:
        info = get_stock_info(s['symbol'])
        if not info:
            # graceful fallback
            info = {"symbol": s['symbol'], "name": s['symbol'], "current_price": s['average_price'], "sector": "Unknown", "pe_ratio": None, "analyst_recommendation": "none", "52w_high": s['average_price'], "52w_low": s['average_price'], "dividend_yield": None, "beta": None, "debt_to_equity": None, "change_pct": 0, "market_cap": None, "industry": "Unknown"}
        
        invested = s['quantity'] * s['average_price']
        current = s['quantity'] * info['current_price']
        gain = current - invested
        gain_pct = (gain / invested * 100) if invested else 0
        
        enriched.append({
            **info,
            "quantity": s['quantity'],
            "average_price": s['average_price'],
            "invested": invested,
            "current_value": current,
            "gain_loss": gain,
            "gain_loss_pct": gain_pct,
            "action": _suggest_action(info, gain_pct)
        })
        
        total_investment += invested
        current_value += current

    gain_loss = current_value - total_investment
    gain_loss_pct = (gain_loss / total_investment * 100) if total_investment else 0
    
    # Sector allocation
    sector_totals: Dict[str, float] = {}
    for e in enriched:
        sec = e.get('sector') or 'Unknown'
        sector_totals[sec] = sector_totals.get(sec, 0) + e['current_value']
    
    sector_allocation = {
        sec: round(val / current_value * 100, 1) if current_value else 0
        for sec, val in sector_totals.items()
    }
    
    # Gap and risk analysis
    gaps = _identify_gaps(enriched, sector_allocation)
    risks = _assess_risks(enriched, sector_allocation)
    risk_score = min(100, len(risks) * 15 + sum(20 for r in risks if r['severity'] == 'HIGH'))
    diversification_score = max(0, 100 - len(sector_allocation) * -10 + (10 * len(sector_allocation)))
    diversification_score = min(100, len(sector_allocation) * 20)
    
    # Generate cross-sell recommendations
    cross_sells = []
    for gap in gaps:
        gap_type = gap.get('type')
        if gap_type in CROSS_SELL_TEMPLATES:
            cs = CROSS_SELL_TEMPLATES[gap_type]
            cross_sells.append({"et_prime": cs.get("et_prime"), "masterclass": cs.get("masterclass")})
    
    if not cross_sells:
        cross_sells.append({
            "et_prime": "📈 **Grow your portfolio faster with ET Prime.** Get expert stock picks, valuations, and research reports used by top fund managers.",
            "masterclass": "🎓 **Masterclass:** 'Building a ₹1 Crore Portfolio from ₹0' — Learn the exact step-by-step roadmap. ₹1499."
        })
    
    return {
        "summary": {
            "total_investment": round(total_investment, 2),
            "current_value": round(current_value, 2),
            "gain_loss": round(gain_loss, 2),
            "gain_loss_pct": round(gain_loss_pct, 2),
            "diversification_score": diversification_score,
            "risk_score": risk_score,
            "num_stocks": len(enriched),
            "num_sectors": len(sector_allocation),
        },
        "sector_allocation": sector_allocation,
        "stocks": enriched,
        "gaps": gaps,
        "risks": risks,
        "cross_sells": cross_sells[:2],
    }

def generate_macro_report(enriched_stocks: List[Dict]) -> str:
    """Generate a geopolitics/macro-aware LLM report from the portfolio."""
    try:
        import openai
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        holdings_summary = "\n".join([
            f"- {s['name']} ({s['symbol']}): {s['quantity']} shares, sector={s['sector']}, gain={s['gain_loss_pct']:.1f}%"
            for s in enriched_stocks
        ])
        
        prompt = f"""You are a senior portfolio analyst at Economic Times. 
Analyze this Indian investor's portfolio in the context of current global geopolitics and economic trends (early 2026):

Holdings:
{holdings_summary}

Provide a concise (250 words max) report covering:
1. How current geopolitics (US-China trade tensions, AI/tech revolution, energy transitions, rate cycles) affect these holdings.
2. Which holdings are most at-risk and which are most resilient in current global conditions.
3. 2-3 actionable intelligence bullets for this specific portfolio.

Use ₹ for Indian currency. Be specific, not generic. End with 1 cross-sell for ET Prime or a Masterclass."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.warning(f"Macro report LLM call failed: {e}")
        # Return a static fallback
        sectors = list(set(s.get('sector', 'Unknown') for s in enriched_stocks))
        return f"""**Global Market Snapshot — March 2026**

Your portfolio spans {len(enriched_stocks)} stocks across {', '.join(sectors[:3])} sectors.

**Key Macro Risks:**
• **US-China Tensions:** IT/tech stocks with US revenue exposure face headwinds from export restrictions. Monitor TCS, Infosys earnings guidance.
• **AI Revolution:** Companies not investing in AI automation risk margin compression over 3–5 years.
• **Rate Environment:** With RBI holding rates, growth stocks and real estate are stabilizing. Defensive FMCG offers relative safety.
• **Energy Transition:** PSU energy companies may face headwinds as India accelerates renewable targets by 2030.

**Portfolio Intelligence:**
→ Ensure <40% exposure to any single sector to withstand global shocks.
→ Add 1–2 export-oriented pharma stocks (US FDA approved) as geopolitical hedges.
→ Consider Gold ETF (5–10%) as geopolitical hedge.

💡 *ET Prime subscribers get weekly macro impact reports tailored to their exact portfolio. Start at ₹99/month.*"""

def _suggest_action(info: Dict, gain_pct: float) -> str:
    rec = info.get('analyst_recommendation', '').lower()
    pe = info.get('pe_ratio')
    
    if gain_pct < -20:
        return "CONSIDER EXIT"
    elif gain_pct > 30 and pe and pe > 35:
        return "BOOK PARTIAL PROFITS"
    elif rec in ['buy', 'strong_buy']:
        return "HOLD / BUY MORE"
    elif rec in ['sell', 'underperform']:
        return "REVIEW / SELL"
    else:
        return "HOLD"

def _identify_gaps(enriched: List[Dict], sector_allocation: Dict) -> List[Dict]:
    gaps = []
    
    # Sector concentration
    for sec, pct in sector_allocation.items():
        if pct > 40:
            gaps.append({
                "type": "sector_concentration",
                "severity": "HIGH",
                "description": f"🔴 {pct:.0f}% concentrated in {sec} (recommended max: 40%)",
                "recommendation": f"Diversify into Banking, FMCG, Healthcare sectors"
            })
    
    # Missing defensive stocks
    defensive_sectors = {'Consumer Defensive', 'Healthcare', 'Utilities'}
    if not any(s in defensive_sectors for s in sector_allocation.keys()):
        gaps.append({
            "type": "no_defensive_stocks",
            "severity": "MEDIUM",
            "description": "🟡 No defensive stocks (FMCG/Pharma). Portfolio vulnerable to downturns.",
            "recommendation": "Add 1-2 defensive stocks like HUL, Nestle or Sun Pharma"
        })
    
    # No dividend stocks
    no_div = [s for s in enriched if not s.get('dividend_yield')]
    if len(no_div) == len(enriched):
        gaps.append({
            "type": "missing_growth_sectors",
            "severity": "LOW",
            "description": "🟢 No dividend-paying stocks. Consider adding for passive income.",
            "recommendation": "Add 1-2 dividend aristocrats (ITC, Coal India, ONGC)"
        })
    
    return gaps

def _assess_risks(enriched: List[Dict], sector_allocation: Dict) -> List[Dict]:
    risks = []
    total_value = sum(s['current_value'] for s in enriched)
    
    # Single stock concentration
    for s in enriched:
        if total_value and (s['current_value'] / total_value) > 0.20:
            risks.append({
                "risk": f"Single Stock Concentration: {s['symbol']}",
                "severity": "HIGH",
                "mitigation": f"Reduce {s['symbol']} to below 15% of portfolio"
            })
    
    # Overvalued stocks
    for s in enriched:
        pe = s.get('pe_ratio')
        if pe and pe > 50:
            risks.append({
                "risk": f"High Valuation: {s['symbol']} P/E = {pe:.0f}x",
                "severity": "MEDIUM",
                "mitigation": "Consider booking profits on stretched valuations"
            })
    
    # Deep losses
    for s in enriched:
        if s['gain_loss_pct'] < -25:
            risks.append({
                "risk": f"Deep Loss: {s['symbol']} at {s['gain_loss_pct']:.1f}%",
                "severity": "HIGH",
                "mitigation": f"Review thesis for {s['symbol']}, consider stop-loss exit"
            })
    
    return risks
