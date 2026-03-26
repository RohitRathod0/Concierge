import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from src.analytics.event_tracker import event_tracker
import logging
from typing import Optional
import os
from jose import jwt

logger = logging.getLogger(__name__)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_super_secret_jwt_key_here")
ALGORITHM = "HS256"

def get_user_id_from_request(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
            return payload.get("sub")
        except Exception:
            return None
    return None

class EventTrackingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        duration_ms = (time.time() - start_time) * 1000
        endpoint = request.url.path
        method = request.method
        
        current_user_id = get_user_id_from_request(request)
        
        event_type = None
        event_data = {"duration_ms": duration_ms}
        
        if method == "POST" and "/chat/message" in endpoint:
            event_type = "message_sent"
        elif method == "POST" and "/chat/agent-message" in endpoint:
            event_type = "agent_message_sent"
        elif method == "GET" and "/profile" in endpoint:
            event_type = "profile_viewed"
        elif method == "PATCH" and "/profile" in endpoint:
            event_type = "profile_updated"
        elif method == "GET" and "/recommendations" in endpoint:
            event_type = "recommendations_viewed"
        elif method == "POST" and "/recommendations/feedback" in endpoint:
            event_type = "recommendation_clicked"
        elif method == "GET" and "/journey/current" in endpoint:
            event_type = "journey_viewed"
            
        if event_type and current_user_id:
            try:
                event_tracker.track(current_user_id, event_type, event_data)
            except Exception as e:
                logger.error(f"Failed to track event: {e}")
                
        return response
