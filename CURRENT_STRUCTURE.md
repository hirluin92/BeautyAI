# Beauty AI Assistant - Struttura Dettagliata del Progetto

## 📁 Struttura Completa del Repository

```
beauty-ai/
├── 📁 app/                                    # Next.js App Router (v15.3.3)
│   ├── 📁 (auth)/                            # Route group autenticazione
│   │   ├── 📄 layout.tsx                     # Layout autenticazione
│   │   ├── 📁 login/                         # Pagina login
│   │   │   └── 📄 page.tsx                   # Form login
│   │   └── 📁 register/                      # Pagina registrazione
│   │       └── 📄 page.tsx                   # Form registrazione
│   ├── 📁 (dashboard)/                       # Route group dashboard (protetto)
│   │   ├── 📄 layout.tsx                     # Layout dashboard con sidebar
│   │   ├── 📁 bookings/                      # Gestione prenotazioni
│   │   │   ├── 📄 page.tsx                   # Lista prenotazioni
│   │   │   ├── 📁 new/                       # Nuova prenotazione
│   │   │   │   └── 📄 page.tsx               # Form nuova prenotazione
│   │   │   └── 📁 [id]/                      # Dettagli prenotazione
│   │   │       ├── 📄 page.tsx               # Vista dettagli
│   │   │       ├── 📁 edit/                  # Modifica prenotazione
│   │   │       │   └── 📄 page.tsx           # Form modifica
│   │   │       ├── 📄 loading.tsx            # Loading state
│   │   │       └── 📄 error.tsx              # Error boundary
│   │   ├── 📁 clients/                       # Gestione clienti
│   │   │   ├── 📄 page.tsx                   # Lista clienti
│   │   │   ├── 📁 new/                       # Nuovo cliente
│   │   │   │   └── 📄 page.tsx               # Form nuovo cliente
│   │   │   └── 📁 [id]/                      # Dettagli cliente
│   │   │       ├── 📄 page.tsx               # Profilo cliente
│   │   │       ├── 📁 edit/                  # Modifica cliente
│   │   │       │   └── 📄 page.tsx           # Form modifica
│   │   │       └── 📁 bookings/              # Storico prenotazioni cliente
│   │   │           └── 📄 page.tsx           # Lista prenotazioni
│   │   ├── 📁 services/                      # Gestione servizi
│   │   │   ├── 📄 page.tsx                   # Lista servizi
│   │   │   ├── 📁 new/                       # Nuovo servizio
│   │   │   │   └── 📄 page.tsx               # Form nuovo servizio
│   │   │   └── 📁 [id]/                      # Dettagli servizio
│   │   │       ├── 📄 page.tsx               # Vista dettagli
│   │   │       └── 📁 edit/                  # Modifica servizio
│   │   │           └── 📄 page.tsx           # Form modifica
│   │   ├── 📁 calendar/                      # Calendario interattivo
│   │   │   └── 📄 page.tsx                   # Vista calendario
│   │   ├── 📁 dashboard/                     # Dashboard principale
│   │   │   ├── 📄 page.tsx                   # Dashboard home
│   │   │   ├── 📄 dashboard-client-modals.tsx # Modali dashboard
│   │   │   └── 📄 DashboardStatsClient.tsx   # Componente statistiche
│   │   └── 📁 error/                         # Pagine di errore
│   │       └── 📄 page.tsx                   # Error page
│   ├── 📁 api/                               # API Routes
│   │   ├── 📁 auth/                          # Autenticazione
│   │   │   ├── 📄 login/route.ts             # Login API
│   │   │   ├── 📄 register/route.ts          # Registrazione API
│   │   │   ├── 📄 logout/route.ts            # Logout API
│   │   │   ├── 📄 complete-registration/route.ts # Completamento registrazione
│   │   │   └── 📄 complete-setup/route.ts    # Setup iniziale
│   │   ├── 📁 bookings/                      # API prenotazioni
│   │   │   ├── 📄 route.ts                   # CRUD prenotazioni
│   │   │   └── 📁 [id]/delete/route.ts       # Eliminazione prenotazione
│   │   ├── 📁 clients/                       # API clienti
│   │   │   ├── 📄 route.ts                   # CRUD clienti
│   │   │   └── 📁 [id]/route.ts              # Operazioni singolo cliente
│   │   ├── 📁 services/                      # API servizi
│   │   │   ├── 📄 route.ts                   # CRUD servizi
│   │   │   └── 📁 [id]/route.ts              # Operazioni singolo servizio
│   │   ├── 📁 staff/                         # API staff
│   │   │   └── 📄 route.ts                   # Gestione staff
│   │   ├── 📁 notifications/                 # API notifiche
│   │   │   ├── 📄 send/route.ts              # Invio notifiche
│   │   │   ├── 📄 send-reminders/route.ts    # Promemoria automatici
│   │   │   ├── 📄 sms/route.ts               # SMS via Twilio
│   │   │   ├── 📄 whatsapp/route.ts          # WhatsApp
│   │   │   ├── 📄 test-simple/route.ts       # Test notifiche
│   │   │   ├── 📄 test-twilio/               # Test Twilio
│   │   │   ├── 📄 test-twilio-bypass/        # Test Twilio bypass
│   │   │   └── 📄 test-twilio-official/      # Test Twilio ufficiale
│   │   └── 📁 whatsapp/                      # API WhatsApp
│   │       └── 📁 webhook/route.ts           # Webhook WhatsApp
│   ├── 📄 layout.tsx                         # Root layout
│   ├── 📄 page.tsx                           # Homepage
│   ├── 📄 globals.css                        # Stili globali
│   ├── 📄 favicon.ico                        # Favicon
│   ├── 📁 test-db/                           # Pagina test database
│   │   └── 📄 page.tsx                       # Test connessione DB
│   └── 📁 test-twilio/                       # Pagina test Twilio
├── 📁 components/                            # Componenti React
│   ├── 📁 ui/                                # Componenti UI base
│   │   ├── 📄 button.tsx                     # Button component (con variants)
│   │   ├── 📄 card.tsx                       # Card component
│   │   ├── 📄 badge.tsx                      # Badge component
│   │   ├── 📄 alert.tsx                      # Alert component
│   │   ├── 📄 alert-dialog.tsx               # Alert dialog
│   │   ├── 📄 dropdown-menu.tsx              # Dropdown menu
│   │   ├── 📄 tabs.tsx                       # Tabs component
│   │   ├── 📄 separator.tsx                  # Separator component
│   │   ├── 📄 skeleton.tsx                   # Loading skeleton
│   │   ├── 📄 Modal.tsx                      # Modal component
│   │   └── 📄 delete-confirmation-modal.tsx  # Modal conferma eliminazione
│   ├── 📁 auth/                              # Componenti autenticazione
│   │   └── 📄 logout-button.tsx              # Pulsante logout
│   ├── 📁 bookings/                          # Componenti prenotazioni
│   │   ├── 📄 booking-form.tsx               # Form prenotazione
│   │   ├── 📄 booking-actions.tsx            # Azioni prenotazione
│   │   ├── 📄 client-booking-history.tsx     # Storico prenotazioni cliente
│   │   ├── 📄 delete-booking-form.tsx        # Form eliminazione
│   │   └── 📄 notification-manager.tsx       # Gestore notifiche
│   ├── 📁 calendar/                          # Componenti calendario
│   │   └── 📄 calendar-view.tsx              # Vista calendario
│   ├── 📁 clients/                           # Componenti clienti
│   │   ├── 📄 client-form.tsx                # Form cliente
│   │   ├── 📄 clients-table.tsx              # Tabella clienti
│   │   ├── 📄 clients-search.tsx             # Ricerca clienti
│   │   ├── 📄 client-quick-actions.tsx       # Azioni rapide cliente
│   │   ├── 📄 client-quick-add-button.tsx    # Pulsante aggiunta rapida
│   │   ├── 📄 client-quick-add-modal.tsx     # Modal aggiunta rapida
│   │   └── 📄 new-client-form-wrapper.tsx    # Wrapper form nuovo cliente
│   ├── 📁 services/                          # Componenti servizi
│   │   ├── 📄 service-form.tsx               # Form servizio
│   │   ├── 📄 services-table.tsx             # Tabella servizi
│   │   └── 📄 services-search.tsx            # Ricerca servizi
│   ├── 📁 dashboard/                         # Componenti dashboard
│   ├── 📁 notifications/                     # Componenti notifiche
│   │   ├── 📄 NotificationsDashboard.tsx     # Dashboard notifiche
│   │   └── 📄 toast-provider.tsx             # Provider toast
│   └── 📁 layout/                            # Componenti layout
│       └── 📄 Sidebar.tsx                    # Sidebar navigation
├── 📁 lib/                                   # Utilities e configurazioni
│   ├── 📁 supabase/                          # Client Supabase
│   │   ├── 📄 client.ts                      # Client browser
│   │   ├── 📄 server.ts                      # Client server
│   │   └── 📁 functions/                     # Edge Functions
│   │       ├── 📁 mark-no-show/              # Funzione mark no-show
│   │       │   └── 📄 index.ts               # Implementazione
│   │       └── 📁 send-reminders/            # Funzione promemoria
│   │           └── 📄 index.ts.bak           # Backup implementazione
│   ├── 📁 ai/                                # Integrazione AI
│   │   ├── 📄 constants.ts                   # Costanti AI
│   │   ├── 📄 conversation-handler.ts        # Gestore conversazioni
│   │   ├── 📄 types.ts                       # Tipi AI
│   │   └── 📄 whatsapp-integration.ts        # Integrazione WhatsApp AI
│   ├── 📁 notifications/                     # Sistema notifiche
│   │   ├── 📄 email.ts                       # Email notifications
│   │   ├── 📄 notification.service.ts        # Servizio notifiche
│   │   ├── 📄 notification.service.ts.bak    # Backup servizio
│   │   └── 📄 whatsapp-green.ts              # WhatsApp Green API
│   ├── 📁 constants/                         # Costanti applicazione
│   │   └── 📄 booking.ts                     # Costanti prenotazioni
│   ├── 📄 utils.ts                           # Utility functions
│   └── 📄 twilio-client.ts                   # Client Twilio
├── 📁 types/                                 # Definizioni TypeScript
│   ├── 📄 database.ts                        # Tipi database (725 righe)
│   └── 📄 index.ts                           # Tipi esportati
├── 📁 hooks/                                 # Custom React hooks
│   └── 📄 use-notificatons.ts                # Hook notifiche
├── 📁 supabase/                              # Migrazioni database
│   └── 📁 migrations/                        # File migrazione
│       ├── 📄 20240617_create_notifications_table.sql # Tabella notifiche
│       ├── 📄 20240617_create_notifications_table.sql.bak # Backup
│       ├── 📄 20240617_fix_rls_policies.sql  # Fix RLS policies
│       ├── 📄 20240617_fix_rls_policies.sql.bak # Backup
│       └── 📄 20240617_setup_cron_jobs.sql   # Setup cron jobs
├── 📁 __tests__/                             # Test unitari
│   ├── 📁 api/                               # Test API
│   │   └── 📁 clients/                       # Test API clienti
│   ├── 📁 components/                        # Test componenti
│   │   ├── 📁 clients/                       # Test componenti clienti
│   │   │   └── 📄 client-form.test.tsx       # Test form cliente
│   │   └── 📁 services/                      # Test componenti servizi
│   ├── 📁 db/                                # Test database
│   ├── 📁 lib/                               # Test utilities
│   └── 📁 performance/                       # Test performance
├── 📁 e2e/                                   # Test end-to-end
│   └── 📄 auth.spec.ts                       # Test autenticazione
├── 📁 public/                                # Asset statici
│   ├── 📄 file.svg                           # Icona file
│   ├── 📄 globe.svg                          # Icona globo
│   ├── 📄 next.svg                           # Logo Next.js
│   ├── 📄 vercel.svg                         # Logo Vercel
│   └── 📄 window.svg                         # Icona finestra
├── 📄 .gitignore                             # Git ignore
├── 📄 .eslintrc.json                         # Configurazione ESLint
├── 📄 eslint.config.mjs                      # Config ESLint moderna
├── 📄 jest.config.js                         # Configurazione Jest
├── 📄 jest.setup.js                          # Setup Jest
├── 📄 next.config.ts                         # Configurazione Next.js
├── 📄 next-env.d.ts                          # Tipi Next.js
├── 📄 package.json                            # Dependencies e scripts
├── 📄 package-lock.json                       # Lock file dependencies
├── 📄 playwright.config.ts                   # Configurazione Playwright
├── 📄 postcss.config.mjs                     # Configurazione PostCSS
├── 📄 tsconfig.json                          # Configurazione TypeScript
├── 📄 tsconfig.tsbuildinfo                   # TypeScript build info
├── 📄 middleware.ts                          # Next.js middleware
└── 📄 README.md                              # Documentazione principale
```

## 🔧 Configurazioni Principali

### Next.js Configuration (`next.config.ts`)
```typescript
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Temporaneamente disabilitato per risolvere errori
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporaneamente disabilitato per risolvere errori
  },
};
```

### TypeScript Configuration (`tsconfig.json`)
- Target: ES2017
- Module: ESNext
- JSX: Preserve
- Path mapping: `@/*` → `./*`
- Strict mode: Enabled

### Package.json Scripts
```json
{
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui"
}
```

## 🗄️ Database Schema

### Tabelle Principali
1. **organizations** - Centri estetici
2. **users** - Staff e operatori
3. **clients** - Clienti
4. **services** - Servizi offerti
5. **bookings** - Prenotazioni
6. **payments** - Pagamenti
7. **chat_sessions** - Sessioni WhatsApp
8. **chat_messages** - Messaggi chat
9. **analytics_events** - Eventi analytics
10. **notifications** - Notifiche inviate

### Enums
- `booking_status`: pending, confirmed, cancelled, completed, no_show
- `payment_status`: pending, processing, paid, failed, refunded
- `user_role`: owner, staff, admin
- `plan_type`: free, premium, enterprise

## 🔌 API Endpoints

### Autenticazione
- `POST /api/auth/login` - Login utente
- `POST /api/auth/register` - Registrazione
- `POST /api/auth/logout` - Logout
- `POST /api/auth/complete-registration` - Completamento registrazione
- `POST /api/auth/complete-setup` - Setup iniziale

### Prenotazioni
- `GET /api/bookings` - Lista prenotazioni
- `POST /api/bookings` - Crea prenotazione
- `PUT /api/bookings/[id]` - Aggiorna prenotazione
- `DELETE /api/bookings/[id]/delete` - Elimina prenotazione

### Clienti
- `GET /api/clients` - Lista clienti
- `POST /api/clients` - Crea cliente
- `GET /api/clients/[id]` - Dettagli cliente
- `PUT /api/clients/[id]` - Aggiorna cliente
- `DELETE /api/clients/[id]` - Elimina cliente

### Servizi
- `GET /api/services` - Lista servizi
- `POST /api/services` - Crea servizio
- `GET /api/services/[id]` - Dettagli servizio
- `PUT /api/services/[id]` - Aggiorna servizio
- `DELETE /api/services/[id]` - Elimina servizio

### Notifiche
- `POST /api/notifications/send` - Invio notifiche
- `POST /api/notifications/send-reminders` - Promemoria automatici
- `POST /api/notifications/sms` - SMS via Twilio
- `POST /api/notifications/whatsapp` - WhatsApp
- `POST /api/notifications/test-simple` - Test notifiche

### WhatsApp
- `POST /api/whatsapp/webhook` - Webhook WhatsApp

## 🎨 Componenti UI

### Componenti Base
- **Button** - Con variants: default, outline, ghost, link, destructive
- **Card** - Container con header, content, footer
- **Badge** - Tag e indicatori
- **Alert** - Messaggi di avviso
- **Modal** - Finestre modali
- **Tabs** - Navigazione a schede
- **Dropdown** - Menu a tendina

### Componenti Specifici
- **BookingForm** - Form prenotazione completa
- **ClientForm** - Form gestione clienti
- **ServiceForm** - Form gestione servizi
- **CalendarView** - Vista calendario interattiva
- **NotificationManager** - Gestione notifiche
- **Sidebar** - Navigazione principale

## 🔒 Sicurezza

### Middleware (`middleware.ts`)
- Autenticazione automatica
- Protezione route dashboard
- Redirect intelligenti
- Gestione sessioni Supabase

### Row Level Security (RLS)
- Politiche per organizzazione
- Accesso basato su ruolo utente
- Protezione dati multi-tenant

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Componenti Responsive
- Sidebar collassabile su mobile
- Tabella con scroll orizzontale
- Form ottimizzati per touch
- Modal full-screen su mobile

## 🧪 Testing

### Unit Tests (`__tests__/`)
- Test componenti React
- Test API endpoints
- Test utilities
- Test database functions

### E2E Tests (`e2e/`)
- Test autenticazione
- Test flussi completi
- Test responsive design

### Coverage
- Jest per unit testing
- Playwright per E2E
- MSW per API mocking

## 🚀 Performance

### Ottimizzazioni
- Next.js App Router
- Server Components
- Code splitting automatico
- Image optimization
- Bundle analysis

### Monitoring
- Analytics events
- Performance metrics
- Error tracking
- User behavior

## 📊 Analytics

### Eventi Tracciati
- Login/Logout
- Creazione prenotazioni
- Invio notifiche
- Azioni utente
- Errori applicazione

### Metriche
- Utilizzo funzionalità
- Performance API
- Conversioni
- Retention utenti

---

**Ultimo aggiornamento**: Dicembre 2024
**Versione**: 2.1.0
**Next.js**: 15.3.3
**React**: 19.0.0