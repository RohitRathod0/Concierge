from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.api.routes.chat import get_current_user
from src.database.models import User, UserPortfolio, PortfolioAnalysis
from src.agents.portfolio_analysis_agent import analyze_portfolio, generate_macro_report
from pydantic import BaseModel
from typing import List, Optional
import uuid

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

class StockInput(BaseModel):
    symbol: str
    quantity: int
    average_price: float
    purchase_date: Optional[str] = None

class PortfolioRequest(BaseModel):
    stocks: List[StockInput]
    generate_macro: bool = True

@router.post("/analyze")
def analyze_user_portfolio(
    request: PortfolioRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze portfolio, identify gaps, risks and generate macro report."""
    if not request.stocks:
        raise HTTPException(status_code=400, detail="At least one stock required")
    
    stocks_data = [{"symbol": s.symbol, "quantity": s.quantity, "average_price": s.average_price} for s in request.stocks]
    
    result = analyze_portfolio(stocks_data)
    
    # Generate LLM macro report if requested
    macro_report = None
    if request.generate_macro:
        macro_report = generate_macro_report(result["stocks"])
    
    result["macro_report"] = macro_report
    
    # Save analysis to DB
    analysis = PortfolioAnalysis(
        user_id=current_user.user_id,
        total_investment=result["summary"]["total_investment"],
        current_value=result["summary"]["current_value"],
        gain_loss=result["summary"]["gain_loss"],
        diversification_score=result["summary"]["diversification_score"],
        risk_score=result["summary"]["risk_score"],
        gaps_identified=result["gaps"],
        recommendations=result["cross_sells"],
        macro_report=macro_report
    )
    db.add(analysis)
    
    # Save holdings to DB
    for s in request.stocks:
        existing = db.query(UserPortfolio).filter(
            UserPortfolio.user_id == current_user.user_id,
            UserPortfolio.stock_symbol == s.symbol
        ).first()
        if not existing:
            holding = UserPortfolio(
                user_id=current_user.user_id,
                stock_symbol=s.symbol,
                quantity=s.quantity,
                average_price=s.average_price,
            )
            db.add(holding)
    
    db.commit()
    return result

@router.get("/history")
def get_portfolio_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analyses = db.query(PortfolioAnalysis).filter(PortfolioAnalysis.user_id == current_user.user_id).order_by(PortfolioAnalysis.created_at.desc()).limit(5).all()
    return {"analyses": [{"id": str(a.analysis_id), "total_investment": float(a.total_investment) if a.total_investment else None, "current_value": float(a.current_value) if a.current_value else None, "gain_loss": float(a.gain_loss) if a.gain_loss else None, "risk_score": a.risk_score, "created_at": a.created_at.isoformat()} for a in analyses]}

@router.get("/holdings")
def get_holdings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    holdings = db.query(UserPortfolio).filter(UserPortfolio.user_id == current_user.user_id).all()
    return {"holdings": [{"symbol": h.stock_symbol, "quantity": h.quantity, "average_price": float(h.average_price)} for h in holdings]}
