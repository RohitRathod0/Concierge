import os
from pathlib import Path

from dotenv import load_dotenv
import google.generativeai as genai

_configured_key = None


def get_gemini_model(model_name: str = "gemini-1.5-flash"):
    global _configured_key

    # Reload the backend .env so newly added keys are picked up without code changes.
    load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=True)

    api_key = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key:
        return None

    if api_key != _configured_key:
        genai.configure(api_key=api_key)
        _configured_key = api_key

    return genai.GenerativeModel(model_name)
