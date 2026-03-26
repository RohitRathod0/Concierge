from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.database.schemas import ProfileUpdate, ProfileResponse, OnboardingStepSubmit, BehavioralSignalCreate
from src.services import profile_service
from src.api.routes.chat import get_current_user
from src.database.models import User, UserProfile, BehavioralSignal, ETProductReadiness
from src.services.persona_engine import calculate_persona
from src.services.product_readiness_service import calculate_readiness_scores
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

class ProfileWrapper(BaseModel):
    profile: ProfileResponse

@router.get("", response_model=ProfileWrapper)
def get_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = profile_service.get_profile(db, current_user.user_id)
    return {"profile": profile}

@router.get("/me")
def get_user_profile_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter_by(user_id=current_user.user_id).first()
    products = db.query(ETProductReadiness).filter_by(user_id=current_user.user_id).all()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "profile": profile,
        "product_readiness": products,
        "behavioral_signals_summary": "Active"
    }

@router.post("/onboarding/start")
def start_onboarding(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter_by(user_id=current_user.user_id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.user_id)
        db.add(profile)
        db.commit()
    return { "step": 1, "total_steps": 6, "progress_pct": 0 }

@router.post("/onboarding/step")
def submit_onboarding_step(step_data: OnboardingStepSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter_by(user_id=current_user.user_id).first()
    if profile and step_data.field:
        setattr(profile, step_data.field, step_data.answer)
        
        # Dynamic completeness tracking
        fields = [
            "income_stability", "financial_cushion", "expense_pressure", 
            "debt_stress", "type_of_debt", "protection_status", 
            "wealth_stage", "money_behavior", "financial_direction", 
            "responsibility_load"
        ]
        filled_count = sum(1 for f in fields if getattr(profile, f, None) not in [None, [], ""])
        profile.profile_completeness = int((filled_count / 10.0) * 100)
        
        db.commit()
    return { "step": step_data.step + 1, "profile_completeness": min(100, profile.profile_completeness if profile else 0), "xp_earned": 30 }

@router.post("/onboarding/complete")
def complete_onboarding(background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter_by(user_id=current_user.user_id).first()
    persona = "STEADY_BUILDER"
    if profile:
        profile.onboarding_completed = True
        
        # Calculate Persona using the 10 core fields
        profile_dict = {
            "income_stability": profile.income_stability,
            "financial_cushion": profile.financial_cushion,
            "expense_pressure": profile.expense_pressure,
            "debt_stress": profile.debt_stress,
            "type_of_debt": profile.type_of_debt,
            "protection_status": profile.protection_status,
            "wealth_stage": profile.wealth_stage,
            "money_behavior": profile.money_behavior,
            "financial_direction": profile.financial_direction,
            "responsibility_load": profile.responsibility_load
        }
        persona = calculate_persona(profile_dict)
        profile.financial_persona = persona
        db.commit()
        
        # Async product readiness calculation
        def update_product_readiness(uid: str):
            with next(get_db()) as background_db:
                p = background_db.query(UserProfile).filter_by(user_id=uid).first()
                if p:
                    p_dict = {
                        "financial_persona": p.financial_persona,
                        "has_demat_account": p.has_demat_account,
                        "income_stability": p.income_stability,
                        "financial_cushion": p.financial_cushion,
                        "expense_pressure": p.expense_pressure,
                        "debt_stress": p.debt_stress,
                        "type_of_debt": p.type_of_debt,
                        "protection_status": p.protection_status,
                        "wealth_stage": p.wealth_stage,
                        "money_behavior": p.money_behavior,
                        "financial_direction": p.financial_direction,
                        "responsibility_load": p.responsibility_load
                    }
                    calculate_readiness_scores(background_db, uid, p_dict)
                    
        background_tasks.add_task(update_product_readiness, current_user.user_id)
        
        return {
            "persona": persona,
            "persona_description": f"Assigned persona {persona}",
            "health_score_preview": 620,
            "xp_earned": 200
        }
    raise HTTPException(status_code=404)

@router.post("/signal")
def log_behavioral_signal(signal: BehavioralSignalCreate, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = BehavioralSignal(
        user_id=current_user.user_id,
        signal_type=signal.signal_type,
        signal_value=signal.signal_value,
        page_context=signal.page_context
    )
    db.add(record)
    db.commit()
    
    # Trigger async update
    def async_refresh(uid: str, sig_dict: dict):
        with next(get_db()) as background_db:
            p = background_db.query(UserProfile).filter_by(user_id=uid).first()
            if p:
                p_dict = {
                    "financial_persona": p.financial_persona,
                    "has_demat_account": p.has_demat_account,
                    "income_stability": p.income_stability,
                    "financial_cushion": p.financial_cushion,
                    "expense_pressure": p.expense_pressure,
                    "debt_stress": p.debt_stress,
                    "type_of_debt": p.type_of_debt,
                    "protection_status": p.protection_status,
                    "wealth_stage": p.wealth_stage,
                    "money_behavior": p.money_behavior,
                    "financial_direction": p.financial_direction,
                    "responsibility_load": p.responsibility_load
                }
                calculate_readiness_scores(background_db, uid, p_dict, [sig_dict])
    
    s_dict = {"signal_type": signal.signal_type, "signal_value": signal.signal_value}
    background_tasks.add_task(async_refresh, current_user.user_id, s_dict)
    
    return {"status": "Logged successfully"}

@router.patch("", response_model=ProfileWrapper)
def update_user_profile(profile_data: ProfileUpdate, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    update_data = profile_data.model_dump(exclude_unset=True)
    profile = profile_service.update_profile(db, current_user.user_id, update_data)
    
    try:
        from src.services.identity_scoring_service import IdentityScoringService
        scorer = IdentityScoringService(db)
        background_tasks.add_task(scorer.calculate_and_store, current_user.user_id)
    except Exception as e:
        print("Identity scoring background task failed:", e)
        
    return {"profile": profile}
