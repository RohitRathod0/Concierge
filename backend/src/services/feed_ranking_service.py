from sqlalchemy.orm import Session
from src.database.models import UserIdentityScore, CrossSellQueue, NudgeEvent
from typing import List, Dict, Any
from uuid import UUID

import random

class FeedRankingService:
    def __init__(self, db: Session):
        self.db = db

    def get_fallback_feed(self) -> List[Dict[str, Any]]:
        # Fallback cards from Phase H requirements
        cards = [
            { "card_id": "fb1", "priority": 100, "type": "MARKET_ALERT", "title": "Market Pulse", "content": "Nifty50 is trading at 22,450. AI signal: IT Sector showing momentum.", "source": "live_market_api", "cta": "View Markets", "cta_url": "/markets" },
            { "card_id": "fb2", "priority": 95, "type": "IPO_CARD", "title": "IPO This Week", "content": "2 IPOs open for subscription this week. AI rating: Strong Apply for Swiggy.", "source": "ipo_service", "cta": "View IPO Details", "cta_url": "/ipo" },
            { "card_id": "fb3", "priority": 90, "type": "LEARNING_CARD", "title": "Did You Know?", "content": "Investors who review their portfolio weekly earn 23% more than those who check monthly. Start your review →", "cta": "Open Portfolio Tracker", "cta_url": "/markets" },
            { "card_id": "fb4", "priority": 85, "type": "MASTERCLASS_TEASER", "title": "Most Popular This Week", "content": "'Stock Market Basics' masterclass — 1,240 enrolled this month. Free preview available.", "cta": "Watch Free Preview", "cta_url": "/masterclass" },
            { "card_id": "fb5", "priority": 80, "type": "SOCIAL_PROOF", "title": "Trending on ET", "content": "234 investors in your city are tracking Reliance Industries today.", "cta": "Add to Watchlist", "cta_url": "/markets" },
            { "card_id": "fb6", "priority": 75, "type": "CROSS_SELL_PRIME", "title": "Exclusive for ET Prime Members", "content": "Today's exclusive: Expert stock pick with full buy/sell analysis. 47 members viewed this.", "cta": "Unlock with ET Prime", "cta_url": "/et-prime" },
            { "card_id": "fb7", "priority": 70, "type": "FINANCIAL_TIP", "title": "Smart Money Tip", "content": "SIP of ₹5,000/month for 20 years at 12% returns = ₹49.9 Lakhs. Start your SIP today.", "cta": "Start SIP Planning", "cta_url": "/financial-services" },
            { "card_id": "fb8", "priority": 65, "type": "PROFILE_NUDGE", "title": "Unlock Full Personalization", "content": "Your feed is showing generic content. Complete your profile in 2 min to see picks matched to your goals.", "cta": "Complete Profile", "cta_url": "/onboarding" }
        ]
        
        # Shuffle a copy, then sort to somewhat randomize but still keep the nudge at the bottom or random
        shuffled = cards[:]
        random.shuffle(shuffled)
        return shuffled

    def generate_feed(self, user_id: UUID, time_of_day: str) -> List[Dict[str, Any]]:
        identity = self.db.query(UserIdentityScore).filter(UserIdentityScore.user_id == user_id).first()
        if not identity:
            return self.get_fallback_feed()
            
        segment = getattr(identity, 'engagement_archetype', "News Reader")
        
        cards = []
        
        if time_of_day == "morning":
            cards.append({"card_id": "c1", "type": "MARKET_ALERT", "priority": 100, "content": "Markets open in 30 mins."})
        elif time_of_day == "evening":
            cards.append({"card_id": "c2", "type": "LEARNING_CARD", "priority": 90, "content": "Masterclass on value investing."})
            
        cards.append({"card_id": "c3", "type": "PEER_INSIGHT", "priority": 80, "content": "Investors like you are watching ITC."})
        cards.append({"card_id": "c4", "type": "STREAK_REMINDER", "priority": 75, "content": "You're on a 3-day learning streak!"})
        
        queue_item = self.db.query(CrossSellQueue).filter(CrossSellQueue.user_id == user_id, CrossSellQueue.readiness_score > 60).first()
        if queue_item:
            cards.append({"card_id": "c5", "type": "CROSS_SELL_NATIVE", "priority": 85, "content": "Recommended for your portfolio: ET Prime."})
            
        cards.append({"card_id": "c6", "type": "SOCIAL_PROOF_STORY", "priority": 50, "content": "Rahul from Pune just enrolled in Stock Trading."})
        
        cards.sort(key=lambda x: x["priority"], reverse=True)
        return cards
