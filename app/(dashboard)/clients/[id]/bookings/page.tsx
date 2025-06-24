import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import ClientBookingsClient from './ClientBookingsClient'
import { DynamicPageProps } from '@/lib/utils'

export default async function ClientBookingsPage({ params }: DynamicPageProps<{ id: string }>) {
  const { userData, supabase } = await requireAuth()
  
  // ✅ FIXED: await params per Next.js 15
  const { id } = await params

  // Get client data
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('organization_id', userData.organization_id)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // Get client's bookings with related data
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services(id, name, price, duration_minutes, category),
      staff:staff(id, full_name, role)
    `)
    .eq('client_id', id)
    .eq('organization_id', userData.organization_id)
    .order('start_at', { ascending: false })

  if (bookingsError) {
    throw new Error('Errore nel caricamento delle prenotazioni')
  }

  return (
    <ClientBookingsClient 
      client={client} 
      bookings={bookings || []} 
    />
  )
}