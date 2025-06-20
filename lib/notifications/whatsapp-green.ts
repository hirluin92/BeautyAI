// lib/notifications/whatsapp-green.ts
// Green API - WhatsApp gratuito per piccoli volumi

interface WhatsAppMessage {
  phone: string
  message: string
}

// Configurazione Green API (alternativa gratuita)
const GREEN_API_URL = 'https://api.green-api.com'
const INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID
const API_TOKEN = process.env.GREEN_API_TOKEN

export async function sendWhatsAppMessage({ phone, message }: WhatsAppMessage) {
  try {
    // Formatta numero (rimuovi + e aggiungi @c.us)
    const formattedPhone = phone.replace(/\D/g, '') + '@c.us'
    
    const response = await fetch(
      `${GREEN_API_URL}/waInstance${INSTANCE_ID}/sendMessage/${API_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: formattedPhone,
          message: message
        })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message')
    }

    return { success: true }
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return { success: false, error }
  }
}

// Template messaggi WhatsApp
export function formatWhatsAppReminder(booking: any): string {
  return `🔔 *Promemoria Appuntamento*

Ciao ${booking.clientName}! 

Ti ricordiamo il tuo appuntamento:
📅 *Data:* ${booking.date}
🕐 *Orario:* ${booking.time}
💇 *Servizio:* ${booking.serviceName}
⏱️ *Durata:* ${booking.duration} minuti

Ti aspettiamo!

_Per modifiche o cancellazioni, rispondi a questo messaggio._`
}

export function formatWhatsAppConfirmation(booking: any): string {
  return `✅ *Prenotazione Confermata*

Gentile ${booking.clientName},

La tua prenotazione è stata confermata:
📅 ${booking.date}
🕐 ${booking.time}
💇 ${booking.serviceName}

A presto! 😊`
}

// Alternativa 2: Usar WhatsApp Web JS (gratuito, self-hosted)
// Richiede un server Node.js separato

/*
// server-whatsapp.js (server separato)
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
});

app.post('/send-message', async (req, res) => {
  const { phone, message } = req.body;
  
  try {
    await client.sendMessage(phone + '@c.us', message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

client.initialize();
app.listen(3001);
*/