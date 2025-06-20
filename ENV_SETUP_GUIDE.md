# Beauty AI Assistant - Environment Setup Guide

**Ultimo aggiornamento:** Dicembre 2024

## 🚀 Setup Iniziale

### Prerequisiti

- **Node.js** 18.17.0 o superiore
- **npm** 9.0.0 o superiore
- **Git** per versioning
- **Editor** (VS Code raccomandato)

### Installazione Dipendenze

```bash
# Clona il repository
git clone https://github.com/your-username/beauty-ai.git
cd beauty-ai

# Installa dipendenze
npm install

# Verifica installazione
npm run dev
```

## 🔧 Configurazione Ambiente

### 1. File Environment

Crea i seguenti file nella root del progetto:

#### `.env.local` (Sviluppo Locale)
```env
# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# =============================================================================
# AUTHENTICATION
# =============================================================================
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# =============================================================================
# NOTIFICATIONS - EMAIL (EmailJS)
# =============================================================================
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# =============================================================================
# NOTIFICATIONS - SMS/WHATSAPP (Twilio)
# =============================================================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# =============================================================================
# WHATSAPP ALTERNATIVE (Green API)
# =============================================================================
GREEN_API_INSTANCE_ID=your_green_api_instance_id
GREEN_API_TOKEN=your_green_api_token

# =============================================================================
# AI INTEGRATION (OpenAI)
# =============================================================================
OPENAI_API_KEY=your_openai_api_key

# =============================================================================
# PAYMENTS (Stripe) - Opzionale
# =============================================================================
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# =============================================================================
# ANALYTICS (Opzionale)
# =============================================================================
GOOGLE_ANALYTICS_ID=your_ga_id
MIXPANEL_TOKEN=your_mixpanel_token

# =============================================================================
# DEVELOPMENT
# =============================================================================
NODE_ENV=development
DEBUG=true
```

#### `.env.production` (Produzione)
```env
# =============================================================================
# PRODUCTION CONFIGURATION
# =============================================================================
NODE_ENV=production
DEBUG=false

# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# =============================================================================
# AUTHENTICATION
# =============================================================================
NEXTAUTH_SECRET=your_production_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# =============================================================================
# NOTIFICATIONS
# =============================================================================
EMAILJS_SERVICE_ID=your_production_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_production_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_production_emailjs_public_key

TWILIO_ACCOUNT_SID=your_production_twilio_account_sid
TWILIO_AUTH_TOKEN=your_production_twilio_auth_token
TWILIO_PHONE_NUMBER=your_production_twilio_phone_number

# =============================================================================
# AI INTEGRATION
# =============================================================================
OPENAI_API_KEY=your_production_openai_api_key

# =============================================================================
# PAYMENTS
# =============================================================================
STRIPE_SECRET_KEY=your_production_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_production_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_production_stripe_webhook_secret
```

## 🗄️ Setup Database (Supabase)

### 1. Creazione Progetto

1. Vai su [Supabase](https://supabase.com)
2. Crea un nuovo progetto
3. Scegli una regione vicina
4. Imposta password database sicura

### 2. Configurazione Database

#### Esegui le Migrazioni

```bash
# Installa Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Link progetto
supabase link --project-ref your-project-ref

# Applica migrazioni
supabase db push
```

#### Schema Database

Le migrazioni sono in `supabase/migrations/`:

- `20240617_create_notifications_table.sql`
- `20240617_fix_rls_policies.sql`
- `20240617_setup_cron_jobs.sql`

### 3. Configurazione RLS

Verifica che le Row Level Security policies siano attive:

```sql
-- Verifica policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 4. Setup Edge Functions

```bash
# Deploy edge functions
supabase functions deploy mark-no-show
supabase functions deploy send-reminders
```

## 📧 Setup Notifiche Email (EmailJS)

### 1. Account EmailJS

1. Registrati su [EmailJS](https://www.emailjs.com)
2. Crea un nuovo servizio email
3. Configura template email

### 2. Template Email

Crea i seguenti template:

#### Conferma Prenotazione
```html
<h2>Conferma Prenotazione</h2>
<p>Ciao {{name}},</p>
<p>La tua prenotazione è stata confermata:</p>
<ul>
  <li>Servizio: {{service}}</li>
  <li>Data: {{date}}</li>
  <li>Ora: {{time}}</li>
  <li>Operatore: {{staff}}</li>
</ul>
<p>Grazie per aver scelto i nostri servizi!</p>
```

#### Promemoria Appuntamento
```html
<h2>Promemoria Appuntamento</h2>
<p>Ciao {{name}},</p>
<p>Ti ricordiamo il tuo appuntamento di domani:</p>
<ul>
  <li>Servizio: {{service}}</li>
  <li>Data: {{date}}</li>
  <li>Ora: {{time}}</li>
</ul>
<p>Ti aspettiamo!</p>
```

### 3. Configurazione

```javascript
// lib/notifications/email.ts
export const emailConfig = {
  serviceId: process.env.EMAILJS_SERVICE_ID,
  templateId: process.env.EMAILJS_TEMPLATE_ID,
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
};
```

## 📱 Setup SMS/WhatsApp (Twilio)

### 1. Account Twilio

1. Registrati su [Twilio](https://www.twilio.com)
2. Verifica il tuo numero di telefono
3. Ottieni Account SID e Auth Token

### 2. Configurazione WhatsApp

1. Vai su [Twilio WhatsApp](https://www.twilio.com/whatsapp)
2. Configura il numero WhatsApp Business
3. Ottieni il Phone Number ID

### 3. Webhook Setup

```bash
# URL webhook per Twilio
https://your-domain.com/api/notifications/sms
```

## 🤖 Setup AI (OpenAI)

### 1. Account OpenAI

1. Registrati su [OpenAI Platform](https://platform.openai.com)
2. Genera una API key
3. Configura billing

### 2. Configurazione

```javascript
// lib/ai/constants.ts
export const AI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  maxTokens: 1000,
  temperature: 0.7,
};
```

### 3. WhatsApp Webhook

```bash
# URL webhook per WhatsApp AI
https://your-domain.com/api/whatsapp/webhook
```

## 💳 Setup Pagamenti (Stripe) - Opzionale

### 1. Account Stripe

1. Registrati su [Stripe](https://stripe.com)
2. Configura account business
3. Ottieni API keys

### 2. Webhook Setup

```bash
# Configura webhook Stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Configurazione

```javascript
// lib/stripe.ts
export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};
```

## 🔍 Verifica Configurazione

### 1. Test Locale

```bash
# Avvia server sviluppo
npm run dev

# Test endpoint
curl http://localhost:3000/api/health

# Test database
curl http://localhost:3000/api/test-db
```

### 2. Verifica Variabili

```bash
# Verifica variabili caricate
npm run env:check

# Test connessione database
npm run db:test

# Test notifiche
npm run notifications:test
```

### 3. Checklist Verifica

- [ ] **Database**: Connessione Supabase funzionante
- [ ] **Auth**: Login/logout funzionante
- [ ] **Email**: Invio email di test
- [ ] **SMS**: Invio SMS di test
- [ ] **AI**: Test conversazione WhatsApp
- [ ] **Payments**: Test checkout Stripe (se configurato)

## 🚀 Deployment

### 1. Vercel Deployment

```bash
# Installa Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configura variabili ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... altre variabili
```

### 2. Environment Variables su Vercel

Configura tutte le variabili in Vercel Dashboard:

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il progetto
3. Vai su Settings > Environment Variables
4. Aggiungi tutte le variabili necessarie

### 3. Domain Setup

1. Configura dominio personalizzato
2. Verifica SSL certificate
3. Configura redirect HTTPS

## 🔧 Troubleshooting

### Problemi Comuni

#### Database Connection
```bash
# Verifica connessione
npm run db:check

# Reset database (solo sviluppo)
npm run db:reset
```

#### Email Non Inviati
```bash
# Test EmailJS
npm run email:test

# Verifica template
npm run email:validate
```

#### SMS Non Inviati
```bash
# Test Twilio
npm run sms:test

# Verifica credenziali
npm run twilio:verify
```

#### AI Non Funziona
```bash
# Test OpenAI
npm run ai:test

# Verifica webhook
npm run webhook:test
```

### Logs e Debug

```bash
# Abilita debug
DEBUG=true npm run dev

# Logs dettagliati
npm run logs:detailed

# Monitor performance
npm run monitor
```

## 📚 Risorse Aggiuntive

### Documentazione
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Setup](https://supabase.com/docs/guides/getting-started)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### Tools
- [Environment Variable Validator](https://www.npmjs.com/package/env-validator)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Vercel CLI](https://vercel.com/docs/cli)

---

**Setup Status**: 🟢 **Completo e Funzionante**  
**Ultimo Test**: Dicembre 2024  
**Prossimo Review**: Gennaio 2025 