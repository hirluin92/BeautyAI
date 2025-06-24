// app/api/whatsapp/webhook/route.ts - SECURITY FIX
import { NextRequest, NextResponse } from 'next/server'
import { ConversationHandler } from '@/lib/ai/conversation-handler'
import { WhatsAppIntegration } from '@/lib/ai/whatsapp-integration'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import crypto from 'crypto'

// 🔒 SECURITY: Webhook signature verification
function verifyWebhookSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) {
    console.error('❌ Missing signature or secret')
    return false
  }

  try {
    // WhatsApp sends signature as "sha256=<hash>"
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')}`

    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('❌ Signature verification error:', error)
    return false
  }
}

// Webhook verification for WhatsApp (GET request)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    console.log('🔍 Webhook verification attempt:', { mode, token: token ? '***' : null })

    // Verify webhook setup request
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ WhatsApp webhook verified successfully')
      return new NextResponse(challenge, { status: 200 })
    }

    console.log('❌ Webhook verification failed')
    return new NextResponse('Forbidden', { status: 403 })
  } catch (error) {
    console.error('❌ Webhook verification error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Validation schemas with enhanced security
const webhookSchema = z.object({
  object: z.string(),
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      value: z.object({
        messaging_product: z.string(),
        metadata: z.object({
          display_phone_number: z.string(),
          phone_number_id: z.string(),
        }),
        contacts: z.array(z.object({
          profile: z.object({
            name: z.string(),
          }),
          wa_id: z.string(),
        })).optional(),
        messages: z.array(z.object({
          from: z.string(),
          id: z.string(),
          timestamp: z.string(),
          text: z.object({
            body: z.string(),
          }).optional(),
          type: z.string(),
        })).optional(),
        statuses: z.array(z.object({
          id: z.string(),
          status: z.string(),
          timestamp: z.string(),
          recipient_id: z.string(),
        })).optional(),
      }),
      field: z.string(),
    })),
  })),
})

// 🔒 SECURITY: Rate limiting per webhook
const webhookRateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 100 // Max 100 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const current = webhookRateLimit.get(ip)

  if (!current || now > current.resetTime) {
    webhookRateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return false
  }

  current.count++
  return true
}

// Receive messages from WhatsApp (POST request)
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let organizationId: string | null = null

  try {
    // 🔒 SECURITY: Rate limiting by IP (Next.js 15 compatible)
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                    request.headers.get('x-real-ip') ||
                    'unknown'
    
    if (!checkRateLimit(clientIP)) {
      console.log('🚫 Rate limit exceeded for IP:', clientIP)
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // 🔒 SECURITY: Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256')

    // Verify webhook signature
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('❌ Missing WHATSAPP_WEBHOOK_SECRET environment variable')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('❌ Invalid webhook signature from IP:', clientIP)
      // Log potential security incident
      await logSecurityIncident('invalid_webhook_signature', {
        ip: clientIP,
        signature,
        timestamp: new Date().toISOString()
      })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    console.log('✅ Webhook signature verified')

    // Parse and validate JSON
    let parsedBody
    try {
      parsedBody = JSON.parse(body)
    } catch (error) {
      console.error('❌ Invalid JSON in webhook body:', error)
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    // Validate webhook structure
    const validatedData = webhookSchema.parse(parsedBody)
    console.log('📱 WhatsApp Webhook received and validated')

    // Process each entry in the webhook
    for (const entry of validatedData.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          const metadata = change.value.metadata
          organizationId = await getOrganizationByPhoneNumberId(metadata.phone_number_id)

          if (!organizationId) {
            console.error('❌ Organization not found for phone number ID:', metadata.phone_number_id)
            continue
          }

          // Handle incoming messages
          if (change.value.messages) {
            for (const message of change.value.messages) {
              await handleIncomingMessage(message, organizationId)
            }
          }

          // Handle message statuses
          if (change.value.statuses) {
            for (const status of change.value.statuses) {
              await handleMessageStatus(status, organizationId)
            }
          }
        }
      }
    }

    const processingTime = Date.now() - startTime
    console.log(`✅ Webhook processed successfully in ${processingTime}ms`)

    return NextResponse.json({ 
      success: true, 
      processingTime: `${processingTime}ms` 
    })

  } catch (error) {
    const processingTime = Date.now() - startTime

    if (error instanceof z.ZodError) {
      console.error('❌ Webhook validation error:', error.errors)
      await logSecurityIncident('webhook_validation_error', {
        errors: error.errors,
        organizationId,
        processingTime
      })
      return NextResponse.json(
        { 
          error: 'Invalid webhook data',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error('❌ Error processing WhatsApp webhook:', error)
    await logSecurityIncident('webhook_processing_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      organizationId,
      processingTime
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 🔒 SECURITY: Get organization by phone number ID with caching
const orgCache = new Map<string, { orgId: string; expiry: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getOrganizationByPhoneNumberId(phoneNumberId: string): Promise<string | null> {
  // Check cache first
  const cached = orgCache.get(phoneNumberId)
  if (cached && Date.now() < cached.expiry) {
    return cached.orgId
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('whatsapp_phone_number_id', phoneNumberId)
      .single()

    if (error || !data) {
      console.error('❌ Error finding organization:', error)
      return null
    }

    // Cache the result
    orgCache.set(phoneNumberId, {
      orgId: data.id,
      expiry: Date.now() + CACHE_TTL
    })

    return data.id
  } catch (error) {
    console.error('❌ Database error finding organization:', error)
    return null
  }
}

// Enhanced message handling with error recovery
async function handleIncomingMessage(message: any, organizationId: string) {
  try {
    console.log('💬 Processing incoming message:', {
      id: message.id,
      from: message.from,
      type: message.type,
      organizationId
    })

    const supabase = await createClient()

    // Save message to database
    const { error: saveError } = await supabase
      .from('whatsapp_messages')
      .insert({
        message_id: message.id,
        from_number: message.from,
        message_type: message.type,
        body: message.text?.body || '',
        timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
        organization_id: organizationId,
        direction: 'inbound',
        status: 'received',
      })

    if (saveError) {
      console.error('❌ Error saving message:', saveError)
      // Continue processing even if save fails
    }

    // Process with AI if it's a text message
    if (message.type === 'text' && message.text?.body) {
      await processMessageWithAI(message, organizationId)
    }

  } catch (error) {
    console.error('❌ Error handling incoming message:', error)
    await logSecurityIncident('message_processing_error', {
      messageId: message.id,
      organizationId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function handleMessageStatus(status: any, organizationId: string) {
  try {
    console.log('📊 Processing message status:', {
      id: status.id,
      status: status.status,
      organizationId
    })

    const supabase = await createClient()

    // Update message status
    const { error } = await supabase
      .from('whatsapp_messages')
      .update({
        status: status.status,
        updated_at: new Date().toISOString(),
      })
      .eq('message_id', status.id)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('❌ Error updating message status:', error)
    }

  } catch (error) {
    console.error('❌ Error handling message status:', error)
  }
}

async function processMessageWithAI(message: any, organizationId: string) {
  try {
    console.log('🤖 Processing message with AI:', {
      messageId: message.id,
      organizationId
    })

    // Create session ID for conversation context
    const sessionId = `${organizationId}_${message.from}`

    // Initialize AI conversation handler
    const conversationHandler = new ConversationHandler(organizationId, sessionId)

    // Process message with AI
    const aiResponse = await conversationHandler.processMessage({
      from: message.from,
      text: message.text?.body || '',
      type: message.type,
      timestamp: parseInt(message.timestamp)
    })

    // Get organization WhatsApp config
    const supabase = await createClient()
    const { data: org } = await supabase
      .from('organizations')
      .select('whatsapp_access_token, whatsapp_phone_number_id')
      .eq('id', organizationId)
      .single()

    if (!org?.whatsapp_access_token || !org?.whatsapp_phone_number_id) {
      console.error('❌ Missing WhatsApp configuration for organization:', organizationId)
      return
    }

    // Initialize WhatsApp integration and send response
    const whatsappIntegration = new WhatsAppIntegration(
      org.whatsapp_access_token,
      org.whatsapp_phone_number_id
    )

    await whatsappIntegration.sendMessage(message.from, aiResponse)
    console.log('✅ AI response sent successfully')

  } catch (error) {
    console.error('❌ Error processing message with AI:', error)
    await logSecurityIncident('ai_processing_error', {
      messageId: message.id,
      organizationId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// 🔒 SECURITY: Log security incidents
async function logSecurityIncident(type: string, details: any) {
  try {
    const supabase = await createClient()
    await supabase
      .from('security_logs')
      .insert({
        incident_type: type,
        details,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('❌ Error logging security incident:', error)
  }
}

// 🧹 CLEANUP: Periodically clean rate limit cache
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of webhookRateLimit) {
    if (now > data.resetTime) {
      webhookRateLimit.delete(ip)
    }
  }
}, RATE_LIMIT_WINDOW)