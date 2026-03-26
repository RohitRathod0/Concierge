from sqlalchemy.orm import Session
from src.database.models import UserProfile, ETProduct, Recommendation
import uuid

def get_recommendations(db: Session, user_id: uuid.UUID, limit: int = 3):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    products = db.query(ETProduct).filter(ETProduct.is_active == True).all()
    
    recommendations = []
    for product in products:
        score = 0.0
        reason = ""
        
        target_segments = product.target_segments or []
        basename = product.name.lower()
        
        if profile and profile.primary_segment == "TECH_PROFESSIONAL_INVESTOR":
            if "prime" in basename:
                score += 0.91
                reason = "Tech professionals use Prime for market edge and exclusive company analysis"
            elif "basics" in basename:
                score += 0.68
                reason = "Great foundation for hands-on investing you likely want to do"
            elif "markets" in basename:
                score += 0.95
                reason = "Real-time data is essential for an active investor like you"
            elif "tax" in basename:
                score += 0.78
                reason = "High earners in tech benefit most from tax optimization strategies"
            else:
                score += 0.65
                reason = "Relevant for your tech career"
        else:
            if profile and profile.primary_segment in target_segments:
                score += 0.85
                reason = f"Strong match for {profile.primary_segment.replace('_', ' ').title()}"
            elif "all" in target_segments:
                score += 0.65
                reason = "Popular choice for all investors"
            
        if profile and getattr(product, 'category', '') == "events" and getattr(profile, 'interests', []):
            if "events" in profile.interests:
                score += 0.1
                reason += " and your interest in events"
        
        if score > 0:
            recommendations.append({
                "product": product,
                "score": min(score, 1.0),
                "reason": reason.strip()
            })
            
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    
    try:
        from src.analytics.event_tracker import event_tracker
        event_tracker.track(str(user_id), 'recommendations_viewed', {'count': len(recommendations[:limit])})
    except Exception:
        pass
        
    return recommendations[:limit]

def ensure_recommendation_record(db: Session, user_id: uuid.UUID, product_id: uuid.UUID, score: float, reason: str):
    rec = db.query(Recommendation).filter(
        Recommendation.user_id == user_id, 
        Recommendation.product_id == product_id
    ).first()
    
    if not rec:
        rec = Recommendation(
            user_id=user_id,
            product_id=product_id,
            score=score,
            reason=reason,
            recommender_algorithm="rule_based"
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
    return rec

def record_interaction(db: Session, user_id: uuid.UUID, recommendation_id: uuid.UUID, action: str):
    rec = db.query(Recommendation).filter(Recommendation.recommendation_id == recommendation_id, Recommendation.user_id == user_id).first()
    if rec:
        from datetime import datetime
        rec.interacted_at = datetime.utcnow()
        rec.status = action
        db.commit()
        try:
            from src.analytics.event_tracker import event_tracker
            event_tracker.track(str(user_id), 'recommendation_clicked', {
                'recommendation_id': str(recommendation_id), 
                'product_id': str(rec.product_id), 
                'action': action
            })
        except Exception:
            pass
    return rec
