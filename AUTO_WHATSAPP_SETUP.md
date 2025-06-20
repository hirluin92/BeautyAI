# 🤖 Configurazione Invio Automatico WhatsApp

## 🎯 **Opzione Raccomandata: Green API (GRATUITO)**

### **Passo 1: Crea Account Green API**

1. **Vai su [https://green-api.com/](https://green-api.com/)**
2. **Clicca "Sign Up"**
3. **Inserisci email e password**
4. **Conferma l'account**

### **Passo 2: Crea Istanza WhatsApp**

1. **Nel dashboard, clicca "Create Instance"**
2. **Nome:** `Beauty Salon`
3. **Tipo:** `WhatsApp`
4. **Clicca "Create"**

### **Passo 3: Connetti il Telefono**

1. **Scansiona il QR code** con WhatsApp Business
2. **Usa il tuo numero aziendale**
3. **Conferma la connessione**

### **Passo 4: Ottieni Credenziali**

1. **Copia Instance ID** (es: `123456789`)
2. **Copia API Token** (es: `abc123def456`)

### **Passo 5: Aggiorna .env.local**

```env
# Email (già configurato)
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=TSr0DRGZrbEp2oS1d
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_wfdhb7c
NEXT_PUBLIC_EMAILJS_UNIVERSAL_TEMPLATE_ID=template_u61en7s

# Telefono aziendale
NEXT_PUBLIC_ORGANIZATION_PHONE=+39123456789
NEXT_PUBLIC_ORGANIZATION_NAME=Beauty Salon

# WhatsApp Automatico (Green API)
GREEN_API_INSTANCE_ID=123456789
GREEN_API_TOKEN=abc123def456
```

### **Passo 6: Testa l'Invio Automatico**

1. **Riavvia il server:** `npm run dev`
2. **Vai su una prenotazione**
3. **Clicca "Gestione Notifiche"**
4. **Clicca "Invia Conferma"**
5. **Verifica che WhatsApp arrivi automaticamente**

## 🔄 **Come Funziona l'Invio Automatico**

### **Flusso Automatico:**

1. **Utente clicca "Invia Conferma"**
2. **Sistema prepara messaggio:**
```
✅ *Prenotazione Confermata*

Ciao Maria Rossi! 👋

Ti confermiamo la prenotazione:
📅 15 Gennaio 2024
⏰ 14:30
💆 Taglio e Piega
👤 Anna Bianchi
💰 €45

Ti aspettiamo!
Beauty Salon
```

3. **Sistema invia automaticamente** via Green API
4. **Cliente riceve WhatsApp** direttamente
5. **Sistema registra** nel database

### **Messaggi Automatici Disponibili:**

- ✅ **Conferma prenotazione**
- ⏰ **Promemoria 24h prima**
- 🔔 **Promemoria 1h prima**
- ❌ **Cancellazione**
- 📝 **Modifica appuntamento**

## 🤖 **Automazioni Completamente Automatiche**

### **Promemoria Automatici 24h:**

Il sistema può inviare promemoria automaticamente:

```javascript
// Edge Function già implementata
// Si attiva ogni ora e controlla appuntamenti
async function sendAutomaticReminders() {
  const bookings = await getBookingsNeedingReminders('reminder_24h')
  
  for (const booking of bookings) {
    await sendWhatsAppNotification('reminder_24h', booking)
  }
}
```

### **Configurazione Cron Job:**

Nel dashboard Supabase:
1. **Settings → Cron Jobs**
2. **Aggiungi:** `0 */1 * * *` (ogni ora)
3. **URL:** `https://your-project.supabase.co/functions/v1/send-reminders`

## 💰 **Confronto Costi**

| **Servizio** | **Costo** | **Limiti** | **Qualità** |
|--------------|-----------|------------|-------------|
| **Green API** | 🆓 GRATUITO | 100 msg/giorno | ⭐⭐⭐⭐⭐ |
| **Twilio** | 💰 $1/mese + $0.0049/msg | Illimitato | ⭐⭐⭐⭐⭐ |
| **Link Manuale** | 🆓 GRATUITO | Nessuno | ⭐⭐⭐ |

## 🧪 **Test Completo**

### **Test Invio Automatico:**

1. **Configura Green API** (vedi sopra)
2. **Crea prenotazione di test**
3. **Clicca "Invia Conferma"**
4. **Verifica che WhatsApp arrivi automaticamente**
5. **Controlla log in Supabase**

### **Test Automazioni:**

1. **Crea prenotazione per domani**
2. **Aspetta che il cron job si attivi**
3. **Verifica promemoria automatico**
4. **Controlla stato nel database**

## 🔧 **Personalizzazione Messaggi**

### **Modifica Template WhatsApp:**

In `lib/notifications/notification.service.ts` (righe 270-284):

```javascript
private getWhatsAppMessage(type: NotificationType, data: NotificationData): string {
  const templates = {
    confirmation: `✅ *Prenotazione Confermata*\n\nCiao ${data.clientName}! 👋\n\nTi confermiamo la prenotazione:\n📅 ${data.date}\n⏰ ${data.time}\n💆 ${data.serviceName}\n${data.staffName ? `👤 ${data.staffName}` : ''}\n💰 €${data.price}\n\nTi aspettiamo!\n${data.organizationName}`,
    
    // Personalizza qui i tuoi messaggi
  }
  return templates[type] || ''
}
```

### **Aggiungi Logo/Emoji:**

```javascript
confirmation: `🏪 *${data.organizationName}*\n\n✅ *Prenotazione Confermata*\n\nCiao ${data.clientName}! 👋\n\nTi confermiamo la prenotazione:\n📅 ${data.date}\n⏰ ${data.time}\n💆 ${data.serviceName}\n${data.staffName ? `👤 ${data.staffName}` : ''}\n💰 €${data.price}\n\nTi aspettiamo!\n\n🏪 ${data.organizationName}`
```

## ✅ **Verifica Finale**

Dopo la configurazione dovresti avere:

- ✅ **Invio automatico WhatsApp** funzionante
- ✅ **Messaggi personalizzati** con emoji
- ✅ **Log nel database** per ogni invio
- ✅ **Promemoria automatici** 24h/1h
- ✅ **Gestione errori** e retry

## 🆘 **Troubleshooting**

### **WhatsApp non arriva automaticamente?**
- Verifica credenziali Green API
- Controlla che l'istanza sia connessa
- Verifica log nella console

### **Messaggi duplicati?**
- Il sistema previene duplicati automaticamente
- Controlla tabella `notifications` in Supabase

### **Green API non funziona?**
- Usa Twilio come alternativa
- O mantieni il link manuale

---

**🎉 Con Green API hai un sistema WhatsApp completamente automatico e gratuito!** 