import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { SYSTEM_PROMPTS, MESSAGE_TEMPLATES } from './constants'
import { ConversationContext, WhatsAppMessage, AIResponse, FunctionResponse } from './types'

export class ConversationHandler {
  private organizationId: string
  private sessionId: string
  private context: ConversationContext
  private openai: OpenAI

  constructor(organizationId: string, sessionId: string) {
    this.organizationId = organizationId
    this.sessionId = sessionId
    this.context = {
      state: 'idle',
      bookingData: {},
      messageHistory: [],
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async processMessage(message: WhatsAppMessage): Promise<AIResponse> {
    try {
      console.log('🤖 Processing message:', message.text)

      // SPAM PROTECTION - Controlli di sicurezza
      const spamCheck = await this.checkForSpam(message)
      if (spamCheck.isSpam) {
        console.log('🚫 Spam detected, ignoring message')
        return {
          text: spamCheck.response || 'Messaggio non riconosciuto.',
          quickReplies: [],
          buttons: undefined,
        }
      }

      // RATE LIMITING - Limita risposte per numero
      const rateLimitCheck = await this.checkRateLimit(message.from)
      if (rateLimitCheck.isLimited) {
        console.log('⏰ Rate limit exceeded, sending wait message')
        return {
          text: rateLimitCheck.response || 'Troppi messaggi inviati.',
          quickReplies: [],
          buttons: undefined,
        }
      }

      // BUSINESS HOURS CHECK - Controlla orari di apertura
      const businessHoursCheck = await this.checkBusinessHours()
      if (!businessHoursCheck.isOpen) {
        console.log('🏪 Outside business hours, sending auto-reply')
        return {
          text: businessHoursCheck.response || 'Siamo chiusi.',
          quickReplies: [],
          buttons: undefined,
        }
      }

      // CONVERSATION CONTEXT - Mantieni contesto conversazione
      await this.updateConversationContext(message)

      // AI PROCESSING - Processa con OpenAI
      const aiResponse = await this.generateAIResponse(message)

      // LOG CONVERSATION - Registra conversazione
      await this.logConversation(message, aiResponse.text)

      return aiResponse

    } catch (error) {
      console.error('❌ Error processing message:', error)
      return this.getFallbackResponse()
    }
  }

  // SPAM PROTECTION
  private async checkForSpam(message: WhatsAppMessage): Promise<{ isSpam: boolean; response?: string }> {
    const supabase = await createClient()
    
    // 1. CONTROLLO WHITELIST - Amici e clienti esistenti
    const isWhitelisted = await this.checkWhitelist(message.from)
    if (isWhitelisted) {
      console.log('✅ Whitelisted contact, bypassing spam checks')
      return { isSpam: false }
    }

    // 2. CONTROLLO CLIENTE ESISTENTE - Se è già un cliente
    const isExistingClient = await this.checkExistingClient(message.from)
    if (isExistingClient) {
      console.log('✅ Existing client, bypassing spam checks')
      return { isSpam: false }
    }

    // 3. CONTROLLO MESSAGGI RECENTI - Solo per nuovi contatti
    const recentMessages = await supabase
      .from('conversation_logs')
      .select('created_at')
      .eq('organization_id', this.organizationId)
      .eq('from_number', message.from)
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Ultimi 5 minuti
      .limit(10)

    if (recentMessages.data && recentMessages.data.length >= 10) {
      return {
        isSpam: true,
        response: 'Mi dispiace, stai inviando troppi messaggi. Riprova tra qualche minuto.'
      }
    }

    // 4. CONTROLLO PAROLE CHIAVE SPAM - Solo per nuovi contatti
    const spamKeywords = ['spam', 'lottery', 'winner', 'prize', 'urgent', 'limited time', 'free money', 'crypto', 'investment']
    const messageLower = (message.text || '').toLowerCase()
    
    if (spamKeywords.some(keyword => messageLower.includes(keyword))) {
      return {
        isSpam: true,
        response: 'Messaggio non riconosciuto. Per assistenza, contattaci durante gli orari di apertura.'
      }
    }

    // 5. CONTROLLO LUNGHEZZA MESSAGGIO - Solo per nuovi contatti
    if ((message.text || '').length > 500) {
      return {
        isSpam: true,
        response: 'Il messaggio è troppo lungo. Invia un messaggio più breve.'
      }
    }

    return { isSpam: false }
  }

  // WHITELIST CHECK - Amici e contatti fidati
  private async checkWhitelist(fromNumber: string): Promise<boolean> {
    const supabase = await createClient()
    
    const { data: whitelist } = await supabase
      .from('whatsapp_whitelist')
      .select('*')
      .eq('organization_id', this.organizationId)
      .eq('phone_number', fromNumber)
      .eq('is_active', true)
      .single()

    return !!whitelist
  }

  // EXISTING CLIENT CHECK - Clienti già nel database
  private async checkExistingClient(fromNumber: string): Promise<boolean> {
    const supabase = await createClient()
    
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('organization_id', this.organizationId)
      .or(`phone.eq.${fromNumber},whatsapp_phone.eq.${fromNumber}`)
      .single()

    return !!client
  }

  // RATE LIMITING - Più permissivo per clienti esistenti
  private async checkRateLimit(fromNumber: string): Promise<{ isLimited: boolean; response?: string }> {
    const supabase = await createClient()
    
    // Controlla se è cliente esistente o whitelist
    const isExistingClient = await this.checkExistingClient(fromNumber)
    const isWhitelisted = await this.checkWhitelist(fromNumber)
    
    // Limiti diversi per clienti esistenti vs nuovi
    const maxMessages = isExistingClient || isWhitelisted ? 50 : 20 // Più permissivo per clienti
    const timeWindow = isExistingClient || isWhitelisted ? 30 : 10 // Minuti

    const recentMessages = await supabase
      .from('conversation_logs')
      .select('created_at')
      .eq('organization_id', this.organizationId)
      .eq('from_number', fromNumber)
      .gte('created_at', new Date(Date.now() - timeWindow * 60 * 1000).toISOString())
      .limit(maxMessages)

    if (recentMessages.data && recentMessages.data.length >= maxMessages) {
      const message = isExistingClient || isWhitelisted 
        ? 'Hai inviato molti messaggi. Ti risponderemo al più presto.'
        : 'Hai inviato troppi messaggi. Riprova tra 10 minuti o contattaci telefonicamente.'
      
      return {
        isLimited: true,
        response: message
      }
    }

    return { isLimited: false }
  }

  // BUSINESS HOURS CHECK
  private async checkBusinessHours(): Promise<{ isOpen: boolean; response?: string }> {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay() // 0 = Domenica, 1 = Lunedì, etc.

    // Orari di apertura (personalizzabili)
    const businessHours = {
      1: { start: 9, end: 19 }, // Lunedì
      2: { start: 9, end: 19 }, // Martedì
      3: { start: 9, end: 19 }, // Mercoledì
      4: { start: 9, end: 19 }, // Giovedì
      5: { start: 9, end: 19 }, // Venerdì
      6: { start: 9, end: 17 }, // Sabato
      0: { start: 0, end: 0 }   // Domenica (chiuso)
    }

    const todayHours = businessHours[day as keyof typeof businessHours]
    
    if (day === 0) { // Domenica
      return {
        isOpen: false,
        response: 'Siamo chiusi la domenica. Ti risponderemo lunedì dalle 9:00 alle 19:00. Per urgenze, lascia un messaggio e ti richiameremo.'
      }
    }

    if (hour < todayHours.start || hour >= todayHours.end) {
      return {
        isOpen: false,
        response: `Siamo chiusi. Orari di apertura: ${todayHours.start}:00 - ${todayHours.end}:00. Ti risponderemo al più presto.`
      }
    }

    return { isOpen: true }
  }

  // CONVERSATION CONTEXT
  private async updateConversationContext(message: WhatsAppMessage): Promise<void> {
    const supabase = await createClient()
    
    // Aggiorna o crea contesto conversazione
    await supabase
      .from('conversation_contexts')
      .upsert({
        organization_id: this.organizationId,
        session_id: this.sessionId,
        from_number: message.from,
        last_message: message.text,
        last_activity: new Date().toISOString(),
        message_count: supabase.rpc('increment_message_count', { session_id: this.sessionId })
      })
  }

  // LOG CONVERSATION
  private async logConversation(message: WhatsAppMessage, response: string): Promise<void> {
    const supabase = await createClient()
    
    await supabase
      .from('conversation_logs')
      .insert({
        organization_id: this.organizationId,
        session_id: this.sessionId,
        from_number: message.from,
        message_text: message.text,
        response_text: response,
        created_at: new Date().toISOString()
      })
  }

  // FALLBACK RESPONSE
  private getFallbackResponse(): AIResponse {
    return {
      text: 'Mi dispiace, c\'è stato un problema tecnico. Riprova tra qualche minuto o contattaci telefonicamente.',
      quickReplies: [],
      buttons: undefined,
    }
  }

  // GENERATE AI RESPONSE - Metodo esistente che chiama OpenAI
  private async generateAIResponse(message: WhatsAppMessage): Promise<AIResponse> {
    // Usa il metodo esistente per generare la risposta AI
    return await this.processMessageWithAI(message)
  }

  private async processMessageWithAI(message: WhatsAppMessage): Promise<AIResponse> {
    // Add message to history
    this.context.messageHistory.push({
      role: 'user',
      content: message.text || '',
      timestamp: new Date(),
    })

    // Load context from database if exists
    await this.loadContext()

    // Prepare OpenAI request
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: await this.buildSystemPrompt(),
        },
        ...this.buildMessageHistory(),
        {
          role: 'user',
          content: message.text || '',
        },
      ],
      functions: [
        {
          name: 'check_availability',
          description: 'Controlla la disponibilità per un servizio in una data specifica',
          parameters: {
            type: 'object',
            properties: {
              service_id: {
                type: 'string',
                description: 'ID del servizio richiesto',
              },
              date: {
                type: 'string',
                description: 'Data richiesta (YYYY-MM-DD)',
              },
              preferred_time: {
                type: 'string',
                description: 'Orario preferito (opzionale)',
              },
            },
            required: ['service_id', 'date'],
          },
        },
        {
          name: 'book_appointment',
          description: 'Prenota un appuntamento per un cliente',
          parameters: {
            type: 'object',
            properties: {
              client_phone: {
                type: 'string',
                description: 'Numero di telefono del cliente',
              },
              service_id: {
                type: 'string',
                description: 'ID del servizio da prenotare',
              },
              datetime: {
                type: 'string',
                description: 'Data e ora dell\'appuntamento (ISO string)',
              },
              notes: {
                type: 'string',
                description: 'Note aggiuntive (opzionale)',
              },
            },
            required: ['client_phone', 'service_id', 'datetime'],
          },
        },
        {
          name: 'cancel_appointment',
          description: 'Cancella una prenotazione esistente',
          parameters: {
            type: 'object',
            properties: {
              booking_id: {
                type: 'string',
                description: 'ID della prenotazione da cancellare',
              },
              reason: {
                type: 'string',
                description: 'Motivo della cancellazione (opzionale)',
              },
            },
            required: ['booking_id'],
          },
        },
        {
          name: 'get_client_bookings',
          description: 'Recupera le prenotazioni di un cliente',
          parameters: {
            type: 'object',
            properties: {
              client_phone: {
                type: 'string',
                description: 'Numero di telefono del cliente',
              },
              status: {
                type: 'string',
                enum: ['upcoming', 'past', 'all'],
                description: 'Filtro per stato delle prenotazioni',
              },
            },
            required: ['client_phone'],
          },
        },
        {
          name: 'get_services',
          description: 'Recupera la lista dei servizi disponibili',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Categoria di servizi (opzionale)',
              },
            },
          },
        },
        {
          name: 'get_service_info',
          description: 'Recupera informazioni dettagliate su un servizio specifico',
          parameters: {
            type: 'object',
            properties: {
              service_id: {
                type: 'string',
                description: 'ID del servizio',
              },
            },
            required: ['service_id'],
          },
        },
        {
          name: 'collect_feedback',
          description: 'Raccoglie feedback da un cliente su un servizio o esperienza',
          parameters: {
            type: 'object',
            properties: {
              client_phone: {
                type: 'string',
                description: 'Numero di telefono del cliente',
              },
              service_id: {
                type: 'string',
                description: 'ID del servizio (opzionale)',
              },
              booking_id: {
                type: 'string',
                description: 'ID della prenotazione (opzionale)',
              },
              rating: {
                type: 'number',
                description: 'Valutazione da 1 a 5 stelle',
              },
              comment: {
                type: 'string',
                description: 'Commento del cliente',
              },
              category: {
                type: 'string',
                enum: ['service', 'staff', 'facility', 'overall'],
                description: 'Categoria del feedback',
              },
            },
            required: ['client_phone', 'rating'],
          },
        },
      ],
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 500,
    })

    // Handle function calls
    if (completion.choices[0].message.function_call) {
      const functionResponse = await this.executeFunctionCall(
        completion.choices[0].message.function_call
      )
      
      // Get final response after function execution
      const finalCompletion = await this.getFinalResponse(
        completion.choices[0].message,
        functionResponse
      )
      
      const response = this.formatResponse(finalCompletion)
      
      // Save context to database
      await this.saveContext()
      
      return response
    }

    // Return direct response
    const response = this.formatResponse(completion.choices[0].message.content || '')
    
    // Save context to database
    await this.saveContext()
    
    return response
  }

  private async executeFunctionCall(functionCall: any): Promise<FunctionResponse> {
    const { name, arguments: args } = functionCall
    const parsedArgs = JSON.parse(args)

    console.log('🔧 Executing function:', name, 'with args:', parsedArgs)

    try {
      switch (name) {
        case 'check_availability':
          return await this.checkAvailability(parsedArgs)
        case 'book_appointment':
          return await this.bookAppointment(parsedArgs)
        case 'cancel_appointment':
          return await this.cancelAppointment(parsedArgs)
        case 'get_client_bookings':
          return await this.getClientBookings(parsedArgs)
        case 'get_services':
          return await this.getServices(parsedArgs)
        case 'get_service_info':
          return await this.getServiceInfo(parsedArgs)
        case 'collect_feedback':
          return await this.collectFeedback(parsedArgs)
        default:
          throw new Error(`Unknown function: ${name}`)
      }
    } catch (error) {
      console.error('❌ Function execution error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async getFinalResponse(
    functionMessage: any,
    functionResponse: FunctionResponse
  ): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: await this.buildSystemPrompt(),
        },
        ...this.buildMessageHistory(),
        functionMessage,
        {
          role: 'function',
          name: functionMessage.function_call.name,
          content: JSON.stringify(functionResponse),
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return completion.choices[0].message.content || ''
  }

  private formatResponse(content: string): AIResponse {
    // Check if we need quick replies or buttons
    const quickReplies = this.getQuickReplies()
    
    return {
      text: content,
      quickReplies,
      buttons: this.context.state === 'confirming_booking' ? [
        { id: 'confirm', title: 'Conferma ✅' },
        { id: 'cancel', title: 'Annulla ❌' },
      ] : undefined,
    }
  }

  private getQuickReplies(): string[] {
    return [
      '📅 Prenota appuntamento',
      '❓ Info servizi',
      '📋 Le mie prenotazioni',
      '🕐 Orari di apertura',
      '📍 Dove siete?',
      '💰 Prezzi servizi'
    ]
  }

  private async buildSystemPrompt(): Promise<string> {
    const supabase = await createClient()
    
    // Get organization info
    const { data: organization } = await supabase
      .from('organizations')
      .select('name, address, working_hours')
      .eq('id', this.organizationId)
      .single()

    // Get services
    const { data: services } = await supabase
      .from('services')
      .select('name, category')
      .eq('organization_id', this.organizationId)
      .eq('is_active', true)

    const servicesList = services?.map(s => `${s.name} (${s.category})`).join(', ') || 'Nessun servizio disponibile'

    const workingHoursText = typeof organization?.working_hours === 'string' ? organization.working_hours : JSON.stringify(organization?.working_hours) || 'Orari non disponibili'

    return SYSTEM_PROMPTS.assistant
      .replace('{organizationName}', organization?.name || 'Centro Estetico')
      .replace('{address}', organization?.address || 'Indirizzo non disponibile')
      .replace('{workingHours}', workingHoursText)
      .replace('{services}', servicesList)
  }

  private buildMessageHistory() {
    return this.context.messageHistory.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content,
    }))
  }

  private async loadContext() {
    const supabase = await createClient()
    
    // Load chat session from database
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('context, client_id')
      .eq('organization_id', this.organizationId)
      .eq('whatsapp_phone', this.sessionId.split('_')[1])
      .eq('is_active', true)
      .single()

    if (session && session.context) {
      // Type assertion for context
      const contextData = session.context as any
      this.context = {
        ...this.context,
        ...contextData,
        bookingData: contextData?.bookingData || {},
      }
    }
  }

  private async saveContext() {
    const supabase = await createClient()
    
    // Get or create chat session
    const whatsappPhone = this.sessionId.split('_')[1]
    
    let { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('organization_id', this.organizationId)
      .eq('whatsapp_phone', whatsappPhone)
      .eq('is_active', true)
      .maybeSingle()

    if (!session) {
      // Create new session
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({
          organization_id: this.organizationId,
          whatsapp_phone: whatsappPhone,
          context: this.context as any, // Type assertion for JSON
        })
        .select('id')
        .single()
      
      session = newSession
    } else {
      // Update existing session
      await supabase
        .from('chat_sessions')
        .update({
          context: this.context as any, // Type assertion for JSON
          last_message_at: new Date().toISOString(),
        })
        .eq('id', session.id)
    }

    // Save message to chat_messages
    if (this.context.messageHistory.length > 0) {
      const lastMessage = this.context.messageHistory[this.context.messageHistory.length - 1]
      
      await supabase
        .from('chat_messages')
        .insert({
          session_id: session!.id,
          organization_id: this.organizationId,
          message_type: 'text',
          content: lastMessage.content,
          is_from_client: lastMessage.role === 'user',
        })
    }
  }

  // Function implementations
  private async checkAvailability(args: any): Promise<FunctionResponse> {
    const supabase = await createClient()
    
    try {
      const { service_id, date } = args
      
      // Get service details
      const { data: service } = await supabase
        .from('services')
        .select('name, duration_minutes')
        .eq('id', service_id)
        .eq('organization_id', this.organizationId)
        .single()

      if (!service) {
        return { success: false, error: 'Servizio non trovato' }
      }

      // Get organization working hours
      const { data: organization } = await supabase
        .from('organizations')
        .select('working_hours')
        .eq('id', this.organizationId)
        .single()

      const workingHours = organization?.working_hours || {}
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()
      const dayHours = (workingHours as any)[dayOfWeek]

      if (!dayHours) {
        return { 
          success: true, 
          data: { 
            available: false, 
            reason: 'Giorno non lavorativo',
            service: service.name,
            date 
          }
        }
      }

      // Get existing bookings for this date
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('start_at, end_at')
        .eq('organization_id', this.organizationId)
        .gte('start_at', startOfDay.toISOString())
        .lte('start_at', endOfDay.toISOString())
        .not('status', 'in', ['cancelled', 'no_show'])

      // Generate available slots
      const slots = this.generateTimeSlots(dayHours.open, dayHours.close, service.duration_minutes)
      const availableSlots = this.filterAvailableSlots(slots, existingBookings || [])

      return {
        success: true,
        data: {
          available: availableSlots.length > 0,
          slots: availableSlots,
          service: service.name,
          date,
          duration: service.duration_minutes
        }
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      return { success: false, error: 'Errore nel controllo disponibilità' }
    }
  }

  private async bookAppointment(args: any): Promise<FunctionResponse> {
    const supabase = await createClient()
    
    try {
      const { client_phone, service_id, datetime, notes } = args
      
      // Find or create client
      let { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', this.organizationId)
        .eq('phone', client_phone)
        .single()

      if (!client) {
        // Create new client
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            organization_id: this.organizationId,
            phone: client_phone,
            whatsapp_phone: client_phone,
            full_name: `Cliente WhatsApp (${client_phone})`,
          })
          .select('id')
          .single()
        
        if (!newClient) {
          return { success: false, error: 'Errore nella creazione cliente' }
        }
        
        client = newClient
      }

      // Get service details
      const { data: service } = await supabase
        .from('services')
        .select('name, duration_minutes, price')
        .eq('id', service_id)
        .eq('organization_id', this.organizationId)
        .single()

      if (!service) {
        return { success: false, error: 'Servizio non trovato' }
      }

      // Calculate end time
      const startAt = new Date(datetime)
      const endAt = new Date(startAt.getTime() + service.duration_minutes * 60000)

      // Create booking
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert({
          organization_id: this.organizationId,
          client_id: client.id,
          service_id,
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
          price: service.price,
          notes,
          source: 'whatsapp',
          status: 'confirmed',
        })
        .select('id, start_at, end_at')
        .single()

      if (error) {
        console.error('Error creating booking:', error)
        return { success: false, error: 'Errore nella creazione prenotazione' }
      }

      // Update chat session with client_id
      const whatsappPhone = this.sessionId.split('_')[1]
      await supabase
        .from('chat_sessions')
        .update({ client_id: client.id })
        .eq('organization_id', this.organizationId)
        .eq('whatsapp_phone', whatsappPhone)

      return {
        success: true,
        data: {
          booking_id: booking.id,
          confirmed: true,
          datetime: booking.start_at,
          service: service.name,
          price: service.price
        }
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      return { success: false, error: 'Errore nella prenotazione' }
    }
  }

  private async cancelAppointment(args: any): Promise<FunctionResponse> {
    const supabase = await createClient()
    
    try {
      const { booking_id, reason } = args
      
      // Get booking details
      const { data: booking } = await supabase
        .from('bookings')
        .select('id, start_at, service_id, client_id')
        .eq('id', booking_id)
        .eq('organization_id', this.organizationId)
        .single()

      if (!booking) {
        return { success: false, error: 'Prenotazione non trovata' }
      }

      // Check if booking is in the future
      const now = new Date()
      const bookingTime = new Date(booking.start_at)
      
      if (bookingTime <= now) {
        return { success: false, error: 'Non è possibile cancellare una prenotazione passata' }
      }

      // Cancel booking
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || 'Cancellazione via WhatsApp',
        })
        .eq('id', booking_id)

      if (error) {
        console.error('Error cancelling booking:', error)
        return { success: false, error: 'Errore nella cancellazione' }
      }

      return {
        success: true,
        data: {
          cancelled: true,
          booking_id,
          cancelled_at: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      return { success: false, error: 'Errore nella cancellazione' }
    }
  }

  private async getClientBookings(args: any): Promise<FunctionResponse> {
    const supabase = await createClient()
    
    try {
      const { client_phone, status = 'upcoming' } = args
      
      // Find client
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', this.organizationId)
        .eq('phone', client_phone)
        .single()

      if (!client) {
        return { success: false, error: 'Cliente non trovato' }
      }

      // Build query
      let query = supabase
        .from('bookings')
        .select(`
          id,
          start_at,
          end_at,
          status,
          price,
          notes,
          services(name, category),
          clients(full_name, phone)
        `)
        .eq('organization_id', this.organizationId)
        .eq('client_id', client.id)
        .order('start_at', { ascending: true })

      // Filter by status
      const now = new Date()
      if (status === 'upcoming') {
        query = query.gte('start_at', now.toISOString())
      } else if (status === 'past') {
        query = query.lt('start_at', now.toISOString())
      }

      const { data: bookings, error } = await query

      if (error) {
        console.error('Error getting client bookings:', error)
        return { success: false, error: 'Errore nel recupero prenotazioni' }
      }

      return {
        success: true,
        data: {
          bookings: bookings?.map(b => ({
            id: b.id,
            date: new Date(b.start_at).toLocaleDateString('it-IT'),
            time: new Date(b.start_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
            service: (b.services as any)?.name,
            status: b.status,
            price: b.price
          })) || []
        }
      }
    } catch (error) {
      console.error('Error getting client bookings:', error)
      return { success: false, error: 'Errore nel recupero prenotazioni' }
    }
  }

  private async getServices(args: any): Promise<FunctionResponse> {
    const supabase = await createClient()
    
    let query = supabase
      .from('services')
      .select('id, name, category, price, duration_minutes')
      .eq('organization_id', this.organizationId)
      .eq('is_active', true)

    if (args.category) {
      query = query.eq('category', args.category)
    }

    const { data: services, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: { services }
    }
  }

  private async getServiceInfo(args: any): Promise<FunctionResponse> {
    const supabase = await createClient()
    
    try {
      const { service_id } = args
      
      const { data: service, error } = await supabase
        .from('services')
        .select(`
          id,
          name,
          description,
          duration_minutes,
          price,
          category,
          organization_id
        `)
        .eq('id', service_id)
        .eq('organization_id', this.organizationId)
        .single()

      if (error || !service) {
        return { success: false, error: 'Servizio non trovato' }
      }

      return {
        success: true,
        data: {
          id: service.id,
          name: service.name,
          description: service.description,
          duration: service.duration_minutes,
          price: service.price,
          category: service.category
        }
      }
    } catch (error) {
      console.error('Error getting service info:', error)
      return { success: false, error: 'Errore nel recupero informazioni servizio' }
    }
  }

  private async collectFeedback(args: any): Promise<FunctionResponse> {
    const supabase = await createClient()
    
    try {
      const { client_phone, service_id, booking_id, rating, comment, category = 'overall' } = args
      
      // Validate rating
      if (rating < 1 || rating > 5) {
        return { success: false, error: 'La valutazione deve essere tra 1 e 5' }
      }

      // Find client
      let { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', this.organizationId)
        .eq('phone', client_phone)
        .single()

      if (!client) {
        // Create new client if not exists
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            organization_id: this.organizationId,
            phone: client_phone,
            whatsapp_phone: client_phone,
            full_name: `Cliente WhatsApp (${client_phone})`,
          })
          .select('id')
          .single()
        
        if (!newClient) {
          return { success: false, error: 'Errore nella creazione cliente' }
        }
        
        client = newClient
      }

      // Create feedback record
      const { data: feedback, error } = await supabase
        .from('feedback')
        .insert({
          organization_id: this.organizationId,
          client_id: client.id,
          service_id: service_id || null,
          booking_id: booking_id || null,
          rating,
          comment: comment || null,
          category,
          source: 'whatsapp',
          created_at: new Date().toISOString()
        })
        .select('id, rating, comment, category')
        .single()

      if (error) {
        console.error('Error creating feedback:', error)
        return { success: false, error: 'Errore nel salvataggio feedback' }
      }

      // Send thank you message based on rating
      let thankYouMessage = ''
      if (rating >= 4) {
        thankYouMessage = 'Grazie mille per il tuo feedback positivo! 🌟 Siamo felici che tu sia soddisfatto del nostro servizio. Ti aspettiamo per il prossimo appuntamento!'
      } else if (rating >= 3) {
        thankYouMessage = 'Grazie per il tuo feedback! 👍 Stiamo sempre lavorando per migliorare i nostri servizi. Speriamo di vederti presto!'
      } else {
        thankYouMessage = 'Grazie per il tuo feedback onesto. 😔 Ci dispiace che la tua esperienza non sia stata all\'altezza delle aspettative. Il nostro team controllerà il tuo commento per migliorare i nostri servizi.'
      }

      return {
        success: true,
        data: {
          feedback_id: feedback.id,
          rating: feedback.rating,
          category: feedback.category,
          thank_you_message: thankYouMessage
        }
      }
    } catch (error) {
      console.error('Error collecting feedback:', error)
      return { success: false, error: 'Errore nella raccolta feedback' }
    }
  }

  // Helper methods
  private generateTimeSlots(openTime: string, closeTime: string, durationMinutes: number): string[] {
    const slots: string[] = []
    const [openHour, openMin] = openTime.split(':').map(Number)
    const [closeHour, closeMin] = closeTime.split(':').map(Number)
    
    let currentHour = openHour
    let currentMin = openMin
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
      slots.push(timeString)
      
      // Add duration
      currentMin += durationMinutes
      while (currentMin >= 60) {
        currentMin -= 60
        currentHour += 1
      }
    }
    
    return slots
  }

  private filterAvailableSlots(slots: string[], existingBookings: any[]): string[] {
    const bookedTimes = new Set()
    
    existingBookings.forEach(booking => {
      const start = new Date(booking.start_at)
      const end = new Date(booking.end_at)
      
      // Mark all times in this booking as unavailable
      const current = new Date(start)
      while (current < end) {
        const timeString = current.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
        bookedTimes.add(timeString)
        current.setMinutes(current.getMinutes() + 15) // 15-minute intervals
      }
    })
    
    return slots.filter(slot => !bookedTimes.has(slot))
  }
} 