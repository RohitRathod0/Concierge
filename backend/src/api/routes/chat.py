from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.database.schemas import MessageCreate, MessageResponse, ConversationResponse
from src.services import conversation_service
from src.services.auth_service import SECRET_KEY, ALGORITHM
from src.database.models import User
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
import uuid

router = APIRouter(prefix="/chat", tags=["chat"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
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

@router.post("/sessions", response_model=ConversationResponse)
def create_chat_session(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = conversation_service.create_session(db, current_user.user_id)
    return session

@router.post("/message", response_model=MessageResponse)
def send_message(message: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session_id = message.session_id
    if not session_id:
        session = conversation_service.create_session(db, current_user.user_id)
        session_id = session.session_id
        
    result = conversation_service.process_chat_message(db, current_user.user_id, session_id, message.content)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")
        
    msg = result["assistant_message"]
    
    # Safely convert SQLAlchemy model to dict
    msg_dict = {
        "message_id": getattr(msg, "message_id", None) or msg.get("message_id") if isinstance(msg, dict) else getattr(msg, "message_id", None),
        "role": getattr(msg, "role", "assistant") if not isinstance(msg, dict) else msg.get("role", "assistant"),
        "content": getattr(msg, "content", "") if not isinstance(msg, dict) else msg.get("content", ""),
        "timestamp": getattr(msg, "timestamp", None) if not isinstance(msg, dict) else msg.get("timestamp", None),
        "product_recommendation": None
    }
    
    # ET AI Phase 3.5: Deep Product Readiness Injection
    try:
        from src.database.models import ETProductReadiness
        top_product = db.query(ETProductReadiness).filter(
            ETProductReadiness.user_id == current_user.user_id,
            ETProductReadiness.readiness_score >= 60
        ).order_by(ETProductReadiness.readiness_score.desc()).first()
        
        if top_product:
            card_map = {
                "et_prime": {"headline":"ET Prime", "subtext": "AI-detected high match based on your profile.", "price":"₹7/day", "cta_text":"Start Free Trial", "cta_url":"/et-prime"},
                "masterclass_beginner": {"headline":"Masterclass", "subtext":"Perfect for your current knowledge level.", "price":"From ₹1,999", "cta_text":"View Course", "cta_url":"/masterclass"},
                "demat_account": {"headline":"Open Demat", "subtext":"Required to apply for upcoming IPOs.", "price":"Free", "cta_text":"Open Account", "cta_url":"/ipo"},
                "ipo_alerts": {"headline":"IPO Alerts", "subtext":"Never miss another grey market premium update.", "price":"Free", "cta_text":"Enable Alerts", "cta_url":"/ipo"},
                "term_insurance": {"headline":"Term Insurance", "subtext":"Protect your wealth generation goals.", "price":"As low as ₹500/mo", "cta_text":"Check Quote", "cta_url":"/financial-services"},
                "wealth_summit": {"headline":"Wealth Summit", "subtext":"Network with top portfolio managers.", "price":"₹4,999", "cta_text":"Reserve Seat", "cta_url":"/masterclass"}
            }
            if top_product.product_id in card_map:
                msg_dict["product_recommendation"] = card_map[top_product.product_id]
                msg_dict["product_recommendation"]["product_id"] = top_product.product_id
                msg_dict["product_recommendation"]["match_score"] = top_product.readiness_score
    except Exception as e:
        print("Failed to attach ML recommendation:", e)
        pass
        
    return msg_dict
    
@router.get("/sessions/{session_id}/messages")
def get_messages(session_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = conversation_service.get_session_messages(db, session_id)
    return messages
