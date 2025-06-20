# Beauty AI Assistant - File Structure & Directory Map

**Ultimo aggiornamento:** Dicembre 2024

Questa guida descrive la struttura completa del progetto, con spiegazione di ogni cartella e file chiave. Utile per onboarding, refactoring e sviluppo collaborativo.

---

## 📁 Root Directory

- **README.md** — Documentazione principale, quick start, stack, guide.
- **CURRENT_STRUCTURE.md** — Struttura aggiornata e dettagliata del progetto.
- **PROJECT_CONTEXT.md** — Contesto, obiettivi, visione, use case.
- **PROJECT_STATUS.md** — Stato attuale, milestone, metriche, problemi noti.
- **TODO_LIST.md / TODO.md** — Task, backlog, roadmap.
- **DATABASE_SCHEMA_UPDATED.sql** — Schema database completo e versionato.
- **CHANGELOG.md** — Log delle modifiche e release note.
- **IMPORTANT_NOTES.md** — Note critiche, workaround, decisioni architetturali.
- **ENV_SETUP_GUIDE.md** — Guida setup ambiente e variabili.
- **SECURITY_CHECKLIST.md** — Checklist sicurezza e best practice.
- **AI_SYSTEM_README.md / AI_Chat_System_design.txt** — Documentazione sistema AI/chatbot.
- **package.json / package-lock.json** — Dipendenze, script, metadata progetto.
- **tsconfig.json** — Configurazione TypeScript.
- **next.config.ts** — Configurazione Next.js.
- **.eslintrc.json / eslint.config.mjs** — Configurazione ESLint.
- **jest.config.js / jest.setup.js** — Configurazione e setup Jest.
- **playwright.config.ts** — Configurazione Playwright (E2E).
- **postcss.config.mjs** — Configurazione PostCSS.
- **.gitignore** — File e cartelle ignorate da git.

---

## 📁 app/
**Next.js App Router** (v15+). Tutte le route, layout e API.

- **(auth)/** — Route gruppo autenticazione (login, register, layout dedicato).
- **(dashboard)/** — Route gruppo dashboard (protette, sidebar, pagine principali).
  - **bookings/** — Prenotazioni: lista, dettaglio, nuovo, modifica, error/loading.
  - **clients/** — Clienti: lista, nuovo, dettaglio, storico prenotazioni, modifica.
  - **services/** — Servizi: lista, nuovo, dettaglio, modifica.
  - **calendar/** — Calendario interattivo.
  - **dashboard/** — Dashboard principale, statistiche, modali.
  - **error/** — Error boundary per dashboard.
- **api/** — API routes (autenticazione, bookings, clients, services, staff, notifications, whatsapp).
- **globals.css** — Stili globali (Tailwind, palette, variabili CSS).
- **layout.tsx** — Root layout (font, provider, struttura base).
- **page.tsx** — Homepage.
- **test-db/** — Pagina test connessione database.
- **test-twilio/** — Pagina test Twilio.

---

## 📁 components/
**Componenti React** riutilizzabili e organizzati per dominio.

- **ui/** — Componenti base UI (Button, Card, Badge, Alert, Modal, Tabs, Dropdown, Skeleton, ecc.).
- **auth/** — Componenti autenticazione (LogoutButton, ecc.).
- **bookings/** — Componenti prenotazioni (BookingForm, BookingActions, NotificationManager, ecc.).
- **clients/** — Componenti clienti (ClientForm, ClientsTable, QuickAdd, ecc.).
- **services/** — Componenti servizi (ServiceForm, ServicesTable, ecc.).
- **dashboard/** — Componenti dashboard (statistiche, modali, ecc.).
- **notifications/** — Componenti notifiche (NotificationsDashboard, ToastProvider, ecc.).
- **calendar/** — Componenti calendario (CalendarView, ecc.).
- **layout/** — Componenti layout (Sidebar, ecc.).

---

## 📁 lib/
**Librerie, utilities e servizi**.

- **supabase/** — Client Supabase (browser/server), edge functions (mark-no-show, send-reminders).
- **ai/** — Integrazione AI (constants, conversation-handler, types, whatsapp-integration).
- **notifications/** — Sistema notifiche (email, whatsapp, notification.service).
- **constants/** — Costanti applicazione (booking, ecc.).
- **utils.ts** — Utility functions generiche.
- **twilio-client.ts** — Client Twilio per SMS/WhatsApp.

---

## 📁 types/
**Definizioni TypeScript**.

- **database.ts** — Tipi database generati (Supabase, 725+ righe).
- **index.ts** — Tipi custom e aggregati.

---

## 📁 hooks/
**Custom React hooks** (es: use-notifications).

---

## 📁 supabase/
**Migrazioni database** e configurazione Supabase.

- **migrations/** — File SQL per creazione e aggiornamento schema.

---

## 📁 __tests__/
**Test unitari** (API, componenti, db, performance).

---

## 📁 e2e/
**Test end-to-end** (Playwright, es: auth.spec.ts).

---

## 📁 public/
**Asset statici** (icone, immagini, svg, favicon).

---

## 📄 Altri file chiave
- **AI_Chat_System_design.txt** — Design e flussi sistema AI/chatbot.
- **AUTO_WHATSAPP_SETUP.md** — Guida setup WhatsApp Business API.
- **TEST_NOTIFICATIONS.md** — Guida test sistema notifiche.
- **TWILIO_SETUP_GUIDE.md / STEP_BY_STEP.md** — Guida setup Twilio.
- **WHATSAPP_ONLY_STRATEGY.md / VS_EMAIL_STRATEGY.md** — Strategie notifiche.
- **SECURITY_CHECKLIST.md** — Checklist sicurezza.
- **DEVELOPMENT_LOG.md** — Log sviluppo e refactoring.

---

**Nota:**
- Tutte le directory sono modulari e seguono la logica "feature-based".
- I file `.bak` sono backup temporanei.
- I file `.md` sono documentazione e guide operative.

---

**Beauty AI Assistant** — Struttura pensata per scalabilità, collaborazione e sviluppo rapido.
