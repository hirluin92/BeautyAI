// hooks/use-notifications.ts
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { sendBookingConfirmation, sendBookingReminder, sendBookingCancellation } from '@/lib/notifications/email'

interface NotificationOptions {
  email?: boolean
  sms?: boolean
  whatsapp?: boolean
}

export function useNotifications() {
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  const sendBookingNotification = async (
    bookingId: string,
    type: 'confirmation' | 'reminder' | 'cancellation',
    options: NotificationOptions = { email: true }
  ) => {
    setSending(true)

    try {
      // Fetch booking details
      const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:clients(*),
          service:services(*)
        `)
        .eq('id', bookingId)
        .single()

      if (error || !booking) throw new Error('Booking not found')

      const bookingData = {
        clientEmail: booking.client.email,
        clientName: booking.client.full_name,
        serviceName: booking.service.name,
        date: new Date(booking.start_at).toLocaleDateString('it-IT'),
        time: new Date(booking.start_at).toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        duration: booking.service.duration_minutes
      }

      // Send email notification
      if (options.email && booking.client.email) {
        let emailResult
        
        switch (type) {
          case 'confirmation':
            emailResult = await sendBookingConfirmation(bookingData)
            break
          case 'reminder':
            emailResult = await sendBookingReminder(bookingData)
            break
          case 'cancellation':
            emailResult = await sendBookingCancellation(bookingData)
            break
        }

        if (!emailResult?.success) {
          throw new Error(emailResult?.error || 'Failed to send email')
        }

        // Log notification
        await supabase.from('notification_logs').insert({
          booking_id: bookingId,
          client_id: booking.client_id,
          type: 'email',
          status: 'sent',
          message: `${type} notification sent`,
          sent_at: new Date().toISOString()
        })
      }

      // Update booking if confirmation
      if (type === 'confirmation') {
        await supabase
          .from('bookings')
          .update({ confirmation_sent_at: new Date().toISOString() })
          .eq('id', bookingId)
      }

      toast.success('Notifica inviata', {
        description: `${type === 'confirmation' ? 'Conferma' : type === 'reminder' ? 'Promemoria' : 'Annullamento'} inviato con successo`
      })

      return { success: true }
    } catch (error: any) {
      console.error('Notification error:', error)
      toast.error('Errore invio notifica', {
        description: error.message || 'Si è verificato un errore'
      })
      return { success: false, error: error.message }
    } finally {
      setSending(false)
    }
  }

  const testNotifications = async () => {
    try {
      // Test edge functions
      const response = await fetch('/api/test-notifications', {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Test failed')
      
      toast.success('Test completato', {
        description: 'Le notifiche sono configurate correttamente'
      })
    } catch (error) {
      toast.error('Test fallito', {
        description: 'Controlla la configurazione delle notifiche'
      })
    }
  }

  return {
    sendBookingNotification,
    testNotifications,
    sending
  }
}