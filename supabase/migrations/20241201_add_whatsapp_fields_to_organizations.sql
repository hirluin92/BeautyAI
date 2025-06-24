-- Add WhatsApp fields to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_webhook_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_verify_token TEXT;

-- Add comments for documentation
COMMENT ON COLUMN organizations.whatsapp_access_token IS 'WhatsApp Business API access token';
COMMENT ON COLUMN organizations.whatsapp_phone_number_id IS 'WhatsApp Business API phone number ID';
COMMENT ON COLUMN organizations.whatsapp_webhook_url IS 'Webhook URL for receiving WhatsApp messages';
COMMENT ON COLUMN organizations.whatsapp_verify_token IS 'Verification token for WhatsApp webhook';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_whatsapp_phone_number_id ON organizations(whatsapp_phone_number_id); 