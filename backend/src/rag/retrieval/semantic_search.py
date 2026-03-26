"""
ET AI Concierge - Phase 2
RAG Semantic Search: cosine similarity search over ChromaDB.
"""
import logging
from typing import List, Optional

from src.rag.ingestion.embedder import embed_query
from src.rag.ingestion.vector_store import get_vector_store

logger = logging.getLogger(__name__)

DEFAULT_TOP_K = 5
SCORE_THRESHOLD = 0.6


def semantic_search(
    query: str,
    collections: Optional[List[str]] = None,
    top_k: int = DEFAULT_TOP_K,
    score_threshold: float = SCORE_THRESHOLD,
    metadata_filter: Optional[dict] = None,
) -> List[dict]:
    """
    Perform semantic search across one or more ChromaDB collections.

    Args:
        query: Natural language query
        collections: List of collection names to search (defaults to all ET content)
        top_k: Max results per collection
        score_threshold: Minimum cosine similarity (0-1)
        metadata_filter: Optional ChromaDB where-filter

    Returns:
        Merged and sorted list of result dicts: {text, metadata, score, id, collection}
    """
    if not collections:
        collections = ["et_articles", "et_products", "et_faqs"]

    store = get_vector_store()
    if not store.is_available:
        logger.warning("semantic_search: vector store unavailable")
        return []

    query_embedding = embed_query(query)
    all_results = []

    for collection_name in collections:
        try:
            results = store.search(
                collection_name=collection_name,
                query_embedding=query_embedding,
                top_k=top_k,
                where=metadata_filter,
            )
            for r in results:
                r["collection"] = collection_name
                if r.get("score", 0) >= score_threshold:
                    all_results.append(r)
        except Exception as e:
            logger.error(f"semantic_search error for {collection_name}: {e}")

    # Sort by score descending and cap at top_k total
    all_results.sort(key=lambda x: x.get("score", 0), reverse=True)
    return all_results[:top_k]
