import yfinance as yf
from sqlalchemy.orm import Session
from src.database.models import MarketDataCache
from datetime import datetime, timezone

def fetch_live_data(symbol: str) -> dict:
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.fast_info if hasattr(ticker, 'fast_info') else ticker.info
        
        # fallback to history if info is missing fields
        if not info or ('last_price' not in info and 'regularMarketPrice' not in info):
            hist = ticker.history(period="5d")
            if hist.empty:
                return None
            last_quote = hist.iloc[-1]
            prev_quote = hist.iloc[-2] if len(hist) > 1 else last_quote
            
            price = float(last_quote['Close'])
            prev_close = float(prev_quote['Close'])
            change = price - prev_close
            change_pct = (change / prev_close) * 100 if prev_close else 0
            
            return {
                "symbol": symbol,
                "current_price": price,
                "change": change,
                "change_percent": change_pct,
                "volume": int(last_quote['Volume']),
                "high_52week": float(hist['High'].max()),
                "low_52week": float(hist['Low'].min()),
                "last_updated": datetime.now(timezone.utc)
            }
        else:
            # using fast_info or info
            price = getattr(info, 'last_price', info.get('regularMarketPrice', 0))
            if not isinstance(price, (int, float)):
                price = getattr(info, 'previous_close', info.get('regularMarketPreviousClose', 0))
                
            prev_close = getattr(info, 'previous_close', info.get('regularMarketPreviousClose', price))
            change = price - prev_close
            change_pct = (change / prev_close) * 100 if prev_close else 0
            
            return {
                "symbol": symbol,
                "current_price": float(price),
                "change": float(change),
                "change_percent": float(change_pct),
                "volume": int(getattr(info, 'last_volume', info.get('regularMarketVolume', 0))),
                "high_52week": float(getattr(info, 'year_high', info.get('fiftyTwoWeekHigh', price))),
                "low_52week": float(getattr(info, 'year_low', info.get('fiftyTwoWeekLow', price))),
                "last_updated": datetime.now(timezone.utc)
            }
    except Exception as e:
        print(f"Error fetching live data for {symbol}: {e}")
        return None

def update_cache_for_preset_symbols(db: Session):
    symbols = ['^NSEI', '^BSESN', 'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS']
    
    for sym in symbols:
        data = fetch_live_data(sym)
        if data:
            cache = db.query(MarketDataCache).filter(MarketDataCache.symbol == sym).first()
            if not cache:
                cache = MarketDataCache(symbol=sym)
                db.add(cache)
                
            # determine asset class
            if '^' in sym:
                cache.asset_class = 'index'
                cache.name = 'NIFTY 50' if sym == '^NSEI' else 'SENSEX'
            else:
                cache.asset_class = 'equity'
                cache.name = sym.split('.')[0]
                
            cache.current_price = data['current_price']
            cache.change = data['change']
            cache.change_percent = data['change_percent']
            cache.volume = data['volume']
            cache.high_52week = data['high_52week']
            cache.low_52week = data['low_52week']
            cache.last_updated = data['last_updated']
            
    db.commit()

def get_cached_data(db: Session):
    return db.query(MarketDataCache).all()
