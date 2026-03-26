"""
ET AI Concierge - Phase 2
Analytics Dashboard API Router.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from src.database.connection import get_db
from src.database.models import User
from src.services.auth_service import SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import func
from src.analytics.aggregator import (
    compute_engagement_metrics,
    compute_agent_metrics,
    compute_journey_metrics,
    compute_recommendation_metrics
)

router = APIRouter(prefix="/analytics", tags=["analytics"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    # NOTE: In production, add role check: if not user.is_admin: raise 403
    return user


@router.get("/engagement")
def get_engagement_dashboard(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get engagement metrics for the last N days."""
    metrics = compute_engagement_metrics(db, days)
    return {"metrics": metrics, "period_days": days}


@router.get("/agents")
def get_agent_performance(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get agent performance metrics."""
    agents = compute_agent_metrics(db, days)
    return {"agents": agents, "period_days": days}


@router.get("/journey")
def get_journey_stats(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get journey stage distribution and milestone rates."""
    metrics = compute_journey_metrics(db)
    return metrics


@router.get("/recommendations")
def get_recommendation_stats(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Get recommendation effectiveness metrics."""
    metrics = compute_recommendation_metrics(db, days)
    metrics["period_days"] = days
    return metrics
