-- Tabella per salvare il contesto delle conversazioni AI
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_organization_id ON ai_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON ai_conversations(updated_at);

-- Aggiungi colonna whatsapp_phone_number_id alla tabella organizations se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'organizations' 
        AND column_name = 'whatsapp_phone_number_id'
    ) THEN
        ALTER TABLE organizations ADD COLUMN whatsapp_phone_number_id VARCHAR(255);
    END IF;
END $$;

-- Commenti per documentazione
COMMENT ON TABLE ai_conversations IS 'Tabella per salvare il contesto delle conversazioni AI con WhatsApp';
COMMENT ON COLUMN ai_conversations.session_id IS 'ID unico della sessione di conversazione (organization_id + numero telefono)';
COMMENT ON COLUMN ai_conversations.context IS 'Contesto JSON della conversazione (stato, dati prenotazione, cronologia messaggi)';
COMMENT ON COLUMN organizations.whatsapp_phone_number_id IS 'ID del numero di telefono WhatsApp Business dell''organizzazione'; 