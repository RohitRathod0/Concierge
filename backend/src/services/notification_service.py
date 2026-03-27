"""
Notification Service — handles Web Push via pywebpush VAPID.
VAPID keys are read from env vars or auto-generated on first run.
"""
import os
import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# ---- VAPID key management ----
_VAPID_PUBLIC_KEY: Optional[str] = None
_VAPID_PRIVATE_KEY: Optional[str] = None
_VAPID_INITIALIZED = False

def _init_vapid():
    global _VAPID_PUBLIC_KEY, _VAPID_PRIVATE_KEY, _VAPID_INITIALIZED
    if _VAPID_INITIALIZED:
        return
    _VAPID_INITIALIZED = True

    pub_env = os.getenv("VAPID_PUBLIC_KEY", "")
    priv_env = os.getenv("VAPID_PRIVATE_KEY", "")

    if pub_env and priv_env:
        _VAPID_PUBLIC_KEY = pub_env
        _VAPID_PRIVATE_KEY = priv_env
        logger.info("VAPID keys loaded from environment.")
        return

    # Auto-generate and cache in memory (restart = new keys, store in .env for persistence)
    try:
        from py_vapid import Vapid
        from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat, PrivateFormat, NoEncryption
        v = Vapid()
        v.generate_keys()
        _VAPID_PRIVATE_KEY = v.private_key.private_bytes(Encoding.PEM, PrivateFormat.PKCS8, NoEncryption()).decode()
        _VAPID_PUBLIC_KEY = v.public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint).hex()
        # Convert to URL-safe base64 for browser use
        import base64
        pub_bytes = v.public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
        _VAPID_PUBLIC_KEY = base64.urlsafe_b64encode(pub_bytes).rstrip(b'=').decode()
        logger.info("VAPID keys auto-generated (store in .env for persistence).")
        logger.info(f"VAPID_PUBLIC_KEY={_VAPID_PUBLIC_KEY}")
    except Exception as e:
        logger.error(f"VAPID key generation failed: {e}. Push notifications disabled.")
        _VAPID_PUBLIC_KEY = None
        _VAPID_PRIVATE_KEY = None

def get_vapid_public_key() -> Optional[str]:
    _init_vapid()
    return _VAPID_PUBLIC_KEY

def send_push_notification(subscription_info: Dict, payload: Dict[str, Any], ttl: int = 86400) -> bool:
    """Send a push notification to a browser subscription."""
    _init_vapid()
    if not _VAPID_PRIVATE_KEY:
        logger.warning("VAPID keys not initialized — push skipped.")
        return False
    try:
        from pywebpush import webpush, WebPushException
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(payload),
            vapid_private_key=_VAPID_PRIVATE_KEY,
            vapid_claims={
                "sub": f"mailto:{os.getenv('VAPID_CONTACT_EMAIL', 'admin@etconcierge.com')}",
            },
            ttl=ttl,
        )
        logger.info(f"Push sent: {payload.get('title', '')[:50]}")
        return True
    except Exception as e:
        logger.warning(f"Push send failed: {e}")
        return False

def broadcast_notification(subscriptions: list, payload: Dict[str, Any]) -> dict:
    """Send to all subscriptions, return success/fail counts."""
    success = 0
    failed = 0
    for sub in subscriptions:
        try:
            sub_info = sub if isinstance(sub, dict) else json.loads(sub)
            ok = send_push_notification(sub_info, payload)
            if ok:
                success += 1
            else:
                failed += 1
        except Exception as e:
            logger.warning(f"Broadcast item failed: {e}")
            failed += 1
    return {"sent": success, "failed": failed, "total": len(subscriptions)}
