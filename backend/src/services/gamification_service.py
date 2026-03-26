from sqlalchemy.orm import Session
from src.database.models import UserXP, Achievement, Streak
from typing import Dict, Any, List
from uuid import UUID
from datetime import datetime, timedelta

class GamificationService:
    def __init__(self, db: Session):
        self.db = db
        self.LEVELS = [
            {"level": 1, "name": "Financial Novice", "xp_required": 0, "badge": "🌱"},
            {"level": 2, "name": "Market Explorer", "xp_required": 500, "badge": "🔍"},
            {"level": 3, "name": "Smart Saver", "xp_required": 1500, "badge": "💡"},
            {"level": 4, "name": "Equity Enthusiast", "xp_required": 3500, "badge": "📈"},
            {"level": 5, "name": "Wealth Builder", "xp_required": 7000, "badge": "🏗️"},
            {"level": 6, "name": "Market Analyst", "xp_required": 15000, "badge": "📊"},
            {"level": 7, "name": "ET Investor", "xp_required": 30000, "badge": "🦅"}
        ]
        
        self.XP_ACTIONS = {
            "daily_login": 10,
            "read_article": 15,
            "complete_ai_conversation": 25,
            "update_profile": 30,
            "complete_masterclass_module": 100,
            "add_watchlist": 20,
            "refer_verified": 500,
            "first_investment": 200,
            "7_day_streak": 150
        }

    def process_xp_event(self, user_id: UUID, action: str) -> Dict[str, Any]:
        xp_to_add = self.XP_ACTIONS.get(action, 0)
        if xp_to_add == 0:
            return {"added": False, "reason": "invalid_action"}
            
        user_xp = self.db.query(UserXP).filter(UserXP.user_id == user_id).first()
        if not user_xp:
            user_xp = UserXP(user_id=user_id, total_xp=0, current_level=1)
            self.db.add(user_xp)
            
        old_level = user_xp.current_level
        user_xp.total_xp += xp_to_add
        
        # Determine new level
        new_level = 1
        for level_def in reversed(self.LEVELS):
            if user_xp.total_xp >= level_def["xp_required"]:
                new_level = level_def["level"]
                break
                
        user_xp.current_level = new_level
        user_xp.updated_at = datetime.utcnow()
        self.db.commit()
        
        return {
            "added": True,
            "xp_added": xp_to_add,
            "total_xp": user_xp.total_xp,
            "leveled_up": new_level > old_level,
            "new_level": new_level
        }

    def process_streak(self, user_id: UUID, streak_type: str = "Learning Streak") -> Dict[str, Any]:
        streak = self.db.query(Streak).filter(Streak.user_id == user_id, Streak.streak_type == streak_type).first()
        now = datetime.utcnow()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        if not streak:
            streak = Streak(user_id=user_id, streak_type=streak_type, current_count=1, longest_count=1, last_activity_at=now)
            self.db.add(streak)
            self.db.commit()
            return {"streak_active": True, "count": 1}
            
        # Check if they already logged today
        last_activity = streak.last_activity_at.replace(hour=0, minute=0, second=0, microsecond=0)
        delta = (today - last_activity).days
        
        if delta == 0:
            return {"streak_active": True, "count": streak.current_count, "already_logged": True}
        elif delta == 1:
            streak.current_count += 1
            if streak.current_count > streak.longest_count:
                streak.longest_count = streak.current_count
        else:
            if getattr(streak, 'shields_available', 0) > 0:
                streak.shields_available -= 1
                streak.current_count += 1 # Continue streak
            else:
                streak.current_count = 1
                
        streak.last_activity_at = now
        self.db.commit()
        
        return {"streak_active": True, "count": streak.current_count, "shields_left": getattr(streak, 'shields_available', 0)}
