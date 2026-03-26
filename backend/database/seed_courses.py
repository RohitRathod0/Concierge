import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from src.database.connection import SessionLocal

def seed():
    db = SessionLocal()
    try:
        res = db.execute(text("SELECT COUNT(*) FROM courses")).scalar()
        if res > 0:
            print("Courses already seeded.")
            return

        print("Seeding Courses...")
        queries = [
            # Courses
            "INSERT INTO courses (id, title, slug, description, short_description, category, level, instructor_name, instructor_bio, duration_hours, total_modules, total_learners, rating, price, original_price, badge_label, is_free) VALUES (gen_random_uuid(), 'Stock Market for Beginners', 'stock-market-beginners', 'Learn the fundamentals of stock market investing with real Indian market examples.', 'Learn stock market fundamentals with Indian market examples', 'equities', 'beginner', 'Neeraj Gupta', 'SEBI-registered analyst.', 8.5, 12, 24560, 4.7, 1999, 3999, 'Recommended', false);",
            "INSERT INTO courses (id, title, slug, description, short_description, category, level, instructor_name, instructor_bio, duration_hours, total_modules, total_learners, rating, price, original_price, badge_label, is_free) VALUES (gen_random_uuid(), 'Technical Analysis Masterclass', 'technical-analysis-masterclass', 'Master the art of reading charts.', 'Learn charts, candlesticks, RSI, MACD with live trade examples', 'trading', 'advanced', 'Rajesh Mehta', 'Professional trader.', 14.0, 18, 18920, 4.8, 4999, 7999, 'Trending', false);",
            "INSERT INTO courses (id, title, slug, description, short_description, category, level, instructor_name, instructor_bio, duration_hours, total_modules, total_learners, rating, price, original_price, badge_label, is_free) VALUES (gen_random_uuid(), 'Mutual Funds Deep Dive', 'mutual-funds-deep-dive', 'Everything about mutual funds.', 'SIP strategies, fund selection, tax planning', 'mutual_funds', 'beginner', 'Priya Sharma', 'AMFI-registered mutual fund distributor.', 6.0, 9, 31240, 4.6, 1499, 2499, 'Bestseller', false);",
            "INSERT INTO courses (id, title, slug, description, short_description, category, level, instructor_name, instructor_bio, duration_hours, total_modules, total_learners, rating, price, original_price, badge_label, is_free) VALUES (gen_random_uuid(), 'Options and Derivatives', 'options-derivatives', 'Advanced options trading strategies.', 'Advanced derivatives strategies', 'derivatives', 'advanced', 'Amit Kolhatkar', 'Options trader.', 18.0, 22, 8450, 4.5, 6999, 9999, 'Niche Pick', false);",
            "INSERT INTO courses (id, title, slug, description, short_description, category, level, instructor_name, instructor_bio, duration_hours, total_modules, total_learners, rating, price, original_price, badge_label, is_free) VALUES (gen_random_uuid(), 'Personal Finance Blueprint', 'personal-finance-blueprint', 'A complete guide to managing your personal finances.', 'Insurance, taxes, EPF, PPF', 'personal_finance', 'beginner', 'Sonal Jain', 'SEBI-registered investment advisor.', 5.0, 8, 42100, 4.9, 0, 1999, 'Bestseller', true);",
            "INSERT INTO courses (id, title, slug, description, short_description, category, level, instructor_name, instructor_bio, duration_hours, total_modules, total_learners, rating, price, original_price, badge_label, is_free) VALUES (gen_random_uuid(), 'IPO Investing Strategy', 'ipo-investing-strategy', 'Learn how to evaluate IPO quality.', 'Evaluate IPOs, understand GMP, allotment tactics', 'ipo', 'intermediate', 'Vikram Singh', 'Investment banker.', 4.5, 7, 15670, 4.4, 1999, 2999, 'Trending', false);",
            
            # Modules for Stock Market Basics
            "INSERT INTO course_modules (id, course_id, module_number, title, duration_minutes, is_free_preview) SELECT gen_random_uuid(), id, 1, 'What is the Stock Market?', 25, true FROM courses WHERE slug='stock-market-beginners';",
            "INSERT INTO course_modules (id, course_id, module_number, title, duration_minutes, is_free_preview) SELECT gen_random_uuid(), id, 2, 'How BSE and NSE work', 30, true FROM courses WHERE slug='stock-market-beginners';",
            "INSERT INTO course_modules (id, course_id, module_number, title, duration_minutes, is_free_preview) SELECT gen_random_uuid(), id, 3, 'Reading a Stock Quote', 35, false FROM courses WHERE slug='stock-market-beginners';",
            "INSERT INTO course_modules (id, course_id, module_number, title, duration_minutes, is_free_preview) SELECT gen_random_uuid(), id, 4, 'Fundamental Analysis Basics', 40, false FROM courses WHERE slug='stock-market-beginners';",
            "INSERT INTO course_modules (id, course_id, module_number, title, duration_minutes, is_free_preview) SELECT gen_random_uuid(), id, 5, 'Your First Stock Purchase', 30, false FROM courses WHERE slug='stock-market-beginners';"
        ]
        for q in queries:
            db.execute(text(q))
            
        db.commit()
        print("Course seed completed.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding courses: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
