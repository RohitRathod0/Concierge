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
    
    # Dictionary conversion to safely attach new properties if it's an object
    msg_dict = msg.dict() if hasattr(msg, "dict") else dict(msg)
    
    # Keyword detection for cross-sell product cards
    text = str(msg_dict.get("content", "")).lower()
    
    if "et prime" in text or "premium" in text or "exclusive" in text:
        msg_dict["product_recommendation"] = {
            "product_id": "prime1",
            "headline": "ET Prime",
            "subtext": "Get exclusive market insights before anyone else",
            "price": "₹7/day",
            "cta_text": "Start 7-Day Free Trial",
            "cta_url": "/et-prime"
        }
    elif "masterclass" in text or "course" in text or "learn" in text:
        msg_dict["product_recommendation"] = {
            "product_id": "mc1",
            "headline": "Masterclass",
            "subtext": "Learn from SEBI-registered experts",
            "price": "From ₹1,999",
            "cta_text": "Explore Courses",
            "cta_url": "/masterclass"
        }
    elif "ipo" in text or "demat" in text:
        msg_dict["product_recommendation"] = {
            "product_id": "ipo1",
            "headline": "Open Demat",
            "subtext": "You need a Demat account to apply for IPOs.",
            "price": "Free",
            "cta_text": "Open Now",
            "cta_url": "/ipo"
        }
        
    return msg_dict
    
@router.get("/sessions/{session_id}/messages")
def get_messages(session_id: uuid.UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = conversation_service.get_session_messages(db, session_id)
    return messages
