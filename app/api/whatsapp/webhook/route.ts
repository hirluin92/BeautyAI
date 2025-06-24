import { NextRequest, NextResponse } from 'next/server'
import { ConversationHandler } from '@/lib/ai/conversation-handler'
import { WhatsAppIntegration } from '@/lib/ai/whatsapp-integration'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Webhook verification for WhatsApp
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Verify webhook
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// Validation schemas
const webhookSchema = z.object({
  Body: z.string().optional(),
  From: z.string().optional(),
  To: z.string().optional(),
  MessageSid: z.string().optional(),
  NumMedia: z.string().optional(),
  MediaUrl0: z.string().optional(),
  MessageStatus: z.string().optional(),
});

const messageSchema = z.object({
  message: z.string().min(1, 'Messaggio è obbligatorio'),
  from: z.string().min(1, 'Numero mittente è obbligatorio'),
  to: z.string().min(1, 'Numero destinatario è obbligatorio'),
});

// Receive messages from WhatsApp
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Parse form data
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());
    
    // Validate webhook data
    const validatedData = webhookSchema.parse(body);
    
    console.log('📱 WhatsApp Webhook received:', validatedData);
    
    // Handle different webhook types
    if (validatedData.MessageStatus) {
      // Message status update
      await handleMessageStatus(validatedData);
    } else if (validatedData.Body) {
      // Incoming message
      await handleIncomingMessage(validatedData);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Webhook validation error:', error.errors);
      return NextResponse.json(
        { error: 'Dati webhook non validi' },
        { status: 400 }
      );
    }
    
    console.error('Error in WhatsApp webhook:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

async function handleMessageStatus(data: any) {
  console.log('📊 Message status update:', data);
  
  // Update message status in database
  const supabase = await createClient();
  
  await supabase
    .from('whatsapp_messages')
    .update({
      status: data.MessageStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('message_sid', data.MessageSid);
}

async function handleIncomingMessage(data: any) {
  console.log('💬 Incoming message:', data);
  
  const supabase = await createClient();
  
  // Save incoming message
  await supabase
    .from('whatsapp_messages')
    .insert({
      message_sid: data.MessageSid,
      from_number: data.From,
      to_number: data.To,
      body: data.Body,
      media_url: data.MediaUrl0,
      direction: 'inbound',
      status: 'received',
      received_at: new Date().toISOString(),
    });
  
  // Process message with AI (if configured)
  if (data.Body) {
    await processMessageWithAI(data.Body, data.From);
  }
}

async function processMessageWithAI(message: string, fromNumber: string) {
  // TODO: Implement AI processing
  console.log('🤖 Processing message with AI:', { message, fromNumber });
}

async function processWhatsAppMessage(message: any, organizationId: string) {
  try {
    console.log('🤖 Processing message:', message)

    // Extract message details
    const from = message.from
    const text = message.text?.body || ''
    const messageType = message.type || 'text'
    const timestamp = message.timestamp

    // Skip non-text messages for now
    if (messageType !== 'text') {
      console.log('⏭️ Skipping non-text message:', messageType)
      return
    }

    // Get or create Supabase client
    const supabase = await createClient()

    // Get organization details
    const { data: organization } = await supabase
      .from('organizations')
      .select('name, whatsapp_access_token, whatsapp_phone_number_id')
      .eq('id', organizationId)
      .single()

    if (!organization) {
      console.error('❌ Organization not found:', organizationId)
      return
    }

    // Create session ID
    const sessionId = `${organizationId}_${from}`

    // Initialize AI conversation handler
    const conversationHandler = new ConversationHandler(organizationId, sessionId)

    // Process message with AI
    const aiResponse = await conversationHandler.processMessage({
      from,
      text,
      type: messageType,
      timestamp
    })

    // Initialize WhatsApp integration
    const whatsappIntegration = new WhatsAppIntegration(
      organization.whatsapp_access_token,
      organization.whatsapp_phone_number_id
    )

    // Send AI response back to WhatsApp
    await whatsappIntegration.sendMessage(from, aiResponse)

    console.log('✅ Message processed and response sent')

  } catch (error) {
    console.error('❌ Error processing message:', error)
  }
} 