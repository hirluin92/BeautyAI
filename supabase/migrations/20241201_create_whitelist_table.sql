-- Create WhatsApp Whitelist table for trusted contacts

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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_whitelist_org_phone ON whatsapp_whitelist(organization_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_whitelist_active ON whatsapp_whitelist(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_whitelist_type ON whatsapp_whitelist(contact_type);

-- Enable RLS
ALTER TABLE whatsapp_whitelist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Trigger for updated_at
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