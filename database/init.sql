CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    age_group VARCHAR(20) NULL,
    gender VARCHAR(20) NULL,
    location VARCHAR(255) NULL,
    occupation VARCHAR(255) NULL,
    industry VARCHAR(100) NULL,
    income_level VARCHAR(20) NULL,
    investment_experience VARCHAR(20) NULL,
    risk_tolerance VARCHAR(20) NULL,
    portfolio_size_range VARCHAR(30) NULL,
    financial_goals JSONB NULL,
    interests JSONB NULL,
    primary_segment VARCHAR(100) NULL,
    sub_segments JSONB NULL,
    profile_completeness INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    message_count INTEGER DEFAULT 0,
    summary TEXT NULL,
    primary_intent VARCHAR(100) NULL
);

CREATE TABLE IF NOT EXISTS messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES conversations(session_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    intent_detected VARCHAR(100) NULL,
    confidence_score DECIMAL(3, 2) NULL,
    recommendations_shown JSONB NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS et_products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(100) NULL,
    pricing_model VARCHAR(50) NULL,
    price_inr DECIMAL(10, 2) NULL,
    trial_available BOOLEAN DEFAULT false,
    trial_duration_days INTEGER NULL,
    url TEXT NULL,
    tags JSONB NULL,
    target_segments JSONB NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    product_id UUID REFERENCES et_products(product_id) ON DELETE CASCADE,
    score DECIMAL(3, 2) NOT NULL,
    reason TEXT NULL,
    recommender_algorithm VARCHAR(100) NULL,
    context VARCHAR(100) NULL,
    status VARCHAR(20) DEFAULT 'shown',
    shown_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    interacted_at TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON et_products(product_code);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
