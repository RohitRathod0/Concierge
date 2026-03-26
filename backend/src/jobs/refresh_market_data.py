import logging
from apscheduler.schedulers.background import BackgroundScheduler
from src.database.connection import SessionLocal
from src.services.market_data_service import update_cache_for_preset_symbols

logger = logging.getLogger(__name__)

def refresh_task():
    logger.info("Starting market data refresh job...")
    db = SessionLocal()
    try:
        update_cache_for_preset_symbols(db)
        logger.info("Market data refreshed successfully.")
    except Exception as e:
        logger.error(f"Error refreshing market data: {e}")
    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(refresh_task, 'interval', minutes=5, id='market_data_refresh', replace_existing=True)
    scheduler.start()
    logger.info("Market data refresh scheduler started.")
    
    # Run once on startup
    refresh_task()
