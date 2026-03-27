"""
Notification API Routes
- POST /subscribe      → Register browser push subscription
- GET  /vapid-key      → Provide VAPID public key for browser
- GET  /history        → User's notification history  
- POST /mark-read/{id} → Mark notification as read
- POST /simulate/{trigger} → Fire a test notification immediately
- GET  /stats          → Number of active subscriptions
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from src.database.connection import get_db
from src.database.models import PushSubscription, NotificationLog, User
from src.services.notification_service import get_vapid_public_key, send_push_notification, broadcast_notification
from src.services.notification_templates import TEMPLATE_REGISTRY
from pydantic import BaseModel
from typing import Optional
import uuid, logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notifications", tags=["notifications"])

# ---- Schemas ----
class PushSubscriptionCreate(BaseModel):
    endpoint: str
    p256dh: str
    auth: str
    user_agent: Optional[str] = None

class SimulateRequest(BaseModel):
    user_id: Optional[str] = None  # If None, send to all active subscriptions

# ---- Routes ----

def ensure_notification_tables(db: Session):
    bind = db.get_bind()
    PushSubscription.__table__.create(bind=bind, checkfirst=True)
    NotificationLog.__table__.create(bind=bind, checkfirst=True)

@router.get("/vapid-key")
def get_vapid_key():
    key = get_vapid_public_key()
    if not key:
        raise HTTPException(status_code=503, detail="VAPID keys not initialized")
    return {"public_key": key}

@router.post("/subscribe")
def subscribe(
    payload: PushSubscriptionCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Register a browser push subscription (upsert by endpoint)."""
    ensure_notification_tables(db)
    existing = db.query(PushSubscription).filter(
        PushSubscription.endpoint == payload.endpoint
    ).first()
    if existing:
        existing.p256dh_key = payload.p256dh
        existing.auth_key = payload.auth
        existing.is_active = True
        existing.last_used_at = datetime.now(timezone.utc)
        db.commit()
        return {"status": "updated", "id": str(existing.id)}
    sub = PushSubscription(
        endpoint=payload.endpoint,
        p256dh_key=payload.p256dh,
        auth_key=payload.auth,
        user_agent=payload.user_agent or str(request.headers.get("user-agent", ""))[:300],
        is_active=True,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    logger.info(f"New push subscription registered: {payload.endpoint[:60]}...")
    return {"status": "subscribed", "id": str(sub.id)}

@router.post("/unsubscribe")
def unsubscribe(payload: PushSubscriptionCreate, db: Session = Depends(get_db)):
    ensure_notification_tables(db)
    sub = db.query(PushSubscription).filter(PushSubscription.endpoint == payload.endpoint).first()
    if sub:
        sub.is_active = False
        db.commit()
    return {"status": "unsubscribed"}

@router.get("/history")
def get_notification_history(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    try:
        ensure_notification_tables(db)
        logs = db.query(NotificationLog).order_by(NotificationLog.sent_at.desc()).limit(limit).all()
        return {
            "notifications": [
                {
                    "id": str(n.id),
                    "trigger_type": n.trigger_type,
                    "title": n.title,
                    "body": n.body,
                    "is_read": n.is_read,
                    "sent_at": n.sent_at.isoformat(),
                }
                for n in logs
            ]
        }
    except SQLAlchemyError as e:
        logger.warning("Notification history unavailable: %s", e)
        return {"notifications": []}

@router.post("/mark-read/{log_id}")
def mark_read(log_id: str, db: Session = Depends(get_db)):
    ensure_notification_tables(db)
    log = db.query(NotificationLog).filter(NotificationLog.id == uuid.UUID(log_id)).first()
    if log:
        log.is_read = True
        db.commit()
    return {"status": "ok"}

@router.post("/simulate/{trigger_name}")
def simulate_notification(trigger_name: str, db: Session = Depends(get_db)):
    """Immediately fire a test notification to all active subscriptions."""
    ensure_notification_tables(db)
    if trigger_name not in TEMPLATE_REGISTRY:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown trigger. Available: {list(TEMPLATE_REGISTRY.keys())}"
        )
    payload = TEMPLATE_REGISTRY[trigger_name]()
    subs = db.query(PushSubscription).filter(PushSubscription.is_active == True).all()
    if not subs:
        # Log it anyway for the in-app bell
        log = NotificationLog(
            trigger_type=trigger_name,
            title=payload.get("title", ""),
            body=payload.get("body", ""),
        )
        db.add(log)
        db.commit()
        return {"status": "no_subscribers", "payload": payload, "message": "No active push subscriptions. Allow browser notifications first. Notification logged for in-app bell."}

    sub_infos = [s.get_subscription_info() for s in subs]
    result = broadcast_notification(sub_infos, payload)

    # Log to DB
    log = NotificationLog(trigger_type=trigger_name, title=payload.get("title", ""), body=payload.get("body", ""))
    db.add(log)
    db.commit()

    return {"status": "sent", "trigger": trigger_name, "payload": payload, **result}

@router.get("/stats")
def notification_stats(db: Session = Depends(get_db)):
    try:
        ensure_notification_tables(db)
        active_subs = db.query(PushSubscription).filter(PushSubscription.is_active == True).count()
        total_sent = db.query(NotificationLog).count()
        unread = db.query(NotificationLog).filter(NotificationLog.is_read == False).count()
        return {
            "active_subscriptions": active_subs,
            "total_sent": total_sent,
            "unread": unread,
            "vapid_ready": bool(get_vapid_public_key()),
            "available_triggers": list(TEMPLATE_REGISTRY.keys()),
        }
    except SQLAlchemyError as e:
        logger.warning("Notification stats unavailable: %s", e)
        return {
            "active_subscriptions": 0,
            "total_sent": 0,
            "unread": 0,
            "vapid_ready": bool(get_vapid_public_key()),
            "available_triggers": list(TEMPLATE_REGISTRY.keys()),
        }
