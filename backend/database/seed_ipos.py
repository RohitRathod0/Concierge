import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from src.database.connection import SessionLocal

def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        res = db.execute(text("SELECT COUNT(*) FROM ipos")).scalar()
        if res > 0:
            print("IPOs already seeded.")
            return

        print("Seeding IPOs...")
        queries = [
            "INSERT INTO ipos (company_name, sector, issue_size_cr, price_band_low, price_band_high, open_date, close_date, listing_date, gmp_premium, gmp_percent, et_rating, et_verdict, lot_size, min_investment, status, about, strengths, risks) VALUES ('HDB Financial Services', 'NBFC / Finance', 12500, 700, 740, CURRENT_DATE - 2, CURRENT_DATE + 1, CURRENT_DATE + 8, 52, 7.0, 4, 'Strong parentage (HDFC Bank), consistent profitability, large NBFC. IPO priced fairly. Good for listing gain and long term.', 20, 14800, 'open', 'HDB Financial Services is HDFC Bank subsidiary and one of India largest NBFCs.', ARRAY['HDFC Bank parentage', 'Pan-India reach', 'Diversified loan book'], ARRAY['Unsecured loan exposure', 'NPA risk in economic slowdown']);",
            "INSERT INTO ipos (company_name, sector, issue_size_cr, price_band_low, price_band_high, open_date, close_date, listing_date, gmp_premium, gmp_percent, et_rating, et_verdict, lot_size, min_investment, status, about, strengths, risks) VALUES ('Ather Energy', 'EV / Auto', 2982, 304, 321, CURRENT_DATE + 5, CURRENT_DATE + 8, CURRENT_DATE + 15, 28, 8.7, 3, 'India pure-play EV scooter brand. High growth but still loss-making. High risk, high potential. Apply only if you have high risk appetite.', 46, 14766, 'upcoming', 'Ather Energy is India leading electric two-wheeler company backed by Hero MotoCorp.', ARRAY['Strong brand', 'EV tailwinds', 'Hero MotoCorp backing'], ARRAY['Not yet profitable', 'Intense competition from Ola EV']);",
            "INSERT INTO ipos (company_name, sector, issue_size_cr, price_band_low, price_band_high, open_date, close_date, listing_date, gmp_premium, gmp_percent, et_rating, et_verdict, lot_size, min_investment, status, about, strengths, risks) VALUES ('Ulta Beauty India', 'Retail / Beauty', 1800, 420, 445, CURRENT_DATE - 15, CURRENT_DATE - 12, CURRENT_DATE - 6, 0, 0, 3, 'Listed at slight premium. Long term play on India beauty market growth.', 33, 14685, 'listed', 'Beauty and personal care retail chain.', ARRAY['India beauty market growth', 'Premium positioning'], ARRAY['High competition', 'Discretionary spend risk']);",
            "INSERT INTO ipos (company_name, sector, issue_size_cr, price_band_low, price_band_high, open_date, close_date, listing_date, gmp_premium, gmp_percent, et_rating, et_verdict, lot_size, min_investment, status, about, strengths, risks) VALUES ('Navi Technologies', 'Fintech / Insurance', 3350, 195, 205, CURRENT_DATE + 12, CURRENT_DATE + 15, CURRENT_DATE + 22, 0, 0, 2, 'Sachin Bansal-founded fintech. Interesting story but regulatory uncertainty in microfinance is a concern. Risky bet.', 73, 14965, 'upcoming', 'Navi Technologies is a fintech company offering loans, insurance, and mutual funds.', ARRAY['Sachin Bansal brand', 'Full-stack financial services'], ARRAY['Regulatory risk', 'Microfinance stress', 'Not yet profitable']);"
        ]
        
        for q in queries:
            db.execute(text(q))
            
        db.commit()
        print("IPO seed completed.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding IPOs: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
