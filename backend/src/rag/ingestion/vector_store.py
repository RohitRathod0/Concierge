"""
ET AI Concierge - Phase 2
RAG Vector Store: ChromaDB interface for document storage and retrieval.
"""
import logging
import os
from typing import List, Optional, Dict, Any

logger = logging.getLogger(__name__)

CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8001"))

COLLECTIONS = ["et_articles", "et_products", "et_faqs", "conversation_history"]

try:
    import chromadb
    from chromadb.config import Settings
    _chroma_available = True
except ImportError:
    _chroma_available = False
    logger.warning("chromadb not installed; vector store unavailable")


class VectorStore:
    """
    ChromaDB-backed vector store with operations for all ET content collections.
    Falls back gracefully if ChromaDB is unavailable.
    """

    def __init__(self, host: str = CHROMA_HOST, port: int = CHROMA_PORT):
        self._client = None
        self._collections: Dict[str, Any] = {}
        
        if _chroma_available:
            try:
                self._client = chromadb.HttpClient(host=host, port=port)
                self._client.heartbeat()  # connectivity check
                self._initialize_collections()
                logger.info(f"VectorStore: connected to ChromaDB at {host}:{port}")
            except Exception as e:
                logger.warning(f"VectorStore: ChromaDB not reachable ({e}); using in-memory fallback")
                try:
                    self._client = chromadb.Client()  # in-memory
                    self._initialize_collections()
                    logger.info("VectorStore: using in-memory ChromaDB")
                except Exception as e2:
                    logger.error(f"VectorStore: in-memory fallback also failed: {e2}")
                    self._client = None

    def _initialize_collections(self):
        for name in COLLECTIONS:
            try:
                self._collections[name] = self._client.get_or_create_collection(
                    name=name,
                    metadata={"hnsw:space": "cosine"},
                )
                logger.debug(f"Collection '{name}' ready")
            except Exception as e:
                logger.error(f"Failed to init collection '{name}': {e}")

    @property
    def is_available(self) -> bool:
        return self._client is not None

    def add_documents(
        self,
        collection_name: str,
        texts: List[str],
        embeddings: List[List[float]],
        metadatas: List[dict],
        ids: List[str],
    ) -> bool:
        """Add documents with pre-computed embeddings to a collection."""
        if not self.is_available:
            return False
        collection = self._collections.get(collection_name)
        if not collection:
            logger.error(f"Collection '{collection_name}' not found")
            return False
        try:
            collection.upsert(
                documents=texts,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids,
            )
            return True
        except Exception as e:
            logger.error(f"add_documents failed for '{collection_name}': {e}")
            return False

    def search(
        self,
        collection_name: str,
        query_embedding: List[float],
        top_k: int = 5,
        where: Optional[dict] = None,
    ) -> List[dict]:
        """
        Vector similarity search.
        Returns list of dicts: {text, metadata, score, id}
        """
        if not self.is_available:
            return []
        collection = self._collections.get(collection_name)
        if not collection:
            return []
        try:
            kwargs = {
                "query_embeddings": [query_embedding],
                "n_results": min(top_k, collection.count() or top_k),
                "include": ["documents", "metadatas", "distances"],
            }
            if where:
                kwargs["where"] = where
            
            result = collection.query(**kwargs)
            
            documents = result.get("documents", [[]])[0]
            metadatas = result.get("metadatas", [[]])[0]
            distances = result.get("distances", [[]])[0]
            ids = result.get("ids", [[]])[0]

            return [
                {
                    "text": doc,
                    "metadata": meta,
                    "score": 1.0 - dist,  # cosine: convert distance to similarity
                    "id": doc_id,
                }
                for doc, meta, dist, doc_id in zip(documents, metadatas, distances, ids)
            ]
        except Exception as e:
            logger.error(f"search failed for '{collection_name}': {e}")
            return []

    def delete_documents(self, collection_name: str, ids: List[str]) -> bool:
        if not self.is_available:
            return False
        collection = self._collections.get(collection_name)
        if not collection:
            return False
        try:
            collection.delete(ids=ids)
            return True
        except Exception as e:
            logger.error(f"delete_documents failed: {e}")
            return False

    def collection_count(self, collection_name: str) -> int:
        collection = self._collections.get(collection_name)
        if not collection:
            return 0
        try:
            return collection.count()
        except Exception:
            return 0


# Singleton
_store: Optional[VectorStore] = None


def get_vector_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore()
    return _store
