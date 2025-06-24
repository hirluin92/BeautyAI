'use client'

import BookingForm from '@/components/bookings/booking-form'

interface NewBookingClientProps {
  services: any[]
  staff: any[]
  clients: any[]
  userData: any
}

export default function NewBookingClient({ services, staff, clients, userData }: NewBookingClientProps) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Nuova Prenotazione</h1>
      <BookingForm
        organizationId={userData.organization_id}
        clients={clients}
        services={services}
        staff={staff}
      />
    </div>
  )
} 