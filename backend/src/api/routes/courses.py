import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

from src.database.connection import get_db
from src.database.models import Course, CourseModule, CourseEnrollment, UserProfile, BehavioralSignal, User
from src.services.auth_service import SECRET_KEY, ALGORITHM
from src.api.routes.chat import get_current_user

router = APIRouter(prefix="/courses", tags=["courses"])

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

@router.get("")
def list_courses(
    category: Optional[str] = Query("all", description="category filters"),
    level: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    page: int = Query(1, ge=1),
    sort: str = Query("popular", description="popular|rating|newest"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Course)
    if category and category != 'all':
        query = query.filter(Course.category == category)
    if level:
        query = query.filter(Course.level == level)
        
    if sort == "popular":
        query = query.order_by(desc(Course.total_learners))
    elif sort == "rating":
        query = query.order_by(desc(Course.rating))
    elif sort == "newest":
        query = query.order_by(desc(Course.created_at))
        
    total = query.count()
    offset = (page - 1) * limit
    courses = query.offset(offset).limit(limit).all()
    
    user_enrolled = set()
    user_profile = None
    if current_user:
        enrolls = db.query(CourseEnrollment).filter(CourseEnrollment.user_id == current_user.user_id).all()
        user_enrolled = {str(e.course_id) for e in enrolls}
        user_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.user_id).first()
        
    result = []
    for c in courses:
        c_dict = {
            "id": str(c.id),
            "title": c.title,
            "slug": c.slug,
            "short_description": c.short_description,
            "category": c.category,
            "level": c.level,
            "instructor_name": c.instructor_name,
            "duration_hours": float(c.duration_hours) if c.duration_hours else 0,
            "total_modules": c.total_modules,
            "total_learners": c.total_learners,
            "rating": float(c.rating) if c.rating else 0,
            "price": c.price,
            "original_price": c.original_price,
            "is_free": c.is_free,
            "badge_label": c.badge_label,
            "thumbnail_url": c.thumbnail_url
        }
        
        if current_user:
            c_dict["is_enrolled"] = str(c.id) in user_enrolled
            score = 50
            if user_profile:
                if user_profile.interested_products and c.category in user_profile.interested_products:
                    score += 30
                if user_profile.knowledge_level == c.level:
                    score += 20
            c_dict["relevance_score"] = min(100, score)
            
        result.append(c_dict)
        
    return {"courses": result, "total": total, "page": page}

@router.get("/recommended")
def recommended_courses(current_user: Optional[User] = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    
    if not current_user:
        sorted_courses = sorted(courses, key=lambda c: c.total_learners or 0, reverse=True)[:3]
    else:
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.user_id).first()
        interested_products = profile.interested_products if profile and profile.interested_products else []
        k_level = profile.knowledge_level if profile else "beginner"
        
        scored = []
        for c in courses:
            score = 0
            if c.category in interested_products:
                score += 30
            if c.level == k_level:
                score += 20
            score += min((c.total_learners or 0) / 1000 * 10, 30) # max 30 pts for popularity
            if c.is_free:
                score += 20
            scored.append((c, score))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        sorted_courses = [x[0] for x in scored[:3]]
        
    result = []
    for c in sorted_courses:
        result.append({
            "id": str(c.id),
            "title": c.title,
            "slug": c.slug,
            "short_description": c.short_description,
            "category": c.category,
            "level": c.level,
            "instructor_name": c.instructor_name,
            "duration_hours": float(c.duration_hours) if c.duration_hours else 0,
            "total_modules": c.total_modules,
            "total_learners": c.total_learners,
            "rating": float(c.rating) if c.rating else 0,
            "price": c.price,
            "original_price": c.original_price,
            "is_free": c.is_free,
            "badge_label": c.badge_label,
            "thumbnail_url": c.thumbnail_url
        })
    return {"courses": result}

@router.get("/{course_id}")
def get_course(course_id: str, current_user: Optional[User] = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
        
    modules = db.query(CourseModule).filter(CourseModule.course_id == course_id).order_by(CourseModule.module_number.asc()).all()
    
    c_dict = {
        "id": str(c.id),
        "title": c.title,
        "slug": c.slug,
        "description": c.description,
        "short_description": c.short_description,
        "category": c.category,
        "level": c.level,
        "instructor_name": c.instructor_name,
        "instructor_bio": c.instructor_bio,
        "instructor_avatar_url": c.instructor_avatar_url,
        "duration_hours": float(c.duration_hours) if c.duration_hours else 0,
        "total_modules": c.total_modules,
        "total_learners": c.total_learners,
        "rating": float(c.rating) if c.rating else 0,
        "price": c.price,
        "original_price": c.original_price,
        "is_free": c.is_free,
        "badge_label": c.badge_label,
        "thumbnail_url": c.thumbnail_url,
        "modules": [{"id": str(m.id), "module_number": m.module_number, "title": m.title, "duration_minutes": m.duration_minutes, "is_free_preview": m.is_free_preview} for m in modules]
    }
    
    if current_user:
        enrollment = db.query(CourseEnrollment).filter(CourseEnrollment.user_id == current_user.user_id, CourseEnrollment.course_id == course_id).first()
        c_dict["is_enrolled"] = enrollment is not None
        if enrollment:
            c_dict["progress_pct"] = enrollment.progress_pct
            c_dict["last_module_completed"] = enrollment.last_module_completed
            
    return c_dict

@router.post("/{course_id}/enroll")
def enroll_course(course_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
        
    existing = db.query(CourseEnrollment).filter(CourseEnrollment.user_id == current_user.user_id, CourseEnrollment.course_id == course_id).first()
    if existing:
        return {"enrolled": True, "message": "Already enrolled!"}
        
    if c.is_free:
        enroll = CourseEnrollment(user_id=current_user.user_id, course_id=course_id)
        db.add(enroll)
        
        c.total_learners = (c.total_learners or 0) + 1
        
        sig = BehavioralSignal(
            user_id=current_user.user_id,
            signal_type="COURSE_ENROLL",
            signal_value={"course_id": course_id, "price": 0, "title": c.title},
            page_context="/masterclass"
        )
        db.add(sig)
        
        # XP
        from src.database.models import UserXP
        user_xp = db.query(UserXP).filter(UserXP.user_id == current_user.user_id).first()
        if user_xp:
            user_xp.total_xp += 100
        else:
            db.add(UserXP(user_id=current_user.user_id, total_xp=100))
            
        db.commit()
        return {"enrolled": True, "message": "You are now enrolled!"}
    else:
        # Mock payment flow
        enroll = CourseEnrollment(user_id=current_user.user_id, course_id=course_id)
        db.add(enroll)
        c.total_learners = (c.total_learners or 0) + 1
        
        sig = BehavioralSignal(
            user_id=current_user.user_id,
            signal_type="COURSE_PURCHASE",
            signal_value={"course_id": course_id, "price": c.price, "title": c.title},
            page_context="/masterclass"
        )
        db.add(sig)
        
        # XP
        from src.database.models import UserXP
        user_xp = db.query(UserXP).filter(UserXP.user_id == current_user.user_id).first()
        if user_xp:
            user_xp.total_xp += 100
        else:
            db.add(UserXP(user_id=current_user.user_id, total_xp=100))
            
        db.commit()
        return {"enrolled": True, "message": "Mock payment successful. You are now enrolled!"}
