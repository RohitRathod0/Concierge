from pathlib import Path
import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import ObjectNotExecutableError, OperationalError

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

# Phase 1 routers
from src.api.routes.auth import router as auth_router
from src.api.routes.chat import router as chat_router
from src.api.routes.profile import router as profile_router
from src.api.routes.recommendations import router as rec_router

# Phase 2 routers
from src.api.routes.agent_chat import router as agent_chat_router
from src.api.routes.journey import router as journey_router
from src.api.routes.rag import router as rag_router
from src.analytics.dashboard_api import router as analytics_router

# Phase 3 routers
from src.api.routes.nudges import router as nudges_router
from src.api.routes.crosssell import router as crosssell_router
from src.api.routes.health_score import router as health_score_router
from src.api.routes.gamification import router as gamification_router
from src.api.routes.referral import router as referral_router
from src.api.routes.social_proof import router as social_proof_router
from src.api.routes.feed import router as feed_router
from src.api.routes.notifications import router as notifications_router
from src.api.routes.vernacular import router as vernacular_router

# ET Market Features
try:
    from src.api.routes.ipo import router as ipo_router
    from src.api.routes.courses import router as courses_router
    from src.api.routes.markets import router as markets_router
except ImportError:
    pass

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ET AI Concierge API",
    version="2.0.0",
    description="Multi-Agent AI Concierge for the Economic Times ecosystem",
)

origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173",
).split(",")

from src.middleware.event_tracking_middleware import EventTrackingMiddleware
app.add_middleware(EventTrackingMiddleware)

# Keep CORS as the outermost middleware so error responses also include CORS headers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phase 1 routes
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(profile_router)
app.include_router(rec_router)

# Phase 2 routes
app.include_router(agent_chat_router)  # POST /chat/agent-message
app.include_router(journey_router)     # GET /journey/*
app.include_router(rag_router)         # POST /rag/*
app.include_router(analytics_router)  # GET /analytics/*

# Phase 3 routes
app.include_router(nudges_router)
app.include_router(crosssell_router)
app.include_router(health_score_router)
app.include_router(gamification_router)
app.include_router(referral_router)
app.include_router(social_proof_router)
app.include_router(feed_router)
app.include_router(notifications_router)
app.include_router(vernacular_router)

# ET Market Features
try:
    app.include_router(ipo_router, prefix='/api/v1', tags=['ipo'])
    app.include_router(courses_router, prefix='/api/v1', tags=['courses'])
    app.include_router(markets_router, prefix='/api/v1', tags=['markets'])
except NameError:
    pass

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": "2.0.0",
        "features": {
            "agent_orchestration": os.getenv("USE_AGENT_ORCHESTRATION", "false"),
            "rag_navigation": os.getenv("USE_RAG_NAVIGATION", "false"),
            "journey_system": os.getenv("ENABLE_JOURNEY_SYSTEM", "true"),
        },
    }


@app.exception_handler(OperationalError)
async def database_operational_error_handler(request, exc):
    logger.exception("Database connection error while handling %s", request.url.path)
    return JSONResponse(
        status_code=503,
        content={"detail": "Database is unavailable. Start PostgreSQL and try again."},
    )


@app.on_event("startup")
async def startup_event():
    logger.info("ET AI Concierge v2.0.0 starting up...")
    logger.info(f"Agent Orchestration: {os.getenv('USE_AGENT_ORCHESTRATION', 'false')}")
    logger.info(f"RAG Navigation: {os.getenv('USE_RAG_NAVIGATION', 'false')}")
    logger.info(f"Journey System: {os.getenv('ENABLE_JOURNEY_SYSTEM', 'true')}")

    try:
        from src.jobs.refresh_market_data import start_scheduler

        start_scheduler()
    except ModuleNotFoundError as e:
        logger.warning("Skipping market data scheduler startup because a dependency is missing: %s", e)
    except Exception as e:
        logger.error(f"Failed to start market data scheduler: {e}")
