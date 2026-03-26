from typing import Dict, Any, List

def calculate_persona(profile: Dict[str, Any]) -> str:
    """
    Calculates the financial persona of the user based on their 10 onboarding profile vectors.
    """
    scores = {
        "PREPARED_MIND": 0,    # Good cushion, protected, clear plan
        "DYNAMIC_INVESTOR": 0, # Active stocks, invest auto, risk tolerance
        "STEADY_BUILDER": 0,   # Save fixed, some plans, comfortable debt
        "SECURITY_SEEKER": 0,  # Stressful, no plan, no protection
        "WEALTH_ACCUMULATOR": 0, # Exceptional cushion, active stocks, easily save
        "BUSINESS_OWNER": 0    # Business stability, mix/credit debt
    }
    
    inc = profile.get("income_stability", "")
    cush = profile.get("financial_cushion", "")
    exp = profile.get("expense_pressure", "")
    debt = profile.get("debt_stress", "")
    tdebt = profile.get("type_of_debt", "")
    prot = profile.get("protection_status", "")
    ws = profile.get("wealth_stage", "")
    mb = profile.get("money_behavior", "")
    fd = profile.get("financial_direction", "")
    rl = profile.get("responsibility_load", "")

    # PREPARED_MIND
    if cush in ["3_to_6m", "over_6m"]: scores["PREPARED_MIND"] += 1
    if prot == "both": scores["PREPARED_MIND"] += 1
    if fd == "clear_long": scores["PREPARED_MIND"] += 1
    if tdebt == "home_edu": scores["PREPARED_MIND"] += 1

    # DYNAMIC_INVESTOR
    if ws == "active_stocks": scores["DYNAMIC_INVESTOR"] += 2
    if mb == "invest_auto": scores["DYNAMIC_INVESTOR"] += 1
    if fd in ["some_short", "clear_long"]: scores["DYNAMIC_INVESTOR"] += 1
    if exp == "easily_save": scores["DYNAMIC_INVESTOR"] += 1

    # STEADY_BUILDER
    if mb == "save_fixed": scores["STEADY_BUILDER"] += 2
    if ws in ["save_fd", "invest_mf"]: scores["STEADY_BUILDER"] += 1
    if debt in ["manageable", "comfortable"]: scores["STEADY_BUILDER"] += 1
    if fd == "some_short": scores["STEADY_BUILDER"] += 1

    # SECURITY_SEEKER
    if cush == "under_1m": scores["SECURITY_SEEKER"] += 2
    if prot == "none": scores["SECURITY_SEEKER"] += 1
    if fd == "no_plan": scores["SECURITY_SEEKER"] += 1
    if debt == "stressful": scores["SECURITY_SEEKER"] += 1
    if tdebt == "credit_heavy": scores["SECURITY_SEEKER"] += 1

    # WEALTH_ACCUMULATOR
    if cush == "over_6m": scores["WEALTH_ACCUMULATOR"] += 2
    if exp == "easily_save": scores["WEALTH_ACCUMULATOR"] += 1
    if ws in ["invest_mf", "active_stocks"]: scores["WEALTH_ACCUMULATOR"] += 1
    if mb == "invest_auto": scores["WEALTH_ACCUMULATOR"] += 1

    # BUSINESS_OWNER
    if inc == "business": scores["BUSINESS_OWNER"] += 3
    if inc == "variable": scores["BUSINESS_OWNER"] += 1
    if tdebt in ["mix", "credit_heavy"]: scores["BUSINESS_OWNER"] += 1

    best_persona = max(scores.items(), key=lambda x: x[1])
    
    if best_persona[1] >= 2:
        return best_persona[0]
    # Default fallback
    return "STEADY_BUILDER"
