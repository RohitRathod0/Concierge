import sys
sys.path.insert(0, '.')
import os
os.environ['GEMINI_API_KEY'] = 'AIzaSyDp3XbSr3FOf4bRqWAKc-GP3l0-aUpQrfc'
import traceback

from src.services.gemini_client import get_gemini_model

model = get_gemini_model()
print("Model:", model)

try:
    # Test a simple call first
    response = model.generate_content("Say hello in 5 words")
    print("Simple test:", response.text)
except Exception as e:
    print("Simple test FAILED:", e)
    traceback.print_exc()

try:
    # Test chat mode
    chat = model.start_chat(history=[])
    response = chat.send_message("What is ET Prime in 1 sentence?")
    print("Chat test:", response.text[:100])
except Exception as e:
    print("Chat test FAILED:", e)
    traceback.print_exc()
