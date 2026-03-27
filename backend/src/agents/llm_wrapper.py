import os
from typing import Any, List, Optional
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from google import genai
from google.genai import types

from src.services.gemini_client import get_gemini_api_key, get_gemini_model_name

class DirectGeminiChatModel(BaseChatModel):
    client: Any = None
    model_name: str = "gemini-2.0-flash"
    temperature: float = 0.3

    def __init__(self, model: str | None = None, temperature: float = 0.3, **kwargs):
        super().__init__(**kwargs)
        self.model_name = model or get_gemini_model_name()
        self.temperature = temperature
        # Initialize the official new SDK client
        self.client = genai.Client(api_key=get_gemini_api_key())

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[Any] = None,
        **kwargs: Any,
    ) -> ChatResult:
        
        # Convert LangChain messages to Gemini contents format
        contents = []
        system_instructions = []
        
        for msg in messages:
            if isinstance(msg, SystemMessage):
                system_instructions.append(msg.content)
            elif isinstance(msg, HumanMessage):
                contents.append(types.Content(role="user", parts=[types.Part.from_text(text=msg.content)]))
            elif isinstance(msg, AIMessage):
                contents.append(types.Content(role="model", parts=[types.Part.from_text(text=msg.content)]))

        sys_config = None
        if system_instructions:
            sys_config = types.GenerateContentConfig(
                system_instruction="\\n".join(system_instructions),
                temperature=self.temperature,
            )
            
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=sys_config
            )
            
            ai_message = AIMessage(content=response.text or "")
            generation = ChatGeneration(message=ai_message)
            return ChatResult(generations=[generation])
            
        except Exception as e:
            # Fallback wrapper if API fails
            ai_message = AIMessage(content=f"Error generating response: {e}")
            return ChatResult(generations=[ChatGeneration(message=ai_message)])

    @property
    def _llm_type(self) -> str:
        return "direct-gemini"
