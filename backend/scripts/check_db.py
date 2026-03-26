import os
import sys
from dotenv import load_dotenv

load_dotenv()

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from src.database.connection import engine
from src.database.models import JourneyStage, Milestone, UserEvent, AgentExecution, ConversationState
from sqlalchemy import inspect
import json

def check_db():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    results = {"existing_tables": tables, "creation_errors": {}}
    
    models_to_check = [JourneyStage, Milestone, UserEvent, AgentExecution, ConversationState]
    for m in models_to_check:
        try:
            m.__table__.create(engine)
        except Exception as e:
            results["creation_errors"][m.__tablename__] = str(e)
            
    with open(os.path.join(backend_dir, "db_diag.json"), "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    check_db()
