# Beauty AI Assistant - Struttura Progetto (Aggiornata)

**Ultimo aggiornamento:** Giugno 2025 (dopo pulizia file orfani e backup)

---

## 📁 Root Directory
- README.md
- CURRENT_STRUCTURE.md
- FILE_STRUCTURE_PROJECT.md
- PROJECT_CONTEXT.md
- PROJECT_STATUS.md
- TODO_LIST.md / TODO.md
- DATABASE_SCHEMA_UPDATED.sql
- CHANGELOG.md
- IMPORTANT_NOTES.md
- ENV_SETUP_GUIDE.md
- SECURITY_CHECKLIST.md
- AI_SYSTEM_README.md / AI_Chat_System_design.txt
- package.json / package-lock.json
- tsconfig.json
- next.config.ts
- .eslintrc.json / eslint.config.mjs
- jest.config.js / jest.setup.js
- playwright.config.ts
- postcss.config.mjs
- .gitignore

---

## 📁 app/
**Next.js App Router** (v15+). Tutte le route, layout e API.
- (auth)/ — Login, register, layout autenticazione
- (dashboard)/ — Dashboard, clienti, servizi, prenotazioni, conversazioni, admin
- api/ — API REST (bookings, clients, services, notifications, whatsapp, staff, ecc.)
- globals.css — Stili globali
- layout.tsx — Layout principale
- page.tsx — Home

---

## 📁 components/
- ai/ — Componenti AI/chat
- auth/ — Logout button
- bookings/ — Form, azioni, storico, notifiche
- calendar/ — Vista calendario
- clients/ — Form, tabella, ricerca, quick add
- layout/ — Sidebar
- notifications/ — Dashboard notifiche, toast
- services/ — Form, tabella, ricerca
- ui/ — Componenti UI riutilizzabili (alert, button, card, input, label, modal, select, tabs, ecc.)

---

## 📁 lib/
- ai/ — Gestione AI, handler conversazioni, integrazione WhatsApp
- config/ — Configurazioni (rate limit, ecc.)
- constants/ — Costanti (booking, ecc.)
- middleware/ — Middleware (rate limit)
- notifications/ — Email, notification.service, WhatsApp
- supabase/ — Client, server, edge functions
- twilio-client.ts — Client Twilio
- utils.ts — Utility functions
- rate-limit.ts — Gestione rate limiting

---

## 📁 types/
- database.ts — Tipi database (Supabase)
- index.ts — Tipi custom e aggregati

---

## 📁 hooks/
- (nessun hook custom orfano, solo hook effettivamente usati)

---

## 📁 supabase/
- migrations/ — Migrazioni database (solo file attivi, niente .bak)

---

## 📁 __tests__/
- Test unitari (API, componenti, db, performance) — solo se usati

---

## 📁 e2e/
- Test end-to-end (Playwright) — solo se usati

---

## 📁 public/
- Asset statici (icone, immagini, svg, favicon) — solo quelli effettivamente usati

---

**Nota:**
- Tutti i file di backup, test manuali, hook/componenti orfani sono stati rimossi.
- La struttura riflette solo i file e le directory effettivamente attivi nel progetto.

---

**Beauty AI Assistant** — Struttura aggiornata e pulita per sviluppo e manutenzione efficienti.