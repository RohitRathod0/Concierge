import json
from src.database.models import User, ProfileVersion

class ProfileServiceMatcherAgent:
    def __init__(self):
        # Static mapping definition as per specifications
        self.rules = {
            "beginner_investor": {
                "condition": lambda profile: profile.get('investment_experience') == 'beginner' or 'learn investing' in str(profile.get('financial_goals', '')).lower() or profile.get('age_group') in ['18-25', '26-30'],
                "services": [
                    {
                        "service": "ET Prime - Beginner's Stock Market Guide",
                        "reason": "You're new to investing. This guide breaks down complex concepts into simple steps.",
                        "value": "Avoid costly beginner mistakes that cost average investors ₹87K in first year.",
                        "urgency": "Start learning before you invest - knowledge is protection.",
                        "cta": "Start Free Trial - First Week FREE"
                    },
                    {
                        "service": "Masterclass: Stock Market Basics",
                        "reason": "Learn from experts who've built ₹100Cr+ portfolios from scratch.",
                        "value": "2-hour masterclass = 6 months of trial-and-error saved.",
                        "urgency": "Next batch starts in 3 days - Limited to 50 students.",
                        "cta": "Reserve Your Seat - ₹999 Only"
                    }
                ]
            },
            "tech_professional": {
                "condition": lambda profile: any(x in str(profile.get('occupation', '')).lower() for x in ['engineer', 'developer', 'tech', 'software']),
                "services": [
                    {
                        "service": "ET Prime - Tech Sector Deep Dives",
                        "reason": "You understand tech. Get insider analysis on companies you know (TCS, Infosys, Wipro).",
                        "value": "Tech professionals using ET Prime identified Zomato's potential 6 months early.",
                        "urgency": "IPO season is here - don't miss the next unicorn.",
                        "cta": "Get Tech Sector Analysis - ₹99 First Month"
                    }
                ]
            },
            "experienced_trader": {
                "condition": lambda profile: profile.get('investment_experience') == 'advanced' or profile.get('risk_tolerance') == 'aggressive',
                "services": [
                    {
                        "service": "ET Prime - Advanced Trading Strategies",
                        "reason": "You're experienced. Get institutional-level analysis and insider reports.",
                        "value": "Access same research that fund managers pay ₹5L/year for.",
                        "urgency": "Market volatility = Opportunity for smart traders.",
                        "cta": "Upgrade to Premium Analysis - ₹2999/year"
                    }
                ]
            },
            "retirement_planner": {
                "condition": lambda profile: profile.get('age_group') in ['41-50', '50+'] or 'retirement' in str(profile.get('financial_goals', '')).lower(),
                "services": [
                    {
                        "service": "ET Prime - Retirement Planning Toolkit",
                        "reason": "Calculate exact amount needed for comfortable retirement + safe investment plan.",
                        "value": "Users who started planning at 45 retired 5 years early with 30% more corpus.",
                        "urgency": "Every year of delay costs ₹5L in retirement savings.",
                        "cta": "Start Planning Now - FREE Retirement Calculator"
                    }
                ]
            }
        }

    def analyze_profile(self, user_profile: dict) -> list:
        if not user_profile:
            return [{
                "service": "ET Prime - Comprehensive Market Coverage",
                "reason": "Stay ahead of the market with our general financial insights.",
                "value": "Access premium insights used by 2 Lakh+ successful investors.",
                "urgency": "The market waits for no one.",
                "cta": "Start ET Prime - ₹99 First Month"
            }]

        recommendations = []
        for persona, config in self.rules.items():
            if config['condition'](user_profile):
                recommendations.extend(config['services'])
        
        # Deduplicate
        seen = set()
        final_recs = []
        for r in recommendations:
            if r['service'] not in seen:
                seen.add(r['service'])
                final_recs.append(r)
                
        if not final_recs:
            final_recs = [{
                "service": "ET Prime - Comprehensive Market Coverage",
                "reason": "Stay ahead of the market with our general financial insights.",
                "value": "Access premium insights used by 2 Lakh+ successful investors.",
                "urgency": "The market waits for no one.",
                "cta": "Start ET Prime - ₹99 First Month"
            }]
            
        return final_recs[:3]
        
    def get_recommendations_post_answer(self, user_profile: dict, user_question: str = "", ai_answer: str = "") -> list:
        recs = self.analyze_profile(user_profile)
        
        question_lower = user_question.lower()
        
        if "sip" in question_lower or "mutual fund" in question_lower:
            recs.insert(0, {
                "service": "ET Prime - Best Mutual Funds 2026",
                "reason": "Interested in SIPs? Expert-rated funds that beat the benchmark by 4-6%.",
                "value": "Find funds that generate 18% returns.",
                "urgency": "Start your SIP today to maximize compounding.",
                "cta": "See Top Funds - FREE Preview"
            })
            
        elif "ipo" in question_lower:
            recs.insert(0, {
                "service": "ET Prime - IPO Analysis & Ratings",
                "reason": "Expert view on every IPO - Subscribe or Skip?",
                "value": "Get detailed reports before your money gets locked.",
                "urgency": "Next major IPO closes in 2 days.",
                "cta": "Get IPO Reports - ₹99/month"
            })
            
        elif "tax" in question_lower or "80c" in question_lower:
            recs.insert(0, {
                "service": "ET Prime - Complete Tax Saving Guide FY26",
                "reason": "Save up to ₹46,800 in taxes legally.",
                "value": "Includes calculators and exact sections to claim.",
                "urgency": "Financial Year closes soon - optimize now.",
                "cta": "Get Tax Guide - ₹99 Only"
            })
            
        # Deduplicate and return top 3
        seen = set()
        final_recs = []
        for r in recs:
            if r['service'] not in seen:
                seen.add(r['service'])
                final_recs.append(r)
        
        return final_recs[:3]

matcher_agent = ProfileServiceMatcherAgent()
