import psycopg2
import os

DB_URL = os.getenv("DATABASE_URL", "postgresql://et_user:et_password@localhost:5432/et_concierge")

# Parse if needed
import re
m = re.match(r'postgresql://([^:]+):([^@]+)@([^:/]+):?(\d*)/(.+)', DB_URL)
if m:
    user, password, host, port, dbname = m.groups()
    port = int(port) if port else 5432
else:
    raise ValueError(f"Cannot parse DB_URL: {DB_URL}")

conn = psycopg2.connect(host=host, port=port, user=user, password=password, dbname=dbname)
cur = conn.cursor()

cur.execute("""
    CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh_key TEXT NOT NULL,
        auth_key TEXT NOT NULL,
        user_agent VARCHAR(300),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP
    )
""")

cur.execute("""
    CREATE TABLE IF NOT EXISTS notification_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        trigger_type VARCHAR(100) NOT NULL,
        title VARCHAR(300),
        body TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        clicked_at TIMESTAMP
    )
""")

conn.commit()
cur.close()
conn.close()
print("push_subscriptions and notification_logs tables created OK")
