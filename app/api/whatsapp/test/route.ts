import { NextRequest, NextResponse } from 'next/server'
import { ConversationHandler } from '@/lib/ai/conversation-handler'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { message, organizationId, phoneNumber } = await request.json()

    console.log('🧪 Test message received:', { message, organizationId, phoneNumber })

    if (!message || !organizationId || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Parametri mancanti' },
        { status: 400 }
      )
    }

    // Fetch services for the organization to use in fallback
    const supabase = await createClient()
    const { data: services } = await supabase
      .from('services')
      .select('name, category, price, duration_minutes')
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    // Create conversation handler
    const handler = new ConversationHandler(organizationId, `${organizationId}_${phoneNumber}`)

    try {
      // Try to process with real AI
      const response = await handler.processMessage({
        from: phoneNumber,
        text: message,
        type: 'text',
        timestamp: Date.now(),
      })

      return NextResponse.json({
        success: true,
        response: {
          text: response.text,
          quickReplies: response.quickReplies,
        },
      })
    } catch (error: any) {
      console.log('❌ Test endpoint error:', error)
      
      // If OpenAI quota exceeded, use fallback responses
      if (error.status === 429 || error.code === 'insufficient_quota') {
        console.log('🔄 Using fallback responses due to quota limit')
        
        const fallbackResponse = getFallbackResponse(message, services || [])
        
        return NextResponse.json({
          success: true,
          response: {
            text: fallbackResponse,
            quickReplies: ['📅 Prenota appuntamento', '❓ Info servizi', '📋 Le mie prenotazioni'],
          },
          fallback: true,
        })
      }
      
      throw error
    }
  } catch (error: any) {
    console.error('❌ Test endpoint error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Errore interno' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const phoneNumber = searchParams.get('phoneNumber')

    if (!organizationId || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Parametri mancanti' },
        { status: 400 }
      )
    }

    // Load recent messages from database
    const supabase = await createClient()
    const { data: recentMessages } = await supabase
      .from('chat_messages')
      .select('content, is_from_client, created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      recentMessages: recentMessages || [],
    })
  } catch (error: any) {
    console.error('❌ Error loading chat history:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Errore interno' },
      { status: 500 }
    )
  }
}

// Fallback responses when OpenAI quota is exceeded
function getFallbackResponse(message: string, services: any[]): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('ciao') || lowerMessage.includes('buongiorno') || lowerMessage.includes('buonasera')) {
    return 'Ciao! 👋 Sono l\'assistente virtuale del centro estetico. Come posso aiutarti oggi? Posso aiutarti a prenotare un appuntamento, controllare i servizi disponibili o rispondere alle tue domande.'
  }
  
  if (lowerMessage.includes('prenota') || lowerMessage.includes('appuntamento')) {
    return 'Perfetto! Per prenotare un appuntamento ho bisogno di alcune informazioni:\n\n1️⃣ Quale servizio ti interessa?\n2️⃣ In quale data preferisci?\n3️⃣ Hai un orario preferito?\n\nDimmi pure e ti aiuto a trovare il posto migliore! 📅'
  }
  
  if (lowerMessage.includes('servizi') || lowerMessage.includes('cosa fate')) {
    if (services.length > 0) {
      const serviceList = services.map(s => `- ${s.name} (${s.duration_minutes} min, €${s.price})`).join('\\n');
      return `Certamente! Ecco i servizi che offriamo:\\n\\n${serviceList}\\n\\nQuale ti interessa? Posso darti più dettagli.`
    } else {
      return 'Al momento non ho trovato servizi specifici per questo centro. Posso aiutarti in altro modo?'
    }
  }
  
  if (lowerMessage.includes('prezzi') || lowerMessage.includes('costa') || lowerMessage.includes('quanto')) {
    return 'I prezzi variano in base al servizio. Ecco alcuni esempi:\n\n💅 Manicure: €25-35\n💇‍♀️ Taglio: €30-45\n💆‍♀️ Trattamento Viso: €40-60\n💄 Trucco: €35-50\n\nVuoi sapere il prezzo di un servizio specifico?'
  }
  
  if (lowerMessage.includes('orari') || lowerMessage.includes('aperto')) {
    return 'Siamo aperti:\n\n📅 Lunedì - Venerdì: 9:00 - 19:00\n📅 Sabato: 9:00 - 17:00\n📅 Domenica: Chiuso\n\nHai bisogno di un orario specifico?'
  }
  
  if (lowerMessage.includes('dove') || lowerMessage.includes('indirizzo') || lowerMessage.includes('ubicato')) {
    return 'Ci troviamo in Via Roma 123, nel centro della città. Siamo facilmente raggiungibili con i mezzi pubblici e abbiamo un parcheggio gratuito per i clienti. Vuoi che ti dia indicazioni più precise?'
  }
  
  return 'Grazie per il tuo messaggio! Sono qui per aiutarti con prenotazioni, informazioni sui servizi, prezzi e qualsiasi altra domanda sul nostro centro estetico. Cosa ti serve? 😊'
} 