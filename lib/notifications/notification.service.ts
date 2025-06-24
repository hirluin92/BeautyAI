// Path: lib/services/notification.service.ts
import { createClient } from '@/lib/supabase/server'
import { format, addDays, startOfDay, endOfDay } from 'date-fns'
import { it } from 'date-fns/locale'

// Bypass SSL verification in development
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

export interface NotificationConfig {
  emailjs: {
    serviceId: string
    templateId: string
    publicKey: string
  }
  twilio?: {
    accountSid: string
    authToken: string
    phoneNumber: string
  }
}

export interface NotificationData {
  bookingId: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  serviceName: string
  staffName?: string
  date: string
  time: string
  duration: number
  price: number
  organizationName: string
  organizationPhone?: string
  notificationPreferences: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
}

export type NotificationType = 'confirmation' | 'reminder_24h' | 'reminder_1h' | 'cancellation' | 'modification'

export class NotificationService {
  private supabase: any
  private config: NotificationConfig

  constructor(config: NotificationConfig) {
    this.config = config
    this.supabase = createClient();
  }

  /**
   * Invia notifica basata sul tipo e preferenze del cliente
   */
  async sendNotification(type: NotificationType, data: NotificationData) {
    console.log('🚀 Starting notification send:', {
      type,
      hasEmail: !!data.clientEmail,
      hasPhone: !!data.clientPhone,
      preferences: data.notificationPreferences,
      twilioConfig: !!this.config.twilio
    })

    const results = {
      email: { sent: false, error: null as string | null },
      sms: { sent: false, error: null as string | null },
      whatsapp: { sent: false, error: null as string | null }
    }

    try {
      // Email notification
      if (data.notificationPreferences.email && data.clientEmail) {
        try {
          console.log('📧 Sending email notification...')
          await this.sendEmailNotification(type, data)
          results.email.sent = true
          console.log('✅ Email sent successfully')
        } catch (error: any) {
          console.error('❌ Email error:', error.message)
          results.email.error = error.message
        }
      }

      // SMS notification
      if (data.notificationPreferences.sms && data.clientPhone && this.config.twilio) {
        try {
          console.log('📱 Sending SMS notification...')
          await this.sendSMSNotification(type, data)
          results.sms.sent = true
          console.log('✅ SMS sent successfully')
        } catch (error: any) {
          console.error('❌ SMS error:', error.message)
          results.sms.error = error.message
        }
      } else {
        console.log('⚠️ SMS skipped:', {
          hasSmsPreference: data.notificationPreferences.sms,
          hasPhone: !!data.clientPhone,
          hasTwilio: !!this.config.twilio
        })
      }

      // WhatsApp notification
      if (data.notificationPreferences.whatsapp && data.clientPhone) {
        try {
          console.log('💬 Sending WhatsApp notification...')
          await this.sendWhatsAppNotification(type, data)
          results.whatsapp.sent = true
          console.log('✅ WhatsApp sent successfully')
        } catch (error: any) {
          console.error('❌ WhatsApp error:', error.message)
          results.whatsapp.error = error.message
        }
      }

      // Log notification in database
      await this.logNotification(type, data, results)

      // Update booking notification status
      await this.updateBookingNotificationStatus(data.bookingId, type)

      console.log('📊 Final results:', results)
      return results
    } catch (error) {
      console.error('💥 Error sending notifications:', error)
      throw error
    }
  }

  /**
   * Invia notifica email usando EmailJS
   */
  private async sendEmailNotification(type: NotificationType, data: NotificationData) {
    const emailData = {
      service_id: this.config.emailjs.serviceId,
      template_id: this.config.emailjs.templateId,
      user_id: this.config.emailjs.publicKey,
      template_params: {
        to_email: data.clientEmail,
        to_name: data.clientName,
        from_name: data.organizationName,
        service_name: data.serviceName,
        appointment_date: data.date,
        appointment_time: data.time,
        staff_name: data.staffName || 'Non assegnato',
        duration: `${data.duration} minuti`,
        price: `€${data.price}`,
        organization_phone: data.organizationPhone,
        message: this.getEmailMessage(type, data)
      }
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      throw new Error(`EmailJS error: ${response.status}`)
    }

    return response
  }

  /**
   * Invia SMS usando Twilio
   */
  private async sendSMSNotification(type: NotificationType, data: NotificationData) {
    console.log('🔍 SMS Notification Debug:', {
      hasTwilioConfig: !!this.config.twilio,
      twilioConfig: this.config.twilio,
      clientPhone: data.clientPhone,
      notificationPreferences: data.notificationPreferences
    })

    if (!this.config.twilio) {
      throw new Error('Twilio configuration missing')
    }

    const message = this.getSMSMessage(type, data)
    const to = this.formatPhoneNumber(data.clientPhone!)

    console.log('📱 SMS Details:', {
      message,
      to,
      from: this.config.twilio.phoneNumber
    })

    const auth = Buffer.from(
      `${this.config.twilio.accountSid}:${this.config.twilio.authToken}`
    ).toString('base64')

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.config.twilio.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: this.config.twilio.phoneNumber,
          Body: message
        })
      }
    )

    console.log('📡 Twilio Response Status:', response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Twilio Error:', error)
      throw new Error(`Twilio error: ${error.message}`)
    }

    const result = await response.json()
    console.log('✅ SMS Sent Successfully:', result.sid)
    return response
  }

  /**
   * Invia notifica WhatsApp
   */
  private async sendWhatsAppNotification(type: NotificationType, data: NotificationData) {
    const message = this.getWhatsAppMessage(type, data)
    const link = this.createWhatsAppLink(data.clientPhone!, message)
    
    // Log the WhatsApp link for manual sending
    console.log('WhatsApp link:', link)
    
    // If Twilio WhatsApp is configured, send automatically
    if (this.config.twilio) {
      const auth = Buffer.from(
        `${this.config.twilio.accountSid}:${this.config.twilio.authToken}`
      ).toString('base64')

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.config.twilio.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: `whatsapp:${this.formatPhoneNumber(data.clientPhone!)}`,
            From: `whatsapp:${this.config.twilio.phoneNumber}`,
            Body: message
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Twilio WhatsApp error: ${error.message}`)
      }

      return response
    }

    // Return success for manual method
    return { ok: true, manual: true, link }
  }

  /**
   * Ottieni messaggio email basato sul tipo
   */
  private getEmailMessage(type: NotificationType, data: NotificationData): string {
    const templates = {
      confirmation: `Gentile ${data.clientName},\n\nLa sua prenotazione è stata confermata!\n\nDettagli:\n- Servizio: ${data.serviceName}\n- Data: ${data.date}\n- Ora: ${data.time}\n- Durata: ${data.duration} minuti\n- Prezzo: €${data.price}\n${data.staffName ? `- Operatore: ${data.staffName}` : ''}\n\nLa aspettiamo!\n\n${data.organizationName}`,
      
      reminder_24h: `Gentile ${data.clientName},\n\nLe ricordiamo il suo appuntamento di domani:\n\n- Servizio: ${data.serviceName}\n- Data: ${data.date}\n- Ora: ${data.time}\n\nA domani!\n\n${data.organizationName}`,
      
      reminder_1h: `Gentile ${data.clientName},\n\nTra un'ora ha l'appuntamento per ${data.serviceName}.\n\nLa aspettiamo alle ${data.time}!\n\n${data.organizationName}`,
      
      cancellation: `Gentile ${data.clientName},\n\nIl suo appuntamento del ${data.date} alle ${data.time} è stato annullato.\n\nPer riprenotare, ci contatti al ${data.organizationPhone}.\n\nGrazie,\n${data.organizationName}`,
      
      modification: `Gentile ${data.clientName},\n\nIl suo appuntamento è stato modificato.\n\nNuovi dettagli:\n- Servizio: ${data.serviceName}\n- Data: ${data.date}\n- Ora: ${data.time}\n\nGrazie,\n${data.organizationName}`
    }

    return templates[type] || ''
  }

  /**
   * Ottieni messaggio SMS basato sul tipo
   */
  private getSMSMessage(type: NotificationType, data: NotificationData): string {
    const templates = {
      confirmation: `Confermato: ${data.serviceName} il ${data.date} alle ${data.time}. ${data.organizationName}`,
      
      reminder_24h: `Promemoria: domani alle ${data.time} - ${data.serviceName}. ${data.organizationName}`,
      
      reminder_1h: `Tra 1 ora: ${data.serviceName} alle ${data.time}. Ti aspettiamo! ${data.organizationName}`,
      
      cancellation: `Annullato: appuntamento del ${data.date}. Chiama ${data.organizationPhone} per riprenotare. ${data.organizationName}`,
      
      modification: `Modificato: ${data.serviceName} spostato al ${data.date} alle ${data.time}. ${data.organizationName}`
    }

    return templates[type] || ''
  }

  /**
   * Ottieni messaggio WhatsApp basato sul tipo
   */
  private getWhatsAppMessage(type: NotificationType, data: NotificationData): string {
    const templates = {
      confirmation: `✅ *Prenotazione Confermata*\n\nCiao ${data.clientName}! 👋\n\nTi confermiamo la prenotazione:\n📅 ${data.date}\n⏰ ${data.time}\n💆 ${data.serviceName}\n${data.staffName ? `👤 ${data.staffName}` : ''}\n💰 €${data.price}\n\nTi aspettiamo!\n${data.organizationName}`,
      
      reminder_24h: `⏰ *Promemoria Appuntamento*\n\nCiao ${data.clientName}!\n\nTi ricordiamo l'appuntamento di domani:\n📅 ${data.date}\n⏰ ${data.time}\n💆 ${data.serviceName}\n\nA domani! 😊\n${data.organizationName}`,
      
      reminder_1h: `🔔 *Tra 1 ora!*\n\nCiao ${data.clientName}!\n\nTra poco ti aspettiamo per:\n⏰ ${data.time}\n💆 ${data.serviceName}\n\nA presto! 🎉\n${data.organizationName}`,
      
      cancellation: `❌ *Appuntamento Annullato*\n\nCiao ${data.clientName},\n\nIl tuo appuntamento del ${data.date} alle ${data.time} è stato annullato.\n\n📞 Chiamaci al ${data.organizationPhone} per riprenotare!\n\n${data.organizationName}`,
      
      modification: `📝 *Appuntamento Modificato*\n\nCiao ${data.clientName}!\n\nIl tuo appuntamento è stato modificato:\n📅 ${data.date}\n⏰ ${data.time}\n💆 ${data.serviceName}\n\nGrazie!\n${data.organizationName}`
    }

    return templates[type] || ''
  }

  /**
   * Formatta numero di telefono per API
   */
  private formatPhoneNumber(phone: string): string {
    // Rimuovi spazi e caratteri speciali
    let cleaned = phone.replace(/\D/g, '')
    
    // Aggiungi prefisso Italia se non presente
    if (!cleaned.startsWith('39') && cleaned.length === 10) {
      cleaned = '39' + cleaned
    }
    
    // Aggiungi + se non presente
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }
    
    return cleaned
  }

  /**
   * Crea link WhatsApp per invio manuale
   */
  private createWhatsAppLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/[^\d]/g, '')
    const phoneWithPrefix = cleanPhone.startsWith('39') ? cleanPhone : `39${cleanPhone}`
    return `https://wa.me/${phoneWithPrefix}?text=${encodeURIComponent(message)}`
  }

  /**
   * Log notifica nel database
   */
  private async logNotification(
    type: NotificationType,
    data: NotificationData,
    results: any
  ) {
    const logs = []
    
    if (data.notificationPreferences.email && data.clientEmail) {
      logs.push({
        booking_id: data.bookingId,
        organization_id: await this.getOrganizationId(),
        type: 'email',
        status: results.email.sent ? 'sent' : 'failed',
        sent_at: results.email.sent ? new Date().toISOString() : null,
        error_message: results.email.error
      })
    }

    if (data.notificationPreferences.sms && data.clientPhone) {
      logs.push({
        booking_id: data.bookingId,
        organization_id: await this.getOrganizationId(),
        type: 'sms',
        status: results.sms.sent ? 'sent' : 'failed',
        sent_at: results.sms.sent ? new Date().toISOString() : null,
        error_message: results.sms.error
      })
    }

    if (data.notificationPreferences.whatsapp && data.clientPhone) {
      logs.push({
        booking_id: data.bookingId,
        organization_id: await this.getOrganizationId(),
        type: 'whatsapp',
        status: results.whatsapp.sent ? 'sent' : 'failed',
        sent_at: results.whatsapp.sent ? new Date().toISOString() : null,
        error_message: results.whatsapp.error
      })
    }

    if (logs.length > 0) {
      await this.supabase.from('notifications').insert(logs)
    }
  }

  /**
   * Aggiorna stato notifica del booking
   */
  private async updateBookingNotificationStatus(bookingId: string, type: NotificationType) {
    const updates: any = {
      last_notification_sent_at: new Date().toISOString(),
      last_notification_type: type
    }

    if (type === 'reminder_24h' || type === 'reminder_1h') {
      updates.reminder_sent = true
    }

    await this.supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
  }

  /**
   * Ottieni organization_id dell'utente corrente
   */
  private async getOrganizationId(): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: userData } = await this.supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userData?.organization_id) throw new Error('Organization not found')
    return userData.organization_id
  }

  /**
   * Ottieni prenotazioni che necessitano reminder
   */
  async getBookingsNeedingReminders(type: 'reminder_24h' | 'reminder_1h') {
    const now = new Date()
    let targetTime: Date

    if (type === 'reminder_24h') {
      targetTime = addDays(now, 1)
    } else {
      targetTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 ora
    }

    const { data: bookings } = await this.supabase
      .from('bookings')
      .select(`
        id,
        start_at,
        end_at,
        client:clients(id, full_name),
        service:services(id, name, duration_minutes),
        staff:staff(*)
      `)
      .eq('status', 'confirmed')
      .gte('start_at', startOfDay(targetTime).toISOString())
      .lt('start_at', endOfDay(targetTime).toISOString())
      .is('reminder_sent', null)
      .eq('organization_id', await this.getOrganizationId())

    return bookings || []
  }

  /**
   * Invia tutti i reminder per le prenotazioni
   */
  async sendBatchReminders(type: 'reminder_24h' | 'reminder_1h') {
    const bookings = await this.getBookingsNeedingReminders(type)
    const results = []

    for (const booking of bookings) {
      try {
        const notificationData: NotificationData = {
          bookingId: booking.id,
          clientName: booking.client.full_name,
          clientEmail: booking.client.email,
          clientPhone: booking.client.phone,
          serviceName: booking.service.name,
          staffName: booking.staff?.full_name,
          date: format(new Date(booking.start_at), 'EEEE d MMMM', { locale: it }),
          time: format(new Date(booking.start_at), 'HH:mm'),
          duration: booking.service.duration_minutes,
          price: booking.price || booking.service.price,
          organizationName: await this.getOrganizationName(),
          organizationPhone: await this.getOrganizationPhone(),
          notificationPreferences: booking.notification_preferences || {
            email: true,
            sms: true,
            whatsapp: true
          }
        }

        const result = await this.sendNotification(type, notificationData)
        results.push({ bookingId: booking.id, success: true, result })
      } catch (error) {
        console.error(`Error sending reminder for booking ${booking.id}:`, error)
        results.push({ bookingId: booking.id, success: false, error })
      }
    }

    return results
  }

  /**
   * Ottieni nome organizzazione
   */
  private async getOrganizationName(): Promise<string> {
    const orgId = await this.getOrganizationId()
    const { data } = await this.supabase
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single()
    
    return data?.name || 'Beauty Center'
  }

  /**
   * Ottieni telefono organizzazione
   */
  private async getOrganizationPhone(): Promise<string> {
    const orgId = await this.getOrganizationId()
    const { data } = await this.supabase
      .from('organizations')
      .select('phone')
      .eq('id', orgId)
      .single()
    
    return data?.phone || ''
  }
}