-- Path: supabase/migrations/20240617_fix_rls_policies_v3.sql
-- Fix per la circular dependency con gestione sicura delle policy esistenti

-- Step 1: Disabilita temporaneamente RLS
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop TUTTE le policy esistenti in modo sicuro
DO $$ 
DECLARE
    pol record;
BEGIN
    -- Drop all policies for organizations
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'organizations' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON organizations', pol.policyname);
    END LOOP;
    
    -- Drop all policies for users
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
    END LOOP;
    
    -- Drop all policies for services
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'services' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON services', pol.policyname);
    END LOOP;
    
    -- Drop all policies for clients
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'clients' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON clients', pol.policyname);
    END LOOP;
    
    -- Drop all policies for bookings
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'bookings' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON bookings', pol.policyname);
    END LOOP;
    
    -- Drop all policies for payments
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'payments' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON payments', pol.policyname);
    END LOOP;
    
    -- Drop all policies for chat_sessions
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_sessions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON chat_sessions', pol.policyname);
    END LOOP;
    
    -- Drop all policies for chat_messages
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_messages' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON chat_messages', pol.policyname);
    END LOOP;
    
    -- Drop all policies for analytics_events
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'analytics_events' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON analytics_events', pol.policyname);
    END LOOP;
    
    -- Drop all policies for notifications
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON notifications', pol.policyname);
    END LOOP;
END $$;

-- Step 3: Crea nuove policies senza circular dependency

-- Organizations policies
CREATE POLICY "org_select_policy"
ON organizations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.organization_id = organizations.id 
        AND users.id = auth.uid()
    )
);

CREATE POLICY "org_update_policy"
ON organizations FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.organization_id = organizations.id 
        AND users.id = auth.uid()
        AND users.role = 'owner'
    )
);

-- Users policies
CREATE POLICY "users_select_policy"
ON users FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
    )
    OR id = auth.uid()
);

CREATE POLICY "users_update_policy"
ON users FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "users_insert_policy"
ON users FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users existing_user
        WHERE existing_user.id = auth.uid() 
        AND existing_user.organization_id = organization_id
        AND existing_user.role = 'owner'
    )
);

-- Services policies
CREATE POLICY "services_select_policy"
ON services FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
    AND deleted_at IS NULL
);

CREATE POLICY "services_all_policy"
ON services FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- Clients policies
CREATE POLICY "clients_select_policy"
ON clients FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

CREATE POLICY "clients_all_policy"
ON clients FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- Bookings policies
CREATE POLICY "bookings_select_policy"
ON bookings FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

CREATE POLICY "bookings_all_policy"
ON bookings FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- Payments policies
CREATE POLICY "payments_select_policy"
ON payments FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

CREATE POLICY "payments_all_policy"
ON payments FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- Chat sessions policies
CREATE POLICY "chat_sessions_select_policy"
ON chat_sessions FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

CREATE POLICY "chat_sessions_all_policy"
ON chat_sessions FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- Chat messages policies
CREATE POLICY "chat_messages_select_policy"
ON chat_messages FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

CREATE POLICY "chat_messages_all_policy"
ON chat_messages FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- Analytics events policies
CREATE POLICY "analytics_select_policy"
ON analytics_events FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

CREATE POLICY "analytics_all_policy"
ON analytics_events FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- Notifications policies
CREATE POLICY "notifications_select_policy"
ON notifications FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

CREATE POLICY "notifications_all_policy"
ON notifications FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    )
);

-- Step 4: Riabilita RLS
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

-- Step 5: Crea indici per performance
CREATE INDEX IF NOT EXISTS idx_users_auth_org ON users(id, organization_id);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_services_org_deleted ON services(organization_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_org ON bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_org ON chat_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_org ON chat_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_org ON analytics_events(organization_id);

-- Step 6: Verifica che tutto sia configurato
DO $$
BEGIN
    RAISE NOTICE 'RLS Policies applicate con successo!';
    RAISE NOTICE 'Tutte le tabelle hanno RLS abilitato.';
END $$;