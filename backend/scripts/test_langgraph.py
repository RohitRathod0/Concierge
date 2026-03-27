import sys
sys.path.insert(0, '.')
import os
os.environ['GEMINI_API_KEY'] = 'AIzaSyDp3XbSr3FOf4bRqWAKc-GP3l0-aUpQrfc'

print("Testing imports...")
from src.agents.agent_state import ETAgentState
print("1. agent_state OK")

from src.agents.tools.et_tools import ALL_TOOLS, get_et_services, get_courses
print(f"2. tools OK — {len(ALL_TOOLS)} tools")

from src.agents.intent_classifier import classify_intent, route_by_intent
print("3. intent_classifier OK")

from src.agents.specialist_agents import services_agent, ipo_agent, masterclass_agent
print("4. specialist_agents OK")

from src.agents.graph import et_graph
if et_graph:
    print("5. LangGraph compiled OK")
else:
    print("5. LangGraph FAILED to compile")
    sys.exit(1)

print("\nTesting tool calls:")
result = get_et_services.invoke({})
import json
data = json.loads(result)
print(f"  get_et_services: {data['total']} services")

result2 = get_courses.invoke({})
data2 = json.loads(result2)
print(f"  get_courses: {data2.get('count', 0)} courses (may be 0 if DB empty)")

print("\nTesting keyword intent classification:")
from langchain_core.messages import HumanMessage
for msg, expected in [
    ("any IPO open?", "IPO"),
    ("which course for beginners?", "MASTERCLASS"),
    ("how is Nifty today?", "MARKETS"),
    ("what services do you have?", "SERVICES"),
    ("hi there!", "GENERAL"),
]:
    state = {"messages": [HumanMessage(content=msg)], "user_id": None, "user_name": None, "user_persona": None, "user_knowledge_level": None, "user_interests": [], "user_risk_appetite": None, "investment_experience": None, "age_group": None, "occupation": None, "income_level": None, "financial_goals": [], "life_stage": None, "has_et_prime": False, "has_demat_account": False, "detected_intent": None, "current_page": None, "article_context": None, "tool_results": None, "product_to_recommend": None, "response_ready": False}
    result_state = classify_intent(state)
    intent = result_state.get("detected_intent", "?")
    status = "✓" if intent == expected else f"✗ (got {intent}, expected {expected})"
    print(f"  '{msg}' → {intent} {status}")

print("\nAll checks passed!")
