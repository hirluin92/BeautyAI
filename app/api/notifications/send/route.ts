// Path: app/api/notifications/send/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { NotificationService, NotificationType } from '@/lib/notifications/notification.service'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { z } from 'zod'

// Configurazione notifiche - da spostare in variabili d'ambiente
const notificationConfig = {
  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    templateId: process.env.EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || ''
  },
  twilio: (process.env.TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID) ? {
    accountSid: process.env.TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || process.env.NEXT_PUBLIC_TWILIO_SMS_NUMBER || ''
  } : undefined
}

// Validation schema
const sendNotificationSchema = z.object({
  booking_id: z.string().uuid('ID prenotazione non valido'),
  type: z.enum(['confirmation', 'reminder_24h', 'reminder_1h', 'cancellation', 'modification'], {
    errorMap: () => ({ message: 'Tipo di notifica non valido' })
  }),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData || !userData.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get request body
    const body = await request.json()
    
    // Validate request body
    const validatedData = sendNotificationSchema.parse(body)

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        start_at,
        end_at,
        client:clients(id, full_name, email, phone, notification_preferences),
        service:services(id, name, duration_minutes, price),
        staff:staff(id, full_name)
      `)
      .eq('id', validatedData.booking_id)
      .eq('organization_id', userData.organization_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Prenotazione non trovata' }, { status: 404 })
    }

    // Prepare notification data
    const client = booking.client?.[0]
    const service = booking.service?.[0]
    const staff = booking.staff?.[0]

    const notificationData = {
      bookingId: booking.id,
      clientName: client?.full_name,
      clientEmail: client?.email,
      clientPhone: client?.phone,
      serviceName: service?.name,
      staffName: staff?.full_name,
      date: format(new Date(booking.start_at), 'dd/MM/yyyy'),
      time: booking.start_at,
      duration: service?.duration_minutes,
      price: service?.price,
      organizationName: 'Beauty AI', // TODO: Get from organization
      organizationPhone: '+39 123 456 7890', // TODO: Get from organization
      notificationPreferences: client?.notification_preferences || {
        email: true,
        sms: true,
      },
    }

    // Initialize notification service
    const notificationService = new NotificationService({
      emailjs: {
        serviceId: process.env.EMAILJS_SERVICE_ID!,
        templateId: process.env.EMAILJS_TEMPLATE_ID!,
        publicKey: process.env.EMAILJS_PUBLIC_KEY!,
      },
      twilio: process.env.TWILIO_ACCOUNT_SID ? {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN!,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER!,
      } : undefined,
    })

    // Send notification
    const results = await notificationService.sendNotification(validatedData.type as NotificationType, notificationData)

    return NextResponse.json({
      success: true,
      results,
      message: 'Notifiche inviate con successo',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error in POST /api/notifications/send:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// GET endpoint per ottenere lo stato delle notifiche di un booking
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // TODO: Implement notifications history when table is created
    return NextResponse.json({
      notifications: [],
      count: 0
    })

  } catch (error: any) {
    console.error('Error in notifications GET:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}