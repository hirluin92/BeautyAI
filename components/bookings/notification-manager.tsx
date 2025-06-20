'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, Mail, MessageSquare, Phone, Send, 
  CheckCircle2, XCircle, AlertCircle, Loader2,
  Clock, ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
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

  useEffect(() => {
    fetchNotifications()
  }, [bookingId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/send?bookingId=${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

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
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="actions">Azioni Rapide</TabsTrigger>
          <TabsTrigger value="history">Storico</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          {/* Quick Actions */}
          <div className="grid gap-3">
            {status === 'confirmed' && (
              <>
                <Button
                  onClick={() => sendNotification('confirmation')}
                  disabled={sending !== null}
                  variant="outline"
                  className="justify-start"
                >
                  {sending === 'confirmation' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Invia Conferma
                </Button>
                <Button
                  onClick={() => sendNotification('reminder_24h')}
                  disabled={sending !== null}
                  variant="outline"
                  className="justify-start"
                >
                  {sending === 'reminder_24h' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Clock className="mr-2 h-4 w-4" />
                  )}
                  Invia Promemoria 24h
                </Button>
              </>
            )}
            
            {status === 'cancelled' && (
              <Button
                onClick={() => sendNotification('cancellation')}
                disabled={sending !== null}
                variant="outline"
                className="justify-start text-red-600 hover:text-red-700"
              >
                {sending === 'cancellation' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Notifica Cancellazione
              </Button>
            )}
          </div>

          {/* WhatsApp Quick Links */}
          {clientPhone && notificationPreferences.whatsapp && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Invio Manuale WhatsApp</p>
                <div className="grid gap-2">
                  {status === 'confirmed' && (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        className="justify-between text-green-600 hover:text-green-700"
                      >
                        <a
                          href={createWhatsAppLink('confirmation')}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            WhatsApp Conferma
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="justify-between text-blue-600 hover:text-blue-700"
                      >
                        <a
                          href={createWhatsAppLink('reminder')}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            WhatsApp Promemoria
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </>
                  )}
                  {status === 'cancelled' && (
                    <Button
                      asChild
                      variant="outline"
                      className="justify-between text-red-600 hover:text-red-700"
                    >
                      <a
                        href={createWhatsAppLink('cancellation')}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="flex items-center">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          WhatsApp Cancellazione
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nessuna notifica inviata</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  {notification.type === 'email' && <Mail className="h-4 w-4 text-muted-foreground" />}
                  {notification.type === 'sms' && <Phone className="h-4 w-4 text-muted-foreground" />}
                  {notification.type === 'whatsapp' && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium capitalize">{notification.type}</p>
                    {notification.sent_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notification.sent_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    notification.status === 'sent' ? 'default' :
                    notification.status === 'failed' ? 'destructive' : 'secondary'
                  }
                >
                  {notification.status === 'sent' && 'Inviata'}
                  {notification.status === 'failed' && 'Fallita'}
                  {notification.status === 'pending' && 'In attesa'}
                </Badge>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}