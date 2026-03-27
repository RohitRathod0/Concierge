import os
from pathlib import Path

from dotenv import load_dotenv
import google.generativeai as genai

_configured_key = None


def _load_env():
    load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=True)


def get_gemini_api_key() -> str:
    _load_env()
    return os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").strip()


def get_gemini_model_name(default: str = "gemini-2.0-flash") -> str:
    _load_env()
    return os.getenv("GEMINI_MODEL", "").strip() or default


def get_gemini_model(model_name: str | None = None):
    global _configured_key

    api_key = get_gemini_api_key()
    if not api_key:
        return None

    if api_key != _configured_key:
        genai.configure(api_key=api_key)
        _configured_key = api_key

    return genai.GenerativeModel(model_name or get_gemini_model_name())
