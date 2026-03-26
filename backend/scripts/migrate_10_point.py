import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.database.connection import engine
from sqlalchemy import text

with engine.begin() as conn:
    for col, dtype in [
        ("age_life_stage", "VARCHAR(50)"),
        ("monthly_income_range", "VARCHAR(50)"),
        ("employment_type", "VARCHAR(50)"),
        ("monthly_savings", "VARCHAR(50)"),
        ("existing_debt", "VARCHAR(50)"),
        ("investment_experience", "VARCHAR(50)"),
        ("risk_behavior", "VARCHAR(50)"),
        ("financial_goal", "JSONB"),
        ("time_horizon", "VARCHAR(50)"),
        ("insurance_status", "JSONB")
    ]:
        try:
            conn.execute(text(f"ALTER TABLE user_profiles ADD COLUMN {col} {dtype}"))
        except Exception as e:
            pass # column likely exists
            
print("Migration for 10-point profiling completed.")
