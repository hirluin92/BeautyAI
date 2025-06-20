# 🚀 Configurazione Twilio WhatsApp - Passo per Passo

## 🎯 **Obiettivo: Reminder Automatici WhatsApp**

### **Cosa otterrai:**
- ✅ **Promemoria 24h** automatici
- ✅ **Promemoria 1h** automatici
- ✅ **Costi:** €2.90/mese
- ✅ **Zero lavoro manuale**

## 📋 **Passo 1: Crea Account Twilio**

### **1.1 Vai su Twilio**
1. **Apri browser** e vai su [https://www.twilio.com/](https://www.twilio.com/)
2. **Clicca "Sign up for free"** (in alto a destra)
3. **Inserisci email** e password
4. **Clicca "Create Account"**

### **1.2 Verifica Account**
1. **Controlla email** per conferma
2. **Clicca link** di conferma
3. **Verifica telefono** (SMS con codice)
4. **Ottieni $15 crediti gratuiti** 🎉

### **1.3 Dashboard Twilio**
- **Account SID:** Copia (inizia con "AC...")
- **Auth Token:** Copia (è nascosto, clicca "show")
- **Salva questi valori** - ti serviranno dopo

## 📱 **Passo 2: Attiva WhatsApp Business**

### **2.1 Vai su Messaging**
1. **Nel dashboard Twilio** (menu laterale)
2. **Clicca "Messaging"**
3. **Clicca "Try WhatsApp"**

### **2.2 Configura WhatsApp**
1. **Clicca "Get Started"**
2. **Accetta i termini** WhatsApp Business
3. **Inserisci nome business:** "Beauty Salon"
4. **Inserisci categoria:** "Beauty & Personal Care"
5. **Clicca "Continue"**

### **2.3 Verifica Business**
1. **Inserisci indirizzo** del tuo salone
2. **Carica logo** (opzionale)
3. **Inserisci descrizione** servizi
4. **Clicca "Submit for Review"**

## 📞 **Passo 3: Acquista Numero WhatsApp**

### **3.1 Vai su Phone Numbers**
1. **Menu laterale** → "Phone Numbers"
2. **Clicca "Buy a number"**
3. **Seleziona paese:** Italy
4. **Cerca numero** con WhatsApp

### **3.2 Acquista Numero**
1. **Scegli numero** disponibile
2. **Clicca "Buy"**
3. **Costo:** ~$1/mese
4. **Conferma acquisto**

### **3.3 Configura Numero**
1. **Copia numero** acquistato
2. **Salvalo** - ti servirà per .env.local

## 🔧 **Passo 4: Configura .env.local**

### **4.1 Crea File .env.local**
1. **Nella root** del progetto
2. **Crea file** `.env.local`
3. **Inserisci questo contenuto:**

```env
# ========================================
# BEAUTY AI - TWILIO WHATSAPP
# ========================================

# Telefono aziendale
NEXT_PUBLIC_ORGANIZATION_PHONE=+39123456789
NEXT_PUBLIC_ORGANIZATION_NAME=Beauty Salon

# Twilio WhatsApp (SOSTITUISCI CON I TUOI VALORI)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+39xxxxxxxxx

# ========================================
# CONFIGURAZIONE SUPABASE (se non già fatto)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### **4.2 Sostituisci i Valori**
1. **TWILIO_ACCOUNT_SID:** Il tuo Account SID (AC...)
2. **TWILIO_AUTH_TOKEN:** Il tuo Auth Token
3. **TWILIO_WHATSAPP_NUMBER:** Il numero acquistato
4. **NEXT_PUBLIC_ORGANIZATION_PHONE:** Il tuo telefono aziendale

## 🧪 **Passo 5: Testa Configurazione**

### **5.1 Riavvia Server**
```bash
# Ferma server (Ctrl+C)
# Poi riavvia
npm run dev
```

### **5.2 Testa Invio Manuale**
1. **Vai su una prenotazione** esistente
2. **Clicca "Gestione Notifiche"**
3. **Clicca "Promemoria 24h"**
4. **Verifica che WhatsApp arrivi**

### **5.3 Controlla Log**
1. **Apri DevTools** (F12)
2. **Vai su Console**
3. **Cerca errori** o messaggi di successo

## 🤖 **Passo 6: Attiva Automazioni**

### **6.1 Configura Edge Functions**
```bash
# Installa Supabase CLI (se non già fatto)
npm install -g supabase

# Login Supabase
supabase login

# Link al progetto
supabase link --project-ref your-project-ref

# Deploy Edge Functions
supabase functions deploy send-reminders
```

### **6.2 Configura Cron Job**
1. **Dashboard Supabase** → Settings
2. **Cron Jobs** → Add New
3. **Schedule:** `0 */1 * * *` (ogni ora)
4. **URL:** `https://your-project.supabase.co/functions/v1/send-reminders`

### **6.3 Variabili d'Ambiente Supabase**
1. **Dashboard Supabase** → Settings → Edge Functions
2. **Aggiungi variabili:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+39xxxxxxxxx
```

## 📱 **Passo 7: Testa Automazioni**

### **7.1 Crea Prenotazione di Test**
1. **Crea prenotazione** per domani
2. **Aspetta 1 ora** (cron job)
3. **Verifica promemoria 24h** automatico

### **7.2 Crea Prenotazione 1h**
1. **Crea prenotazione** per tra 2 ore
2. **Aspetta 1 ora**
3. **Verifica promemoria 1h** automatico

### **7.3 Controlla Database**
```sql
-- In Supabase SQL Editor
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🎯 **Passo 8: Personalizzazione (Opzionale)**

### **8.1 Modifica Messaggi**
In `lib/notifications/notification.service.ts`:

```javascript
private getWhatsAppMessage(type: NotificationType, data: NotificationData): string {
  const templates = {
    reminder_24h: `⏰ *Promemoria Appuntamento*\n\nCiao ${data.clientName}!\n\nTi ricordiamo l'appuntamento di domani:\n📅 ${data.date}\n🕐 ${data.time}\n💇 ${data.serviceName}\n\nA domani! 😊\n${data.organizationName}`,
    
    reminder_1h: `🔔 *Tra 1 ora!*\n\nCiao ${data.clientName}!\n\nTra poco ti aspettiamo per:\n🕐 ${data.time}\n💇 ${data.serviceName}\n\nA presto! 🎉\n${data.organizationName}`
  }
  return templates[type] || ''
}
```

### **8.2 Aggiungi Logo/Emoji**
```javascript
reminder_24h: `🏪 *${data.organizationName}*\n\n⏰ *Promemoria Appuntamento*\n\nCiao ${data.clientName}!\n\nTi ricordiamo l'appuntamento di domani:\n📅 ${data.date}\n🕐 ${data.time}\n💇 ${data.serviceName}\n\nA domani! 😊\n\n🏪 ${data.organizationName}`
```

## ✅ **Verifica Finale**

### **Checklist Completamento:**
- ✅ **Account Twilio** creato
- ✅ **WhatsApp Business** attivato
- ✅ **Numero acquistato** e configurato
- ✅ **.env.local** configurato
- ✅ **Test manuale** funziona
- ✅ **Edge Functions** deployate
- ✅ **Cron job** configurato
- ✅ **Test automatico** funziona

## 🎉 **Risultato Finale**

### **Cosa hai ottenuto:**
- 🤖 **Reminder automatici** 24h e 1h
- 💰 **Costi:** €2.90/mese
- ⚡ **Zero lavoro manuale**
- 📱 **Clienti felici** con WhatsApp
- 📊 **Log completi** nel database

### **ROI:**
- **Benefici:** €340/mese
- **Costi:** €2.90/mese
- **ROI:** +€337.10/mese

## 🆘 **Troubleshooting**

### **WhatsApp non arriva?**
1. **Verifica credenziali** Twilio
2. **Controlla numero** WhatsApp
3. **Verifica log** console browser
4. **Controlla database** notifications

### **Automazioni non funzionano?**
1. **Verifica Edge Functions** deployate
2. **Controlla cron job** configurato
3. **Verifica variabili** d'ambiente Supabase
4. **Controlla log** Edge Functions

### **Errori di configurazione?**
1. **Riavvia server** dopo .env.local
2. **Verifica sintassi** .env.local
3. **Controlla spazi** e caratteri speciali
4. **Verifica che file** sia nella root

---

**🎉 Congratulazioni! Hai un sistema WhatsApp automatico professionale!** 