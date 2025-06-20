import { AIResponse } from './types'

export class WhatsAppIntegration {
  private accessToken: string
  private phoneNumberId: string

  constructor(accessToken: string, phoneNumberId: string) {
    this.accessToken = accessToken
    this.phoneNumberId = phoneNumberId
  }

  async sendMessage(to: string, message: AIResponse): Promise<void> {
    const payload = this.buildMessagePayload(to, message)
    
    console.log('📤 Sending WhatsApp message:', JSON.stringify(payload, null, 2))
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ WhatsApp API error:', response.status, errorText)
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('✅ WhatsApp message sent successfully:', result)
  }

  private buildMessagePayload(to: string, message: AIResponse): any {
    const basePayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
    }

    // Se ci sono bottoni, usa il formato interactive
    if (message.buttons && message.buttons.length > 0) {
      return {
        ...basePayload,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: message.text },
          action: {
            buttons: message.buttons.map(btn => ({
              type: 'reply',
              reply: {
                id: btn.id,
                title: btn.title,
              },
            })),
          },
        },
      }
    }

    // Se ci sono quick replies, aggiungili al testo
    if (message.quickReplies && message.quickReplies.length > 0) {
      const textWithReplies = message.text + '\n\n' + message.quickReplies.join('\n')
      return {
        ...basePayload,
        type: 'text',
        text: {
          body: textWithReplies,
        },
      }
    }

    // Messaggio di testo semplice
    return {
      ...basePayload,
      type: 'text',
      text: { body: message.text },
    }
  }

  // Metodo per inviare un messaggio di benvenuto
  async sendWelcomeMessage(to: string, organizationName: string): Promise<void> {
    const welcomeMessage: AIResponse = {
      text: `Ciao! 👋 Sono l'assistente virtuale di ${organizationName}.
Come posso aiutarti oggi?`,
      quickReplies: [
        '📅 Prenota appuntamento',
        '❓ Info servizi',
        '📋 Le mie prenotazioni',
        '📞 Contatti',
      ],
    }

    await this.sendMessage(to, welcomeMessage)
  }

  // Metodo per inviare un messaggio di errore
  async sendErrorMessage(to: string, errorMessage: string): Promise<void> {
    const errorResponse: AIResponse = {
      text: `❌ Si è verificato un errore: ${errorMessage}\n\nPer favore riprova o contattaci direttamente.`,
    }

    await this.sendMessage(to, errorResponse)
  }

  // Metodo per inviare conferma prenotazione
  async sendBookingConfirmation(
    to: string, 
    bookingData: {
      date: string
      time: string
      service: string
      price: number
    }
  ): Promise<void> {
    const confirmationMessage: AIResponse = {
      text: `✅ Prenotazione confermata!

📅 Data: ${bookingData.date}
⏰ Ora: ${bookingData.time}
💆 Servizio: ${bookingData.service}
💰 Prezzo: €${bookingData.price}

Ti invieremo un promemoria 24 ore prima dell'appuntamento.
Per cancellare o modificare, scrivi qui in qualsiasi momento.`,
      buttons: [
        { id: 'cancel_booking', title: '❌ Cancella' },
        { id: 'modify_booking', title: '✏️ Modifica' },
      ],
    }

    await this.sendMessage(to, confirmationMessage)
  }
} 