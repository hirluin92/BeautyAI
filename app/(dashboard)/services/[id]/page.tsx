import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import ServiceDetailClient from './ServiceDetailClient'

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const { userData, supabase } = await requireAuth()
  const { id } = params

  // Fetch service data
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .eq('organization_id', userData.organization_id)
    .single()

  if (serviceError || !service) {
    notFound()
  }

  // Fetch recent bookings for this service
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, start_at, price, status,
      client:clients(id, full_name)
    `)
    .eq('service_id', id)
    .eq('organization_id', userData.organization_id)
    .order('start_at', { ascending: false })
    .limit(10)

  // Calculate total revenue
  const totalRevenue = bookings?.reduce((sum: number, booking: any) => sum + (booking.price || 0), 0) || 0

  return (
    <ServiceDetailClient 
      service={service} 
      bookings={bookings || []} 
      totalRevenue={totalRevenue}
    />
  )
}