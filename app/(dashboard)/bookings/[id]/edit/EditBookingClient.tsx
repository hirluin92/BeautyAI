'use client'
import BookingForm from '@/components/bookings/booking-form'
import { Database } from '@/types/database'

type BookingWithRelations = Database['public']['Tables']['bookings']['Row'] & {
  client: Database['public']['Tables']['clients']['Row'] | null
  service: Database['public']['Tables']['services']['Row'] | null
  staff: Database['public']['Tables']['staff']['Row'] | null
}

type PartialService = Pick<Database['public']['Tables']['services']['Row'], 'id' | 'name' | 'duration_minutes' | 'price' | 'category'>
type PartialStaff = Pick<Database['public']['Tables']['staff']['Row'], 'id' | 'full_name'>
type UserWithOrganization = {
  id: string
  email: string
  full_name: string
  organization_id: string
  role: 'owner' | 'staff' | 'admin'
  is_active: boolean
  organization: {
    id: string
    name: string
    slug: string
    plan_type: string
  }
}

interface EditBookingClientProps {
  booking: BookingWithRelations
  services: PartialService[]
  staff: PartialStaff[]
  userData: UserWithOrganization
}

export default function EditBookingClient({ booking, services, staff, userData }: EditBookingClientProps) {
  if (!booking) return <div>Prenotazione non trovata</div>
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Modifica Prenotazione</h1>
      <BookingForm
        organizationId={userData.organization_id}
        clients={booking.client ? [booking.client] : []}
        services={services}
        staff={staff}
        booking={booking}
        mode="edit"
      />
    </div>
  )
} 