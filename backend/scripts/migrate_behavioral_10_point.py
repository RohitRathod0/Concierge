import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.database.connection import engine
from sqlalchemy import text

with engine.begin() as conn:
    for col, dtype in [
        ("income_stability", "VARCHAR(50)"),
        ("financial_cushion", "VARCHAR(50)"),
        ("expense_pressure", "VARCHAR(50)"),
        ("debt_stress", "VARCHAR(50)"),
        ("type_of_debt", "VARCHAR(50)"),
        ("protection_status", "VARCHAR(50)"),
        ("wealth_stage", "VARCHAR(50)"),
        ("money_behavior", "VARCHAR(50)"),
        ("financial_direction", "VARCHAR(50)"),
        ("responsibility_load", "VARCHAR(50)")
    ]:
        try:
            conn.execute(text(f"ALTER TABLE user_profiles ADD COLUMN {col} {dtype}"))
        except Exception as e:
            pass # column likely exists
            
print("Migration for new refined 10-point behavioral profiling completed.")
