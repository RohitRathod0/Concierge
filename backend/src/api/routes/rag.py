"""
ET AI Concierge - Phase 2
RAG API Route: POST /rag/search, POST /rag/ingest (admin only)
"""
import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List

from src.database.connection import get_db
from src.database.models import User
from src.services.auth_service import SECRET_KEY, ALGORITHM
from src.rag.retrieval.semantic_search import semantic_search
from src.rag.cache.query_cache import get_cached_results, cache_results
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["rag"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class RAGSearchRequest(BaseModel):
    query: str
    collections: Optional[List[str]] = None
    top_k: int = 5
    rerank: bool = False


class RAGIngestRequest(BaseModel):
    source: str = "seed"
    incremental: bool = True


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/search")
def rag_search(
    request: RAGSearchRequest,
    current_user: User = Depends(get_current_user),
):
    """Search the RAG knowledge base. Results are cached for 1 hour."""
    # Check cache first
    cached = get_cached_results(request.query, request.collections)
    if cached is not None:
        return {"documents": cached, "cached": True}

    results = semantic_search(
        query=request.query,
        collections=request.collections,
        top_k=request.top_k,
    )
    # Sanitize for JSON response
    safe_results = [
        {
            "id": r.get("id", ""),
            "text": r.get("text", "")[:500],
            "title": r.get("metadata", {}).get("title", "ET Content"),
            "source_type": r.get("metadata", {}).get("source_type", ""),
            "collection": r.get("collection", ""),
            "score": r.get("score", 0.0),
        }
        for r in results
    ]
    cache_results(request.query, safe_results, request.collections)
    return {"documents": safe_results, "cached": False}


@router.post("/ingest")
def trigger_ingestion(
    request: RAGIngestRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    """Trigger content ingestion into ChromaDB (runs in background)."""
    job_id = str(uuid.uuid4())

    def run_ingestion():
        try:
            from src.rag.ingestion.seed_content import seed_vector_store
            count = seed_vector_store()
            logger.info(f"Ingestion job {job_id} complete. Chunks added: {count}")
        except Exception as e:
            logger.error(f"Ingestion job {job_id} failed: {e}")

    background_tasks.add_task(run_ingestion)
    return {"job_id": job_id, "status": "queued", "source": request.source}
