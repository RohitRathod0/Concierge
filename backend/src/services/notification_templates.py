"""
Smart notification templates — cheesy, human-convincing re-engagement copy.
Each trigger type returns a dict with title, body, icon, url, and tag.
"""
from datetime import datetime
from typing import Optional

def ipo_fomo(ipo_name: str = "This Hot IPO", gmp: float = 38.0, hours_left: int = 48, applications: int = 47000) -> dict:
    return {
        "title": f"🚨 FOMO Alert! {ipo_name} Closes in {hours_left}h",
        "body": f"{applications:,}+ applications already submitted! Analysts project {gmp:.0f}% listing gains. Are YOU in? ⚡",
        "icon": "/et-logo.png",
        "badge": "/et-logo.png",
        "tag": "ipo_fomo",
        "url": "/ipo",
        "data": {"type": "ipo_fomo", "ipo_name": ipo_name},
        "actions": [
            {"action": "view_ipo", "title": "Check IPO Now →"},
            {"action": "dismiss", "title": "Remind me later"}
        ]
    }

def course_nudge(user_name: str = "Friend", course_title: str = "Your Masterclass", progress_pct: int = 0, amount_paid: int = 999) -> dict:
    if progress_pct == 0:
        body = f"Your seat is getting cold 🥶 While you were MIA, others in '{course_title}' are already 3 modules ahead! ₹{amount_paid} spent — don't waste it!"
    else:
        body = f"You're {progress_pct}% done with '{course_title}'! The next module reveals the #1 stock-picking secret. Just 15 mins to unlock it! 🎯"
    return {
        "title": f"😴 {user_name}, your classmates left you behind!",
        "body": body,
        "icon": "/et-logo.png",
        "badge": "/et-logo.png",
        "tag": "course_nudge",
        "url": "/masterclass",
        "data": {"type": "course_nudge"},
        "actions": [
            {"action": "continue", "title": "Continue Learning 🎓"},
            {"action": "dismiss", "title": "Later"}
        ]
    }

def re_engagement_3day(user_name: str = "Investor", nifty_move: float = 340.5, days_away: int = 3, new_ipos: int = 2) -> dict:
    direction = "💹 rallied" if nifty_move > 0 else "📉 dropped"
    return {
        "title": f"🏦 {user_name}, the market moved while you were away!",
        "body": f"Nifty {direction} {abs(nifty_move):.0f} pts in {days_away} days. {new_ipos} new IPOs opened. Your portfolio isn't watching itself — are you? 👀",
        "icon": "/et-logo.png",
        "badge": "/et-logo.png",
        "tag": "re_engagement",
        "url": "/dashboard",
        "data": {"type": "re_engagement"},
        "actions": [
            {"action": "open_dashboard", "title": "See What I Missed →"},
            {"action": "dismiss", "title": "Snooze 1 day"}
        ]
    }

def re_engagement_7day(user_name: str = "Investor") -> dict:
    return {
        "title": f"💔 {user_name}, we miss you! (And so does your money)",
        "body": "It's been a week. The smart investors you're competing with? They've been on ET Prime every single day. Ready to catch up? 🚀",
        "icon": "/et-logo.png",
        "badge": "/et-logo.png",
        "tag": "re_engagement_7d",
        "url": "/dashboard",
        "data": {"type": "re_engagement_7day"},
        "actions": [
            {"action": "come_back", "title": "I'm Back! 💪"},
            {"action": "dismiss", "title": "Not now"}
        ]
    }

def flash_sale(hours_left: int = 48, original_price: int = 199, sale_price: int = 49, buyers_count: int = 2341) -> dict:
    discount_pct = round((1 - sale_price/original_price) * 100)
    return {
        "title": f"⚡ {discount_pct}% OFF — ET Prime FLASH SALE ({hours_left}h only!)",
        "body": f"₹{sale_price}/month instead of ₹{original_price}! {buyers_count:,} smart investors grabbed it in the last 2 hrs. Only a few slots left! 🔥",
        "icon": "/et-logo.png",
        "badge": "/et-logo.png",
        "tag": "flash_sale",
        "url": "/et-prime",
        "data": {"type": "flash_sale", "sale_price": sale_price},
        "actions": [
            {"action": "grab_deal", "title": f"Grab ₹{sale_price}/month Deal 🔥"},
            {"action": "dismiss", "title": "I'll pay full price later 🤡"}
        ]
    }

def news_digest(article_title: str = "Market Update", articles_missed: int = 5, category: str = "markets") -> dict:
    emojis = {"ipo": "🚀", "markets": "📈", "tax": "🧾", "crypto": "₿", "mutual_funds": "💰", "global": "🌍"}
    emoji = emojis.get(category, "📰")
    return {
        "title": f"{emoji} You missed {articles_missed} stories that could affect your money!",
        "body": f"Latest: '{article_title[:50]}...' + {articles_missed - 1} more. The market doesn't pause for anyone. Catch up in 3 minutes! ⏱️",
        "icon": "/et-logo.png",
        "badge": "/et-logo.png",
        "tag": "news_digest",
        "url": "/news",
        "data": {"type": "news_digest"},
        "actions": [
            {"action": "read_news", "title": "Read Now 📰"},
            {"action": "dismiss", "title": "Tomorrow"}
        ]
    }

def masterclass_reminder(course_title: str, days_until: int = 1) -> dict:
    if days_until == 0:
        urgency = "🔴 STARTING IN A FEW HOURS!"
        body = f"'{course_title}' starts TODAY! Don't be that person who paid and didn't show up. Your money is waiting to be worth it! ⏰"
    elif days_until == 1:
        urgency = "📅 TOMORROW!"
        body = f"'{course_title}' is TOMORROW! Mark your calendar, set 3 alarms, tell your spouse. This one will change how you invest. 💡"
    else:
        urgency = f"📅 {days_until} days away"
        body = f"'{course_title}' starts in {days_until} days. Prepare to 10x your market knowledge 🎯"
    return {
        "title": f"Your Masterclass reminder — {urgency}",
        "body": body,
        "icon": "/et-logo.png",
        "badge": "/et-logo.png",
        "tag": "masterclass_reminder",
        "url": "/masterclass",
        "data": {"type": "masterclass_reminder"},
        "actions": [
            {"action": "view_course", "title": "View My Course 🎓"},
            {"action": "dismiss", "title": "Got it!"}
        ]
    }

def portfolio_alert(symbol: str = "RELIANCE", change_pct: float = -5.2) -> dict:
    if change_pct < -3:
        return {
            "title": f"🔴 Alert: {symbol} dropped {abs(change_pct):.1f}% today!",
            "body": f"{symbol} is having a bad day. Time to review your position? AI-powered analysis of your portfolio waiting → 📊",
            "icon": "/et-logo.png",
            "badge": "/et-logo.png",
            "tag": f"portfolio_alert_{symbol}",
            "url": "/portfolio",
            "data": {"type": "portfolio_alert", "symbol": symbol}
        }
    else:
        return {
            "title": f"🟢 {symbol} surged {change_pct:.1f}%! Book profits?",
            "body": f"{symbol} is flying! Our AI says this could be a good time to book partial profits. See the analysis → 📈",
            "icon": "/et-logo.png",
            "badge": "/et-logo.png",
            "tag": f"portfolio_alert_{symbol}",
            "url": "/portfolio",
            "data": {"type": "portfolio_alert", "symbol": symbol}
        }

# Registry of all templates for the simulate endpoint
TEMPLATE_REGISTRY = {
    "ipo_fomo": lambda: ipo_fomo("Ola Electric", 42.0, 36, 52000),
    "course_nudge": lambda: course_nudge("Investor", "Stock Market Mastery 2026", 15, 1499),
    "re_engagement_3d": lambda: re_engagement_3day("Investor", 340.5, 3, 2),
    "re_engagement_7d": lambda: re_engagement_7day(),
    "flash_sale": lambda: flash_sale(48, 199, 49, 2341),
    "news_digest": lambda: news_digest("Nifty 50 hits all-time high as FII inflows surge", 5, "markets"),
    "masterclass_reminder": lambda: masterclass_reminder("Stock Market Mastery 2026", 1),
    "portfolio_alert": lambda: portfolio_alert("RELIANCE", -4.8),
}
