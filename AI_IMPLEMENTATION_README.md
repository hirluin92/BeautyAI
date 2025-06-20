# 🤖 AI WhatsApp Implementation - Beauty AI Assistant

## 🎯 Panoramica

L'AI WhatsApp è un assistente virtuale intelligente che gestisce automaticamente le conversazioni con i clienti via WhatsApp, permettendo di:

- **Prenotare appuntamenti** automaticamente
- **Controllare disponibilità** in tempo reale
- **Gestire cancellazioni** e modifiche
- **Fornire informazioni** sui servizi
- **Creare clienti** automaticamente
- **Inviare promemoria** personalizzati

## 🏗️ Architettura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   Webhook       │    │   AI Handler    │
│   Business API  │───▶│   /api/whatsapp │───▶│   OpenAI GPT-4  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Database      │    │   WhatsApp      │
                       │   Supabase      │    │   Response      │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Setup Rapido

### 1. Variabili Ambiente

```bash
# Copia .env.example
cp .env.example .env.local

# Configura le variabili AI
OPENAI_API_KEY=your_openai_api_key
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_VERIFY_TOKEN=your_whatsapp_verify_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
```

### 2. Database

```bash
# Applica migrazioni
supabase db push

# Verifica tabelle AI
supabase db query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'chat_%';"
```

### 3. Test Locale

```bash
# Avvia server
npm run dev

# Test AI
npm run test:ai

# Test specifico
npm run test:ai:booking
```

## 🧪 Test Interfaccia

Vai su: `http://localhost:3000/test-ai`

Questa interfaccia ti permette di:
- ✅ Simulare conversazioni WhatsApp
- ✅ Testare tutte le funzionalità AI
- ✅ Vedere le risposte in tempo reale
- ✅ Debuggare problemi

## 🔧 Funzionalità Implementate

### 1. Gestione Conversazioni

```typescript
// Carica contesto da database
await loadContext()

// Salva conversazione
await saveContext()

// Gestione sessioni multiple
const sessionId = `${organizationId}_${phoneNumber}`
```

### 2. Funzioni AI

| Funzione | Descrizione | Esempio |
|----------|-------------|---------|
| `check_availability` | Controlla disponibilità | "Hai posto domani?" |
| `book_appointment` | Crea prenotazione | "Prenota massaggio 10:00" |
| `cancel_appointment` | Cancella prenotazione | "Cancella appuntamento" |
| `get_client_bookings` | Lista prenotazioni | "Le mie prenotazioni" |
| `get_services` | Info servizi | "Quali servizi offrite?" |
| `get_service_info` | Dettagli servizio | "Quanto costa massaggio?" |

### 3. Gestione Clienti Automatica

```typescript
// Crea cliente automaticamente se non esiste
if (!client) {
  const { data: newClient } = await supabase
    .from('clients')
    .insert({
      organization_id: organizationId,
      phone: phoneNumber,
      whatsapp_phone: phoneNumber,
      full_name: `Cliente WhatsApp (${phoneNumber})`
    })
}
```

### 4. Controllo Disponibilità Intelligente

```typescript
// Genera slot disponibili
const slots = generateTimeSlots(openTime, closeTime, duration)

// Filtra slot occupati
const availableSlots = filterAvailableSlots(slots, existingBookings)
```

## 📱 Esempi di Conversazione

### Scenario 1: Nuovo Cliente

```
Cliente: "Ciao"
AI: "Ciao! 👋 Sono l'assistente virtuale di Centro Estetico.
Come posso aiutarti oggi?

📅 Prenota appuntamento
❓ Info servizi  
📋 Le mie prenotazioni
📞 Contatti"

Cliente: "Vorrei prenotare"
AI: "Perfetto! Quale servizio ti interessa?

💆 Massaggio Rilassante - €50 (60 min)
💆 Massaggio Sportivo - €60 (60 min)
✨ Facial Anti-Age - €45 (45 min)
💅 Manicure - €25 (30 min)
🦶 Pedicure - €35 (45 min)"

Cliente: "Massaggio rilassante"
AI: "Ottimo! Per quando vorresti il massaggio rilassante?

Puoi dirmi la data preferita (es. domani, venerdì, 15 gennaio)"
```

### Scenario 2: Controllo Disponibilità

```
Cliente: "Hai disponibilità per domani?"
AI: "📅 Ecco gli orari disponibili per domani:

09:00, 10:00, 11:00, 14:00, 15:00, 16:00

Quale preferisci?"
```

### Scenario 3: Prenotazione Completa

```
Cliente: "Prenota per domani alle 10:00"
AI: "✅ Prenotazione confermata!

📅 Data: 15 gennaio 2024
⏰ Ora: 10:00
💆 Servizio: Massaggio Rilassante
💰 Prezzo: €50

Ti invieremo un promemoria 24 ore prima dell'appuntamento.
Per cancellare o modificare, scrivi qui in qualsiasi momento.

[❌ Cancella] [✏️ Modifica]"
```

## 🔌 API Endpoints

### 1. Webhook WhatsApp

```bash
POST /api/whatsapp/webhook
```

Gestisce i messaggi in arrivo da WhatsApp Business API.

### 2. Test AI

```bash
GET /api/whatsapp/test?organizationId=xxx&phoneNumber=+39xxx
POST /api/whatsapp/test
```

Endpoint per testare l'AI senza WhatsApp reale.

### 3. Esempio di Uso

```bash
# Test conversazione
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Ciao, vorrei prenotare un massaggio",
    "organizationId": "your-org-id",
    "phoneNumber": "+393331234567"
  }'
```

## 🗄️ Database Schema

### Tabelle AI

```sql
-- Sessioni chat
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  client_id UUID REFERENCES clients(id),
  whatsapp_phone VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  context JSONB DEFAULT '{}',
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messaggi chat
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id),
  organization_id UUID REFERENCES organizations(id),
  message_type VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  is_from_client BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Campi Aggiuntivi

```sql
-- Organizzazioni
ALTER TABLE organizations ADD COLUMN whatsapp_phone_number_id VARCHAR(255);
ALTER TABLE organizations ADD COLUMN whatsapp_access_token TEXT;

-- Prenotazioni
ALTER TABLE bookings ADD COLUMN source VARCHAR(50) DEFAULT 'manual';
```

## 🧪 Testing

### 1. Test Automatici

```bash
# Tutti i test
npm run test:ai

# Test specifici
npm run test:ai:booking
npm run test:ai:services
npm run test:ai:availability
npm run test:ai:cancellation
npm run test:ai:client
```

### 2. Test Manuali

```bash
# Script di test
node scripts/test-ai.js

# Test con scenario specifico
node scripts/test-ai.js booking
```

### 3. Test Interfaccia Web

Vai su `http://localhost:3000/test-ai` per testare:
- ✅ Conversazioni complete
- ✅ Gestione errori
- ✅ Risposte AI
- ✅ Creazione prenotazioni

## 🔍 Debug e Logging

### 1. Log Console

```bash
# Log dettagliati
DEBUG=* npm run dev

# Log specifici AI
DEBUG=ai:* npm run dev
```

### 2. Log Database

```bash
# Verifica sessioni
supabase db query "
SELECT 
  cs.whatsapp_phone,
  cs.created_at,
  COUNT(cm.id) as message_count
FROM chat_sessions cs
LEFT JOIN chat_messages cm ON cs.id = cm.session_id
WHERE cs.organization_id = 'your-org-id'
GROUP BY cs.id, cs.whatsapp_phone, cs.created_at
ORDER BY cs.created_at DESC;
"
```

### 3. Log OpenAI

```bash
# Verifica chiamate API
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/usage
```

## 🚨 Troubleshooting

### Errori Comuni

**1. "OpenAI API key not found"**
```bash
# Verifica variabile
echo $OPENAI_API_KEY
```

**2. "Organization not found"**
```bash
# Verifica organizzazione
supabase db query "SELECT id, name FROM organizations LIMIT 5;"
```

**3. "Service not found"**
```bash
# Verifica servizi
supabase db query "SELECT id, name FROM services WHERE organization_id = 'your-org-id';"
```

### Soluzioni

**1. Configurazione WhatsApp**
- Verifica `WHATSAPP_ACCESS_TOKEN`
- Controlla `WHATSAPP_PHONE_NUMBER_ID`
- Testa webhook con `curl`

**2. Database**
- Applica migrazioni: `supabase db push`
- Verifica tabelle: `supabase db diff`
- Controlla RLS policies

**3. OpenAI**
- Verifica API key: `curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models`
- Controlla crediti account
- Verifica rate limits

## 📊 Metriche e Monitoraggio

### Metriche Chiave

- **Tempo di risposta AI**: < 5 secondi
- **Successo conversazioni**: > 90%
- **Prenotazioni create**: Numero/giorno
- **Errori webhook**: < 1%

### Monitoraggio

```bash
# Metriche real-time
supabase db query "
SELECT 
  COUNT(*) as total_conversations,
  AVG(EXTRACT(EPOCH FROM (last_message_at - created_at))) as avg_duration,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as active_last_hour
FROM chat_sessions 
WHERE organization_id = 'your-org-id';
"
```

## 🔒 Sicurezza

### 1. Validazione Input

```typescript
// Validazione numero telefono
const phoneRegex = /^\+[1-9]\d{1,14}$/
if (!phoneRegex.test(phoneNumber)) {
  throw new Error('Numero telefono non valido')
}
```

### 2. Rate Limiting

```typescript
// Implementa rate limiting per webhook
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100 // max 100 richieste per finestra
}
```

### 3. Sanitizzazione

```typescript
// Sanitizza input utente
const sanitizedMessage = message.replace(/[<>]/g, '')
```

## 🚀 Deployment

### 1. Produzione

```bash
# Build
npm run build

# Start
npm start

# Verifica webhook
curl "https://your-domain.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=$WHATSAPP_VERIFY_TOKEN&hub.challenge=test"
```

### 2. Variabili Produzione

```bash
# .env.production
NODE_ENV=production
OPENAI_API_KEY=your_production_key
WHATSAPP_ACCESS_TOKEN=your_production_token
WHATSAPP_VERIFY_TOKEN=your_production_verify_token
WHATSAPP_PHONE_NUMBER_ID=your_production_phone_id
```

### 3. SSL e Domini

- Configura certificato SSL
- Imposta dominio principale
- Configura redirect HTTPS

## 📚 Risorse

- [OpenAI API Docs](https://platform.openai.com/docs)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🤝 Contribuire

1. Fork il repository
2. Crea branch feature: `git checkout -b feature/ai-improvement`
3. Commit changes: `git commit -am 'Add AI feature'`
4. Push branch: `git push origin feature/ai-improvement`
5. Apri Pull Request

## 📞 Supporto

Per problemi o domande:

1. Controlla i log: `npm run logs`
2. Verifica configurazione: `npm run test:config`
3. Test connessioni: `npm run test:connections`
4. Apri issue su GitHub con log dettagliati

---

**Nota**: Assicurati di avere sempre dati di test nel database prima di testare l'AI. Usa l'interfaccia di amministrazione per creare organizzazioni, servizi e prenotazioni di test. 