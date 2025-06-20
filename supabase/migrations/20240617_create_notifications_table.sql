-- Path: supabase/migrations/20240617_create_notifications_table.sql

-- Crea la tabella notifications se non esiste
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'whatsapp')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crea gli indici
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_booking_id ON notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Crea il trigger per updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Applica il trigger solo se non esiste già
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notifications_updated_at') THEN
        CREATE TRIGGER update_notifications_updated_at 
        BEFORE UPDATE ON notifications
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Aggiungi anche i campi mancanti alla tabella bookings se non esistono
DO $$ 
BEGIN
    -- Aggiungi reminder_sent se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'bookings' 
                  AND column_name = 'reminder_sent') THEN
        ALTER TABLE bookings ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
    END IF;

    -- Aggiungi last_notification_sent_at se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'bookings' 
                  AND column_name = 'last_notification_sent_at') THEN
        ALTER TABLE bookings ADD COLUMN last_notification_sent_at TIMESTAMPTZ;
    END IF;

    -- Aggiungi last_notification_type se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'bookings' 
                  AND column_name = 'last_notification_type') THEN
        ALTER TABLE bookings ADD COLUMN last_notification_type TEXT;
    END IF;

    -- Aggiungi notification_preferences se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'bookings' 
                  AND column_name = 'notification_preferences') THEN
        ALTER TABLE bookings ADD COLUMN notification_preferences JSONB DEFAULT '{
            "email": true,
            "sms": true,
            "whatsapp": true,
            "reminder_24h": true,
            "reminder_1h": true
        }'::jsonb;
    END IF;

    -- Aggiungi no_show_marked se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'bookings' 
                  AND column_name = 'no_show_marked') THEN
        ALTER TABLE bookings ADD COLUMN no_show_marked BOOLEAN DEFAULT false;
    END IF;

    -- Aggiungi no_show_marked_at se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'bookings' 
                  AND column_name = 'no_show_marked_at') THEN
        ALTER TABLE bookings ADD COLUMN no_show_marked_at TIMESTAMPTZ;
    END IF;
END $$;