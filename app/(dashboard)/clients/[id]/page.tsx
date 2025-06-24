import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import ClientDetailClient from './ClientDetailClient'
import { ClientDetailPageProps } from '@/lib/utils'

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { userData, supabase } = await requireAuth()
  
  // ✅ FIXED: await params per Next.js 15
  const { id } = await params

  // Fetch client with details
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, organization_id, full_name, email, phone, whatsapp_phone, birth_date, notes, tags, is_active, created_at, updated_at, last_booking_date, notification_preferences')
    .eq('id', id)
    .eq('organization_id', userData.organization_id)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // Fetch bookings for this client
  const { data: bookingsRaw } = await supabase
    .from('bookings')
    .select('id, start_at, end_at, status, service:services(id, name), staff:staff(id, full_name)')
    .eq('client_id', id)
    .eq('organization_id', userData.organization_id)
    .order('start_at', { ascending: false })

  // Ensure service and staff are single objects, not arrays
  const bookings = (bookingsRaw || []).map((b: any) => ({
    ...b,
    service: Array.isArray(b.service) ? b.service[0] : b.service,
    staff: Array.isArray(b.staff) ? b.staff[0] : b.staff,
  }))

  return (
    <ClientDetailClient client={client} bookings={bookings || []} />
  )
}