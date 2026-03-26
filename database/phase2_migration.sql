-- ============================================================
-- ET AI Concierge - Phase 2 Migration
-- Run after init.sql (Phase 1 tables must already exist)
-- All statements are idempotent (safe to re-run)
-- ============================================================

-- --------------------------------------------------------
-- 1. ALTER existing tables (add Phase 2 columns)
-- --------------------------------------------------------

-- messages: add agent attribution + RAG context fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='agent_used') THEN
        ALTER TABLE messages ADD COLUMN agent_used VARCHAR(50) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='context_used') THEN
        ALTER TABLE messages ADD COLUMN context_used JSONB NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='metadata') THEN
        ALTER TABLE messages ADD COLUMN metadata JSONB NULL;
    END IF;
END $$;

-- user_profiles: add enriched profiling fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='segment_confidence') THEN
        ALTER TABLE user_profiles ADD COLUMN segment_confidence DECIMAL(3, 2) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='sub_segments_scores') THEN
        ALTER TABLE user_profiles ADD COLUMN sub_segments_scores JSONB NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='life_stage') THEN
        ALTER TABLE user_profiles ADD COLUMN life_stage VARCHAR(50) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='life_stage_confidence') THEN
        ALTER TABLE user_profiles ADD COLUMN life_stage_confidence DECIMAL(3, 2) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='behavioral_signals') THEN
        ALTER TABLE user_profiles ADD COLUMN behavioral_signals JSONB NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='last_enriched_at') THEN
        ALTER TABLE user_profiles ADD COLUMN last_enriched_at TIMESTAMP NULL;
    END IF;
END $$;

-- --------------------------------------------------------
-- 2. New tables
-- --------------------------------------------------------

-- conversation_states: LangGraph checkpointing
CREATE TABLE IF NOT EXISTS conversation_states (
    state_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES conversations(session_id) ON DELETE CASCADE,
    checkpoint_id VARCHAR(100) NOT NULL,
    state_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conv_states_session ON conversation_states(session_id);
CREATE INDEX IF NOT EXISTS idx_conv_states_checkpoint ON conversation_states(checkpoint_id);

-- journey_stages: user journey progression
CREATE TABLE IF NOT EXISTS journey_stages (
    journey_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    current_stage VARCHAR(50) NOT NULL DEFAULT 'discovery',
    stage_started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    previous_stage VARCHAR(50) NULL,
    velocity_score DECIMAL(3, 2) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_journey_user ON journey_stages(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_stage ON journey_stages(current_stage);

-- milestones: individual milestone completions per user
CREATE TABLE IF NOT EXISTS milestones (
    milestone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    milestone_name VARCHAR(100) NOT NULL,
    journey_stage VARCHAR(50) NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP NULL,
    reward_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, milestone_name)
);

CREATE INDEX IF NOT EXISTS idx_milestones_user ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_completed ON milestones(completed);
CREATE INDEX IF NOT EXISTS idx_milestones_stage ON milestones(journey_stage);

-- user_events: analytics event stream
CREATE TABLE IF NOT EXISTS user_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    session_id UUID NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_user ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON user_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_data ON user_events USING GIN (event_data);

-- agent_executions: per-invocation performance log
CREATE TABLE IF NOT EXISTS agent_executions (
    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES conversations(session_id) ON DELETE CASCADE,
    agent_name VARCHAR(50) NOT NULL,
    input_data JSONB NOT NULL DEFAULT '{}',
    output_data JSONB NOT NULL DEFAULT '{}',
    execution_time_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_executions_session ON agent_executions(session_id);
CREATE INDEX IF NOT EXISTS idx_executions_agent ON agent_executions(agent_name);
CREATE INDEX IF NOT EXISTS idx_executions_timestamp ON agent_executions(timestamp);

-- rag_documents: metadata for ChromaDB documents
CREATE TABLE IF NOT EXISTS rag_documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chroma_id VARCHAR(100) UNIQUE NOT NULL,
    collection_name VARCHAR(50) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(255) NULL,
    title VARCHAR(500) NULL,
    content_preview TEXT NULL,
    metadata JSONB NULL,
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rag_docs_collection ON rag_documents(collection_name);
CREATE INDEX IF NOT EXISTS idx_rag_docs_source ON rag_documents(source_type, source_id);
