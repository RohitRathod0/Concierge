try:
    from src.database.connection import engine
    with engine.connect() as conn:
        print("[OK] Database connection successful!")
except Exception as e:
    print("[ERROR] DB Connection:", type(e).__name__, str(e))

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    print("[OK] Passlib initialized successfully!")
    hash_val = pwd_context.hash("test")
    print("[OK] Bcrypt hash successful!")
except Exception as e:
    print("[ERROR] Auth/Bcrypt:", type(e).__name__, str(e))
