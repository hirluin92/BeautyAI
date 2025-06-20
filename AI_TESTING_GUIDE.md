# 🧪 Guida Test AI WhatsApp - Beauty AI Assistant

## 🚀 Setup Iniziale

### 1. Configurazione Ambiente

```bash
# Copia le variabili ambiente
cp .env.example .env.local

# Configura le variabili AI
OPENAI_API_KEY=your_openai_api_key
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_VERIFY_TOKEN=your_whatsapp_verify_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
```

### 2. Database Setup

```bash
# Applica le migrazioni
supabase db push

# Verifica le tabelle AI
supabase db diff --schema public
```

### 3. Avvia il Server

```bash
npm run dev
```

## 🧪 Test Interfaccia Web

### 1. Pagina Test AI

Vai su: `http://localhost:3000/test-ai`

Questa pagina ti permette di:
- Selezionare un'organizzazione
- Impostare un numero di telefono
- Simulare conversazioni WhatsApp
- Vedere le risposte dell'AI in tempo reale

### 2. Test Rapidi

Usa i pulsanti quick reply per testare:

```
👋 Ciao
📅 Prenota appuntamento  
❓ Info servizi
📋 Le mie prenotazioni
```

### 3. Test Manuali

Prova questi messaggi:

```
"Ciao, come stai?"
"Vorrei prenotare un massaggio"
"Quali servizi offrite?"
"Ho una prenotazione per domani?"
"Quanto costa un massaggio?"
"Posso cancellare il mio appuntamento?"
```

## 🔧 Test API Diretti

### 1. Test Endpoint Base

```bash
# GET - Info organizzazione e servizi
curl "http://localhost:3000/api/whatsapp/test?organizationId=YOUR_ORG_ID&phoneNumber=+393331234567"
```

### 2. Test Conversazione

```bash
# POST - Invia messaggio
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Ciao, vorrei prenotare un appuntamento",
    "organizationId": "YOUR_ORG_ID",
    "phoneNumber": "+393331234567"
  }'
```

### 3. Test Funzioni AI

```bash
# Test disponibilità
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hai disponibilità per un massaggio domani?",
    "organizationId": "YOUR_ORG_ID",
    "phoneNumber": "+393331234567"
  }'

# Test prenotazione
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Prenota un massaggio per domani alle 10:00",
    "organizationId": "YOUR_ORG_ID",
    "phoneNumber": "+393331234567"
  }'

# Test servizi
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quali servizi offrite?",
    "organizationId": "YOUR_ORG_ID",
    "phoneNumber": "+393331234567"
  }'
```

## 🌐 Test Webhook WhatsApp

### 1. Simulazione Webhook

```bash
# Simula messaggio WhatsApp
curl -X POST "http://localhost:3000/api/whatsapp/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123456789",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "+393331234567",
            "phone_number_id": "YOUR_PHONE_NUMBER_ID"
          },
          "messages": [{
            "from": "+393331234567",
            "id": "wamid.123456789",
            "timestamp": "1234567890",
            "text": {
              "body": "Ciao, come stai?"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

### 2. Verifica Webhook

```bash
# GET - Verifica webhook
curl "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test"
```

## 📊 Test Funzionalità Specifiche

### 1. Test Controllo Disponibilità

```bash
# Test con data specifica
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hai disponibilità per un massaggio rilassante il 15 gennaio 2024?",
    "organizationId": "YOUR_ORG_ID",
    "phoneNumber": "+393331234567"
  }'
```

**Risposta Attesa:**
```json
{
  "success": true,
  "response": {
    "text": "📅 Ecco gli orari disponibili per Massaggio rilassante il 15 gennaio 2024:\n\n09:00, 10:00, 11:00, 14:00, 15:00\n\nQuale preferisci?",
    "quickReplies": []
  }
}
```

### 2. Test Prenotazione

```bash
# Test prenotazione completa
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Prenota un massaggio rilassante per domani alle 10:00",
    "organizationId": "YOUR_ORG_ID",
    "phoneNumber": "+393331234567"
  }'
```

**Risposta Attesa:**
```json
{
  "success": true,
  "response": {
    "text": "✅ Prenotazione confermata!\n\n📅 Data: 15 gennaio 2024\n⏰ Ora: 10:00\n💆 Servizio: Massaggio rilassante\n💰 Prezzo: €50\n\nTi invieremo un promemoria 24 ore prima dell'appuntamento.",
    "buttons": [
      {"id": "cancel_booking", "title": "❌ Cancella"},
      {"id": "modify_booking", "title": "✏️ Modifica"}
    ]
  }
}
```

### 3. Test Gestione Clienti

```bash
# Test cliente nuovo
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Ciao, sono nuovo cliente",
    "organizationId": "YOUR_ORG_ID",
    "phoneNumber": "+393339876543"
  }'
```

### 4. Test Cancellazione

```bash
# Test cancellazione prenotazione
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Vorrei cancellare la mia prenotazione di domani",
    "organizationId": "YOUR_ORG_ID",
    "phoneNumber": "+393331234567"
  }'
```

## 🔍 Debug e Logging

### 1. Log Console

```bash
# Avvia con log dettagliati
DEBUG=* npm run dev

# Log specifici AI
DEBUG=ai:* npm run dev
```

### 2. Log Database

```bash
# Verifica sessioni chat
supabase db query "SELECT * FROM chat_sessions WHERE organization_id = 'YOUR_ORG_ID' ORDER BY created_at DESC LIMIT 5;"

# Verifica messaggi
supabase db query "SELECT * FROM chat_messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE organization_id = 'YOUR_ORG_ID') ORDER BY created_at DESC LIMIT 10;"

# Verifica prenotazioni create
supabase db query "SELECT * FROM bookings WHERE source = 'whatsapp' AND organization_id = 'YOUR_ORG_ID' ORDER BY created_at DESC LIMIT 5;"
```

### 3. Log OpenAI

```bash
# Verifica chiamate OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/usage
```

## 🚨 Troubleshooting

### 1. Errori Comuni

**Errore: "OpenAI API key not found"**
```bash
# Verifica variabile ambiente
echo $OPENAI_API_KEY
```

**Errore: "Organization not found"**
```bash
# Verifica organizzazione nel database
supabase db query "SELECT id, name FROM organizations LIMIT 5;"
```

**Errore: "Service not found"**
```bash
# Verifica servizi
supabase db query "SELECT id, name FROM services WHERE organization_id = 'YOUR_ORG_ID';"
```

### 2. Test Connessione Database

```bash
# Test connessione Supabase
supabase status

# Test query semplice
supabase db query "SELECT NOW();"
```

### 3. Test OpenAI

```bash
# Test API OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

## 📈 Metriche e Performance

### 1. Metriche da Monitorare

- **Tempo di risposta AI**: < 5 secondi
- **Successo conversazioni**: > 90%
- **Prenotazioni create**: Numero per giorno
- **Errori webhook**: < 1%

### 2. Test Performance

```bash
# Test carico
ab -n 100 -c 10 -p test_message.json -T application/json \
  http://localhost:3000/api/whatsapp/test
```

### 3. Monitoraggio Real-time

```bash
# Log in tempo reale
tail -f logs/ai.log

# Metriche database
supabase db query "
SELECT 
  COUNT(*) as total_conversations,
  AVG(EXTRACT(EPOCH FROM (last_message_at - created_at))) as avg_duration
FROM chat_sessions 
WHERE created_at > NOW() - INTERVAL '1 day';
"
```

## 🎯 Test Scenari Completi

### 1. Scenario: Nuovo Cliente

```
1. Cliente invia: "Ciao"
2. AI risponde: Saluto + menu opzioni
3. Cliente invia: "Vorrei prenotare"
4. AI chiede: "Quale servizio?"
5. Cliente invia: "Massaggio"
6. AI mostra: Lista servizi massaggio
7. Cliente invia: "Massaggio rilassante"
8. AI chiede: "Per quando?"
9. Cliente invia: "Domani"
10. AI mostra: Orari disponibili
11. Cliente invia: "10:00"
12. AI conferma: Prenotazione creata
```

### 2. Scenario: Cliente Esistente

```
1. Cliente invia: "Le mie prenotazioni"
2. AI risponde: Lista prenotazioni future
3. Cliente invia: "Cancella quella di domani"
4. AI conferma: Prenotazione cancellata
```

### 3. Scenario: Informazioni

```
1. Cliente invia: "Info servizi"
2. AI risponde: Lista servizi con prezzi
3. Cliente invia: "Quanto costa il massaggio?"
4. AI risponde: Prezzo specifico
```

## 🔧 Configurazione Avanzata

### 1. Personalizzazione Prompt

Modifica `lib/ai/constants.ts`:

```typescript
export const SYSTEM_PROMPTS = {
  assistant: `Sei l'assistente virtuale di {organizationName}...
  // Personalizza qui il prompt
  `,
}
```

### 2. Aggiunta Funzioni AI

Modifica `lib/ai/constants.ts`:

```typescript
export const AI_FUNCTIONS = [
  // ... funzioni esistenti
  {
    name: 'nuova_funzione',
    description: 'Descrizione funzione',
    parameters: {
      // ... parametri
    }
  }
]
```

### 3. Test Funzioni Personalizzate

```bash
# Test funzione personalizzata
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Messaggio che attiva la nuova funzione",
    "organizationId": "YOUR_ORG_ID",
    "phoneNumber": "+393331234567"
  }'
```

## 📞 Supporto

Per problemi o domande:

1. Controlla i log: `npm run logs`
2. Verifica configurazione: `npm run test:config`
3. Test connessioni: `npm run test:connections`
4. Apri issue su GitHub con log dettagliati

---

**Nota**: Assicurati di avere sempre dati di test nel database prima di testare l'AI. Usa l'interfaccia di amministrazione per creare organizzazioni, servizi e prenotazioni di test. 