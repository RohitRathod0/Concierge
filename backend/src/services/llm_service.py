import os
import google.generativeai as genai
from typing import List, Dict, Any

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

SYSTEM_PROMPT = """You are ET AI Concierge, an intelligent assistant for the Economic Times ecosystem.
You help users discover ET products and services (ET Prime, ET Markets, Masterclasses, Events, Wealth Summits) based on their interests and needs.
You are conversational, helpful, and knowledgeable about finance and investing.
Always provide value and guide users to relevant ET offerings naturally."""

def generate_response(message: str, history: List[Dict[str, str]] = None) -> str:
    """Generate a response using Gemini."""
    if not model:
        return "I am the ET AI Concierge. Please configure my GEMINI_API_KEY to enable full AI responses."
        
    chat = model.start_chat(history=[])
    if history:
        for msg in history:
            role = 'user' if msg['role'] == 'user' else 'model'
            chat.history.append({'role': role, 'parts': [msg['content']]})
            
    prompt = f"System: {SYSTEM_PROMPT}\n\nUser: {message}"
    response = chat.send_message(prompt)
    return response.text

def classify_intent(message: str) -> str:
    """Classify the user intent into predefined buckets."""
    if not model:
        return "general_question"
        
    prompt = f"Analyze this user message and classify the primary intent into one of: learning, investing, service_inquiry, general_question, product_interest. Message: {message}. Respond with just the intent category."
    response = model.generate_content(prompt)
    intent = response.text.strip().lower()
    
    valid_intents = ["learning", "investing", "service_inquiry", "general_question", "product_interest"]
    for v in valid_intents:
        if v in intent:
            return v
    return "general_question"
