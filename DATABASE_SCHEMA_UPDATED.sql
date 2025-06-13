-- Beauty AI Assistant - Database Schema CORRECTED
-- Version: 2.1 (RLS Policies Active)
-- Date: 13/03/2024

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE IF NOT EXISTS booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE IF NOT EXISTS payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'refunded');
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('owner', 'staff', 'admin');
CREATE TYPE IF NOT EXISTS plan_type AS ENUM ('free', 'premium', 'enterprise');

-- TABLES

-- Organizations (Centri Estetici)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    vat_number VARCHAR(50),
    -- Subscription
    plan_type plan_type DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_ends_at TIMESTAMPTZ,
    client_count INTEGER DEFAULT 0,
    -- WhatsApp
    whatsapp_business_id VARCHAR(255),
    whatsapp_phone_number_id VARCHAR(255),
    whatsapp_access_token TEXT,
    -- Settings
    booking_advance_days INTEGER DEFAULT 30,
    cancellation_hours INTEGER DEFAULT 24,
    working_hours JSONB DEFAULT '{"mon": {"open": "09:00", "close": "19:00"}, "tue": {"open": "09:00", "close": "19:00"}}',
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (Staff) - IMPORTANT: This is NOT the auth.users table!
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Links to Supabase Auth
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'staff',
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services (Trattamenti)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    deleted_at timestamp with time zone,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients (Clienti del centro)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    whatsapp_phone VARCHAR(20),
    birth_date DATE,
    notes TEXT,
    tags TEXT[],
    total_spent DECIMAL(10,2) DEFAULT 0,
    visit_count INTEGER DEFAULT 0,
    last_visit_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, phone)
);

-- Bookings (Prenotazioni)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status booking_status DEFAULT 'pending',
    price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    source VARCHAR(50) DEFAULT 'manual', -- manual, whatsapp, website
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    no_show_marked BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{
      "email": true,
      "sms": true,
      "whatsapp": true,
      "reminder_24h": true,
      "reminder_1h": true
    }'::jsonb,
    last_notification_sent_at TIMESTAMPTZ,
    last_notification_type TEXT,
    no_show_marked_at TIMESTAMPTZ
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50), -- cash, card, bank_transfer
    stripe_payment_intent_id VARCHAR(255),
    invoice_number VARCHAR(50),
    invoice_url TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions (WhatsApp)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    whatsapp_phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    context JSONB DEFAULT '{}',
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL, -- text, image, audio, button
    content TEXT NOT NULL,
    is_from_client BOOLEAN DEFAULT true,
    whatsapp_message_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
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

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_bookings_organization_start ON bookings(organization_id, start_at);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_sent ON bookings(reminder_sent);
CREATE INDEX IF NOT EXISTS idx_bookings_no_show_marked ON bookings(no_show_marked);
CREATE INDEX IF NOT EXISTS idx_bookings_last_notification_sent_at ON bookings(last_notification_sent_at);
CREATE INDEX IF NOT EXISTS idx_clients_organization_phone ON clients(organization_id, phone);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_type ON analytics_events(organization_id, event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_users_auth ON users(id); -- For fast auth.uid() lookups
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_booking_id ON notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_services_deleted_at ON services(deleted_at);

-- FUNCTIONS

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update client stats after booking
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
        UPDATE clients 
        SET 
            visit_count = visit_count + 1,
            last_visit_at = NEW.start_at,
            total_spent = total_spent + NEW.price
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_stats_after_booking
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_client_stats();

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Organizations Policies
CREATE POLICY "Users can view their own organization"
ON organizations FOR SELECT
USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own organization"
ON organizations FOR UPDATE
USING (id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Users Policies
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Services Policies
CREATE POLICY "Organizations can view their own active services"
ON services FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
  AND (deleted_at IS NULL)
);

CREATE POLICY "Users can manage their organization's services"
ON services FOR ALL
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Clients Policies
CREATE POLICY "Users can view their organization's clients"
ON clients FOR SELECT
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's clients"
ON clients FOR ALL
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Bookings Policies
CREATE POLICY "Users can view their organization's bookings"
ON bookings FOR SELECT
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's bookings"
ON bookings FOR ALL
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Payments Policies
CREATE POLICY "Users can view their organization's payments"
ON payments FOR SELECT
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's payments"
ON payments FOR ALL
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Chat Sessions Policies
CREATE POLICY "Users can view their organization's chat sessions"
ON chat_sessions FOR SELECT
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's chat sessions"
ON chat_sessions FOR ALL
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Chat Messages Policies
CREATE POLICY "Users can view their organization's chat messages"
ON chat_messages FOR SELECT
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's chat messages"
ON chat_messages FOR ALL
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Analytics Events Policies
CREATE POLICY "Users can view their organization's analytics"
ON analytics_events FOR SELECT
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's analytics"
ON analytics_events FOR ALL
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Notifications Policies
CREATE POLICY "Organizations can view their own notifications"
ON notifications FOR SELECT
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Organizations can insert their own notifications"
ON notifications FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Organizations can update their own notifications"
ON notifications FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Get user's organization (useful for RLS policies)
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS UUID AS $$
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is owner
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM users 
        WHERE id = auth.uid() 
        AND role = 'owner'
    )
$$ LANGUAGE sql SECURITY DEFINER;

-- Funzione helper per marking no-show
CREATE OR REPLACE FUNCTION mark_booking_no_show(booking_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE bookings
  SET 
    status = 'no_show',
    no_show_marked = true,
    no_show_marked_at = NOW()
  WHERE id = booking_id;
END;
$$ LANGUAGE plpgsql;

-- Funzione helper per invio notifiche
CREATE OR REPLACE FUNCTION send_booking_notification(
  p_booking_id UUID,
  p_type TEXT,
  p_status TEXT DEFAULT 'pending'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    organization_id,
    booking_id,
    type,
    status
  )
  SELECT 
    b.organization_id,
    b.id,
    p_type,
    p_status
  FROM bookings b
  WHERE b.id = p_booking_id
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Aggiornamento commenti
COMMENT ON TABLE bookings IS 'Prenotazioni con gestione stati e notifiche';
COMMENT ON COLUMN bookings.status IS 'Stato prenotazione: pending, confirmed, completed, no_show, cancelled';
COMMENT ON COLUMN bookings.reminder_sent IS 'Flag per reminder inviato';
COMMENT ON COLUMN bookings.no_show_marked IS 'Flag per no-show marcato';
COMMENT ON COLUMN bookings.notification_preferences IS 'Preferenze notifiche cliente';
COMMENT ON COLUMN bookings.last_notification_sent_at IS 'Ultima notifica inviata';
COMMENT ON COLUMN bookings.last_notification_type IS 'Tipo ultima notifica';
COMMENT ON COLUMN bookings.no_show_marked_at IS 'Data marking no-show';

COMMENT ON TABLE notifications IS 'Tracking notifiche inviate';
COMMENT ON COLUMN notifications.type IS 'Tipo notifica: email, sms, whatsapp';
COMMENT ON COLUMN notifications.status IS 'Stato notifica: pending, sent, failed';
COMMENT ON COLUMN notifications.sent_at IS 'Data invio notifica';
COMMENT ON COLUMN notifications.error_message IS 'Messaggio errore se fallita';

-- Aggiornamento types
COMMENT ON TYPE booking_status IS 'Stati possibili per una prenotazione';
COMMENT ON TYPE notification_type IS 'Tipi possibili di notifica';
COMMENT ON TYPE notification_status IS 'Stati possibili per una notifica';

-- NOTA: la dashboard usa una query su bookings che include le relazioni client, service e staff (users!bookings_staff_id_fkey) per mostrare i dettagli nella dropdown clienti di oggi.