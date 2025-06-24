import { requireAuth } from '@/lib/supabase/requireAuth'
import ClientDetailClient from './ClientDetailClient'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const { userData, supabase } = await requireAuth()
  const { id } = params

  // Fetch client with details
  const { data: client } = await supabase
    .from('clients')
    .select('id, full_name, phone, email, last_booking_date, created_at, notification_preferences')
    .eq('id', id)
    .eq('organization_id', userData.organization_id)
    .single()

  // Fetch bookings for this client
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, start_at, end_at, status, service:services(id, name), staff:staff(id, full_name)')
    .eq('client_id', id)
    .eq('organization_id', userData.organization_id)
    .order('start_at', { ascending: false })

  return (
    <ClientDetailClient client={client} bookings={bookings || []} userData={userData} />
  )
}