# Beauty AI Assistant - Struttura Attuale

## 🏗️ Architettura Sistema

### Frontend (Next.js 14)
- **App Router**: Organizzazione pagine e layout
- **Server Components**: Per pagine auth e dati statici
- **Client Components**: Per interazioni utente
- **UI Components**: Tailwind + shadcn/ui
- **State Management**: React Context + Server State
- **Form Handling**: React Hook Form + Zod
- **API Client**: Supabase Client + Custom Hooks

### Backend (Supabase + Edge Functions)
- **Database**: PostgreSQL con RLS
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Edge Functions**: 
  - `send-reminders.ts`: Gestione notifiche
  - `mark-no-show.ts`: Gestione no-show
- **API Routes**: Next.js API Routes

### Integrazioni
- **WhatsApp**: Meta Business API
- **Email**: EmailJS
- **SMS**: Twilio API
- **AI**: OpenAI GPT-4
- **Payments**: Stripe Connect

## 📦 Componenti Principali

### Gestione Clienti
- Lista clienti con ricerca e filtri
- Dettaglio cliente con storico
- Form creazione/modifica
- Sistema tag
- Integrazione contatti

### Gestione Servizi
- Lista servizi con categorie
- Dettaglio servizio
- Form creazione/modifica
- Gestione prezzi e durate
- Stato attivo/inattivo

### Sistema Prenotazioni (In Sviluppo)
- Calendario interattivo
- Gestione appuntamenti
- Sistema notifiche
  - Email (EmailJS)
  - SMS (Twilio)
  - WhatsApp (Twilio)
- Azioni di stato avanzate
  - Conferma
  - Completa
  - No Show
  - Annulla
- Feedback UX
  - Toast notifications (sonner/react-hot-toast)
  - Loading states
  - Error handling

### Dashboard
- Card "Clienti di oggi" con dropdown dettagliata (nome, telefono, servizi, orario, operatore)
- Card "Appuntamenti oggi", "Incasso previsto oggi", "Incasso mensile"
- Nessuna card "Servizi di oggi"
- Dropdown ordinata per orario del primo appuntamento

## 🔄 Flussi Principali

### Autenticazione
1. Login/Registrazione
2. Verifica email
3. Creazione organizzazione
4. Setup ruoli

### Gestione Clienti
1. Creazione cliente
2. Assegnazione tag
3. Storico interazioni
4. Gestione contatti

### Gestione Servizi
1. Creazione servizio
2. Configurazione prezzi
3. Assegnazione categoria
4. Gestione disponibilità

### Sistema Prenotazioni
1. Creazione appuntamento
2. Notifiche automatiche
   - Conferma iniziale
   - Reminder 24h prima
   - Reminder 1h prima
3. Gestione stati
   - Confermato
   - Completato
   - No Show
   - Annullato
4. Feedback utente
   - Toast notifications
   - Loading states
   - Error messages

## 🛠️ Strumenti di Sviluppo

### Testing
- Jest per unit test
- Playwright per e2e
- React Testing Library

### CI/CD
- GitHub Actions
- Vercel Deploy
- Supabase Migrations

### Monitoring
- Vercel Analytics
- Error tracking
- Performance monitoring

## 📱 UI/UX

### Design System
- Tailwind CSS
- shadcn/ui components
- Custom theme
- Responsive design

### Interazioni
- Toast notifications
- Loading states
- Error handling
- Form validation
- Drag & drop
- Infinite scroll

### Feedback Utente
- Toast notifications (sonner/react-hot-toast)
- Loading spinners
- Error messages
- Success confirmations
- Tooltips
- Hover states

## 🔒 Sicurezza

### Autenticazione
- Supabase Auth
- Email verification
- Session management
- Role-based access

### Autorizzazione
- RLS policies
- Organization isolation
- Role permissions
- API security

### Data Protection
- Input validation
- XSS prevention
- CSRF protection
- Rate limiting

## 📊 Database

### Schema Principale
- organizations
- users
- clients
- services
- bookings
  - status (confirmed, completed, no_show, cancelled)
  - reminder_sent
  - no_show_marked
  - notification_preferences
- payments
- notifications
- analytics

### Relazioni
- Organization → Users
- Organization → Clients
- Organization → Services
- Client → Bookings
- Service → Bookings
- Booking → Notifications

## 🚀 Prossimi Sviluppi

### Priorità Alta
1. Sistema prenotazioni
2. Notifiche automatiche
3. Azioni di stato avanzate
4. Feedback UX con toast

### Priorità Media
1. Analytics avanzati
2. Report personalizzati
3. Export dati
4. Backup automatico

### Priorità Bassa
1. App mobile
2. API pubblica
3. Marketplace
4. Gamification

Ultimo aggiornamento: 14/03/2024

La dashboard è strutturata secondo le best practice di Next.js, con un layout condiviso (in "app/(dashboard)/layout.tsx") che fornisce la sidebar, la navigazione e il wrapper (es. "min-h-screen", "bg-gray-50", "ml-64", ecc.). Tutte le sottopagine (clients, services, bookings, ecc.) sono "figlie" del layout e non duplicano la sidebar, il wrapper o il <main>. In questo modo, ogni pagina contiene solo il contenuto specifico (header, form, dettagli, ecc.) e la manutenzione (es. aggiornare la sidebar) è centralizzata.