// app/(dashboard)/bookings/[id]/page.tsx
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, Calendar, Clock, User, Briefcase, Phone, Mail, 
  MapPin, Euro, FileText, Bell, Sparkles 
} from 'lucide-react'
import BookingActions from '@/components/bookings/booking-actions'
import NotificationManagerRedesigned from '@/components/bookings/notification-manager'

interface PageProps {
  params: Promise<{ id: string }>
}

// Status configuration
const STATUS_CONFIG = {
  scheduled: {
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    label: 'Programmato'
  },
  confirmed: {
    className: 'bg-green-50 text-green-700 border-green-200',
    label: 'Confermato'
  },
  completed: {
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    label: 'Completato'
  },
  cancelled: {
    className: 'bg-red-50 text-red-700 border-red-200',
    label: 'Annullato'
  },
  no_show: {
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    label: 'No Show'
  }
} as const

type BookingStatus = keyof typeof STATUS_CONFIG

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: booking } = await supabase
    .from('bookings')
    .select('client:clients(full_name), service:services(name)')
    .eq('id', id)
    .single()

  if (!booking) {
    return {
      title: 'Prenotazione non trovata | Beauty AI'
    }
  }

  return {
    title: `${booking.client?.full_name || 'Cliente'} - ${booking.service?.name || 'Servizio'} | Beauty AI`,
    description: `Dettagli prenotazione per ${booking.service?.name}`
  }
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params
  
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch booking with all relations
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(*),
      service:services(*)
    `)
    .eq('id', id)
    .single()

  // Handle errors and missing data
  if (error || !booking || !booking.service || !booking.client) {
    notFound()
  }

  // Get status configuration
  const currentStatus = STATUS_CONFIG[booking.status as BookingStatus] || STATUS_CONFIG.scheduled

  // Format dates for display
  const appointmentDate = new Date(booking.start_at)
  const formattedDate = appointmentDate.toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedTime = `${appointmentDate.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  })} - ${new Date(booking.end_at).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  })}`

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Modern Header with gradient */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/calendar">
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Torna al calendario</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Dettagli Prenotazione
                </h1>
                <p className="text-sm text-gray-500">ID: #{id.slice(0, 8)}</p>
              </div>
            </div>
            <Badge className={`${currentStatus.className} px-3 py-1 border`}>
              {currentStatus.label}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Card - Enhanced */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 -m-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-14 w-14 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {booking.client.full_name}
                      </h2>
                      <p className="text-sm text-gray-600">Cliente</p>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent>
                <div className="space-y-3">
                  {booking.client.email && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`mailto:${booking.client.email}`} 
                        className="text-blue-600 hover:underline"
                      >
                        {booking.client.email}
                      </a>
                    </div>
                  )}
                  {booking.client.phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`tel:${booking.client.phone}`} 
                        className="text-blue-600 hover:underline"
                      >
                        {booking.client.phone}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service Details - Enhanced */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <CardTitle>Dettagli Servizio</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Service Info Box */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.service.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Durata: {booking.service.duration_minutes} minuti
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        €{booking.service.price}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-200 my-4" />

                {/* Date and Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data</p>
                      <p className="font-medium">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Orario</p>
                      <p className="font-medium">{formattedTime}</p>
                    </div>
                  </div>
                </div>

                {/* Notes if present */}
                {booking.notes && (
                  <>
                    <div className="h-px bg-gray-200 my-4" />
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <FileText className="h-4 w-4" />
                        <span>Note</span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                        {booking.notes}
                      </p>
                    </div>
                  </>
                )}

                {/* Reminder Status */}
                {booking.reminder_sent && (
                  <>
                    <div className="h-px bg-gray-200 my-4" />
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Bell className="h-4 w-4" />
                      <span>Promemoria inviato</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notification Manager */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <Bell className="h-5 w-5 text-purple-600" />
                  <CardTitle>Gestione Notifiche</CardTitle>
                </div>
                <p className="text-sm text-gray-500">
                  Invia promemoria e notifiche al cliente
                </p>
              </CardHeader>
              <CardContent>
                <NotificationManagerRedesigned
                  bookingId={booking.id}
                  clientName={booking.client.full_name || ''}
                  clientEmail={booking.client.email || undefined}
                  clientPhone={booking.client.phone || undefined}
                  serviceName={booking.service.name || ''}
                  appointmentDate={appointmentDate.toLocaleDateString('it-IT')}
                  appointmentTime={appointmentDate.toLocaleTimeString('it-IT', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                  status={booking.status || 'confirmed'}
                  notificationPreferences={{ email: true, sms: true, whatsapp: true }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <aside className="space-y-6">
            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Azioni Rapide</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Gestisci lo stato dell'appuntamento
                </p>
              </CardHeader>
              <CardContent>
                <BookingActions 
                  bookingId={booking.id} 
                  currentStatus={booking.status || 'scheduled'}
                />
              </CardContent>
            </Card>

            {/* Quick Info Summary */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
              <CardHeader>
                <CardTitle className="text-lg">Riepilogo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Servizio</dt>
                    <dd className="font-medium text-right">{booking.service.name}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Durata</dt>
                    <dd className="font-medium">{booking.service.duration_minutes} min</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Prezzo</dt>
                    <dd className="font-medium">€{booking.service.price}</dd>
                  </div>
                </dl>
                <div className="h-px bg-purple-200 my-3" />
                <div className="flex justify-between">
                  <span className="text-gray-600">Totale</span>
                  <span className="text-lg font-bold text-purple-600">
                    €{booking.service.price}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Hai bisogno di aiuto?
                  </p>
                  <Button variant="link" className="text-purple-600">
                    Contatta il supporto →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}