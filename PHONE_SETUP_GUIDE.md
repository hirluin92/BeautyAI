# 📱 Configurazione Telefono Aziendale

## 🎯 **Configurazione Raccomandata (GRATUITO)**

### **Passo 1: WhatsApp Business App**

1. **Scarica WhatsApp Business**
   - Android: [Google Play](https://play.google.com/store/apps/details?id=com.whatsapp.w4b)
   - iPhone: [App Store](https://apps.apple.com/app/whatsapp-business/id1386431840)

2. **Registra il numero aziendale**
   - Usa il numero: `+39 123 456 789` (il tuo)
   - Conferma con SMS/codice

3. **Configura profilo business**
   - Logo aziendale
   - Nome business
   - Descrizione servizi
   - Orari di apertura
   - Indirizzo

4. **Aggiorna .env.local**
```env
NEXT_PUBLIC_ORGANIZATION_PHONE=+39123456789
```

### **Passo 2: Test WhatsApp Manuale**

Il sistema già supporta invio manuale:
1. Vai su una prenotazione
2. Clicca "Gestione Notifiche"
3. Clicca "Invia WhatsApp"
4. Si apre WhatsApp con messaggio già pronto
5. Premi invio

## 🚀 **Configurazione Avanzata (OPZIONALE)**

### **Opzione A: Green API (GRATUITO)**

1. **Crea account Green API**
   - Vai su [https://green-api.com/](https://green-api.com/)
   - Registrati gratuitamente

2. **Crea istanza WhatsApp**
   - Clicca "Create Instance"
   - Nome: "Beauty Salon"
   - Tipo: WhatsApp

3. **Connetti il telefono**
   - Scansiona QR code con WhatsApp Business
   - Usa il numero aziendale

4. **Ottieni credenziali**
   - Instance ID (es: `123456789`)
   - API Token (es: `abc123def456`)

5. **Aggiorna .env.local**
```env
GREEN_API_INSTANCE_ID=123456789
GREEN_API_TOKEN=abc123def456
```

### **Opzione B: Twilio WhatsApp (A PAGAMENTO)**

1. **Crea account Twilio**
   - Vai su [https://www.twilio.com/](https://www.twilio.com/)
   - Registrati (crediti gratuiti)

2. **Acquista numero WhatsApp**
   - Dashboard → Phone Numbers
   - Acquista numero con WhatsApp
   - Prezzo: ~$1/mese + $0.0049/messaggio

3. **Configura WhatsApp Business**
   - Verifica business profile
   - Configura messaggi automatici

4. **Aggiorna .env.local**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+39xxxxxxxxx
```

## 📞 **Configurazione SMS**

### **Opzione A: Twilio SMS**

1. **Usa stesso account Twilio**
2. **Acquista numero SMS** (può essere diverso)
3. **Configura .env.local**
```env
NEXT_PUBLIC_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_TWILIO_AUTH_TOKEN=your_auth_token
NEXT_PUBLIC_TWILIO_SMS_NUMBER=+39xxxxxxxxx
```

### **Opzione B: Provider Italiani**

#### **Aruba SMS**
```env
ARUBA_SMS_USERNAME=your_username
ARUBA_SMS_PASSWORD=your_password
ARUBA_SMS_SENDER=BeautySalon
```

#### **Fastweb SMS**
```env
FASTWEB_SMS_API_KEY=your_api_key
FASTWEB_SMS_SENDER=BeautySalon
```

## 🧪 **Test Configurazione**

### **Test WhatsApp**
1. Riavvia server: `npm run dev`
2. Vai su prenotazione
3. Clicca "Gestione Notifiche"
4. Prova "Invia WhatsApp"
5. Verifica che si apra WhatsApp con messaggio

### **Test SMS (se configurato)**
1. Clicca "Invia Conferma"
2. Verifica che SMS arrivi
3. Controlla log in Supabase

### **Test Automazioni**
1. Configura Edge Functions
2. Testa promemoria automatici
3. Verifica invio automatico

## 💰 **Costi Stimati**

### **Configurazione Gratuita**
- ✅ WhatsApp Business App: **GRATUITO**
- ✅ Green API: **GRATUITO** (fino a 100 messaggi/giorno)
- ✅ EmailJS: **GRATUITO** (200 email/mese)

### **Configurazione Professionale**
- 📱 Twilio WhatsApp: ~$1/mese + $0.0049/messaggio
- 📞 Twilio SMS: ~$1/mese + $0.07/messaggio
- 📧 EmailJS Pro: $15/mese (1000 email)

## 🎯 **Raccomandazione Finale**

### **Per Iniziare (GRATUITO):**
1. ✅ WhatsApp Business App con numero aziendale
2. ✅ EmailJS per email
3. ✅ Link manuale per WhatsApp

### **Per Produzione:**
1. ✅ Green API per WhatsApp automatico
2. ✅ Twilio per SMS
3. ✅ Automazioni Supabase

## 🔧 **Configurazione Rapida**

Crea `.env.local` con:

```env
# Email (GRATUITO)
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=TSr0DRGZrbEp2oS1d
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_wfdhb7c
NEXT_PUBLIC_EMAILJS_UNIVERSAL_TEMPLATE_ID=template_u61en7s

# Telefono Aziendale
NEXT_PUBLIC_ORGANIZATION_PHONE=+39123456789
NEXT_PUBLIC_ORGANIZATION_NAME=Beauty Salon

# WhatsApp (OPZIONALE)
GREEN_API_INSTANCE_ID=your_instance_id
GREEN_API_TOKEN=your_api_token
```

**🎉 Con questa configurazione hai un sistema completo e professionale!** 