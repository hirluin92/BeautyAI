'use client'
import BookingForm from '@/components/bookings/booking-form'

interface EditBookingClientProps {
  booking: any
  services: any[]
  staff: any[]
  userData: any
}

export default function EditBookingClient({ booking, services, staff, userData }: EditBookingClientProps) {
  if (!booking) return <div>Prenotazione non trovata</div>
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Modifica Prenotazione</h1>
      <BookingForm
        organizationId={userData.organization_id}
        clients={[booking.client]}
        services={services}
        staff={staff}
        booking={booking}
        mode="edit"
      />
    </div>
  )
} 