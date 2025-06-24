'use client'

import BookingForm from '@/components/bookings/booking-form'
import { Database } from '@/types/database'

type Service = Database['public']['Tables']['services']['Row']
type Staff = Database['public']['Tables']['staff']['Row']
type Client = Database['public']['Tables']['clients']['Row']
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

interface NewBookingClientProps {
  services: Service[]
  staff: Staff[]
  clients: Client[]
  userData: UserWithOrganization
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