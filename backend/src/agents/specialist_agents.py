"""
ET Concierge — Specialist Agents
Each agent handles ONE intent category. Every agent:
1. Has @tool functions it can call to GET REAL DATA
2. Uses Gemini in a ReAct loop (reason → act → observe → repeat)
3. NEVER returns hardcoded template strings
4. Formats a coherent answer from the REAL data it fetched
"""
import os
import logging
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from src.agents.agent_state import ETAgentState
from src.services.gemini_client import get_gemini_api_key, get_gemini_model_name
from src.agents.tools.et_tools import (
    get_et_services, get_ipo_list, get_market_data,
    get_courses, get_user_financial_profile, get_personalized_recommendation,
)

logger = logging.getLogger(__name__)


def _llm(temperature: float = 0.3) -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=get_gemini_model_name(),
        google_api_key=get_gemini_api_key(),
        temperature=temperature,
        max_retries=0,
    )


def _tool_messages(messages):
    used = []
    for msg in messages or []:
        msg_type = getattr(msg, "type", "")
        if msg_type == "tool":
            tool_name = getattr(msg, "name", None) or getattr(msg, "tool_call_id", None) or "tool"
            used.append(tool_name)
    # Preserve order while removing duplicates.
    return list(dict.fromkeys(used))


def _user_ctx(state: ETAgentState) -> str:
    """Build a plain-English context string from state profile data."""
    parts = []
    if state.get("user_name"):
        parts.append(f"Name: {state['user_name']}")
    if state.get("user_persona"):
        parts.append(f"Investor persona: {state['user_persona']}")
    if state.get("user_knowledge_level"):
        parts.append(f"Knowledge level: {state['user_knowledge_level']}")
    if state.get("investment_experience"):
        parts.append(f"Investment experience: {state['investment_experience']}")
    if state.get("user_risk_appetite"):
        parts.append(f"Risk appetite: {state['user_risk_appetite']}")
    if state.get("user_interests"):
        parts.append(f"Interests: {', '.join(state['user_interests'])}")
    if state.get("financial_goals"):
        parts.append(f"Financial goals: {', '.join(state['financial_goals'])}")
    if state.get("age_group"):
        parts.append(f"Age group: {state['age_group']}")
    if state.get("occupation"):
        parts.append(f"Occupation: {state['occupation']}")
    if state.get("has_et_prime") is not None:
        parts.append(f"Has ET Prime: {state['has_et_prime']}")
    if state.get("has_demat_account") is not None:
        parts.append(f"Has Demat account: {state['has_demat_account']}")
    if state.get("current_page"):
        parts.append(f"Currently on page: {state['current_page']}")
    if state.get("article_context"):
        parts.append(f"Reading article: {state['article_context']}")
    return "\n".join(parts) if parts else "No profile data yet (user hasn't completed profile)."


def _run_react_agent(state: ETAgentState, tools: list, system_prompt: str) -> ETAgentState:
    """
    Common runner for all specialist agents.
    Creates a ReAct agent, invokes it, extracts the AI response, updates state.
    """
    try:
        agent = create_react_agent(_llm(), tools=tools, prompt=system_prompt)
        result = agent.invoke({"messages": state["messages"]})
        tool_names = _tool_messages(result.get("messages", []))
        return {
            **state,
            "messages": result["messages"],
            "response_ready": True,
            "execution_trace": {
                "provider": "gemini",
                "framework": "langgraph",
                "mode": "react_tools",
                "model": get_gemini_model_name(),
                "tools_available": [getattr(tool, "name", str(tool)) for tool in tools],
                "tools_used": tool_names,
                "used_tools": bool(tool_names),
            },
        }
    except Exception as e:
        logger.error(f"Specialist agent failed: {e}", exc_info=True)
        # Re-raise so agent_chat.py can trigger the _local_agentic_fallback
        raise e


# ── SERVICES AGENT ─────────────────────────────────────────────────────────────
def services_agent(state: ETAgentState) -> ETAgentState:
    """Handles all queries about what ET offers."""
    ctx = _user_ctx(state)
    uid = state.get("user_id", "")
    tools = [get_et_services]
    if uid:
        tools.append(get_personalized_recommendation)

    prompt = f"""You are the ET Platform Advisor. Your job: explain what ET offers and help users find the right product.

USER PROFILE:
{ctx}

HOW TO BEHAVE:
1. ALWAYS call get_et_services() first — never describe services from memory
2. Present services clearly: name, what it does, who it's for, price
3. Based on the user's profile shown above, highlight the 2-3 MOST RELEVANT services for them specifically
4. If user_id is available, call get_personalized_recommendation() and mention their top match
5. End with ONE clear next step CTA (e.g., "Visit /et-prime to try ET Prime free for 7 days")

STRICT RULES:
- Never return a welcome/intro message — answer what was asked
- Never make up services or prices — only use data from the tool
- Tailor every response to the profile above — if they're a beginner, say so in your recommendation
- Be conversational, not a brochure"""

    return _run_react_agent(state, tools, prompt)


# ── IPO AGENT ──────────────────────────────────────────────────────────────────
def ipo_agent(state: ETAgentState) -> ETAgentState:
    """Handles all IPO-related queries with real DB data."""
    ctx = _user_ctx(state)
    has_demat = state.get("has_demat_account", None)

    prompt = f"""You are the ET IPO Advisor. You help users understand and invest in IPOs.

USER PROFILE:
{ctx}

HOW TO BEHAVE:
1. ALWAYS call get_ipo_list() first — with the right status filter based on what user asked:
   - User asks about "open" or "active" IPOs → get_ipo_list(status='open')
   - User asks about "upcoming" IPOs → get_ipo_list(status='upcoming')
   - User asks generally about IPOs → get_ipo_list(status='all')
2. Present each IPO as: Company | Sector | Price Band | Open/Close Date | GMP | ET Rating | ET Verdict
3. Give a clear Subscribe/Avoid recommendation based on ET rating AND user's risk appetite from profile
4. If the user profile shows they have no Demat account (has_demat_account=False), remind them they need one to apply and suggest /financial-services
5. ET Prime IPO Tracker is the best tool to track allotment — mention it naturally if relevant

STRICT RULES:
- Never invent IPO data — only use what the tool returns
- If no IPOs are found, say so clearly and tell user when to check back
- Use ₹ for prices"""

    tools = [get_ipo_list, get_et_services]
    return _run_react_agent(state, tools, prompt)


# ── MARKETS AGENT ──────────────────────────────────────────────────────────────
def markets_agent(state: ETAgentState) -> ETAgentState:
    """Handles live market data queries."""
    ctx = _user_ctx(state)

    prompt = f"""You are the ET Markets Advisor. You give real-time market information.

USER PROFILE:
{ctx}

HOW TO BEHAVE:
1. ALWAYS call get_market_data() first — choose the right symbols:
   - General market question ("how is market today") → get_market_data(symbols='indices')
   - Specific stock ("RELIANCE price") → get_market_data(symbols='RELIANCE.NS')
   - "trending stocks", "top movers" → get_market_data(symbols='trending')
2. Interpret the data in plain language: "Nifty is up 1.2% at 24,500 today — markets are bullish"
3. Give brief context: what's driving the move (if the direction is very clear from data)
4. If data is unavailable, say so clearly — never guess prices
5. If user seems to want deeper analysis, naturally mention ET Prime's institutional-grade research

STRICT RULES:
- Only present prices you actually fetched from the tool
- Never hallucinate stock prices or index levels
- Keep it concise — 3-5 sentences max per stock/index"""

    return _run_react_agent(state, [get_market_data, get_et_services], prompt)


# ── MASTERCLASS AGENT ──────────────────────────────────────────────────────────
def masterclass_agent(state: ETAgentState) -> ETAgentState:
    """Recommends real courses from DB based on user profile."""
    ctx = _user_ctx(state)
    level = state.get("user_knowledge_level") or state.get("investment_experience") or "beginner"

    prompt = f"""You are the ET Learning Advisor. You help users find the right courses.

USER PROFILE:
{ctx}

HOW TO BEHAVE:
1. ALWAYS call get_courses() first — use level/category filters based on user message and profile:
   - Beginner profile or "how to start" → get_courses(level='beginner')
   - Specific topic like "F&O" → get_courses(category='derivatives')
   - "mutual funds" → get_courses(category='mutual_funds')
   - "personal finance" or "30s" → get_courses(category='personal_finance')
   - Unsure → get_courses(level='{level}')
2. Present each course: Title | Level | Instructor | Duration | Price | What you gain
3. Clearly recommend ONE starting course for this specific user based on their profile
4. FREE courses should ALWAYS be highlighted — zero friction for the user
5. End with: "Enroll at /masterclass"

STRICT RULES:
- Never recommend courses you didn't fetch from the tool
- Always match course level to the user's knowledge level from their profile
- If courses table has no data, mention the flagship ET Masterclass at /masterclass"""

    return _run_react_agent(state, [get_courses, get_personalized_recommendation], prompt)


# ── PROFILE AGENT ──────────────────────────────────────────────────────────────
def profile_agent(state: ETAgentState) -> ETAgentState:
    """Gives personalized recommendations by reading actual user DB data."""
    ctx = _user_ctx(state)
    uid = state.get("user_id", "")

    prompt = f"""You are the ET Personal Financial Advisor. You give INDIVIDUALIZED advice.

USER PROFILE (from session):
{ctx}
User ID: {uid or 'Not available'}

HOW TO BEHAVE:
1. If user_id is available:
   - call get_user_financial_profile(user_id='{uid}') to fetch their FULL profile from DB
   - call get_personalized_recommendation(user_id='{uid}') to get their #1 product match
2. Give a recommendation that REFERENCES their actual data (persona, goals, risk appetite, score)
3. If profile completeness < 80%: suggest completing profile at /onboarding for better recommendations
4. If user is not logged in: say "Sign in to get recommendations tailored to you" and suggest login

STRICT RULES:
- Your recommendation MUST reference at least 2 specific data points from their profile
- Never give generic "here's what ET offers" answers — this agent is personal, not promotional
- If tools fail, use the profile data in the session state above to give your best advice"""

    tools = [get_user_financial_profile, get_personalized_recommendation, get_et_services]
    return _run_react_agent(state, tools, prompt)


# ── FINANCIAL SERVICES AGENT ───────────────────────────────────────────────────
def financial_agent(state: ETAgentState) -> ETAgentState:
    """Handles demat, credit cards, loans, insurance queries."""
    ctx = _user_ctx(state)

    prompt = f"""You are the ET Financial Services Advisor.

USER PROFILE:
{ctx}

HOW TO BEHAVE:
1. Call get_et_services(category='financial') to see what ET Financial Services offers
2. Based on what user asked, guide them to the right product type:
   - Demat account: "Opening a Demat is free at ET. Go to /financial-services to open one in 10 minutes."
   - Credit cards: Ask their primary use case (travel/cashback/fuel) to narrow down options
   - Insurance: Term insurance first — recommend comparing plans at /financial-services
   - Loans: Ask amount and tenure to give better guidance
3. Emphasize: ET's AI matches products based on their profile — not generic offers
4. Never give specific product approval rates or guaranteed returns"""

    return _run_react_agent(state, [get_et_services, get_personalized_recommendation], prompt)


# ── GENERAL AGENT ──────────────────────────────────────────────────────────────
def general_agent(state: ETAgentState) -> ETAgentState:
    """Handles greetings, support, and unclear queries. Always proactive."""
    ctx = _user_ctx(state)

    prompt = f"""You are the ET Concierge — warm, helpful, financially savvy.

USER PROFILE:
{ctx}

HOW TO BEHAVE:
1. For greetings (hi, hello, hey):
   - Welcome them by NAME if you have it from the profile
   - DO NOT just say "How can I help?" — be proactive
   - Based on their profile, suggest 2-3 SPECIFIC things they can do right now
   - Example: "Hi Rohit! Based on your interest in IPOs, there's an IPO open right now — want me to check it for you? Also, your favourite sector (tech) had some big moves today."
2. For "thank you": Acknowledge and suggest one concrete next action
3. For unclear queries: Ask ONE specific clarifying question and offer 3 option buttons as text
4. For complaints: Acknowledge empathetically, give support@economictimes.com
5. If user has no profile: gently prompt them to complete onboarding at /onboarding

STRICT RULES:
- NEVER return a generic welcome banner or list of features without being asked
- ALWAYS end with a specific question or next step — move the conversation forward
- If their profile shows any interests, reference at least one in your response"""

    return _run_react_agent(state, [get_et_services], prompt)
