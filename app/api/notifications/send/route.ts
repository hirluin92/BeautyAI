// Path: app/api/notifications/send/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NotificationService, NotificationType } from '@/lib/notifications/notification.service'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

// Configurazione notifiche - da spostare in variabili d'ambiente
const notificationConfig = {
  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    templateId: process.env.EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || ''
  },
  twilio: process.env.TWILIO_ACCOUNT_SID ? {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
  } : undefined
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, organization:organizations(*)')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const body = await request.json()
    const { bookingId, type } = body

    if (!bookingId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate notification type
    const validTypes: NotificationType[] = ['confirmation', 'reminder_24h', 'reminder_1h', 'cancellation', 'modification']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        client:clients(*),
        service:services(*),
        staff:users!bookings_staff_id_fkey(*)
      `)
      .eq('id', bookingId)
      .eq('organization_id', userData.organization_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Initialize notification service
    const notificationService = new NotificationService(notificationConfig)

    // Prepare notification data
    const notificationData = {
      bookingId: booking.id,
      clientName: booking.client?.full_name || '',
      clientEmail: booking.client?.email || undefined,
      clientPhone: booking.client?.phone || undefined,
      serviceName: booking.service?.name || '',
      staffName: booking.staff?.full_name || undefined,
      date: format(new Date(booking.start_at), 'EEEE d MMMM yyyy', { locale: it }),
      time: format(new Date(booking.start_at), 'HH:mm'),
      duration: booking.service?.duration_minutes || 0,
      price: booking.price || booking.service?.price || 0,
      organizationName: userData.organization?.name || '',
      organizationPhone: userData.organization?.phone || undefined,
      notificationPreferences: {
        email: true,
        sms: true,
        whatsapp: true
      }
    }

    // Send notification
    const results = await notificationService.sendNotification(type, notificationData)

    return NextResponse.json({
      success: true,
      results,
      message: 'Notifications sent successfully'
    })

  } catch (error: any) {
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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