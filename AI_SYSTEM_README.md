# Beauty AI Assistant - Sistema AI

**Ultimo aggiornamento:** Dicembre 2024

## 🤖 Panoramica Sistema AI

Il sistema AI di Beauty AI Assistant integra OpenAI GPT-4 con WhatsApp Business API per fornire un assistente intelligente che gestisce automaticamente le conversazioni con i clienti, prenotazioni e richieste.

## 🏗️ Architettura

### Componenti Principali

```
lib/ai/
├── constants.ts              # Costanti e configurazioni AI
├── conversation-handler.ts   # Gestore conversazioni
├── types.ts                  # Tipi TypeScript per AI
└── whatsapp-integration.ts   # Integrazione WhatsApp
```

### Flusso di Conversazione

1. **Ricezione Messaggio** → Webhook WhatsApp
2. **Analisi Contesto** → ConversationHandler
3. **Elaborazione AI** → OpenAI GPT-4
4. **Esecuzione Azioni** → Function Calling
5. **Risposta** → WhatsApp API

## 🔧 Configurazione

### Variabili Ambiente

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# WhatsApp Business API
WHATSAPP_BUSINESS_ID=your_business_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# Webhook URL
WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/whatsapp/webhook
```

### Setup OpenAI

1. **Account OpenAI**: Creare account su [OpenAI Platform](https://platform.openai.com)
2. **API Key**: Generare chiave API con crediti sufficienti
3. **Model**: Utilizzare `gpt-4` per performance ottimali
4. **Rate Limits**: Monitorare limiti di utilizzo

### Setup WhatsApp Business API

1. **Meta Developer Account**: Registrarsi su [Meta Developers](https://developers.facebook.com)
2. **WhatsApp Business API**: Configurare app e numero di telefono
3. **Webhook**: Configurare endpoint per ricevere messaggi
4. **Permissions**: Abilitare permessi per invio messaggi

## 🎯 Funzionalità AI

### Funzioni Disponibili

#### 📅 Gestione Prenotazioni
- **`check_availability`**: Verifica disponibilità date/orari
- **`book_appointment`**: Crea nuova prenotazione
- **`cancel_appointment`**: Cancella prenotazione esistente
- **`reschedule_appointment`**: Riprogramma appuntamento

#### 👥 Gestione Clienti
- **`get_client_info`**: Recupera informazioni cliente
- **`update_client_info`**: Aggiorna dati cliente
- **`get_client_bookings`**: Storico prenotazioni cliente

#### 💼 Gestione Servizi
- **`get_services`**: Lista servizi disponibili
- **`get_service_info`**: Dettagli servizio specifico
- **`get_service_pricing`**: Prezzi e durate servizi

#### 📊 Informazioni Generali
- **`get_business_hours`**: Orari di apertura
- **`get_staff_info`**: Informazioni operatori
- **`get_promotions`**: Offerte e promozioni attive

### Esempi di Conversazione

#### Prenotazione Appuntamento
```
Cliente: "Vorrei prenotare un massaggio per domani alle 15:00"
AI: "Perfetto! Ho controllato la disponibilità. Ci sono questi slot disponibili:
     - 15:00-16:00 (Massaggio Relax)
     - 15:30-16:30 (Massaggio Sportivo)
     
     Quale preferisce?"
```

#### Modifica Prenotazione
```
Cliente: "Devo spostare il mio appuntamento di oggi alle 18:00"
AI: "Ho trovato la sua prenotazione per oggi alle 16:00. 
     Alle 18:00 abbiamo disponibilità. 
     Conferma la modifica?"
```

#### Informazioni Servizi
```
Cliente: "Quanto costa la depilazione?"
AI: "Ecco i nostri servizi di depilazione:
     - Depilazione Gambe: €45 (45 min)
     - Depilazione Ascelle: €15 (15 min)
     - Depilazione Bikini: €25 (30 min)
     
     Vuole prenotare?"
```

## 🔄 Gestione Conversazioni

### ConversationHandler

```typescript
interface ConversationContext {
  client_id?: string;
  current_booking?: string;
  last_action?: string;
  preferences?: ClientPreferences;
  conversation_history: Message[];
}
```

### Persistenza Contesto

- **Database**: Tabella `ai_conversations` per salvare contesto
- **Session Management**: Gestione sessioni per conversazioni lunghe
- **Context Window**: Mantenimento contesto per coerenza

### Template Messaggi

```typescript
const messageTemplates = {
  greeting: "Ciao! Sono l'assistente di {business_name}. Come posso aiutarla?",
  booking_confirmation: "Perfetto! Ho prenotato {service} per {date} alle {time}.",
  availability_check: "Ho controllato la disponibilità per {date}. Ecco gli slot liberi:",
  error: "Mi dispiace, c'è stato un errore. Può riprovare o contattarci direttamente?"
};
```

## 🛡️ Sicurezza e Privacy

### Protezione Dati
- **Encryption**: Tutti i dati crittografati in transito
- **GDPR Compliance**: Gestione consensi e privacy
- **Data Retention**: Politiche di conservazione dati
- **Access Control**: Controllo accessi basato su ruoli

### Validazione Input
- **Sanitizzazione**: Pulizia input utente
- **Rate Limiting**: Protezione da abusi
- **Content Filtering**: Filtro contenuti inappropriati
- **Error Handling**: Gestione errori sicura

## 📊 Monitoraggio e Analytics

### Metriche AI
- **Conversation Success Rate**: Tasso di successo conversazioni
- **Response Time**: Tempo medio di risposta
- **User Satisfaction**: Feedback utenti
- **Function Usage**: Utilizzo funzioni AI

### Logging
- **Conversation Logs**: Storico conversazioni complete
- **Error Logs**: Log errori e fallimenti
- **Performance Logs**: Metriche performance
- **Usage Analytics**: Statistiche utilizzo

## 🔧 Sviluppo e Testing

### Ambiente di Test
```typescript
// Test conversation handler
const testConversation = {
  message: "Prenota massaggio domani",
  context: { client_id: "test-client" },
  expected_actions: ["check_availability", "book_appointment"]
};
```

### Debug Tools
- **Conversation Simulator**: Simulatore conversazioni
- **Function Tester**: Test singole funzioni AI
- **Context Inspector**: Ispezione contesto conversazione
- **Performance Monitor**: Monitoraggio performance

## 🚀 Deployment

### Produzione
1. **Environment Variables**: Configurare tutte le variabili
2. **Webhook Setup**: Configurare webhook WhatsApp
3. **Database Migration**: Applicare schema AI
4. **Monitoring**: Attivare monitoring e alerting

### Staging
1. **Test Environment**: Ambiente di test separato
2. **Mock Services**: Servizi mock per testing
3. **Data Seeding**: Dati di test per AI
4. **Integration Tests**: Test integrazione completi

## 📚 Risorse

### Documentazione
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Meta Developers](https://developers.facebook.com)

### Esempi
- [Conversation Examples](./examples/conversations.md)
- [Function Definitions](./examples/functions.md)
- [Integration Guide](./examples/integration.md)

---

**Sistema AI**: 🤖 **Operativo e in Sviluppo**  
**Versione**: 2.1.0  
**OpenAI**: GPT-4  
**WhatsApp**: Business API 