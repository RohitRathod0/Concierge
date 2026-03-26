"""
ET AI Concierge - Phase 2
RAG Seed Content: sample ET articles, FAQs, and product descriptions for dev/testing.
Run: python -m src.rag.ingestion.seed_content
"""
import logging
import sys
import os
import uuid

logger = logging.getLogger(__name__)

SEED_ARTICLES = [
    {
        "title": "How to Start Investing in Mutual Funds: A Beginner's Guide",
        "content": """Mutual funds pool money from multiple investors to invest in a diversified portfolio 
of stocks, bonds, or other securities. For beginners, mutual funds offer professional management, 
diversification, and affordability. 

Key types of mutual funds in India:
1. Equity Mutual Funds: Invest primarily in stocks. Higher risk, higher potential returns. 
   ELSS (Equity Linked Savings Schemes) offer tax benefits under Section 80C.
2. Debt Mutual Funds: Invest in bonds and fixed-income instruments. Lower risk, stable returns.
3. Hybrid Funds: Mix of equity and debt for balanced risk-return profile.

Getting started: Open a demat/trading account or invest directly through AMC websites or platforms 
like ET Money, Zerodha, or Groww. Start with SIP (Systematic Investment Plan) as low as ₹500/month.
KYC (Know Your Customer) documents required: PAN card, Aadhaar, and bank details.

ET Prime subscribers get access to mutual fund analysis, fund manager interviews, and curated 
investment strategies from India's top financial journalists.""",
        "source_type": "article",
        "category": "education",
        "tags": ["mutual_funds", "beginner", "investing", "sip"],
    },
    {
        "title": "Understanding Market Volatility: How to Stay Calm During Market Crashes",
        "content": """Market volatility is a normal part of investing. The Nifty 50 has experienced 
multiple crashes of 30-50% (2008 global financial crisis, 2020 COVID crash) but has always recovered 
to new highs over 3-5 year horizons.

Key principles during volatile markets:
- Don't panic sell: Selling during a crash locks in losses permanently
- Continue SIPs: Market dips mean you buy more units at lower prices, lowering average cost
- Review asset allocation: Not portfolio composition — just ensure equity-debt ratio matches your risk profile
- Look for buying opportunities: Quality companies on sale

Historical data (Nifty 50):
- 2008 crash: -60% peak to trough. 2013 recovery: +200% from the bottom
- 2020 crash: -38% in 45 days. 2022 recovery: +120% from the COVID low
- Average annual return over 20 years: ~15% CAGR

ET Markets provides real-time alerts, volatility indicators, and expert commentary to help you 
navigate market turbulence without emotional decisions.""",
        "source_type": "article",
        "category": "market_analysis",
        "tags": ["volatility", "market_crash", "investing_psychology"],
    },
    {
        "title": "Tax Planning for Salaried Employees: Section 80C Investment Guide",
        "content": """Section 80C of the Income Tax Act allows deductions up to ₹1.5 lakh per year 
from your taxable income. Here are the best 80C investment options:

1. ELSS (Equity Linked Savings Scheme): 3-year lock-in (shortest among 80C options), market-linked returns
   - Historical returns: 12-15% CAGR over 5+ years
   - Best for: Young investors with 5+ year horizon

2. PPF (Public Provident Fund): 15-year tenure, government-backed, 7.1% current interest rate
   - Tax-free returns, sovereign guarantee
   - Best for: Conservative investors, retirement corpus

3. EPF (Employee Provident Fund): 12% of basic salary contribution, employer matches
   - 8.15% current interest rate, tax-free on >5 years service
   - Auto-enrolled for salaried employees

4. Life Insurance Premium: Term insurance premiums qualify under 80C
   - Minimum ₹1 crore term cover recommended

5. Home Loan Principal Repayment: Principal portion of EMI qualifies
   - Combined with home loan interest deduction under Section 24b

Other deductions to maximize: 80D (health insurance), 80CCD for NPS (additional ₹50,000)

ET Prime's tax planning content provides updated guidance every budget season with expert CA analysis.""",
        "source_type": "article",
        "category": "tax_planning",
        "tags": ["tax", "80c", "elss", "ppf", "salary"],
    },
    {
        "title": "Technical Analysis Basics: Reading Candlestick Charts",
        "content": """Technical analysis helps traders predict future price movements using historical 
price and volume data. Candlestick charts are the most widely used chart type in Indian markets.

Reading a candlestick:
- Body: The rectangular area between opening and closing price
- Green/white candle: Close price > Open price (bullish)  
- Red/black candle: Close price < Open price (bearish)
- Wicks/Shadows: Lines extending above/below body showing high and low

Key candlestick patterns:
1. Doji: Open ≈ Close, signals indecision. Strong reversal signal when appearing at extremes.
2. Hammer: Small body, long lower wick. Bullish reversal at market bottoms.
3. Shooting Star: Small body, long upper wick. Bearish reversal at market tops.
4. Engulfing Pattern: Second candle completely covers first candle. Strong reversal signal.

Support & Resistance: Price levels where buying or selling historically concentrates.
Moving Averages: 20-day, 50-day, and 200-day EMAs are widely followed by institutional traders.
RSI (Relative Strength Index): Values below 30 = oversold, above 70 = overbought.

ET Markets provides free charting tools with all major technical indicators for Nifty, 
Bank Nifty, and individual stocks.""",
        "source_type": "article",
        "category": "technical_analysis",
        "tags": ["trading", "charts", "technical_analysis", "candlestick"],
    },
    {
        "title": "Building Wealth at 30: Investment Strategy for Young Professionals",
        "content": """Your 30s are the most powerful decade for wealth creation due to the magic of 
compounding. With 25-30 working years ahead, even modest investments grow significantly.

The 50-30-20 budget rule:
- 50% on Needs (rent, food, utilities, EMIs)
- 30% on Wants (entertainment, dining, travel)
- 20% on Savings and Investments

Recommended portfolio allocation at 30:
- 70-80% Equity: ELSS, large-cap index funds (Nifty 50 ETF), diversified equity funds
- 15-20% Debt: PPF, corporate bonds for stability
- 5-10% Alternative: Gold (SGBs), REITs

Compounding example:
₹10,000/month SIP at 12% CAGR:
- In 10 years: ₹23 lakhs invested → ₹23 lakhs corpus
- In 20 years: ₹24 lakhs invested → ₹98 lakhs corpus (4x)
- In 30 years: ₹36 lakhs invested → ₹3.5 crores corpus (10x!)

Emergency Fund: Before investing, build 6 months of expenses in liquid funds or high-yield savings.
Term Insurance: ₹1 crore cover costs just ₹8,000-15,000/year when bought at 30.
Health Insurance: Separate floater policy beyond employer's group cover essential.

ET Masterclass offers a "Wealth Building for Professionals" course with 8 modules covering 
budgeting, investment selection, and portfolio review.""",
        "source_type": "article",
        "category": "wealth_building",
        "tags": ["wealth_building", "30s", "young_professional", "compounding", "sip"],
    },
]

SEED_FAQS = [
    {
        "title": "What is ET Prime and what benefits does it offer?",
        "content": """ET Prime is the Economic Times' premium subscription service offering ad-free reading, 
exclusive content, and in-depth analysis not available to free users.

Key benefits:
- 1,500+ exclusive stories per month from ET's top journalists
- Quarterly and annual reports analysis
- Live expert Q&A sessions with fund managers and economists
- ET Prime Chat: real-time market Q&A
- ET Money: integrated personal finance tracking
- Ad-free experience across ET apps and website
- Access to ET Prime investment guides and special reports

Pricing (2024):
- Annual: ₹1,499/year (₹125/month)
- Monthly: ₹199/month
- Quarterly: ₹499/quarter

Free trial: 30-day free trial available for first-time subscribers
Payment methods: Credit/debit card, UPI, net banking""",
        "source_type": "faq",
        "product": "ET_PRIME",
        "category": "subscription",
    },
    {
        "title": "How does ET Markets help with stock investing?",
        "content": """ET Markets is the Economic Times' comprehensive market data and analysis platform.

Features:
- Real-time quotes for NSE/BSE stocks, F&O, commodities, forex
- Advanced charting with 50+ technical indicators
- Portfolio tracker: track all your investments in one place
- Market news integrated with price movements
- Earnings calendar and quarterly results
- Mutual fund explorer with comparison tools
- IPO tracker with GMP (grey market premium) data
- Sensex/Nifty alerts via SMS and email

Free features: Basic quotes, news, basic portfolio tracking
Premium features (ET Markets Pro):
- API access for algo trading
- Derivative chain analysis
- Institutional shareholding data
- Historical data downloads

The mobile app is available on iOS and Android with widget support.""",
        "source_type": "faq",
        "product": "ET_MARKETS",
        "category": "product_features",
    },
    {
        "title": "What are ET Masterclasses and how to enroll?",
        "content": """ET Masterclass offers expert-led video courses on personal finance and investing.

Available courses:
- "Fundamentals of Stock Investing" - 8 modules, 4 hours (Price: ₹3,999)
- "Mutual Fund Mastery" - 6 modules, 3 hours (Price: ₹2,999)
- "Derivatives & Options Trading" - 10 modules, 6 hours (Price: ₹7,999)
- "Real Estate Investment" - 5 modules, 2.5 hours (Price: ₹3,499)
- "Tax Planning for Salaried Employees" - 4 modules, 2 hours (Price: ₹1,999)

How to enroll:
1. Visit economictimes.indiatimes.com/masterclass
2. Choose your course
3. Pay via UPI, card, or net banking
4. Access course videos on ET app or website (no expiry)
5. Download certificate on completion

ET Prime subscribers get 15% discount on all Masterclass courses.
Group discounts available for corporates (5+ employees).""",
        "source_type": "faq",
        "product": "ET_MASTERCLASS",
        "category": "enrollment",
    },
]

SEED_PRODUCTS = [
    {
        "title": "ET Prime - Premium Business & Financial Journalism",
        "content": """ET Prime is the premium tier of Economic Times, India's #1 financial newspaper.

Subscription includes:
- Unlimited access to all ET Prime exclusive stories
- 1,500+ curated stories published every month
- Deep dives into sectors: Technology, Banking, FMCG, Auto, Pharma
- Investment strategies from top fund managers
- Weekly ET Prime Weekend edition

Why choose ET Prime:
- Used by 100,000+ working professionals and investors
- Trusted by India's top CXOs and investment managers
- Ground-breaking investigative financial journalism
- Mobile-first design with offline reading

Annual subscription: ₹1,499. Monthly: ₹199. Free 30-day trial available.
Best for: knowledge-focused investors, business professionals, researchers""",
        "source_type": "product",
        "product_code": "ET_PRIME",
        "category": "premium_content",
    },
]


def seed_vector_store():
    """Populate ChromaDB with seed documents."""
    from src.rag.ingestion.content_processor import process_document
    from src.rag.ingestion.embedder import embed_batch
    from src.rag.ingestion.vector_store import get_vector_store

    store = get_vector_store()
    if not store.is_available:
        logger.error("Vector store not available. Start ChromaDB first.")
        return

    total_added = 0

    # Seed articles
    for article in SEED_ARTICLES:
        chunks = process_document(
            raw_content=article["content"],
            title=article["title"],
            source_type=article["source_type"],
            source_id=article["title"][:50],
            extra_metadata={"category": article.get("category", "general"), "tags": article.get("tags", [])},
        )
        texts = [c.text for c in chunks]
        embeddings = embed_batch(texts)
        ids = [f"article_{c.chunk_id}" for c in chunks]
        metadatas = [c.metadata for c in chunks]
        store.add_documents("et_articles", texts, embeddings, metadatas, ids)
        total_added += len(chunks)
        logger.info(f"Seeded article: '{article['title'][:50]}' ({len(chunks)} chunks)")

    # Seed FAQs
    for faq in SEED_FAQS:
        chunks = process_document(
            raw_content=faq["content"],
            title=faq["title"],
            source_type="faq",
            source_id=faq["title"][:50],
            extra_metadata={"product": faq.get("product", ""), "category": faq.get("category", "")},
        )
        texts = [c.text for c in chunks]
        embeddings = embed_batch(texts)
        ids = [f"faq_{c.chunk_id}" for c in chunks]
        metadatas = [c.metadata for c in chunks]
        store.add_documents("et_faqs", texts, embeddings, metadatas, ids)
        total_added += len(chunks)
        logger.info(f"Seeded FAQ: '{faq['title'][:50]}' ({len(chunks)} chunks)")

    # Seed products
    for prod in SEED_PRODUCTS:
        chunks = process_document(
            raw_content=prod["content"],
            title=prod["title"],
            source_type="product",
            source_id=prod.get("product_code", ""),
            extra_metadata={"product_code": prod.get("product_code"), "category": prod.get("category")},
        )
        texts = [c.text for c in chunks]
        embeddings = embed_batch(texts)
        ids = [f"prod_{c.chunk_id}" for c in chunks]
        metadatas = [c.metadata for c in chunks]
        store.add_documents("et_products", texts, embeddings, metadatas, ids)
        total_added += len(chunks)
        logger.info(f"Seeded product: '{prod['title'][:50]}' ({len(chunks)} chunks)")

    logger.info(f"Seeding complete. Total chunks added: {total_added}")
    return total_added


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_vector_store()
