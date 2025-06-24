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
    .select('id, full_name, phone, email, last_booking_date, created_at, notification_preferences')
    .eq('id', id)
    .eq('organization_id', userData.organization_id)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // Fetch bookings for this client
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, start_at, end_at, status, service:services(id, name), staff:staff(id, full_name)')
    .eq('client_id', id)
    .eq('organization_id', userData.organization_id)
    .order('start_at', { ascending: false })

  return (
    <ClientDetailClient client={client} bookings={bookings || []} />
  )
}