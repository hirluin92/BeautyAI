'use client'
import NotificationManager from '@/components/bookings/notification-manager'
import { Database } from '@/types/database'

type BookingWithRelations = Database['public']['Tables']['bookings']['Row'] & {
  client: Database['public']['Tables']['clients']['Row'] | null
  service: Database['public']['Tables']['services']['Row'] | null
  staff: Database['public']['Tables']['staff']['Row'] | null
}

interface BookingDetailClientProps {
  booking: BookingWithRelations
}

export default function BookingDetailClient({ booking }: BookingDetailClientProps) {
  if (!booking) return <div>Prenotazione non trovata</div>
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Dettaglio Prenotazione</h1>
      <div>
        <div>Cliente: {booking.client?.full_name}</div>
        <div>Servizio: {booking.service?.name}</div>
        <div>Staff: {booking.staff?.full_name}</div>
        {/* ...altri dettagli */}
      </div>
      <NotificationManager 
        bookingId={booking.id}
        clientName={booking.client?.full_name || ''}
        clientEmail={booking.client?.email || undefined}
        clientPhone={booking.client?.phone || undefined}
        serviceName={booking.service?.name || ''}
        appointmentDate={formatDate(booking.start_at)}
        appointmentTime={formatTime(booking.start_at)}
        status={booking.status || 'pending'}
      />
    </div>
  )
} 