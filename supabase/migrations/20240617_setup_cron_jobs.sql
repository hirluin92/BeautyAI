-- Path: supabase/migrations/20240617_setup_cron_jobs.sql

-- Abilita l'estensione pg_cron se non già abilitata
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Configura il cron job per i reminder ogni ora
-- Questo job chiamerà la edge function ogni ora per controllare i reminder
SELECT cron.schedule(
    'send-booking-reminders', -- nome del job
    '0 * * * *', -- ogni ora all'inizio dell'ora (minuto 0)
    $$
    SELECT
        net.http_post(
            url := 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-reminders',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || 'YOUR_ANON_KEY'
            ),
            body := jsonb_build_object(
                'trigger', 'cron',
                'timestamp', now()
            )
        ) AS request_id;
    $$
);

-- Opzionale: Job per marking automatico no-show (30 minuti dopo l'appuntamento)
SELECT cron.schedule(
    'mark-no-show-bookings',
    '*/30 * * * *', -- ogni 30 minuti
    $$
    UPDATE bookings
    SET 
        status = 'no_show',
        no_show_marked = true,
        no_show_marked_at = now()
    WHERE 
        status = 'confirmed'
        AND end_at < (now() - interval '30 minutes')
        AND no_show_marked = false;
    $$
);

-- Per visualizzare i job schedulati
-- SELECT * FROM cron.job;

-- Per rimuovere un job
-- SELECT cron.unschedule('send-booking-reminders');