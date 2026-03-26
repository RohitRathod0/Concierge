"""
ET AI Concierge - Phase 2
RAG Query Cache: Redis-backed caching for retrieval results.
"""
import hashlib
import json
import logging
import os
from typing import List, Optional

logger = logging.getLogger(__name__)

CACHE_TTL = int(os.getenv("RAG_CACHE_TTL_SECONDS", "3600"))  # 1 hour

try:
    import redis as redis_lib
    _redis_available = True
except ImportError:
    _redis_available = False

_memory_cache: dict = {}  # fallback


def _get_redis():
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    if _redis_available:
        try:
            client = redis_lib.from_url(redis_url, decode_responses=True)
            client.ping()
            return client
        except Exception:
            pass
    return None


_redis = _get_redis()


def _query_cache_key(query: str, collections: Optional[List[str]] = None) -> str:
    content = f"{query}:{sorted(collections or [])}"
    return f"rag:query:{hashlib.sha256(content.encode()).hexdigest()[:16]}"


def get_cached_results(query: str, collections: Optional[List[str]] = None) -> Optional[List[dict]]:
    """Retrieve cached search results. Returns None if cache miss."""
    key = _query_cache_key(query, collections)
    try:
        raw = _redis.get(key) if _redis else _memory_cache.get(key)
        return json.loads(raw) if raw else None
    except Exception as e:
        logger.debug(f"Cache get error: {e}")
        return None


def cache_results(
    query: str,
    results: List[dict],
    collections: Optional[List[str]] = None,
    ttl: int = CACHE_TTL,
) -> bool:
    """Cache search results. Returns True on success."""
    key = _query_cache_key(query, collections)
    try:
        serialized = json.dumps(results)
        if _redis:
            _redis.set(key, serialized, ex=ttl)
        else:
            _memory_cache[key] = serialized
        return True
    except Exception as e:
        logger.debug(f"Cache set error: {e}")
        return False


def invalidate_cache(query: str, collections: Optional[List[str]] = None) -> bool:
    """Invalidate a specific cached query result."""
    key = _query_cache_key(query, collections)
    try:
        if _redis:
            _redis.delete(key)
        else:
            _memory_cache.pop(key, None)
        return True
    except Exception as e:
        logger.debug(f"Cache invalidate error: {e}")
        return False
