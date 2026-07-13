-- AI Usage tracking table
CREATE TABLE ai_usage_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    estimated_cost DOUBLE PRECISION DEFAULT 0.0,
    request_type VARCHAR(50),
    duration_ms BIGINT DEFAULT 0,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_usage_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Index for querying usage by user
CREATE INDEX idx_usage_user_id ON ai_usage_records (user_id);
CREATE INDEX idx_usage_created_at ON ai_usage_records (created_at);
