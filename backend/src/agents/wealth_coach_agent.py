from typing import Dict, Any, List
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

class WealthCoachAgent:
    """
    Phase 3: The proactive WealthCoach Agent that conducts weekly check-ins,
    monitors goal progress, and ties financial health score dimensions into friendly advice.
    """
    def __init__(self, llm_client=None):
        self.llm = llm_client # Placeholder for LLM injection
        self.system_prompt = """
        You are the ET Wealth Coach, a proactive, encouraging financial mentor.
        Tone: Friendly, authoritative but accessible, celebrating small wins.
        Primary goal: Conduct weekly check-ins, discuss the user's Financial Health Score,
        and provide highly actionable next steps without being pushy.
        """

    def generate_weekly_checkin(self, user_name: str, health_score: Dict[str, Any], recent_activity: List[Dict[str, str]]) -> str:
        """Generates the opening message for a weekly check-in."""
        score_val = health_score.get("total_score", 0)
        
        # Build prompt context
        context = f"User: {user_name}\n"
        context += f"Current Health Score: {score_val}/850\n"
        gap = ""
        if health_score.get("emergency_fund_score", 0) < 100:
            gap = "Emergency Fund needs attention."
        elif health_score.get("diversification_score", 0) < 150:
            gap = "Portfolio needs better diversification."
            
        context += f"Primary Gap: {gap}\n"
        context += f"Recent Wins: {recent_activity}\n"
        
        # Simulated LLM generation
        message = f"Hi {user_name}! Happy Sunday! You've had a great week — I noticed you completed 2 learning modules. "
        message += f"Your Financial Health Score is holding steady at {score_val}. "
        if gap:
            message += f"I see your {gap.lower()} Let's tackle that this week. Ready for a quick 2-minute review?"
        else:
            message += "You're doing fantastic across all dimensions. Want to look at advanced growth strategies today?"
            
        return message

    def handle_coach_conversation(self, user_id: str, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Handles multi-turn coaching dialogue."""
        logger.info(f"Coach Agent processing message for {user_id}")
        # Simulated LLM response
        response = "That makes sense. Even starting with ₹500 a month into a liquid fund builds the habit. Should we set up a reminder for your next payday?"
        return {
            "role": "assistant",
            "content": response,
            "suggested_actions": ["Set Reminder", "Tell me more about Liquid Funds"]
        }
