# Beauty AI Assistant - Test Notifiche

**Ultimo aggiornamento:** Dicembre 2024

## 🧪 Panoramica Testing

Il sistema di notifiche di Beauty AI Assistant supporta multiple modalità di invio. Questa guida copre tutti i metodi di testing per verificare il corretto funzionamento.

## 📧 Test Email (EmailJS)

### Setup Test

#### 1. Configurazione EmailJS
```bash
# Verifica variabili ambiente
echo $EMAILJS_SERVICE_ID
echo $EMAILJS_TEMPLATE_ID
echo $EMAILJS_PUBLIC_KEY
```

#### 2. Template di Test
Crea un template di test in EmailJS:

```html
<h2>Test Notifica Beauty AI</h2>
<p>Ciao {{name}},</p>
<p>Questo è un test del sistema di notifiche.</p>
<p><strong>Dettagli:</strong></p>
<ul>
  <li>Servizio: {{service}}</li>
  <li>Data: {{date}}</li>
  <li>Ora: {{time}}</li>
</ul>
<p>Test completato con successo!</p>
```

### Test Manuale

#### 1. Test Frontend
```javascript
// Test invio email da frontend
const testEmail = async () => {
  try {
    const response = await fetch('/api/notifications/test-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_email: 'test@example.com',
        to_name: 'Test User',
        service: 'Massaggio Test',
        date: '2024-12-20',
        time: '15:00'
      })
    });
    
    const result = await response.json();
    console.log('Email test result:', result);
  } catch (error) {
    console.error('Email test failed:', error);
  }
};
```

#### 2. Test API Endpoint
```bash
# Test endpoint semplice
curl -X POST http://localhost:3000/api/notifications/test-simple \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "to_name": "Test User",
    "service": "Massaggio Test",
    "date": "2024-12-20",
    "time": "15:00"
  }'
```

#### 3. Test Prenotazione Reale
```bash
# Test con prenotazione esistente
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "your-booking-id",
    "type": "confirmation",
    "channels": ["email"]
  }'
```

### Verifica Risultati

#### 1. Controllo Email
- ✅ Email ricevuta nella casella di destinazione
- ✅ Template renderizzato correttamente
- ✅ Variabili sostituite con valori reali
- ✅ Formattazione HTML corretta

#### 2. Controllo Logs
```sql
-- Verifica log nel database
SELECT * FROM notifications 
WHERE type = 'email' 
ORDER BY created_at DESC 
LIMIT 5;
```

#### 3. Controllo Console
```javascript
// Verifica errori in console
console.log('EmailJS response:', response);
console.log('Email status:', response.status);
```

## 📱 Test SMS (Twilio)

### Setup Test

#### 1. Configurazione Twilio
```bash
# Verifica variabili ambiente
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $TWILIO_PHONE_NUMBER
```

#### 2. Numero di Test
Assicurati di avere un numero di telefono verificato per i test.

### Test Manuale

#### 1. Test API Endpoint
```bash
# Test SMS semplice
curl -X POST http://localhost:3000/api/notifications/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to_phone": "+393331234567",
    "message": "Test SMS Beauty AI - Prenotazione confermata per domani alle 15:00"
  }'
```

#### 2. Test Prenotazione
```bash
# Test SMS per prenotazione
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "your-booking-id",
    "type": "reminder",
    "channels": ["sms"]
  }'
```

### Verifica Risultati

#### 1. Controllo SMS
- ✅ SMS ricevuto sul telefono
- ✅ Messaggio completo e leggibile
- ✅ Numero mittente corretto
- ✅ Timestamp appropriato

#### 2. Controllo Logs
```sql
-- Verifica log SMS
SELECT * FROM notifications 
WHERE type = 'sms' 
ORDER BY created_at DESC 
LIMIT 5;
```

#### 3. Controllo Twilio Dashboard
- Verifica nel dashboard Twilio che l'SMS sia stato inviato
- Controlla lo status del messaggio
- Verifica eventuali errori

## 💬 Test WhatsApp

### Setup Test

#### 1. Configurazione WhatsApp
```bash
# Verifica variabili ambiente
echo $WHATSAPP_BUSINESS_ID
echo $WHATSAPP_PHONE_NUMBER_ID
echo $WHATSAPP_ACCESS_TOKEN
```

#### 2. Webhook Setup
```bash
# URL webhook per test
https://your-domain.com/api/whatsapp/webhook
```

### Test Manuale

#### 1. Test Invio WhatsApp
```bash
# Test WhatsApp diretto
curl -X POST http://localhost:3000/api/notifications/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to_phone": "+393331234567",
    "message": "Test WhatsApp Beauty AI - Prenotazione confermata! 📅"
  }'
```

#### 2. Test AI Chatbot
```bash
# Test conversazione AI
curl -X POST http://localhost:3000/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test-id",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "+393331234567",
            "phone_number_id": "test-phone-id"
          },
          "contacts": [{
            "profile": {"name": "Test User"},
            "wa_id": "+393331234567"
          }],
          "messages": [{
            "from": "+393331234567",
            "id": "test-message-id",
            "timestamp": "1234567890",
            "text": {"body": "Ciao, vorrei prenotare un massaggio"}
          }]
        }
      }]
    }]
  }'
```

### Verifica Risultati

#### 1. Controllo WhatsApp
- ✅ Messaggio ricevuto su WhatsApp
- ✅ Formattazione corretta
- ✅ Emoji e link funzionanti
- ✅ Risposta AI appropriata

#### 2. Controllo Database
```sql
-- Verifica conversazioni AI
SELECT * FROM ai_conversations 
ORDER BY created_at DESC 
LIMIT 5;

-- Verifica notifiche WhatsApp
SELECT * FROM notifications 
WHERE type = 'whatsapp' 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🔔 Test Toast In-App

### Setup Test

#### 1. Componente Toast
```typescript
// Test toast notifications
import { toast } from 'sonner';

const testToast = () => {
  toast.success('Test toast di successo!');
  toast.error('Test toast di errore!');
  toast.info('Test toast informativo!');
};
```

#### 2. Test Automatico
```bash
# Test toast tramite API
curl -X POST http://localhost:3000/api/notifications/toast \
  -H "Content-Type: application/json" \
  -d '{
    "type": "success",
    "message": "Test toast notification"
  }'
```

### Verifica Risultati

#### 1. Controllo UI
- ✅ Toast appare correttamente
- ✅ Animazioni fluide
- ✅ Auto-dismiss funziona
- ✅ Stili applicati correttamente

#### 2. Controllo Console
```javascript
// Verifica eventi toast
console.log('Toast triggered:', toastEvent);
```

## 🤖 Test AI Integration

### Setup Test

#### 1. Configurazione OpenAI
```bash
# Verifica variabili ambiente
echo $OPENAI_API_KEY
```

#### 2. Test Conversation Handler
```typescript
// Test conversation handler
import { ConversationHandler } from '@/lib/ai/conversation-handler';

const testAI = async () => {
  const handler = new ConversationHandler();
  
  const response = await handler.processMessage({
    message: "Prenota un massaggio per domani",
    phoneNumber: "+393331234567",
    context: {}
  });
  
  console.log('AI Response:', response);
};
```

### Test Manuale

#### 1. Test API Endpoint
```bash
# Test AI conversation
curl -X POST http://localhost:3000/api/ai/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Ciao, vorrei prenotare un massaggio",
    "phoneNumber": "+393331234567",
    "context": {}
  }'
```

#### 2. Test Function Calling
```bash
# Test specifiche funzioni AI
curl -X POST http://localhost:3000/api/ai/test-functions \
  -H "Content-Type: application/json" \
  -d '{
    "function": "check_availability",
    "params": {
      "service": "massaggio",
      "date": "2024-12-20"
    }
  }'
```

### Verifica Risultati

#### 1. Controllo AI Response
- ✅ Risposta AI appropriata
- ✅ Function calling funziona
- ✅ Contesto mantenuto
- ✅ Errori gestiti correttamente

#### 2. Controllo Database
```sql
-- Verifica conversazioni AI
SELECT * FROM ai_conversations 
WHERE phone_number = '+393331234567'
ORDER BY created_at DESC;
```

## 🔄 Test Automazioni

### Setup Test

#### 1. Cron Jobs
```bash
# Verifica cron jobs Supabase
supabase functions list
```

#### 2. Edge Functions
```bash
# Test edge function send-reminders
curl -X POST https://your-project.supabase.co/functions/v1/send-reminders \
  -H "Authorization: Bearer your-anon-key"
```

### Test Manuale

#### 1. Test Promemoria Automatici
```bash
# Simula promemoria 24h prima
curl -X POST http://localhost:3000/api/notifications/send-reminders \
  -H "Content-Type: application/json" \
  -d '{
    "hours_before": 24,
    "test_mode": true
  }'
```

#### 2. Test No-Show
```bash
# Simula mark no-show
curl -X POST http://localhost:3000/api/notifications/mark-no-show \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "test-booking-id"
  }'
```

## 📊 Test Performance

### Setup Test

#### 1. Load Testing
```bash
# Test performance con multiple richieste
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/notifications/test-simple \
    -H "Content-Type: application/json" \
    -d '{"to_email": "test'$i'@example.com", "message": "Test '$i'"}' &
done
wait
```

#### 2. Concurrent Testing
```javascript
// Test concorrenza
const testConcurrency = async () => {
  const promises = Array.from({ length: 10 }, (_, i) =>
    fetch('/api/notifications/test-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_email: `test${i}@example.com`,
        message: `Test ${i}`
      })
    })
  );
  
  const results = await Promise.all(promises);
  console.log('Concurrent test results:', results);
};
```

### Verifica Performance

#### 1. Metriche
- ✅ Tempo di risposta < 2 secondi
- ✅ Throughput > 10 richieste/secondo
- ✅ Error rate < 1%
- ✅ Memory usage stabile

#### 2. Monitoring
```bash
# Monitor risorse
npm run monitor:performance

# Log performance
npm run logs:performance
```

## 🚨 Troubleshooting

### Problemi Comuni

#### Email Non Inviati
```bash
# Debug EmailJS
npm run debug:email

# Verifica template
npm run validate:email-template

# Test connessione
npm run test:emailjs-connection
```

#### SMS Non Inviati
```bash
# Debug Twilio
npm run debug:sms

# Verifica credenziali
npm run verify:twilio-credentials

# Test numero
npm run test:phone-number
```

#### WhatsApp Non Funziona
```bash
# Debug WhatsApp
npm run debug:whatsapp

# Verifica webhook
npm run test:webhook

# Test AI
npm run test:ai-conversation
```

### Logs e Debug

#### Abilita Debug Mode
```bash
# Abilita debug completo
DEBUG=* npm run dev

# Debug specifico
DEBUG=notifications:* npm run dev
```

#### Controllo Logs
```bash
# Logs real-time
npm run logs:tail

# Logs specifici
npm run logs:notifications

# Logs errori
npm run logs:errors
```

## 📋 Checklist Test Completo

### Pre-Test
- [ ] Variabili ambiente configurate
- [ ] Database connesso
- [ ] Template email configurati
- [ ] Numeri telefono verificati
- [ ] Webhook URL configurati

### Test Email
- [ ] Template renderizzato correttamente
- [ ] Variabili sostituite
- [ ] Email ricevuta
- [ ] Log salvato nel database
- [ ] Errori gestiti

### Test SMS
- [ ] SMS inviato
- [ ] Messaggio ricevuto
- [ ] Numero mittente corretto
- [ ] Log salvato
- [ ] Errori gestiti

### Test WhatsApp
- [ ] Messaggio inviato
- [ ] Formattazione corretta
- [ ] AI risponde
- [ ] Conversazione salvata
- [ ] Errori gestiti

### Test AI
- [ ] OpenAI risponde
- [ ] Function calling funziona
- [ ] Contesto mantenuto
- [ ] Errori gestiti
- [ ] Performance accettabile

### Post-Test
- [ ] Logs verificati
- [ ] Database pulito
- [ ] Performance monitorata
- [ ] Errori risolti
- [ ] Documentazione aggiornata

---

**Test Status**: 🟢 **Completo e Funzionante**  
**Ultimo Test**: Dicembre 2024  
**Prossimo Test**: Gennaio 2025 