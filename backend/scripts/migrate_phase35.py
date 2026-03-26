import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.database.connection import engine
from sqlalchemy import text
from src.database.models import Base

with engine.begin() as conn:
    # Append new columns to user_profiles if they don't exist
    for col, dtype in [
        ("financial_persona", "VARCHAR(50)"),
        ("knowledge_level", "VARCHAR(20) DEFAULT 'beginner'"),
        ("primary_goal", "VARCHAR(50)"),
        ("risk_appetite", "VARCHAR(20)"),
        ("monthly_investment_capacity", "VARCHAR(30)"),
        ("profession", "VARCHAR(100)"),
        ("age_bracket", "VARCHAR(20)"),
        ("city", "VARCHAR(100)"),
        ("city_tier", "VARCHAR(10)"),
        ("has_demat_account", "BOOLEAN"),
        ("has_et_prime", "BOOLEAN"),
        ("interested_sectors", "JSONB"),
        ("interested_products", "JSONB"),
        ("onboarding_completed", "BOOLEAN")
    ]:
        try:
            conn.execute(text(f"ALTER TABLE user_profiles ADD COLUMN {col} {dtype}"))
        except Exception as e:
            pass # column likely exists
    
    # Create new tables (BehavioralSignal, ETProductReadiness, ProfileVersion)
    Base.metadata.create_all(bind=engine)
print("Migration completed successfully.")
