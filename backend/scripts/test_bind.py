import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool

os.environ['GEMINI_API_KEY'] = 'AIzaSyDp3XbSr3FOf4bRqWAKc-GP3l0-aUpQrfc'

@tool
def dummy_tool(x: int) -> int:
    """Returns x + 1"""
    return x + 1

print("Testing ChatGoogleGenerativeAI...")
try:
    llm = ChatGoogleGenerativeAI(
        model="models/gemini-1.5-flash",
        temperature=0.3
    )
    llm_with_tools = llm.bind_tools([dummy_tool])
    result = llm_with_tools.invoke("Use dummy_tool with 5")
    print("SUCCESS!")
    print(result.tool_calls)
except Exception as e:
    print(f"FAILED: {type(e).__name__} - {e}")
