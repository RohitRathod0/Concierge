import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, case
from typing import Optional
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

from src.database.connection import get_db
from src.database.models import IPO, IPOAlert, UserProfile, BehavioralSignal, User
from src.services.auth_service import SECRET_KEY, ALGORITHM
from src.api.routes.chat import get_current_user

router = APIRouter(prefix="/ipo", tags=["ipo"])

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_optional_current_user(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(User).filter(User.user_id == user_id).first()
        return user
    except JWTError:
        return None

@router.get("/list")
def list_ipos(
    status: Optional[str] = Query("all", description="status=open|upcoming|closed|listed|all"),
    limit: int = Query(20, ge=1, le=100),
    page: int = Query(1, ge=1),
    sector: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(IPO)
    
    if status and status != 'all':
        query = query.filter(IPO.status == status)
    if sector:
        query = query.filter(IPO.sector == sector)
        
    # Order by: open first, then upcoming (by open_date ASC), then closed, then listed
    status_order = case(
        (IPO.status == 'open', 1),
        (IPO.status == 'upcoming', 2),
        (IPO.status == 'closed', 3),
        (IPO.status == 'listed', 4),
        else_=5
    )
    
    total = query.count()
    query = query.order_by(status_order, IPO.open_date.asc())
    
    offset = (page - 1) * limit
    ipos = query.offset(offset).limit(limit).all()
    
    # Status counts
    counts = {
        "open": db.query(IPO).filter(IPO.status == 'open').count(),
        "upcoming": db.query(IPO).filter(IPO.status == 'upcoming').count(),
        "closed": db.query(IPO).filter(IPO.status == 'closed').count(),
        "listed": db.query(IPO).filter(IPO.status == 'listed').count(),
    }
    
    user_alert_ids = set()
    user_sector_interests = []
    
    if current_user:
        # Get user ipo alerts
        alerts = db.query(IPOAlert).filter(IPOAlert.user_id == current_user.user_id).all()
        user_alert_ids = {str(a.ipo_id) for a in alerts}
        
        # Get user profile for personalization score
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.user_id).first()
        if profile and profile.interested_sectors:
            user_sector_interests = profile.interested_sectors
            
    result = []
    for ipo in ipos:
        ipo_dict = {
            "id": str(ipo.id),
            "company_name": ipo.company_name,
            "sector": ipo.sector,
            "price_band_low": ipo.price_band_low,
            "price_band_high": ipo.price_band_high,
            "open_date": ipo.open_date,
            "close_date": ipo.close_date,
            "gmp_premium": ipo.gmp_premium,
            "gmp_percent": float(ipo.gmp_percent) if ipo.gmp_percent else 0.0,
            "et_rating": ipo.et_rating,
            "et_verdict": ipo.et_verdict,
            "lot_size": ipo.lot_size,
            "min_investment": ipo.min_investment,
            "status": ipo.status,
            "company_logo_url": ipo.company_logo_url,
        }
        
        if current_user:
            ipo_dict["user_has_alert"] = str(ipo.id) in user_alert_ids
            # Personalization score: simple sector match logic
            score = 50 
            if ipo.sector in user_sector_interests:
                score += 30
            if ipo.status == 'open':
                score += 20
            ipo_dict["personalization_score"] = min(100, score)
            
        result.append(ipo_dict)
        
    return {
        "ipos": result,
        "total": total,
        "page": page,
        "status_counts": counts
    }

@router.get("/my-alerts")
def get_my_alerts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = db.query(IPOAlert, IPO).join(IPO, IPOAlert.ipo_id == IPO.id).filter(IPOAlert.user_id == current_user.user_id).all()
    result = []
    for alert, ipo in alerts:
        result.append({
            "id": str(ipo.id),
            "company_name": ipo.company_name,
            "sector": ipo.sector,
            "price_band_low": ipo.price_band_low,
            "price_band_high": ipo.price_band_high,
            "open_date": ipo.open_date,
            "close_date": ipo.close_date,
            "gmp_premium": ipo.gmp_premium,
            "gmp_percent": float(ipo.gmp_percent) if ipo.gmp_percent else 0.0,
            "status": ipo.status,
            "user_has_alert": True
        })
    return {"alerts": result}

@router.get("/{ipo_id}")
def get_ipo(ipo_id: str, current_user: Optional[User] = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    ipo = db.query(IPO).filter(IPO.id == ipo_id).first()
    if not ipo:
        raise HTTPException(status_code=404, detail="IPO not found")
        
    ipo_dict = {
        "id": str(ipo.id),
        "company_name": ipo.company_name,
        "sector": ipo.sector,
        "price_band_low": ipo.price_band_low,
        "price_band_high": ipo.price_band_high,
        "open_date": ipo.open_date,
        "close_date": ipo.close_date,
        "listing_date": ipo.listing_date,
        "gmp_premium": ipo.gmp_premium,
        "gmp_percent": float(ipo.gmp_percent) if ipo.gmp_percent else 0.0,
        "et_rating": ipo.et_rating,
        "et_verdict": ipo.et_verdict,
        "lot_size": ipo.lot_size,
        "min_investment": ipo.min_investment,
        "status": ipo.status,
        "listing_price": float(ipo.listing_price) if ipo.listing_price else None,
        "listing_gain_percent": float(ipo.listing_gain_percent) if ipo.listing_gain_percent else None,
        "about": ipo.about,
        "strengths": ipo.strengths or [],
        "risks": ipo.risks or [],
        "registrar": ipo.registrar,
        "company_logo_url": ipo.company_logo_url
    }
    
    if current_user:
        alert = db.query(IPOAlert).filter(IPOAlert.user_id == current_user.user_id, IPOAlert.ipo_id == ipo_id).first()
        ipo_dict["user_has_alert"] = alert is not None
        
    return ipo_dict

@router.post("/{ipo_id}/alert")
def set_alert(ipo_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ipo = db.query(IPO).filter(IPO.id == ipo_id).first()
    if not ipo:
        raise HTTPException(status_code=404, detail="IPO not found")
        
    if ipo.status == "listed":
        raise HTTPException(status_code=400, detail="This IPO has already listed")
        
    alert = db.query(IPOAlert).filter(IPOAlert.user_id == current_user.user_id, IPOAlert.ipo_id == ipo_id).first()
    if not alert:
        alert = IPOAlert(user_id=current_user.user_id, ipo_id=ipo_id)
        db.add(alert)
        
        # Log behavioral signal
        signal = BehavioralSignal(
            user_id=current_user.user_id,
            signal_type="IPO_ALERT_SET",
            signal_value={"ipo_id": ipo_id, "company_name": ipo.company_name},
            page_context="/ipo"
        )
        db.add(signal)
        
        # Award XP (simplified)
        from src.database.models import UserXP
        user_xp = db.query(UserXP).filter(UserXP.user_id == current_user.user_id).first()
        if user_xp:
            user_xp.total_xp += 20
        else:
            db.add(UserXP(user_id=current_user.user_id, total_xp=20))
            
        db.commit()
        
    return {"alert_set": True}

@router.delete("/{ipo_id}/alert")
def remove_alert(ipo_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(IPOAlert).filter(IPOAlert.user_id == current_user.user_id, IPOAlert.ipo_id == ipo_id).first()
    if alert:
        db.delete(alert)
        db.commit()
    return {"alert_removed": True}
