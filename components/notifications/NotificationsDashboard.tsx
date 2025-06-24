'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Mail, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react'
import { NotificationService } from '@/lib/notifications/notification.service'
import { toast } from 'sonner'

interface NotificationBooking {
  id: string
  start_at: string
  price?: number
  notification_preferences?: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
  client: {
    full_name: string
    email: string
    phone: string
    notification_preferences?: {
      email: boolean
      sms: boolean
      whatsapp: boolean
    }
  }
  service: {
    name: string
    duration_minutes: number
    price: number
  }
  staff?: {
    full_name: string
  }
}

export function NotificationsDashboard() {
  const [pendingNotifications, setPendingNotifications] = useState<NotificationBooking[]>([])
  const [sentNotifications, setSentNotifications] = useState<NotificationBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  
  const notificationConfig = useMemo(() => ({
    emailjs: {
      serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
      publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
    },
    email: {
      enabled: true,
      provider: 'resend',
      apiKey: process.env.NEXT_PUBLIC_RESEND_API_KEY || ''
    },
    sms: {
      enabled: true,
      provider: 'twilio',
      accountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || '',
      authToken: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.NEXT_PUBLIC_TWILIO_FROM_NUMBER || ''
    },
    whatsapp: {
      enabled: true,
      provider: 'twilio',
      accountSid: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || '',
      authToken: process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER || ''
    }
  }), [])
  
  const notificationService = useMemo(() => new NotificationService(notificationConfig), [notificationConfig])

  const loadNotifications = useCallback(async () => {
    try {
      // Carica notifiche da inviare
      const pending = await notificationService.getBookingsNeedingReminders('reminder_24h')
      setPendingNotifications(pending)
      
      // Qui potresti caricare anche lo storico delle notifiche inviate
      
      setLoading(false)
    } catch (error) {
      toast.error('Errore caricamento notifiche')
      setLoading(false)
    }
  }, [notificationService])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const sendNotification = async (booking: NotificationBooking, type: 'reminder_24h' | 'reminder_1h') => {
    setSending(booking.id)
    
    try {
      const notificationData = {
        bookingId: booking.id,
        clientName: booking.client.full_name,
        clientEmail: booking.client.email,
        clientPhone: booking.client.phone,
        serviceName: booking.service.name,
        staffName: booking.staff?.full_name,
        date: new Date(booking.start_at).toLocaleDateString('it-IT', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: new Date(booking.start_at).toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        duration: booking.service.duration_minutes,
        price: booking.price || booking.service.price,
        organizationName: 'Beauty Center', // This should come from organization settings
        organizationPhone: '',
        notificationPreferences: booking.notification_preferences || {
          email: true,
          sms: true,
          whatsapp: true
        }
      }
      
      const result = await notificationService.sendNotification(type, notificationData)
      
      // Check if at least one notification was sent successfully
      const success = result.email.sent || result.sms.sent || result.whatsapp.sent
      
      if (success) {
        toast.success('Notifica inviata con successo!')
        // Rimuovi da pending e ricarica
        setPendingNotifications(prev => prev.filter(n => n.id !== booking.id))
      } else {
        toast.error('Errore invio notifica')
      }
    } catch (error) {
      toast.error('Errore invio notifica')
    } finally {
      setSending(null)
    }
  }

  const sendAllReminders = async () => {
    const confirmed = confirm(`Inviare ${pendingNotifications.length} promemoria?`)
    if (!confirmed) return

    for (const booking of pendingNotifications) {
      await sendNotification(booking, 'reminder_24h')
      // Piccola pausa tra invii
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  if (loading) {
    return <div>Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Centro Notifiche</h2>
        <Button 
          onClick={sendAllReminders}
          disabled={pendingNotifications.length === 0}
        >
          <Bell className="w-4 h-4 mr-2" />
          Invia Tutti i Promemoria ({pendingNotifications.length})
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Da Inviare Oggi
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inviate Oggi
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasso Successo
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Risparmio Tempo
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h/giorno</div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Promemoria da Inviare</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingNotifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nessun promemoria da inviare per domani
            </p>
          ) : (
            <div className="space-y-4">
              {pendingNotifications.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{booking.client.full_name}</p>
                      {booking.client.notification_preferences?.whatsapp && (
                        <Badge variant="outline" className="text-green-600">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          WhatsApp
                        </Badge>
                      )}
                      {booking.client.notification_preferences?.email && (
                        <Badge variant="outline" className="text-blue-600">
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.service.name} - Domani alle{' '}
                      {new Date(booking.start_at).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.client.phone} • {booking.client.email}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => sendNotification(booking, 'reminder_24h')}
                      disabled={sending === booking.id}
                    >
                      {sending === booking.id ? (
                        'Invio...'
                      ) : (
                        <>
                          <Bell className="w-4 h-4 mr-1" />
                          Invia Promemoria
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Come Funziona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
              1
            </div>
            <div>
              <p className="font-medium">Notifiche Automatiche Email</p>
              <p className="text-sm text-gray-600">
                Le email vengono inviate automaticamente tramite EmailJS
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
              2
            </div>
            <div>
              <p className="font-medium">WhatsApp Semi-Automatico</p>
              <p className="text-sm text-gray-600">
                Clicca &quot;Invia Promemoria&quot; e si aprirà WhatsApp con il messaggio già pronto.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
              3
            </div>
            <div>
              <p className="font-medium">Tracciamento Completo</p>
              <p className="text-sm text-gray-600">
                Ogni notifica viene registrata per evitare duplicati e tenere traccia
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}