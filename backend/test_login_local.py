import sys
import logging
from src.database.connection import SessionLocal
from src.services.auth_service import authenticate_user

logging.basicConfig(level=logging.DEBUG)

db = SessionLocal()
try:
    print("Attempting to authenticate user...")
    user = authenticate_user(db, "test@example.com", "password")
    print("Success:", user)
except Exception as e:
    print("Error occurred:")
    import traceback
    traceback.print_exc()
finally:
    db.close()
