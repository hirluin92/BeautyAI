# Beauty AI Assistant - Project Context

## 🌟 Visione

Beauty AI Assistant vuole rivoluzionare la gestione dei saloni di bellezza e centri estetici, offrendo una piattaforma intelligente, automatizzata e integrata con AI e WhatsApp, per semplificare la vita di titolari, staff e clienti.

## 🎯 Obiettivi
- Automatizzare la gestione delle prenotazioni e dei clienti
- Ridurre i no-show e aumentare la retention
- Offrire notifiche multicanale (WhatsApp, Email, SMS)
- Fornire dashboard e analytics in tempo reale
- Integrare un assistente AI per rispondere ai clienti e gestire le conversazioni
- Garantire sicurezza, privacy e multi-tenancy (RLS)
- Offrire un'esperienza utente premium, mobile-first e accessibile

## 👤 Target Utenti
- **Titolari di centri estetici, saloni di bellezza, spa**
- **Staff e operatori** (estetiste, parrucchieri, receptionist)
- **Clienti finali** (tramite notifiche e chatbot)
- **Manager multi-location** (in futuro)

## 🏆 Use Case Principali
- Gestione prenotazioni con calendario interattivo
- Invio automatico di promemoria e conferme
- Gestione clienti con storico, tag, note e preferenze
- Gestione servizi, prezzi, durate e operatori
- Notifiche automatiche e manuali su più canali
- Dashboard con statistiche e performance
- Chatbot AI per risposte automatiche su WhatsApp
- Gestione pagamenti e fatturazione (in sviluppo)

## 🏗️ Architettura Overview

### Frontend
- **Next.js 15.3.3** (App Router, Server/Client Components)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Radix UI**
- **React Hook Form + Zod**

### Backend & Database
- **Supabase** (PostgreSQL, Auth, Storage, Edge Functions)
- **Row Level Security (RLS)**
- **Migrazioni versionate**

### Integrazioni
- **WhatsApp Business API**
- **Twilio** (SMS, WhatsApp)
- **OpenAI** (AI chatbot)
- **Stripe** (pagamenti, in sviluppo)
- **EmailJS** (email automatiche)

### Testing & Quality
- **Jest** (unit test)
- **Playwright** (E2E)
- **ESLint** (linting)
- **TypeScript** (type checking)

## 🗺️ Roadmap Strategica
- [x] Core booking, clienti, servizi, notifiche
- [x] Dashboard e analytics
- [x] Integrazione WhatsApp e SMS
- [x] RLS multi-tenant
- [ ] AI chatbot avanzato
- [ ] Pagamenti e fatturazione
- [ ] App mobile e PWA
- [ ] Integrazioni esterne (CRM, social, review)

## 📈 KPI e Success Metrics
- Riduzione no-show > 30%
- Aumento retention clienti > 20%
- Tasso di apertura notifiche > 90%
- Tempo medio gestione prenotazione < 1 min
- NPS utenti > 8/10

---

**Beauty AI Assistant** - Il futuro della gestione beauty è intelligente, automatizzato e conversazionale. 