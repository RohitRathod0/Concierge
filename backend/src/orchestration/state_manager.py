"""
ET AI Concierge - Phase 2
StateManager: Redis (short-term) + PostgreSQL (long-term) conversation state persistence.
"""
import json
import logging
import time
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)

try:
    import redis as redis_lib
    _redis_available = True
except ImportError:
    _redis_available = False


class StateManager:
    """
    Manages conversation state:
    - Redis: current session state (TTL = 2 hours)  
    - PostgreSQL: persisted checkpoints via ConversationState model
    """

    def __init__(self, redis_url: Optional[str] = None, db_session=None):
        self._redis = None
        self._db = db_session
        if redis_url and _redis_available:
            try:
                self._redis = redis_lib.from_url(redis_url, decode_responses=True)
                self._redis.ping()
                logger.info("StateManager: Redis connected")
            except Exception as e:
                logger.warning(f"StateManager: Redis unavailable ({e}), using in-memory fallback")
                self._redis = None

        self._memory_cache: dict = {}  # fallback if Redis unavailable

    def save_state(self, session_id: str, state: dict, ttl_seconds: int = 7200) -> bool:
        """Save state to Redis (or memory fallback)."""
        key = f"session_state:{session_id}"
        try:
            serialized = json.dumps(state, default=str)
            if self._redis:
                self._redis.set(key, serialized, ex=ttl_seconds)
            else:
                self._memory_cache[key] = serialized
            return True
        except Exception as e:
            logger.error(f"save_state failed: {e}")
            return False

    def load_state(self, session_id: str) -> Optional[dict]:
        """Load state from Redis (or memory fallback)."""
        key = f"session_state:{session_id}"
        try:
            raw = None
            if self._redis:
                raw = self._redis.get(key)
            else:
                raw = self._memory_cache.get(key)
            return json.loads(raw) if raw else None
        except Exception as e:
            logger.error(f"load_state failed: {e}")
            return None

    def checkpoint_state(self, session_id: str, state: dict, checkpoint_id: Optional[str] = None) -> bool:
        """Persist a state checkpoint to PostgreSQL via the ConversationState model."""
        if not self._db:
            logger.warning("checkpoint_state: no DB session provided")
            return False
        try:
            from src.database.models import ConversationState
            import uuid as _uuid
            checkpoint = ConversationState(
                session_id=session_id,
                checkpoint_id=checkpoint_id or str(_uuid.uuid4()),
                state_data=state,
            )
            self._db.add(checkpoint)
            self._db.commit()
            return True
        except Exception as e:
            logger.error(f"checkpoint_state failed: {e}")
            if self._db:
                self._db.rollback()
            return False

    def load_latest_checkpoint(self, session_id: str) -> Optional[dict]:
        """Load the most recent checkpoint for a session from PostgreSQL."""
        if not self._db:
            return None
        try:
            from src.database.models import ConversationState
            checkpoint = (
                self._db.query(ConversationState)
                .filter(ConversationState.session_id == session_id)
                .order_by(ConversationState.created_at.desc())
                .first()
            )
            return checkpoint.state_data if checkpoint else None
        except Exception as e:
            logger.error(f"load_latest_checkpoint failed: {e}")
            return None

    def delete_state(self, session_id: str) -> bool:
        """Clean up session state from Redis."""
        key = f"session_state:{session_id}"
        try:
            if self._redis:
                self._redis.delete(key)
            else:
                self._memory_cache.pop(key, None)
            return True
        except Exception as e:
            logger.error(f"delete_state failed: {e}")
            return False
