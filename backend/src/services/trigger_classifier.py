from typing import Dict, Any, Optional

class TriggerClassifier:
    """Classifies user actions into 8 Phase 3 trigger types."""
    
    TRIGGERS = [
        "FOMO_TRIGGER",
        "LOSS_AVERSION_TRIGGER",
        "SOCIAL_PROOF_TRIGGER",
        "PROGRESS_NUDGE",
        "URGENCY_TRIGGER",
        "RECIPROCITY_TRIGGER",
        "IDENTITY_TRIGGER",
        "COMEBACK_TRIGGER"
    ]
    
    def classify_event(self, event_type: str, context: Dict[str, Any]) -> Optional[str]:
        if event_type == "read_article" and context.get("tag") == "high_growth_stock":
            return "FOMO_TRIGGER"
        elif event_type == "portfolio_simulation":
            return "LOSS_AVERSION_TRIGGER"
        elif event_type == "view_masterclass":
            return "SOCIAL_PROOF_TRIGGER"
        elif event_type == "course_progress" and context.get("completion", 0) >= 60:
            return "PROGRESS_NUDGE"
        elif event_type == "view_ipo":
            return "URGENCY_TRIGGER"
        elif event_type == "read_free_articles" and context.get("count", 0) >= 5:
            return "RECIPROCITY_TRIGGER"
        elif event_type == "profile_view" and context.get("segment") == "Serious Investor":
            return "IDENTITY_TRIGGER"
        elif event_type == "session_start" and context.get("days_since_last_session", 0) >= 3:
            return "COMEBACK_TRIGGER"
        return None
