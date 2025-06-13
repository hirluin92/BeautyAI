# Beauty AI Assistant - Struttura File Progetto
Ultimo aggiornamento: 14/03/2024

## 📁 Struttura Directory

```
beauty-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── clients/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── services/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── bookings/
│   │       ├── [id]/
│   │       │   └── page.tsx
│   │       ├── new/
│   │       │   └── page.tsx
│   │       └── page.tsx
│   ├── api/
│   │   ├── clients/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── services/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── bookings/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── clients/
│   │   ├── client-form.tsx
│   │   ├── client-list.tsx
│   │   ├── client-stats.tsx
│   │   └── client-tags.tsx
│   ├── services/
│   │   ├── service-form.tsx
│   │   ├── service-list.tsx
│   │   └── service-categories.tsx
│   ├── bookings/
│   │   ├── booking-form.tsx
│   │   ├── booking-list.tsx
│   │   ├── booking-calendar.tsx
│   │   └── booking-actions.tsx
│   ├── notifications/
│   │   ├── toast-provider.tsx
│   │   ├── toast.tsx
│   │   └── notification-badge.tsx
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── dialog.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── edge/
│   │   ├── send-reminders.ts
│   │   └── mark-no-show.ts
│   ├── notifications/
│   │   ├── email.ts
│   │   ├── sms.ts
│   │   └── whatsapp.ts
│   ├── validations.ts
│   └── utils.ts
├── hooks/
│   ├── use-notifications.ts
│   ├── use-bookings.ts
│   └── use-toast.ts
├── types/
│   ├── database.ts
│   └── index.ts
├── public/
│   └── assets/
├── middleware.ts
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── .env.local
```

## 📦 Componenti Principali

### Auth Components
- `login-form.tsx`: Form di login
- `register-form.tsx`: Form di registrazione

### Client Components
- `client-form.tsx`: Form creazione/modifica cliente
- `client-list.tsx`: Lista clienti con ricerca
- `client-stats.tsx`: Statistiche cliente
- `client-tags.tsx`: Gestione tag cliente

### Service Components
- `service-form.tsx`: Form creazione/modifica servizio
- `service-list.tsx`: Lista servizi con filtri
- `service-categories.tsx`: Gestione categorie

### Booking Components
- `booking-form.tsx`: Form creazione/modifica prenotazione
- `booking-list.tsx`: Lista prenotazioni
- `booking-calendar.tsx`: Calendario interattivo
- `booking-actions.tsx`: Pulsanti azione stato

### Notification Components
- `toast-provider.tsx`: Provider toast notifications
- `toast.tsx`: Componente toast
- `notification-badge.tsx`: Badge notifiche

### UI Components
- `button.tsx`: Pulsanti custom
- `input.tsx`: Input fields
- `select.tsx`: Select dropdown
- `dialog.tsx`: Modal dialog

## 🔧 Utility e Helpers

### Supabase
- `client.ts`: Client Supabase
- `server.ts`: Server Supabase

### Edge Functions
- `send-reminders.ts`: Gestione notifiche
- `mark-no-show.ts`: Gestione no-show

### Notifications
- `email.ts`: Integrazione EmailJS
- `sms.ts`: Integrazione Twilio SMS
- `whatsapp.ts`: Integrazione Twilio WhatsApp

### Hooks
- `use-notifications.ts`: Hook notifiche
- `use-bookings.ts`: Hook prenotazioni
- `use-toast.ts`: Hook toast

## 📝 File di Configurazione

### Next.js
- `next.config.js`: Configurazione Next.js
- `tsconfig.json`: Configurazione TypeScript
- `tailwind.config.ts`: Configurazione Tailwind

### Environment
- `.env.local`: Variabili ambiente
- `.env.example`: Template variabili ambiente

## 🔒 Sicurezza

### Middleware
- `middleware.ts`: Protezione routes
- `lib/supabase/server.ts`: Server-side auth

### Types
- `types/database.ts`: Tipi database
- `types/index.ts`: Tipi comuni

## 🚀 Deployment

### Vercel
- Configurazione automatica
- Preview deployments
- Production checks

### Supabase
- Database migrations
- Edge functions
- Storage buckets

## 📊 Monitoring

### Analytics
- Vercel Analytics
- Error tracking
- Performance monitoring

### Logging
- Edge function logs
- API logs
- Error logs

## 🎯 Prossimi Sviluppi

### Priorità Alta
1. Sistema notifiche
2. Azioni di stato
3. Toast notifications
4. Edge functions

### Priorità Media
1. Analytics
2. Testing
3. Documentation
4. Performance

### Priorità Bassa
1. Mobile app
2. API pubblica
3. Marketplace
4. Gamification

## 📌 Layout

La dashboard è strutturata secondo le best practice di Next.js, con un layout condiviso (in "app/(dashboard)/layout.tsx") che fornisce la sidebar, la navigazione e il wrapper (es. "min-h-screen", "bg-gray-50", "ml-64", ecc.). Tutte le sottopagine (clients, services, bookings, ecc.) sono "figlie" del layout e non duplicano la sidebar, il wrapper o il <main>. In questo modo, ogni pagina contiene solo il contenuto specifico (header, form, dettagli, ecc.) e la manutenzione (es. aggiornare la sidebar) è centralizzata.

## 🔄 Cambiamento

- /app/(dashboard)/dashboard/DashboardStatsClient.tsx: componente client-side per le statistiche e la dropdown clienti di oggi
- /app/(dashboard)/dashboard/page.tsx: logica server per raggruppamento clienti/servizi di oggi
- Nessuna card "Servizi di oggi"
- Dropdown dettagliata per clienti di oggi
