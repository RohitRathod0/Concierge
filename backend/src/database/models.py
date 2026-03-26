from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Numeric, Text, text, UniqueConstraint, BigInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY, DATE
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    user_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    last_login_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    conversations = relationship("Conversation", back_populates="user")
    journey_stage = relationship("JourneyStage", back_populates="user", uselist=False)
    milestones = relationship("Milestone", back_populates="user")
    events = relationship("UserEvent", back_populates="user")

class UserProfile(Base):
    __tablename__ = 'user_profiles'
    profile_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), unique=True)
    age_group = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    location = Column(String(255), nullable=True)
    occupation = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)
    income_level = Column(String(20), nullable=True)
    investment_experience = Column(String(20), nullable=True)
    risk_tolerance = Column(String(20), nullable=True)
    portfolio_size_range = Column(String(30), nullable=True)
    financial_goals = Column(JSONB, nullable=True)
    interests = Column(JSONB, nullable=True)
    primary_segment = Column(String(100), nullable=True)
    sub_segments = Column(JSONB, nullable=True)
    profile_completeness = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    # Phase 2 additions
    segment_confidence = Column(Numeric(3, 2), nullable=True)
    sub_segments_scores = Column(JSONB, nullable=True)
    life_stage = Column(String(50), nullable=True)
    life_stage_confidence = Column(Numeric(3, 2), nullable=True)
    behavioral_signals = Column(JSONB, nullable=True)
    last_enriched_at = Column(DateTime, nullable=True)
    
    # Phase 3.5 additions
    # Phase 3.5 additions: 10-Point Deep Profiling (Refined Behavioral)
    financial_persona = Column(String(50), nullable=True)
    # The 10 final vectors
    income_stability = Column(String(50), nullable=True)
    financial_cushion = Column(String(50), nullable=True)
    expense_pressure = Column(String(50), nullable=True)
    debt_stress = Column(String(50), nullable=True)
    type_of_debt = Column(String(50), nullable=True)
    protection_status = Column(String(50), nullable=True)
    wealth_stage = Column(String(50), nullable=True)
    money_behavior = Column(String(50), nullable=True)
    financial_direction = Column(String(50), nullable=True)
    responsibility_load = Column(String(50), nullable=True)
    
    # Legacy fields
    knowledge_level = Column(String(20), default='beginner')
    primary_goal = Column(String(50), nullable=True)
    risk_appetite = Column(String(20), nullable=True)
    monthly_investment_capacity = Column(String(30), nullable=True)
    profession = Column(String(100), nullable=True)
    age_bracket = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    city_tier = Column(String(10), nullable=True)
    has_demat_account = Column(Boolean, default=False)
    has_et_prime = Column(Boolean, default=False)
    interested_sectors = Column(JSONB, nullable=True)
    interested_products = Column(JSONB, nullable=True)
    onboarding_completed = Column(Boolean, default=False)

    user = relationship("User", back_populates="profile")

class Conversation(Base):
    __tablename__ = 'conversations'
    session_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    started_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    last_message_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    status = Column(String(20), default='active')
    message_count = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    primary_intent = Column(String(100), nullable=True)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")
    states = relationship("ConversationState", back_populates="conversation")
    agent_executions = relationship("AgentExecution", back_populates="conversation")

class Message(Base):
    __tablename__ = 'messages'
    message_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    session_id = Column(UUID(as_uuid=True), ForeignKey('conversations.session_id', ondelete='CASCADE'))
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    intent_detected = Column(String(100), nullable=True)
    confidence_score = Column(Numeric(3, 2), nullable=True)
    recommendations_shown = Column(JSONB, nullable=True)
    timestamp = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    # Phase 2 additions
    agent_used = Column(String(50), nullable=True)
    context_used = Column(JSONB, nullable=True)
    message_metadata = Column("metadata", JSONB, nullable=True)

    conversation = relationship("Conversation", back_populates="messages")

class ETProduct(Base):
    __tablename__ = 'et_products'
    product_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    product_code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    pricing_model = Column(String(50), nullable=True)
    price_inr = Column(Numeric(10, 2), nullable=True)
    trial_available = Column(Boolean, default=False)
    trial_duration_days = Column(Integer, nullable=True)
    url = Column(Text, nullable=True)
    tags = Column(JSONB, nullable=True)
    target_segments = Column(JSONB, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class Recommendation(Base):
    __tablename__ = 'recommendations'
    recommendation_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    product_id = Column(UUID(as_uuid=True), ForeignKey('et_products.product_id', ondelete='CASCADE'))
    score = Column(Numeric(3, 2), nullable=False)
    reason = Column(Text, nullable=True)
    recommender_algorithm = Column(String(100), nullable=True)
    context = Column(String(100), nullable=True)
    status = Column(String(20), default='shown')
    shown_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    interacted_at = Column(DateTime, nullable=True)

# ============================================================
# Phase 2 New Models
# ============================================================

class ConversationState(Base):
    """LangGraph conversation checkpoints."""
    __tablename__ = 'conversation_states'
    state_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    session_id = Column(UUID(as_uuid=True), ForeignKey('conversations.session_id', ondelete='CASCADE'))
    checkpoint_id = Column(String(100), nullable=False)
    state_data = Column(JSONB, nullable=False)
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

    conversation = relationship("Conversation", back_populates="states")

class JourneyStage(Base):
    """User journey progression stage."""
    __tablename__ = 'journey_stages'
    journey_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), unique=True)
    current_stage = Column(String(50), nullable=False, default='discovery')
    stage_started_at = Column(DateTime, nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    previous_stage = Column(String(50), nullable=True)
    velocity_score = Column(Numeric(3, 2), nullable=True)
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

    user = relationship("User", back_populates="journey_stage")

class Milestone(Base):
    """Individual milestone tracking per user."""
    __tablename__ = 'milestones'
    milestone_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    milestone_name = Column(String(100), nullable=False)
    journey_stage = Column(String(50), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    reward_points = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

    __table_args__ = (UniqueConstraint('user_id', 'milestone_name', name='uq_user_milestone'),)

    user = relationship("User", back_populates="milestones")

class UserEvent(Base):
    """Analytics event stream."""
    __tablename__ = 'user_events'
    event_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    event_type = Column(String(100), nullable=False)
    event_category = Column(String(50), nullable=True)
    event_data = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    session_id = Column(UUID(as_uuid=True), nullable=True)
    timestamp = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

    user = relationship("User", back_populates="events")

class AgentExecution(Base):
    """Per-invocation agent performance log."""
    __tablename__ = 'agent_executions'
    execution_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    session_id = Column(UUID(as_uuid=True), ForeignKey('conversations.session_id', ondelete='CASCADE'))
    agent_name = Column(String(50), nullable=False)
    input_data = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    output_data = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    execution_time_ms = Column(Integer, nullable=False)
    success = Column(Boolean, nullable=False)
    error_message = Column(Text, nullable=True)
    timestamp = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

    conversation = relationship("Conversation", back_populates="agent_executions")

class RAGDocument(Base):
    """Metadata for documents stored in ChromaDB."""
    __tablename__ = 'rag_documents'
    document_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    chroma_id = Column(String(100), unique=True, nullable=False)
    collection_name = Column(String(50), nullable=False)
    source_type = Column(String(50), nullable=False)
    source_id = Column(String(255), nullable=True)
    title = Column(String(500), nullable=True)
    content_preview = Column(Text, nullable=True)
    document_metadata = Column("metadata", JSONB, nullable=True)
    ingested_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    last_updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

# ============================================================
# Phase 3 New Models
# ============================================================

class UserIdentityScore(Base):
    __tablename__ = 'user_identity_scores'
    score_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), unique=True)
    wealth_stage = Column(String(100), nullable=True)
    risk_fingerprint = Column(String(50), nullable=True)
    knowledge_quotient = Column(String(50), nullable=True)
    product_readiness_json = Column(JSONB, nullable=True)
    engagement_archetype = Column(String(50), nullable=True)
    life_event_flags = Column(JSONB, nullable=True)
    identity_vector = Column(JSONB, nullable=True)
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class NudgeEvent(Base):
    __tablename__ = 'nudge_events'
    nudge_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    trigger_type = Column(String(100), nullable=False)
    nudge_copy = Column(Text, nullable=False)
    channel = Column(String(50), nullable=False)
    shown_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    clicked = Column(Boolean, default=False)
    converted = Column(Boolean, default=False)
    revenue_attributed = Column(Numeric(10, 2), nullable=True)

class CrossSellQueue(Base):
    __tablename__ = 'crosssell_queue'
    queue_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    product_id = Column(UUID(as_uuid=True), ForeignKey('et_products.product_id', ondelete='CASCADE'))
    readiness_score = Column(Numeric(5, 2), nullable=False)
    cooldown_until = Column(DateTime, nullable=True)
    status = Column(String(50), default='queued')
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class FinancialHealthScore(Base):
    __tablename__ = 'financial_health_scores'
    health_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), unique=True)
    total_score = Column(Integer, default=0)
    diversification_score = Column(Integer, default=0)
    protection_score = Column(Integer, default=0)
    emergency_fund_score = Column(Integer, default=0)
    knowledge_score = Column(Integer, default=0)
    growth_trajectory_score = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class UserXP(Base):
    __tablename__ = 'user_xp'
    xp_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), unique=True)
    total_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class Achievement(Base):
    __tablename__ = 'achievements'
    achievement_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    achievement_type = Column(String(100), nullable=False)
    earned_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class Streak(Base):
    __tablename__ = 'streaks'
    streak_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    streak_type = Column(String(50), nullable=False)
    current_count = Column(Integer, default=0)
    longest_count = Column(Integer, default=0)
    last_activity_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    shields_available = Column(Integer, default=0)

class LeaderboardEntry(Base):
    __tablename__ = 'leaderboard_entries'
    entry_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), unique=True)
    board_type = Column(String(50), nullable=False)
    score = Column(Integer, nullable=False)
    rank = Column(Integer, nullable=True)
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class Referral(Base):
    __tablename__ = 'referrals'
    referral_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    referrer_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    referred_user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=True)
    referral_code = Column(String(50), unique=True, nullable=False)
    status = Column(String(50), default='pending')
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    verified_at = Column(DateTime, nullable=True)

class ETCoin(Base):
    __tablename__ = 'et_coins'
    wallet_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), unique=True)
    balance = Column(Integer, default=0)
    total_earned = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class ActivityEvent(Base):
    __tablename__ = 'activity_events'
    event_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    anonymized_user_id = Column(String(255), nullable=True)
    event_type = Column(String(100), nullable=False)
    anonymized_name = Column(String(100), nullable=False)
    city = Column(String(100), nullable=True)
    action_text = Column(Text, nullable=False)
    entity_name = Column(String(255), nullable=True)
    timestamp = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class FeedInteraction(Base):
    __tablename__ = 'feed_interactions'
    interaction_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    card_id = Column(String(100), nullable=False)
    card_type = Column(String(50), nullable=False)
    interaction_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class NotificationPreference(Base):
    __tablename__ = 'notification_preferences'
    pref_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), unique=True)
    email_enabled = Column(Boolean, default=True)
    push_enabled = Column(Boolean, default=True)
    whatsapp_enabled = Column(Boolean, default=False)
    dnd_start = Column(String(5), default='22:00')
    dnd_end = Column(String(5), default='07:00')

class NotificationLog(Base):
    __tablename__ = 'notification_logs'
    log_id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'))
    notification_type = Column(String(100), nullable=False)
    channel = Column(String(50), nullable=False)
    status = Column(String(50), default='sent')
    sent_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    opened_at = Column(DateTime, nullable=True)

# ============================================================
# Phase 3.5 New Models (Deep User Profiling)
# ============================================================

class BehavioralSignal(Base):
    """Logs every meaningful user action."""
    __tablename__ = 'behavioral_signals'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    signal_type = Column(String(50), nullable=False)
    signal_value = Column(JSONB, nullable=False)
    page_context = Column(String(100), nullable=True)
    session_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class ETProductReadiness(Base):
    """Per-product conversion readiness score (0-100)."""
    __tablename__ = 'et_product_readiness'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    product_id = Column(String(50), nullable=False)
    readiness_score = Column(Integer, default=0)
    last_shown_at = Column(DateTime, nullable=True)
    last_clicked_at = Column(DateTime, nullable=True)
    last_rejected_at = Column(DateTime, nullable=True)
    conversion_status = Column(String(30), default='not_started')
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    
    __table_args__ = (UniqueConstraint('user_id', 'product_id', name='uq_user_product_readiness'),)

class ProfileVersion(Base):
    """Tracks how profile evolves for ML training."""
    __tablename__ = 'profile_versions'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    profile_snapshot = Column(JSONB, nullable=False)
    trigger_event = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

# ============================================================
# ET Market Features Models
# ============================================================

class IPO(Base):
    __tablename__ = 'ipos'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    company_name = Column(String(200), nullable=False)
    company_logo_url = Column(String(500), nullable=True)
    sector = Column(String(100), nullable=True)
    issue_size_cr = Column(Numeric(12, 2), nullable=True)
    price_band_low = Column(Integer, nullable=True)
    price_band_high = Column(Integer, nullable=True)
    open_date = Column(DATE, nullable=True)
    close_date = Column(DATE, nullable=True)
    listing_date = Column(DATE, nullable=True)
    gmp_premium = Column(Integer, default=0)
    gmp_percent = Column(Numeric(5, 2), default=0)
    et_rating = Column(Integer, default=3)
    et_verdict = Column(String(500), nullable=True)
    lot_size = Column(Integer, nullable=True)
    min_investment = Column(Integer, nullable=True)
    status = Column(String(20), default='upcoming')
    listing_price = Column(Numeric(10, 2), nullable=True)
    listing_gain_percent = Column(Numeric(5, 2), nullable=True)
    about = Column(Text, nullable=True)
    strengths = Column(ARRAY(Text), nullable=True)
    risks = Column(ARRAY(Text), nullable=True)
    registrar = Column(String(200), nullable=True)
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class IPOAlert(Base):
    __tablename__ = 'ipo_alerts'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    ipo_id = Column(UUID(as_uuid=True), ForeignKey('ipos.id', ondelete='CASCADE'), nullable=False)
    alert_type = Column(String(30), default='open_soon')
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    __table_args__ = (UniqueConstraint('user_id', 'ipo_id', name='uq_user_ipo_alert'),)

class Course(Base):
    __tablename__ = 'courses'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    title = Column(String(300), nullable=False)
    slug = Column(String(300), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    category = Column(String(50), nullable=False)
    level = Column(String(20), nullable=False)
    instructor_name = Column(String(200), nullable=False)
    instructor_bio = Column(String(500), nullable=True)
    instructor_avatar_url = Column(String(500), nullable=True)
    duration_hours = Column(Numeric(4, 1), nullable=True)
    total_modules = Column(Integer, nullable=True)
    total_learners = Column(Integer, default=0)
    rating = Column(Numeric(3, 2), default=4.0)
    price = Column(Integer, nullable=False)
    original_price = Column(Integer, nullable=True)
    is_free = Column(Boolean, default=False)
    thumbnail_url = Column(String(500), nullable=True)
    preview_video_url = Column(String(500), nullable=True)
    badge_label = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))

class CourseModule(Base):
    __tablename__ = 'course_modules'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    course_id = Column(UUID(as_uuid=True), ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    module_number = Column(Integer, nullable=False)
    title = Column(String(300), nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    is_free_preview = Column(Boolean, default=False)

class CourseEnrollment(Base):
    __tablename__ = 'course_enrollments'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    enrolled_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    progress_pct = Column(Integer, default=0)
    last_module_completed = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    __table_args__ = (UniqueConstraint('user_id', 'course_id', name='uq_user_course_enroll'),)

class WatchlistItem(Base):
    __tablename__ = 'watchlist_items'
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    symbol = Column(String(20), nullable=False)
    company_name = Column(String(200), nullable=True)
    sector = Column(String(100), nullable=True)
    added_at = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
    __table_args__ = (UniqueConstraint('user_id', 'symbol', name='uq_user_symbol_watchlist'),)

class MarketDataCache(Base):
    __tablename__ = 'market_data_cache'
    symbol = Column(String(30), primary_key=True)
    price = Column(Numeric(12, 2), nullable=True)
    change_amount = Column(Numeric(10, 2), nullable=True)
    change_percent = Column(Numeric(6, 2), nullable=True)
    volume = Column(BigInteger, nullable=True)
    high_52w = Column(Numeric(12, 2), nullable=True)
    low_52w = Column(Numeric(12, 2), nullable=True)
    market_cap = Column(BigInteger, nullable=True)
    last_updated = Column(DateTime, server_default=text('CURRENT_TIMESTAMP'))
