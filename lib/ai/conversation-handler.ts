import OpenAI from 'openai'
import { ConversationContext, WhatsAppMessage, AIResponse, FunctionResponse } from './types'
import { SYSTEM_PROMPTS, AI_FUNCTIONS } from './constants'
import { createClient } from '@/lib/supabase/server'

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
    console.log('🤖 Processing message:', message.text)

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
      model: 'gpt-4-turbo-preview',
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
      functions: AI_FUNCTIONS,
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

  private async executeFunctionCall(functionCall: unknown): Promise<FunctionResponse> {
    const { name, arguments: args } = functionCall as { name: string; arguments: string }
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
      model: 'gpt-4-turbo-preview',
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
    if (this.context.state === 'idle') {
      return [
        '📅 Prenota appuntamento',
        '❓ Info servizi',
        '📋 Le mie prenotazioni',
        '📞 Contatti',
      ]
    }
    return []
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

    return SYSTEM_PROMPTS.assistant
      .replace('{organizationName}', organization?.name || 'Centro Estetico')
      .replace('{address}', organization?.address || 'Indirizzo non disponibile')
      .replace('{workingHours}', typeof organization?.working_hours === 'string' ? organization.working_hours : JSON.stringify(organization?.working_hours) || 'Orari non disponibili')
      .replace('{services}', servicesList)
  }

  private buildMessageHistory() {
    return this.context.messageHistory.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content,
    }))
  }

  private async loadContext() {
    // TODO: Implementare quando la tabella ai_conversations sarà disponibile
    console.log('Loading context - not implemented yet')
  }

  private async saveContext() {
    // TODO: Implementare quando la tabella ai_conversations sarà disponibile
    console.log('Saving context - not implemented yet')
  }

  // Function implementations
  private async checkAvailability(args: any): Promise<FunctionResponse> {
    // TODO: Implement actual availability check
    console.log('🔍 Checking availability for:', args)
    
    return {
      success: true,
      data: {
        available: true,
        slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        service: 'Massaggio rilassante',
        date: args.date
      }
    }
  }

  private async bookAppointment(args: any): Promise<FunctionResponse> {
    // TODO: Implement actual booking
    console.log('📅 Booking appointment:', args)
    
    return {
      success: true,
      data: {
        booking_id: 'test-booking-123',
        confirmed: true,
        datetime: args.datetime
      }
    }
  }

  private async cancelAppointment(args: any): Promise<FunctionResponse> {
    // TODO: Implement actual cancellation
    console.log('❌ Cancelling appointment:', args)
    
    return {
      success: true,
      data: {
        cancelled: true,
        booking_id: args.booking_id
      }
    }
  }

  private async getClientBookings(args: any): Promise<FunctionResponse> {
    // TODO: Implement actual client bookings retrieval
    console.log('📋 Getting client bookings:', args)
    
    return {
      success: true,
      data: {
        bookings: [
          { id: '1', service: 'Massaggio', date: '2024-01-15', time: '10:00' },
          { id: '2', service: 'Facial', date: '2024-01-20', time: '14:00' }
        ]
      }
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
    
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('organization_id', this.organizationId)
      .eq('is_active', true)
      .ilike('name', `%${args.service_name}%`)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: { service }
    }
  }
} 