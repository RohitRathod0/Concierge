from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.services.market_data_service import get_cached_data
from src.api.routes.chat import get_current_user
from src.database.models import User, WatchlistItem
from pydantic import BaseModel

router = APIRouter(prefix="/markets", tags=["markets"])

class WatchlistAdd(BaseModel):
    symbol: str
    asset_class: str

@router.get("/live")
def get_live_markets(db: Session = Depends(get_db)):
    data = get_cached_data(db)
    indices = [d for d in data if d.asset_class == 'index']
    equities = [d for d in data if d.asset_class == 'equity']
    
    return {
        "indices": [{"symbol": i.symbol, "name": i.name, "price": float(i.price) if i.price else 0.0, "change": float(i.change_amount) if i.change_amount else 0.0, "change_percent": float(i.change_percent) if i.change_percent else 0.0} for i in indices],
        "top_movers": [{"symbol": e.symbol, "name": e.name, "price": float(e.price) if e.price else 0.0, "change": float(e.change_amount) if e.change_amount else 0.0, "change_percent": float(e.change_percent) if e.change_percent else 0.0} for e in equities]
    }

@router.post("/watchlist")
def add_to_watchlist(item: WatchlistAdd, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(WatchlistItem).filter(
        WatchlistItem.user_id == current_user.user_id,
        WatchlistItem.symbol == item.symbol
    ).first()
    
    if existing:
        return {"added": True, "message": "Already in watchlist"}
        
    w_item = WatchlistItem(
        user_id=current_user.user_id,
        symbol=item.symbol,
        asset_class=item.asset_class
    )
    db.add(w_item)
    db.commit()
    return {"added": True}

@router.delete("/watchlist/{symbol}")
def remove_from_watchlist(symbol: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(WatchlistItem).filter(
        WatchlistItem.user_id == current_user.user_id,
        WatchlistItem.symbol == symbol
    ).first()
    
    if item:
        db.delete(item)
        db.commit()
    return {"removed": True}

@router.get("/watchlist")
def get_watchlist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(WatchlistItem).filter(WatchlistItem.user_id == current_user.user_id).all()
    cached = {c.symbol: c for c in get_cached_data(db)}
    
    result = []
    for i in items:
        c_data = cached.get(i.symbol)
        result.append({
            "id": str(i.id),
            "symbol": i.symbol,
            "asset_class": i.asset_class,
            "price": float(c_data.price) if c_data and c_data.price else None,
            "change": float(c_data.change_amount) if c_data and c_data.change_amount else None,
            "change_percent": float(c_data.change_percent) if c_data and c_data.change_percent else None
        })
    return {"watchlist": result}
