'use client'

import BookingForm from '@/components/bookings/booking-form'
import { Database } from '@/types/database'

type PartialService = Pick<Database['public']['Tables']['services']['Row'], 'id' | 'name' | 'duration_minutes' | 'price' | 'category'>
type PartialStaff = Pick<Database['public']['Tables']['staff']['Row'], 'id' | 'full_name'>
type PartialClient = Pick<Database['public']['Tables']['clients']['Row'], 'id' | 'full_name' | 'phone' | 'email'>
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
  services: PartialService[]
  staff: PartialStaff[]
  clients: PartialClient[]
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