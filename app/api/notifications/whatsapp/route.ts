// app/api/notifications/whatsapp/route.ts
// API route per inviare WhatsApp con Twilio (opzionale)

import { NextResponse } from 'next/server'
import twilio from 'twilio'

// Inizializza Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export async function POST(request: Request) {
  // Se non hai configurato Twilio, usa il metodo manuale
  if (!client) {
    return NextResponse.json({
      success: false,
      error: 'Twilio non configurato - usa il metodo manuale'
    })
  }

  try {
    const { to, message } = await request.json()

    // Formatta numero per WhatsApp
    const formattedTo = to.startsWith('whatsapp:') 
      ? to 
      : `whatsapp:+${to.replace(/[^\d]/g, '')}`

    // Invia messaggio
    const twilioMessage = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: formattedTo,
      body: message
    })

    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
      status: twilioMessage.status
    })

  } catch (error: any) {
    console.error('Twilio WhatsApp error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Errore invio WhatsApp'
    }, { status: 500 })
  }
}