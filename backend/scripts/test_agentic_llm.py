import sys
sys.path.insert(0, '.')
import os
os.environ['GEMINI_API_KEY'] = 'AIzaSyDp3XbSr3FOf4bRqWAKc-GP3l0-aUpQrfc'

from src.services.llm_service import generate_response_agentic

test_profile = {
    'name': 'Test User',
    'age_group': '26-30',
    'occupation': 'Software Engineer',
    'income_level': '10-20 LPA',
    'investment_experience': 'beginner',
    'risk_tolerance': 'moderate',
    'financial_goals': ['grow_wealth', 'tax_saving'],
    'interests': ['stocks', 'mutual_funds'],
    'life_stage': 'early_career',
    'primary_segment': 'young_professional',
}

result = generate_response_agentic(
    message="which masterclass matches my profile?",
    history=[],
    user_profile=test_profile,
    page_context=None,
)

print("ANSWER:", result.get('answer', '')[:200])
print("CROSS_SELL:", result.get('cross_sell'))
