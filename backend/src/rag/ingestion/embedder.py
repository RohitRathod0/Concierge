"""
ET AI Concierge - Phase 2
RAG Embedder: generates sentence embeddings using sentence-transformers.
"""
import logging
import hashlib
import json
import os
from typing import List, Optional

logger = logging.getLogger(__name__)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIM = 384

try:
    from sentence_transformers import SentenceTransformer
    _model = SentenceTransformer(MODEL_NAME)
    _st_available = True
    logger.info(f"Embedder: sentence-transformers model loaded ({MODEL_NAME})")
except Exception as e:
    _st_available = False
    _model = None
    logger.warning(f"Embedder: sentence-transformers unavailable ({e}). Using random fallback.")

# Local embedding cache (in-memory, TTL not enforced here — use Redis for production)
_embed_cache: dict = {}


def _cache_key(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def embed_text(text: str) -> List[float]:
    """Generate embedding for a single text. Returns list of 384 floats."""
    key = _cache_key(text)
    if key in _embed_cache:
        return _embed_cache[key]

    if _st_available and _model:
        try:
            embedding = _model.encode(text, normalize_embeddings=True)
            result = embedding.tolist()
        except Exception as e:
            logger.error(f"embed_text failed: {e}")
            result = _random_embedding()
    else:
        result = _random_embedding()

    _embed_cache[key] = result
    return result


def embed_batch(texts: List[str], batch_size: int = 32) -> List[List[float]]:
    """Batch embed a list of texts efficiently."""
    if not texts:
        return []
    
    if _st_available and _model:
        try:
            uncached = []
            uncached_indices = []
            results = [None] * len(texts)
            
            for i, text in enumerate(texts):
                key = _cache_key(text)
                if key in _embed_cache:
                    results[i] = _embed_cache[key]
                else:
                    uncached.append(text)
                    uncached_indices.append(i)
            
            if uncached:
                embeddings = _model.encode(uncached, batch_size=batch_size, normalize_embeddings=True)
                for idx, (orig_idx, text) in enumerate(zip(uncached_indices, uncached)):
                    emb = embeddings[idx].tolist()
                    _embed_cache[_cache_key(text)] = emb
                    results[orig_idx] = emb
            
            return results
        except Exception as e:
            logger.error(f"embed_batch failed: {e}")

    return [_random_embedding() for _ in texts]


def embed_query(query: str) -> List[float]:
    """Embed a query string. Same as embed_text but semantically distinct for clarity."""
    return embed_text(query)


def _random_embedding() -> List[float]:
    """Zero-vector fallback when sentence-transformers is unavailable."""
    import random
    vec = [random.gauss(0, 0.1) for _ in range(EMBEDDING_DIM)]
    norm = sum(x**2 for x in vec) ** 0.5
    return [x / norm for x in vec] if norm > 0 else vec
