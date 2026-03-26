from typing import List, Dict, Any

class ContentDiversityService:
    def __init__(self):
        pass

    def apply_diversity_rules(self, cards: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        diversified_feed = []
        last_type = None
        cross_sell_count = 0
        
        for card in cards:
            if card["type"] == last_type:
                continue 
                
            if card["type"] == "CROSS_SELL_NATIVE":
                if cross_sell_count > 0 and len(diversified_feed) < 6:
                    continue 
                cross_sell_count += 1
                
            diversified_feed.append(card)
            last_type = card["type"]
            
        return diversified_feed
