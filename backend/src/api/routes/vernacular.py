from fastapi import APIRouter, Depends, File, UploadFile
from typing import Dict

router = APIRouter(prefix="/api/v1/vernacular", tags=["Vernacular Layer"])

from src.services.vernacular_service import VernacularService

@router.get("/translate")
def translate_term(term: str, target: str = "hi") -> Dict[str, str]:
    service = VernacularService()
    return service.translate_term(term, target)

@router.post("/speech-to-text")
async def speech_to_text(audio: UploadFile = File(...)):
    service = VernacularService()
    content = await audio.read()
    transcription = service.transcribe_audio(content)
    return {"text": transcription, "language": "hi"}
