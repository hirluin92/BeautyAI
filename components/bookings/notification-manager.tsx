'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Bell, Mail, MessageSquare, Phone, Send, 
  CheckCircle2, XCircle, AlertCircle, Loader2,
  Clock, ChevronRight
} from 'lucide-react'
import { it } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface NotificationManagerProps {
  bookingId: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  serviceName: string
  appointmentDate: string
  appointmentTime: string
  status: string
  notificationPreferences?: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
}

interface NotificationLog {
  id: string
  type: 'email' | 'sms' | 'whatsapp'
  status: 'sent' | 'failed' | 'pending'
  sent_at: string | null
  error_message: string | null
  created_at: string
}

export default function NotificationManagerRedesigned({
  bookingId,
  clientName,
  clientEmail,
  clientPhone,
  serviceName,
  appointmentDate,
  appointmentTime,
  status,
  notificationPreferences = { email: true, sms: true, whatsapp: true }
}: NotificationManagerProps) {
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<NotificationLog[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications/send?bookingId=${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [bookingId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const sendNotification = async (type: 'confirmation' | 'reminder_24h' | 'reminder_1h' | 'cancellation') => {
    setSending(type)
    setMessage(null)

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, type })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: data.whatsappOnly 
            ? 'Link WhatsApp generato! Usa il pulsante per inviare.' 
            : 'Notifiche inviate con successo!' 
        })
        fetchNotifications()
      } else {
        setMessage({ type: 'error', text: data.error || 'Errore nell\'invio' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore di connessione' })
    } finally {
      setSending(null)
    }
  }

  const createWhatsAppLink = (messageType: 'reminder' | 'confirmation' | 'cancellation') => {
    if (!clientPhone) return ''
    
    const messages = {
      reminder: `⏰ *Promemoria Appuntamento*\n\nCiao ${clientName}!\n\nTi ricordiamo l'appuntamento di domani:\n📅 ${appointmentDate}\n⏰ ${appointmentTime}\n💆 ${serviceName}\n\nA domani! 😊`,
      confirmation: `✅ *Prenotazione Confermata*\n\nCiao ${clientName}! 👋\n\nTi confermiamo la prenotazione:\n📅 ${appointmentDate}\n⏰ ${appointmentTime}\n💆 ${serviceName}\n\nTi aspettiamo!`,
      cancellation: `❌ *Appuntamento Annullato*\n\nCiao ${clientName},\n\nIl tuo appuntamento del ${appointmentDate} alle ${appointmentTime} è stato annullato.\n\n📞 Chiamaci per riprenotare!`
    }
    
    const phone = clientPhone.replace(/[^\d]/g, '').replace(/^0/, '39')
    return `https://wa.me/${phone}?text=${encodeURIComponent(messages[messageType])}`
  }

  const canSendNotification = status === 'confirmed' || status === 'cancelled'

  if (!canSendNotification) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Le notifiche sono disponibili solo per appuntamenti confermati o cancellati
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={cn(
          "flex items-center space-x-3 p-4 rounded-lg border",
          notificationPreferences.email && clientEmail 
            ? "bg-green-50 border-green-200" 
            : "bg-gray-50 border-gray-200"
        )}>
          <Mail className={cn(
            "h-5 w-5",
            notificationPreferences.email && clientEmail ? "text-green-600" : "text-gray-400"
          )} />
          <div className="flex-1">
            <p className="font-medium text-sm">Email</p>
            <p className="text-xs text-muted-foreground">
              {!clientEmail ? 'Non disponibile' : 'Attiva'}
            </p>
          </div>
          {notificationPreferences.email && clientEmail && (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
        </div>

        <div className={cn(
          "flex items-center space-x-3 p-4 rounded-lg border",
          notificationPreferences.whatsapp && clientPhone 
            ? "bg-green-50 border-green-200" 
            : "bg-gray-50 border-gray-200"
        )}>
          <MessageSquare className={cn(
            "h-5 w-5",
            notificationPreferences.whatsapp && clientPhone ? "text-green-600" : "text-gray-400"
          )} />
          <div className="flex-1">
            <p className="font-medium text-sm">WhatsApp</p>
            <p className="text-xs text-muted-foreground">
              {!clientPhone ? 'Non disponibile' : 'Attiva'}
            </p>
          </div>
          {notificationPreferences.whatsapp && clientPhone && (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
        </div>

        <div className={cn(
          "flex items-center space-x-3 p-4 rounded-lg border",
          notificationPreferences.sms && clientPhone 
            ? "bg-green-50 border-green-200" 
            : "bg-gray-50 border-gray-200"
        )}>
          <Phone className={cn(
            "h-5 w-5",
            notificationPreferences.sms && clientPhone ? "text-green-600" : "text-gray-400"
          )} />
          <div className="flex-1">
            <p className="font-medium text-sm">SMS</p>
            <p className="text-xs text-muted-foreground">
              {!clientPhone ? 'Non disponibile' : 'Non configurato'}
            </p>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'error' ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Azioni Rapide</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => sendNotification('confirmation')}
              disabled={sending === 'confirmation'}
              className="flex items-center space-x-2"
              variant="outline"
            >
              {sending === 'confirmation' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Conferma</span>
            </Button>

            <Button
              onClick={() => sendNotification('reminder_24h')}
              disabled={sending === 'reminder_24h'}
              className="flex items-center space-x-2"
              variant="outline"
            >
              {sending === 'reminder_24h' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>Promemoria 24h</span>
            </Button>

            <Button
              onClick={() => sendNotification('reminder_1h')}
              disabled={sending === 'reminder_1h'}
              className="flex items-center space-x-2"
              variant="outline"
            >
              {sending === 'reminder_1h' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>Promemoria 1h</span>
            </Button>

            <Button
              onClick={() => sendNotification('cancellation')}
              disabled={sending === 'cancellation'}
              className="flex items-center space-x-2"
              variant="outline"
            >
              {sending === 'cancellation' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>Cancellazione</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Quick Links */}
      {clientPhone && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>WhatsApp Rapido</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => window.open(createWhatsAppLink('confirmation'), '_blank')}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Conferma</span>
              </Button>

              <Button
                onClick={() => window.open(createWhatsAppLink('reminder'), '_blank')}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Promemoria</span>
              </Button>

              <Button
                onClick={() => window.open(createWhatsAppLink('cancellation'), '_blank')}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Cancellazione</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Cronologia Notifiche</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {notification.type === 'email' && <Mail className="h-4 w-4 text-blue-500" />}
                    {notification.type === 'sms' && <Phone className="h-4 w-4 text-green-500" />}
                    {notification.type === 'whatsapp' && <MessageSquare className="h-4 w-4 text-green-600" />}
                    
                    <div>
                      <p className="font-medium text-sm capitalize">{notification.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString('it-IT')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {notification.status === 'sent' && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Inviato
                      </Badge>
                    )}
                    {notification.status === 'failed' && (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Fallito
                      </Badge>
                    )}
                    {notification.status === 'pending' && (
                      <Badge variant="secondary">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        In attesa
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nessuna notifica inviata</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}