# Important Notes - Beauty AI Assistant

## TypeScript Types ✅ IMPLEMENTED
- Generated from Supabase on 11/06/2025
- Located in types/database.ts
- Common types exported from types/index.ts
- All components now fully typed
- No more "any" types in the codebase

## API Design
The TypeScript interfaces in API_DESIGN_REFERENCE.ts are planning documents.
They are NOT yet implemented in actual API routes!

## Database RLS
- Currently DISABLED due to circular dependency issues
- Fix available in DATABASE_SCHEMA_UPDATED.sql (commented section)
- To be applied after proper testing
- All queries currently work without RLS

## ✅ CRUD Clienti COMPLETATO
**Stato: 100% Funzionante** - Session 3 (11/06/2025)

### 📁 Struttura File Completata:
```
app/(dashboard)/clients/
├── page.tsx              ✅ Lista completa
├── new/page.tsx         ✅ Nuovo cliente
└── [id]/
    ├── page.tsx         ✅ Dettaglio
    └── edit/page.tsx    ✅ Modifica

app/api/clients/
├── route.ts             ✅ GET/POST
└── [id]/route.ts       ✅ GET/PATCH/DELETE

components/clients/
├── clients-search.tsx   ✅ Ricerca avanzata
├── clients-table.tsx    ✅ Tabella completa
└── client-form.tsx     ✅ Form riutilizzabile

components/ui/
└── delete-confirmation-modal.tsx ✅ Modal professionale
```

### 🔧 Funzionalità Implementate:
- ✅ **CRUD Completo**: Create, Read, Update, Delete (soft)
- ✅ **Ricerca Avanzata**: Nome, telefono, email con debouncing
- ✅ **Sistema Tag**: Predefiniti + personalizzati
- ✅ **Paginazione**: Server-side con navigazione completa
- ✅ **Validazione**: Form validation completa
- ✅ **Sicurezza**: Auth + controllo organizzazione
- ✅ **UX/UI**: Loading states, error handling, modal conferma
- ✅ **Soft Delete**: Preserva dati storici per contabilità
- ✅ **Statistiche**: Contatori e KPI nel dashboard
- ✅ **Contatti**: Click-to-call, email, WhatsApp

## TypeScript Types ✅ IMPLEMENTATO
- Generated from Supabase on 11/06/2025
- Located in types/database.ts (600+ lines)
- Common types exported from types/index.ts
- All components now fully typed
- No more "any" types in the codebase

## API Design
**ATTENZIONE**: Le interfacce TypeScript in API_DESIGN_REFERENCE.ts sono documenti di pianificazione.
**NON sono ancora implementate** nelle API routes reali!

### ✅ API Implementate (Clienti):
- `GET /api/clients` - Lista con filtri
- `POST /api/clients` - Creazione
- `GET /api/clients/[id]` - Dettaglio singolo  
- `PATCH /api/clients/[id]` - Aggiornamento
- `DELETE /api/clients/[id]` - Eliminazione (soft)

### ❌ API Da Implementare:
- Tutte le altre (services, bookings, analytics, etc.)

## Database RLS ⚠️ CRITICO
- **Stato**: DISABLED a causa di circular dependency
- **Problema**: Policies circolari tra users ↔ organizations
- **Fix disponibile**: In DATABASE_SCHEMA_UPDATED.sql (sezione commentata)
- **Priorità**: ALTA - da risolvere prima del deploy

## Next.js 15 Specific
- Cookies sono ASYNC (critical to remember!)
- Always use: `const cookieStore = await cookies()`
- All cookie operations must be awaited

## Authentication Flow
- Using Supabase Auth
- Custom users table linked to auth.users
- Registration creates both auth user and profile
- Session managed by Supabase

## Test Data
**Suggerito**: Creare 5-10 clienti di test per validare:
- Ricerca e filtri
- Paginazione
- Statistiche dashboard
- Export/import CSV (quando implementato)

## Development Priorities 🎯
1. **Fix RLS policies** ⚠️ CRITICO
2. **CRUD Servizi** 🎯 PROSSIMO OBIETTIVO
3. **Sistema Calendar/Prenotazioni**
4. **WhatsApp Integration** 
5. **AI Assistant**

## Performance Notes
- Search con debouncing implementato
- Paginazione server-side
- Lazy loading delle immagini
- Ottimizzazioni bundle da fare

## Security Checklist
- ✅ Authentication required
- ✅ Organization-level data isolation  
- ✅ Input validation
- ✅ CSRF protection
- ❌ RLS policies (da fixare)
- ❌ Rate limiting (da implementare)
- ❌ Audit logging completo

## Browser Compatibility
- Testato su Chrome/Firefox/Safari
- Mobile responsive implementato
- IE non supportato (per scelta)

## Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Future:
OPENAI_API_KEY=
WHATSAPP_ACCESS_TOKEN=
STRIPE_SECRET_KEY=
```

## Known Issues
1. **RLS Policies**: Circular dependency - alta priorità
2. **Modal clicks**: Click fuori non chiude dropdown in alcuni casi
3. **Search debouncing**: Potrebbe migliorare con useCallback
4. **Error boundaries**: Da implementare per crash graceful

## Next Session Focus
**Obiettivo**: Implementare CRUD Servizi completo seguendo stesso pattern clienti:
- Lista servizi con categorie
- Form creazione/modifica
- Gestione prezzi e durata
- Toggle attivo/inattivo
- Eliminazione con controlli bookings

**Stima**: 3-4 ore per completamento totale

# Beauty AI Assistant - Note Importanti
Ultimo aggiornamento: 14/03/2024

## Stato del Progetto

### Database e Sicurezza
- [x] CRUD per clients: 100% completo
- [x] CRUD per services: 100% completo
- [x] TypeScript types: 100% implementati
- [x] RLS Policies: Implementate e attive
  - Policies granulari per ogni operazione (SELECT, INSERT, UPDATE, DELETE)
  - Controllo accessi basato su ruoli (owner, staff)
  - Enforcement automatico dell'organization_id
  - Trigger per validazione e aggiornamenti automatici
- [x] Funzioni helper implementate:
  - get_user_organization()
  - is_owner()
  - is_staff()
  - enforce_organization_id()

### Struttura File
- [x] Organizzazione chiara per la gestione dei clienti
- [x] Organizzazione chiara per la gestione dei servizi
- [x] Componenti UI ben strutturati
- [x] API endpoints organizzate per dominio

### Funzionalità Implementate
- [x] CRUD completo per clients
- [x] CRUD completo per services
  - [x] Creazione servizi con validazione
  - [x] Modifica servizi
  - [x] Eliminazione servizi (con controllo prenotazioni)
  - [x] Ricerca e filtri
  - [x] Paginazione
  - [x] Gestione categorie
- [x] Ricerca avanzata
- [x] Sistema di tagging
- [x] Paginazione lato server
- [x] Validazione form
- [x] Soft delete
- [x] Statistiche
- [x] Sistema di sicurezza RLS completo

### Prossimi Obiettivi
1. Implementare sistema di prenotazioni
2. Integrare WhatsApp
3. Aggiungere sistema di pagamenti
4. Implementare analytics avanzate

## Note Tecniche

### Stack Tecnologico
- Next.js 15
- Supabase (Auth + Database)
- TypeScript
- Tailwind CSS

### Variabili d'Ambiente Richieste
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WHATSAPP_API_KEY=your-whatsapp-key
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

### Compatibilità Browser
- Chrome (ultime 2 versioni)
- Firefox (ultime 2 versioni)
- Safari (ultime 2 versioni)
- Edge (ultime 2 versioni)

### Note sulla Sicurezza
- RLS policies implementate e attive su tutte le tabelle
- Controllo accessi basato su ruoli utente
- Isolamento completo tra organizzazioni
- Validazione automatica dell'organization_id
- Trigger per aggiornamenti automatici
- Funzione di rollback disponibile se necessario

### Known Issues
- Nessun problema critico noto
- Sistema di sicurezza RLS completamente funzionante
- Monitoraggio attivo per eventuali problemi di performance

### Best Practices Implementate
- Validazione input lato server
- Gestione errori centralizzata
- Logging delle operazioni critiche
- Backup automatico del database
- Rate limiting su API endpoints
- Protezione contro attacchi comuni

## Risorse Utili
- [Documentazione Supabase](https://supabase.com/docs)
- [Documentazione Next.js](https://nextjs.org/docs)
- [Guida TypeScript](https://www.typescriptlang.org/docs)
- [Documentazione Tailwind](https://tailwindcss.com/docs)

## 🔔 Sistema Notifiche

### Architettura
1. **Edge Functions**
   - `send-reminders.ts`: Gestisce l'invio di notifiche
   - `mark-no-show.ts`: Gestisce il marking automatico dei no-show

2. **Integrazioni**
   - EmailJS per email
   - Twilio per SMS e WhatsApp
   - Template predefiniti per ogni tipo di notifica

3. **Database**
   - Nuove colonne in `bookings`:
     ```sql
     reminder_sent boolean
     no_show_marked boolean
     notification_preferences jsonb
     ```

### Flusso Notifiche
1. **Creazione Prenotazione**
   - Conferma immediata via email/SMS/WhatsApp
   - Template personalizzato per organizzazione

2. **Reminder**
   - 24h prima: Email + SMS
   - 1h prima: SMS + WhatsApp
   - Configurabile per organizzazione

3. **No-Show**
   - Marking automatico giornaliero
   - Notifica staff
   - Storico no-show per cliente

## 🎯 Azioni di Stato

### Stati Prenotazione
1. **Confermato**
   - Inviato reminder
   - Cliente confermato
   - Staff assegnato

2. **Completato**
   - Servizio erogato
   - Pagamento registrato
   - Feedback raccolto

3. **No-Show**
   - Cliente non presente
   - Marking automatico
   - Storico mantenuto

4. **Annullato**
   - Cancellazione cliente
   - Cancellazione staff
   - Slot liberato

### UI/UX
1. **Pulsanti Azione**
   - Conferma
   - Completa
   - No-Show
   - Annulla
   - Ogni azione con conferma

2. **Feedback**
   - Toast notifications (sonner/react-hot-toast)
   - Loading states
   - Error handling
   - Success confirmations

## 🔧 Setup Integrazioni

### EmailJS
1. Creare account
2. Configurare template
3. Ottenere API key
4. Test invio

### Twilio
1. Creare account
2. Verificare numero
3. Configurare WhatsApp
4. Ottenere credenziali
5. Test invio

## ⚠️ Considerazioni Importanti

### Sicurezza
1. **API Keys**
   - Mai esporre in frontend
   - Usare variabili ambiente
   - Rotazione periodica

2. **Rate Limiting**
   - Limiti per organizzazione
   - Limiti per cliente
   - Gestione errori

3. **Privacy**
   - Consenso cliente
   - GDPR compliance
   - Data retention

### Performance
1. **Edge Functions**
   - Ottimizzare payload
   - Gestire timeout
   - Monitorare costi

2. **Database**
   - Indici appropriati
   - Query ottimizzate
   - Caching strategico

### UX
1. **Feedback**
   - Toast chiari e concisi
   - Loading states appropriati
   - Error messages utili

2. **Accessibilità**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

## 📝 Best Practices

### Sviluppo
1. **Code Style**
   - TypeScript strict
   - ESLint rules
   - Prettier config

2. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

3. **Documentazione**
   - JSDoc comments
   - README aggiornato
   - API docs

### Deployment
1. **Vercel**
   - Preview deployments
   - Production checks
   - Rollback plan

2. **Supabase**
   - Migration strategy
   - Backup plan
   - Monitoring

## 🚀 Prossimi Passi

### Priorità Alta
1. Implementare sistema notifiche
2. Aggiungere azioni di stato
3. Setup EmailJS/Twilio
4. Implementare toast

### Priorità Media
1. Ottimizzare performance
2. Migliorare UX
3. Aggiungere test
4. Documentare API

### Priorità Bassa
1. Analytics avanzati
2. Report personalizzati
3. Export dati
4. Backup automatico

## 📊 Metriche di Successo

### Notifiche
- Tasso di consegna
- Tasso di apertura
- Tasso di risposta
- Tasso di no-show

### UX
- Tempo di interazione
- Tasso di errore
- NPS
- Retention

### Performance
- Tempo di risposta
- Uptime
- Costi
- Scalabilità

## 🔍 Monitoraggio

### Errori
- Logging centralizzato
- Alerting
- Tracking
- Analytics

### Performance
- Response time
- API calls
- Database queries
- Edge functions

### Business
- Conversion rate
- Retention rate
- Customer satisfaction
- Revenue metrics

## **Refactoring delle sottopagine (sidebar, layout, ecc.)** – Tutte le sottopagine (clients, services, bookings, ecc.) sono "figlie" del layout condiviso (in "app/(dashboard)/layout.tsx") e non duplicano la sidebar, il wrapper o il <main>. Ogni pagina contiene solo il contenuto specifico (header, form, dettagli, ecc.) e la manutenzione (es. aggiornare la sidebar) è centralizzata.

- La dashboard mostra solo la card "Clienti di oggi" con dropdown dettagliata (nome, telefono, servizi, orario, operatore)
- Motivazione: maggiore utilità operativa, chiarezza, meno ridondanza
- Best practice: raggruppamento dati lato server, dropdown client-side, nessuna duplicazione di logica