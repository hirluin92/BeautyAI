'use client'
import NotificationManager from '@/components/bookings/notification-manager'
import BookingActions from '@/components/bookings/booking-actions'
import { Database } from '@/types/database'

type BookingWithRelations = Database['public']['Tables']['bookings']['Row'] & {
  client: Database['public']['Tables']['clients']['Row'] | null
  service: Database['public']['Tables']['services']['Row'] | null
  staff: Database['public']['Tables']['staff']['Row'] | null
  // Extended fields for payment data
  payment_method?: string
  fiscal_document?: string
  actual_amount?: number
  vat_amount?: number
  payment_notes?: string
  completed_at?: string
  duration?: number
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

  const handleStatusChange = (newStatus: string) => {
    // Refresh the page to show updated data
    window.location.reload()
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Dettaglio Prenotazione</h1>
      
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Informazioni Cliente</h2>
            <p><strong>Nome:</strong> {booking.client?.full_name}</p>
            <p><strong>Email:</strong> {booking.client?.email}</p>
            <p><strong>Telefono:</strong> {booking.client?.phone}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Servizio</h2>
            <p><strong>Servizio:</strong> {booking.service?.name}</p>
            <p><strong>Prezzo:</strong> €{booking.service?.price}</p>
            <p><strong>Staff:</strong> {booking.staff?.full_name}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Appuntamento</h2>
            <p><strong>Data:</strong> {formatDate(booking.start_at)}</p>
            <p><strong>Ora:</strong> {formatTime(booking.start_at)}</p>
            <p><strong>Durata:</strong> {booking.duration || 60} minuti</p>
            <p><strong>Stato:</strong> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {booking.status}
              </span>
            </p>
          </div>

          {/* Payment Information for completed bookings */}
          {booking.status === 'completed' && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Pagamento</h2>
              <p><strong>Metodo:</strong> {booking.payment_method || 'Non specificato'}</p>
              <p><strong>Documento fiscale:</strong> {booking.fiscal_document || 'Non specificato'}</p>
              <p><strong>Importo effettivo:</strong> €{booking.actual_amount || booking.service?.price || 0}</p>
              {booking.vat_amount && <p><strong>IVA:</strong> €{booking.vat_amount}</p>}
              {booking.payment_notes && <p><strong>Note:</strong> {booking.payment_notes}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Booking Actions */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Azioni</h2>
        <BookingActions
          bookingId={booking.id}
          currentStatus={booking.status || 'pending'}
          onStatusChange={handleStatusChange}
          bookingPrice={booking.service?.price || 0}
        />
      </div>

      {/* Notification Manager */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Notifiche</h2>
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
    </div>
  )
} 