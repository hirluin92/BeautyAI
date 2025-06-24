-- Rate Limiting Tables for Beauty AI (Gratuito - Solo Supabase)
-- Created: 2024-12-01

-- Configurazioni dinamiche per rate limiting
CREATE TABLE rate_limit_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_name TEXT NOT NULL UNIQUE,
    config_type TEXT NOT NULL CHECK (config_type IN ('global', 'service', 'user_type')),
    service_name TEXT, -- NULL per global/user_type
    user_type TEXT, -- NULL per global/service
    requests_per_window INTEGER NOT NULL,
    window_seconds INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracking delle violazioni di rate limiting
CREATE TABLE rate_limit_violations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL, -- IP, user_id, phone_number
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'user_id', 'phone_number', 'session')),
    service_name TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    violation_type TEXT NOT NULL CHECK (violation_type IN ('rate_limit_exceeded', 'spam_detected', 'suspicious_activity')),
    request_count INTEGER NOT NULL,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    country_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log delle richieste per analytics (ottimizzato per Supabase gratuito)
CREATE TABLE rate_limit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL,
    identifier_type TEXT NOT NULL,
    service_name TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    user_agent TEXT,
    ip_address INET,
    country_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurazioni predefinite (conservative per piano gratuito)
INSERT INTO rate_limit_configs (config_name, config_type, service_name, user_type, requests_per_window, window_seconds) VALUES
-- Configurazioni globali (conservative)
('global_default', 'global', NULL, NULL, 50, 3600), -- 50 req/ora per IP
('global_strict', 'global', NULL, NULL, 5, 300), -- 5 req/5min per IP sospetti

-- Configurazioni per servizi (conservative per piano gratuito)
('whatsapp_ai', 'service', 'whatsapp_ai', NULL, 30, 1800), -- 30 msg/30min
('bookings_api', 'service', 'bookings', NULL, 10, 3600), -- 10 prenotazioni/ora
('sms_notifications', 'service', 'sms', NULL, 5, 3600), -- 5 SMS/ora
('email_notifications', 'service', 'email', NULL, 20, 3600), -- 20 email/ora
('file_upload', 'service', 'upload', NULL, 5, 3600), -- 5 upload/ora
('dashboard_api', 'service', 'dashboard', NULL, 100, 3600), -- 100 req/ora

-- Configurazioni per tipo utente (WhatsApp) - conservative
('whatsapp_trusted', 'user_type', 'whatsapp_ai', 'trusted', 50, 1800), -- 50 msg/30min per fidati
('whatsapp_existing', 'user_type', 'whatsapp_ai', 'existing', 30, 1800), -- 30 msg/30min per clienti
('whatsapp_new', 'user_type', 'whatsapp_ai', 'new', 15, 1800), -- 15 msg/30min per nuovi
('whatsapp_unknown', 'user_type', 'whatsapp_ai', 'unknown', 5, 1800); -- 5 msg/30min per sconosciuti

-- Indici ottimizzati per Supabase gratuito (massimo 500MB)
CREATE INDEX idx_rate_limit_violations_identifier ON rate_limit_violations(identifier, identifier_type);
CREATE INDEX idx_rate_limit_violations_service ON rate_limit_violations(service_name, created_at);
CREATE INDEX idx_rate_limit_violations_created_at ON rate_limit_violations(created_at);

CREATE INDEX idx_rate_limit_logs_identifier ON rate_limit_logs(identifier, identifier_type);
CREATE INDEX idx_rate_limit_logs_service ON rate_limit_logs(service_name, created_at);
CREATE INDEX idx_rate_limit_logs_created_at ON rate_limit_logs(created_at);

-- Indici composti per performance
CREATE INDEX idx_rate_limit_logs_composite ON rate_limit_logs(identifier, service_name, created_at);
CREATE INDEX idx_rate_limit_violations_composite ON rate_limit_violations(identifier, service_name, created_at);

-- RLS Policies
ALTER TABLE rate_limit_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- Solo admin possono vedere/modificare configurazioni
CREATE POLICY "Admin can manage rate limit configs" ON rate_limit_configs
    FOR ALL USING (auth.role() = 'authenticated');

-- Solo admin possono vedere violazioni
CREATE POLICY "Admin can view violations" ON rate_limit_violations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admin possono vedere logs
CREATE POLICY "Admin can view logs" ON rate_limit_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Service role può inserire violazioni e logs
CREATE POLICY "Service can insert violations" ON rate_limit_violations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can insert logs" ON rate_limit_logs
    FOR INSERT WITH CHECK (true);

-- Funzione per cleanup automatico (mantiene solo ultimi 7 giorni per piano gratuito)
CREATE OR REPLACE FUNCTION cleanup_rate_limit_data()
RETURNS void AS $$
BEGIN
    -- Elimina log più vecchi di 7 giorni (conservativo per piano gratuito)
    DELETE FROM rate_limit_logs 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Elimina violazioni più vecchie di 7 giorni
    DELETE FROM rate_limit_violations 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Log del cleanup
    RAISE NOTICE 'Cleaned up rate limit data older than 7 days';
END;
$$ LANGUAGE plpgsql;

-- Cron job per cleanup giornaliero (alle 3:00 AM)
SELECT cron.schedule(
    'cleanup-rate-limit-data',
    '0 3 * * *', -- Ogni giorno alle 3:00
    'SELECT cleanup_rate_limit_data();'
);

-- Funzione per ottenere statistiche ottimizzate
CREATE OR REPLACE FUNCTION get_rate_limit_stats(
    p_service_name TEXT DEFAULT NULL,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    total_requests BIGINT,
    total_violations BIGINT,
    violation_rate NUMERIC,
    avg_response_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(l.id)::BIGINT as total_requests,
        COUNT(v.id)::BIGINT as total_violations,
        CASE 
            WHEN COUNT(l.id) > 0 THEN 
                ROUND((COUNT(v.id)::NUMERIC / COUNT(l.id)::NUMERIC) * 100, 2)
            ELSE 0 
        END as violation_rate,
        ROUND(AVG(l.response_time_ms), 2) as avg_response_time
    FROM rate_limit_logs l
    LEFT JOIN rate_limit_violations v ON 
        l.identifier = v.identifier AND 
        l.service_name = v.service_name AND 
        l.created_at = v.created_at
    WHERE l.created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND (p_service_name IS NULL OR l.service_name = p_service_name);
END;
$$ LANGUAGE plpgsql;

-- Funzione per monitorare l'uso dello storage
CREATE OR REPLACE FUNCTION get_storage_usage()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    size_mb NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins + n_tup_upd + n_tup_del as row_count,
        ROUND(pg_total_relation_size(schemaname||'.'||tablename) / 1024.0 / 1024.0, 2) as size_mb
    FROM pg_stat_user_tables 
    WHERE tablename LIKE 'rate_limit%'
    ORDER BY size_mb DESC;
END;
$$ LANGUAGE plpgsql; 