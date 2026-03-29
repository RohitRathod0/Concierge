"""
Dynamic News proxy route using GNews API (free, no credit card needed).
Get your free key at: https://gnews.io (100 requests/day free)
Add NEWS_API_KEY=your_key to your .env file.

Falls back to curated static articles if no key is configured, 
so the contextual agent demo always works.
"""
import os
import httpx
import logging
import time
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter(prefix="/news", tags=["news"])
logger = logging.getLogger(__name__)

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
GNEWS_BASE = "https://gnews.io/api/v4"

_NEWS_CACHE = {}
CACHE_TTL_SECONDS = 6 * 3600  # 6 hours

# Category → query mapping for financial news
CATEGORY_QUERIES = {
    "markets": "stock market india nifty sensex",
    "ipo": "IPO india listing grey market",
    "mutual_funds": "mutual fund SIP india",
    "economy": "india economy RBI budget",
    "crypto": "cryptocurrency bitcoin india",
    "tech": "technology AI stocks india",
    "tax": "income tax india 80C ELSS",
    "global": "global markets geopolitics economy",
}

FALLBACK_ARTICLES = [
    {
        "id": "fallback-1",
        "title": "Nifty 50 Hits Record High as FII Inflows Surge",
        "description": "The Nifty 50 index surged to a record high today as Foreign Institutional Investors pumped ₹12,500 crore into Indian equities. IT and Banking stocks led the rally. Analysts expect the uptrend to continue if global cues remain positive.",
        "content": "The Nifty 50 index surged to a record high today as Foreign Institutional Investors (FII) pumped ₹12,500 crore into Indian equities. IT and Banking stocks led the rally with gains of 2.3% and 1.8% respectively. Analysts from major brokerages expect the uptrend to continue if global cues remain positive. The Sensex also gained 1,100 points to close above 82,000. Market experts suggest that the RBI's accommodative stance and strong GDP growth projections are supporting the bullish sentiment. Investors should watch out for the upcoming quarterly earnings season which begins next week. Stock picking strategy is crucial in this environment—avoid overvalued names with PE ratios above 50x.",
        "url": "#",
        "image": None,
        "publishedAt": "2026-03-27T01:00:00Z",
        "source": {"name": "ET Markets"},
        "category": "markets",
    },
    {
        "id": "fallback-2",
        "title": "Top 5 SIP Funds That Beat Nifty by 6% in Last 3 Years",
        "description": "A study of 500+ mutual fund schemes revealed 5 consistent outperformers. Here's what made them different from the rest.",
        "content": "A comprehensive study of over 500 mutual fund schemes over the last 3 years has revealed consistent outperformers that beat the Nifty benchmark by more than 6% on an annualized basis. The study focused on large-cap and flexi-cap funds with disciplined SIP investors. Key findings: 1) Funds with low expense ratios consistently outperform peers. 2) Diversification across 60+ stocks reduces drawdown risk. 3) Fund managers with tenures exceeding 5 years delivered better risk-adjusted returns. The top performing funds included those from UTI, Mirae, and Parag Parikh. Investors are advised to start SIPs early and stay invested through market cycles. Starting a ₹5,000/month SIP at age 25 can create a ₹3 crore corpus by retirement.",
        "url": "#",
        "image": None,
        "publishedAt": "2026-03-27T00:30:00Z",
        "source": {"name": "ET Prime"},
        "category": "mutual_funds",
    },
    {
        "id": "fallback-3",
        "title": "Major IPO Alert:₹4,200 Cr Issue Opens Next Week — GMP Already at 38%",
        "description": "The Grey Market Premium for the upcoming IPO has surged to 38%, suggesting strong listing gains. Analysts rate it 'Subscribe' for long-term.",
        "content": "The upcoming mega IPO valued at ₹4,200 crore opens for subscription next week. The Grey Market Premium (GMP) has already surged to 38%, indicating strong market enthusiasm. The company operates in the fast-growing fintech space with a CAGR of 45% over the last 3 years. Issue price band is ₹420-440. Analysts at three major brokerages have rated it 'Subscribe for long term' while cautioning about stretched valuations at 45x FY26 earnings. Subscription through UPI is recommended for retail investors applying under the ₹2 lakh limit. Allotment chances improve significantly when applying under HNI or NII category. The company plans to use IPO proceeds for expansion into Tier 2 cities and technology infrastructure.",
        "url": "#",
        "image": None,
        "publishedAt": "2026-03-26T22:00:00Z",
        "source": {"name": "ET Markets IPO"},
        "category": "ipo",
    },
    {
        "id": "fallback-4",
        "title": "Tax Saving Season: How to Save ₹46,800 Before March 31",
        "description": "Financial year-end is approaching. Here's a step-by-step guide to maximize your 80C, 80D, and NPS deductions.",
        "content": "The financial year closes on March 31, and there are only days left to optimize your tax savings. Under Section 80C, you can claim up to ₹1.5 lakh in deductions through ELSS mutual funds, PPF, EPF, and NSC. Additionally, Section 80D allows deductions of ₹25,000 on health insurance premiums. NPS contributions under Section 80CCD(1B) offer an extra ₹50,000 deduction. For a taxpayer in the 30% bracket, maximizing all these deductions can save up to ₹46,800 in taxes. Tax professionals recommend ELSS funds over traditional instruments due to the shortest lock-in period of 3 years and potential for higher returns. Late filing of tax returns attracts penalties of ₹5,000-10,000, so submit before the deadline.",
        "url": "#",
        "image": None,
        "publishedAt": "2026-03-26T20:00:00Z",
        "source": {"name": "ET Wealth"},
        "category": "tax",
    },
    {
        "id": "fallback-5",
        "title": "US-China Trade War Escalation: Impact on Indian IT and Pharma Stocks",
        "description": "Renewed trade tensions between the US and China are creating ripple effects in emerging markets. Here's what Indian investors should watch.",
        "content": "The escalating US-China trade war has created significant uncertainty across global markets. For Indian investors, the implications are nuanced. Indian IT companies with large US revenue exposure may face headwinds if technology export restrictions tighten. However, pharma companies supplying to the US market could benefit from reduced Chinese competition. Geopolitical analysts note that India is increasingly being seen as a reliable alternative manufacturing hub under the China+1 strategy. FII flows into India have remained positive even as regional peers like South Korea and Taiwan see outflows. Investors should monitor currency movements, as a stronger dollar could impact earnings of export-oriented companies. Defensive sectors like FMCG and healthcare offer protection in uncertain times.",
        "url": "#",
        "image": None,
        "publishedAt": "2026-03-26T18:00:00Z",
        "source": {"name": "ET Global Markets"},
        "category": "global",
    },
    {
        "id": "fallback-6",
        "title": "Bitcoin Crosses $95,000: Should Indian Investors Allocate Crypto Now?",
        "description": "Cryptocurrency markets are surging. Financial advisors weigh in on whether Indian retail investors should add crypto to their portfolio.",
        "content": "Bitcoin has crossed the $95,000 mark for the first time since its last bull run, reigniting discussions about cryptocurrency as an asset class for Indian investors. While SEBI has not yet fully regulated crypto in India, many retail investors have been buying through exchanges. Financial advisors recommend limiting crypto allocation to 5% of total portfolio for aggressive risk profiles. Ethereum and Bitcoin remain the most established assets, with altcoins carrying significantly higher risk. Tax implications in India are significant—crypto gains are taxed at 30% flat, with no loss offset allowed against other income. Investors should ensure they are using SEBI and RBI compliant platforms and maintaining proper transaction records for ITR filing.",
        "url": "#",
        "image": None,
        "publishedAt": "2026-03-26T16:00:00Z",
        "source": {"name": "ET Crypto Desk"},
        "category": "crypto",
    },
]


async def fetch_from_gnews(query: str, max_articles: int = 6) -> list:
    """Fetch articles from GNews API."""
    if not NEWS_API_KEY:
        return []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{GNEWS_BASE}/search",
                params={
                    "q": query,
                    "token": NEWS_API_KEY,
                    "lang": "en",
                    "country": "in",
                    "max": max_articles,
                    "sortby": "publishedAt",
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                articles = data.get("articles", [])
                return [
                    {
                        "id": str(i),
                        "title": a.get("title", ""),
                        "description": a.get("description", ""),
                        "content": a.get("content", "") or a.get("description", ""),
                        "url": a.get("url", "#"),
                        "image": a.get("image"),
                        "publishedAt": a.get("publishedAt", ""),
                        "source": a.get("source", {"name": "News"}),
                        "category": query,
                    }
                    for i, a in enumerate(articles)
                ]
    except Exception as e:
        logger.warning(f"GNews fetch failed: {e}")
    return []


@router.get("/feed")
async def get_news_feed(
    category: Optional[str] = Query(default="markets"),
    q: Optional[str] = Query(default=None),
    force_refresh: bool = Query(default=False),
):
    """Get financial news feed. Uses GNews API with 6-hour cache."""
    query = q or CATEGORY_QUERIES.get(category, "india stock market finance")
    
    current_time = time.time()
    if not force_refresh and query in _NEWS_CACHE:
        cached_data, timestamp = _NEWS_CACHE[query]
        if current_time - timestamp < CACHE_TTL_SECONDS:
            return cached_data
            
    articles = await fetch_from_gnews(query, max_articles=9)
    
    if not articles:
        # Use fallback — filter by category if specified
        if category and category != "all":
            articles = [a for a in FALLBACK_ARTICLES if a["category"] == category]
        if not articles:
            articles = FALLBACK_ARTICLES
    
    response_data = {
        "articles": articles,
        "source": "gnews" if NEWS_API_KEY else "curated_fallback",
        "query": query,
        "total": len(articles),
        "api_key_configured": bool(NEWS_API_KEY),
    }
    
    _NEWS_CACHE[query] = (response_data, current_time)
    
    return response_data


@router.get("/categories")
def get_categories():
    return {"categories": list(CATEGORY_QUERIES.keys())}


@router.get("/article/{article_id}")
async def get_article(article_id: str, category: Optional[str] = None):
    """Get a single article by index (from fallback)."""
    articles = FALLBACK_ARTICLES
    try:
        idx = int(article_id.replace("fallback-", "")) - 1
        if 0 <= idx < len(articles):
            return {"article": articles[idx]}
    except Exception:
        pass
    return {"article": articles[0]}
