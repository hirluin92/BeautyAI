import { NextRequest, NextResponse } from 'next/server'
import { ConversationHandler } from '../../../../lib/ai/conversation-handler'
import { WhatsAppIntegration } from '../../../../lib/ai/whatsapp-integration'
import { createClient } from '@/lib/supabase/server'

// Verifica del webhook di WhatsApp
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Verifica del token (dovresti impostarlo nelle variabili d'ambiente)
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verificato con successo')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// Gestione dei messaggi in arrivo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Webhook ricevuto:', JSON.stringify(body, null, 2))

    // Verifica che sia un messaggio valido
    if (body.object !== 'whatsapp_business_account') {
      return new NextResponse('OK', { status: 200 })
    }

    // Processa ogni entry
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.value.messages && change.value.messages.length > 0) {
          for (const message of change.value.messages) {
            await processMessage(message, change.value.metadata)
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('❌ Errore nel webhook:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function processMessage(message: {
  from: string
  text?: { body: string }
  timestamp: number
  type: string
}, metadata: {
  phone_number_id: string
}) {
  try {
    console.log('🤖 Processando messaggio:', message)

    // Estrai informazioni del messaggio
    const from = message.from
    const text = message.text?.body || ''
    const timestamp = message.timestamp

    // Ottieni organization_id dal numero di telefono (dovrai implementare questa logica)
    const organizationId = await getOrganizationFromPhone(metadata.phone_number_id)
    
    if (!organizationId) {
      console.error('❌ Organization non trovata per il numero:', metadata.phone_number_id)
      return
    }

    // Crea session ID unico per questa conversazione
    const sessionId = `${organizationId}_${from}`

    // Inizializza il conversation handler
    const conversationHandler = new ConversationHandler(organizationId, sessionId)
    
    // Processa il messaggio
    const response = await conversationHandler.processMessage({
      from,
      text,
      type: 'text',
      timestamp
    })

    // Invia la risposta via WhatsApp
    const whatsappIntegration = new WhatsAppIntegration(
      process.env.WHATSAPP_ACCESS_TOKEN!,
      metadata.phone_number_id
    )

    await whatsappIntegration.sendMessage(from, response)

    console.log('✅ Messaggio processato e risposta inviata')

  } catch (error) {
    console.error('❌ Errore nel processare il messaggio:', error)
  }
}

async function getOrganizationFromPhone(phoneNumberId: string): Promise<string | null> {
  // TODO: Implementa la logica per mappare phone_number_id a organization_id
  // Per ora restituiamo un ID di test
  const supabase = await createClient()
  
  // Cerca l'organizzazione che usa questo numero WhatsApp
  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('whatsapp_phone_number_id', phoneNumberId)
    .single()

  if (error || !data) {
    console.error('❌ Organization non trovata per phone_number_id:', phoneNumberId)
    return null
  }

  return data.id
} 