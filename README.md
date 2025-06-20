# Beauty AI Assistant 🎨

Un sistema completo di gestione per saloni di bellezza e centri estetici, con integrazione AI e WhatsApp.

## 🚀 Caratteristiche Principali

### 📅 Gestione Prenotazioni
- Calendario interattivo con drag & drop
- Gestione completa del ciclo di vita delle prenotazioni
- Controllo conflitti e disponibilità in tempo reale
- Sistema di promemoria automatici

### 👥 Gestione Clienti
- Database clienti completo con storico
- Sistema di tag e note personalizzate
- Tracciamento visite e spese totali
- Integrazione WhatsApp diretta

### 💼 Gestione Servizi
- Catalogo servizi con prezzi e durate
- Categorizzazione e gestione attiva/inattiva
- Calcolo automatico prezzi e durate

### 🔔 Sistema Notifiche
- **WhatsApp Business API** integrata
- Email automatiche con template personalizzabili
- SMS via Twilio
- Promemoria configurabili (24h, 1h prima)

### 🤖 Integrazione AI
- Chatbot WhatsApp intelligente
- Gestione conversazioni automatica
- Risposte contestuali e personalizzate

### 📊 Dashboard Analytics
- Statistiche in tempo reale
- Report performance
- Metriche business

## 🛠 Stack Tecnologico

### Frontend
- **Next.js 15.3.3** - Framework React con App Router
- **React 19** - UI Library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Componenti accessibili
- **Lucide React** - Icone
- **React Hook Form** - Gestione form
- **Zod** - Validazione schemi

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database relazionale
- **Row Level Security (RLS)** - Sicurezza dati
- **Edge Functions** - Serverless functions

### Integrazioni
- **WhatsApp Business API** - Messaggistica
- **Twilio** - SMS e chiamate
- **Stripe** - Pagamenti
- **OpenAI** - AI Chatbot
- **EmailJS** - Email templates

### Testing & Quality
- **Jest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **TypeScript** - Type checking

## 📁 Struttura del Progetto

```
beauty-ai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group autenticazione
│   ├── (dashboard)/              # Route group dashboard
│   ├── api/                      # API Routes
│   └── globals.css               # Stili globali
├── components/                   # Componenti React
│   ├── ui/                       # Componenti base UI
│   ├── auth/                     # Componenti autenticazione
│   ├── bookings/                 # Componenti prenotazioni
│   ├── clients/                  # Componenti clienti
│   ├── services/                 # Componenti servizi
│   ├── dashboard/                # Componenti dashboard
│   ├── notifications/            # Componenti notifiche
│   ├── calendar/                 # Componenti calendario
│   └── layout/                   # Componenti layout
├── lib/                          # Utilities e configurazioni
│   ├── supabase/                 # Client Supabase
│   ├── ai/                       # Integrazione AI
│   ├── notifications/            # Sistema notifiche
│   └── constants/                # Costanti
├── types/                        # Definizioni TypeScript
├── hooks/                        # Custom React hooks
├── supabase/                     # Migrazioni database
├── __tests__/                    # Test unitari
├── e2e/                          # Test end-to-end
└── public/                       # Asset statici
```

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+ 
- npm o yarn
- Account Supabase
- Account WhatsApp Business API
- Account Twilio (opzionale)

### 1. Clona il Repository
```bash
git clone https://github.com/your-username/beauty-ai.git
cd beauty-ai
```

### 2. Installa Dependencies
```bash
npm install
```

### 3. Configura Environment Variables
Crea un file `.env.local` nella root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp Business API
WHATSAPP_BUSINESS_ID=your_whatsapp_business_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# Twilio (opzionale)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# OpenAI (per AI chatbot)
OPENAI_API_KEY=your_openai_key

# Stripe (opzionale)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Setup Database
```bash
# Applica le migrazioni Supabase
npx supabase db push
```

### 5. Avvia Development Server
```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 📚 Documentazione

- [📋 Project Context](./PROJECT_CONTEXT.md) - Contesto e obiettivi del progetto
- [🏗️ Current Structure](./CURRENT_STRUCTURE.md) - Struttura dettagliata del codice
- [📊 Project Status](./PROJECT_STATUS.md) - Stato attuale del progetto
- [✅ TODO List](./TODO_LIST.md) - Lista delle attività da completare
- [🔧 Development Log](./DEVELOPMENT_LOG.md) - Log di sviluppo
- [🗄️ Database Schema](./DATABASE_SCHEMA_UPDATED.sql) - Schema completo del database
- [🔌 API Design](./API_DESIGN_REFERENCE.ts) - Riferimento API
- [📱 WhatsApp Setup](./AUTO_WHATSAPP_SETUP.md) - Setup WhatsApp Business API
- [🔔 Notifications](./TEST_NOTIFICATIONS.md) - Sistema notifiche
- [🔒 Security](./security_checklist.md) - Checklist sicurezza

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run e2e

# Test coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Raccomandato)
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatico

### Altri Provider
Il progetto è compatibile con qualsiasi provider che supporti Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per dettagli.

## 🆘 Support

- 📧 Email: support@beauty-ai.com
- 💬 Discord: [Beauty AI Community](https://discord.gg/beauty-ai)
- 📖 Docs: [Documentazione completa](https://docs.beauty-ai.com)

---

**Beauty AI Assistant** - Trasforma il tuo salone di bellezza con l'intelligenza artificiale! ✨
