import { requireAuth } from '@/lib/supabase/requireAuth'
import EditBookingClient from './EditBookingClient'

export default async function EditBookingPage({ params }: { params: { id: string } }) {
  const { userData, supabase } = await requireAuth()
  const { id } = params

  // Fetch booking
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(id, full_name, phone),
      service:services(id, name, duration_minutes, price),
      staff:staff(id, full_name)
    `)
    .eq('id', id)
    .eq('organization_id', userData.organization_id)
    .single()

  // Fetch services and staff for select options
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price')
    .eq('organization_id', userData.organization_id)
    .eq('is_active', true)
    .order('name')

  const { data: staff } = await supabase
    .from('staff')
    .select('id, full_name')
    .eq('organization_id', userData.organization_id)
    .eq('is_active', true)
    .order('full_name')

  return (
    <EditBookingClient
      booking={booking}
      services={services || []}
      staff={staff || []}
      userData={userData}
    />
  )
}
