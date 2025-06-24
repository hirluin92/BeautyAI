-- Create conversation logging and spam protection tables

-- 1. Conversation Logs Table
CREATE TABLE IF NOT EXISTS conversation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    from_number TEXT NOT NULL,
    message_text TEXT,
    response_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Conversation Contexts Table
CREATE TABLE IF NOT EXISTS conversation_contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE NOT NULL,
    from_number TEXT NOT NULL,
    last_message TEXT,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Spam Protection Table
CREATE TABLE IF NOT EXISTS spam_protection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    from_number TEXT NOT NULL,
    spam_score INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_logs_org_from ON conversation_logs(organization_id, from_number);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_created_at ON conversation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_session ON conversation_contexts(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_org_from ON conversation_contexts(organization_id, from_number);
CREATE INDEX IF NOT EXISTS idx_spam_protection_org_from ON spam_protection(organization_id, from_number);

-- Enable RLS
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE spam_protection ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_logs
CREATE POLICY "Organizations can view their own conversation logs" ON conversation_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organizations can insert their own conversation logs" ON conversation_logs
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- RLS Policies for conversation_contexts
CREATE POLICY "Organizations can view their own conversation contexts" ON conversation_contexts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organizations can insert their own conversation contexts" ON conversation_contexts
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organizations can update their own conversation contexts" ON conversation_contexts
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- RLS Policies for spam_protection
CREATE POLICY "Organizations can view their own spam protection" ON spam_protection
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organizations can insert their own spam protection" ON spam_protection
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organizations can update their own spam protection" ON spam_protection
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Function to increment message count
CREATE OR REPLACE FUNCTION increment_message_count(session_id_param TEXT)
RETURNS INTEGER AS $$
BEGIN
    UPDATE conversation_contexts 
    SET message_count = message_count + 1,
        updated_at = NOW()
    WHERE session_id = session_id_param;
    
    RETURN (SELECT message_count FROM conversation_contexts WHERE session_id = session_id_param);
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_conversation_contexts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_contexts_updated_at
    BEFORE UPDATE ON conversation_contexts
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_contexts_updated_at();

CREATE OR REPLACE FUNCTION update_spam_protection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_spam_protection_updated_at
    BEFORE UPDATE ON spam_protection
    FOR EACH ROW
    EXECUTE FUNCTION update_spam_protection_updated_at(); 