from typing import Dict, Any

class VernacularService:
    def __init__(self):
        self.dictionary = {
            "Equity": {
                "hi": "इक्विटी (शेयर/हिस्सेदारी)",
                "explanation": "Company shares representing ownership."
            },
            "Mutual Fund": {
                "hi": "म्यूचुअल फंड",
                "explanation": "A pool of money managed by experts."
            },
            "SIP": {
                "hi": "एसआईपी (क्रमानुसार निवेश योजना)",
                "explanation": "Systematic Investment Plan."
            },
            "Bonds": {
                "hi": "बॉन्ड (ऋण पत्र)",
                "explanation": "Fixed-income debt instruments."
            }
        }

    def translate_term(self, term: str, target_lang: str = "hi") -> Dict[str, str]:
        result = self.dictionary.get(term, None)
        if not result:
            return {"term": term, "translated": term, "explanation": "Context not available."}
            
        return {
            "term": term,
            "translated": result.get(target_lang, term),
            "explanation": result["explanation"]
        }
        
    def transcribe_audio(self, audio_bytes: bytes) -> str:
        # Simulate Google Speech-to-Text
        return "म्यूचुअल फंड में निवेश कैसे करें?"
