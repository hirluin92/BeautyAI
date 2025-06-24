-- WhatsApp AI Integration - Database Setup Completo
-- Esegui questo file nel tuo database Supabase

-- 1. Aggiungi campi WhatsApp alla tabella organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_webhook_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_verify_token TEXT;

-- Aggiungi commenti per documentazione
COMMENT ON COLUMN organizations.whatsapp_access_token IS 'WhatsApp Business API access token';
COMMENT ON COLUMN organizations.whatsapp_phone_number_id IS 'WhatsApp Business API phone number ID';
COMMENT ON COLUMN organizations.whatsapp_webhook_url IS 'Webhook URL for receiving WhatsApp messages';
COMMENT ON COLUMN organizations.whatsapp_verify_token IS 'Verification token for WhatsApp webhook';

-- Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_organizations_whatsapp_phone_number_id ON organizations(whatsapp_phone_number_id);

-- 2. Crea tabella feedback per raccolta feedback clienti
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    category VARCHAR(50) DEFAULT 'overall' CHECK (category IN ('service', 'staff', 'facility', 'overall')),
    source VARCHAR(50) DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'website', 'manual', 'email')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crea tabella conversation_logs per logging conversazioni
CREATE TABLE IF NOT EXISTS conversation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    from_number TEXT NOT NULL,
    message_text TEXT,
    response_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crea tabella conversation_contexts per contesto conversazioni
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

-- 5. Crea tabella spam_protection per protezione spam
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

-- 6. Crea tabella whatsapp_whitelist per contatti fidati
CREATE TABLE IF NOT EXISTS whatsapp_whitelist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    contact_name TEXT,
    contact_type VARCHAR(50) DEFAULT 'friend' CHECK (contact_type IN ('friend', 'family', 'employee', 'partner', 'vip')),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique phone number per organization
    UNIQUE(organization_id, phone_number)
);

-- Aggiungi indici per performance
CREATE INDEX IF NOT EXISTS idx_feedback_organization_id ON feedback(organization_id);
CREATE INDEX IF NOT EXISTS idx_feedback_client_id ON feedback(client_id);
CREATE INDEX IF NOT EXISTS idx_feedback_service_id ON feedback(service_id);
CREATE INDEX IF NOT EXISTS idx_feedback_booking_id ON feedback(booking_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

CREATE INDEX IF NOT EXISTS idx_conversation_logs_org_from ON conversation_logs(organization_id, from_number);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_created_at ON conversation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_session ON conversation_contexts(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_contexts_org_from ON conversation_contexts(organization_id, from_number);
CREATE INDEX IF NOT EXISTS idx_spam_protection_org_from ON spam_protection(organization_id, from_number);

-- Indici per whitelist
CREATE INDEX IF NOT EXISTS idx_whatsapp_whitelist_org_phone ON whatsapp_whitelist(organization_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_whitelist_active ON whatsapp_whitelist(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_whitelist_type ON whatsapp_whitelist(contact_type);

-- Abilita RLS su tutte le tabelle
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE spam_protection ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_whitelist ENABLE ROW LEVEL SECURITY;

-- Policy per feedback
CREATE POLICY "Organizations can view their own feedback" ON feedback
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organizations can insert their own feedback" ON feedback
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organizations can update their own feedback" ON feedback
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organizations can delete their own feedback" ON feedback
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Policy per conversation_logs
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

-- Policy per conversation_contexts
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

-- Policy per spam_protection
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

-- Policy per whatsapp_whitelist
CREATE POLICY "Organizations can view their own whitelist" ON whatsapp_whitelist
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organizations can insert their own whitelist" ON whatsapp_whitelist
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organizations can update their own whitelist" ON whatsapp_whitelist
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organizations can delete their own whitelist" ON whatsapp_whitelist
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Funzioni per incrementare message count
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

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_updated_at();

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

-- Trigger per whitelist
CREATE OR REPLACE FUNCTION update_whatsapp_whitelist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_whatsapp_whitelist_updated_at
    BEFORE UPDATE ON whatsapp_whitelist
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_whitelist_updated_at();

-- Verifica che tutto sia stato creato correttamente
SELECT 'Organizations table updated' as status, 
       column_name, 
       data_type 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
  AND column_name LIKE 'whatsapp%';

SELECT 'Feedback table created' as status, 
       COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_name = 'feedback';

SELECT 'Conversation logs table created' as status, 
       COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_name = 'conversation_logs';

SELECT 'Conversation contexts table created' as status, 
       COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_name = 'conversation_contexts';

SELECT 'Spam protection table created' as status, 
       COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_name = 'spam_protection';

SELECT 'WhatsApp whitelist table created' as status, 
       COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_name = 'whatsapp_whitelist';

-- Esempio di configurazione per un'organizzazione (sostituisci con i tuoi valori)
-- UPDATE organizations 
-- SET 
--   whatsapp_access_token = 'your-access-token',
--   whatsapp_phone_number_id = 'your-phone-number-id',
--   whatsapp_webhook_url = 'https://your-domain.com/api/whatsapp/webhook',
--   whatsapp_verify_token = 'your-verify-token'
-- WHERE id = 'your-organization-id';

-- Setup completato!
SELECT '🎉 Setup WhatsApp AI completato con successo!' as message; 