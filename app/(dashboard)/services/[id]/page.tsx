import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import ServiceDetailClient from './ServiceDetailClient'
import { DynamicPageProps } from '@/lib/utils'

interface ServiceBooking {
  id: string
  start_at: string
  price?: number
  status: string
  client: {
    id: string
    full_name: string
  }[]
}

export default async function ServiceDetailPage({ params }: DynamicPageProps<{ id: string }>) {
  const { userData, supabase } = await requireAuth()
  
  // ✅ FIXED: await params per Next.js 15
  const { id } = await params

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
  const totalRevenue = bookings?.reduce((sum: number, booking: ServiceBooking) => sum + (booking.price || 0), 0) || 0

  return (
    <ServiceDetailClient 
      service={service} 
      bookings={bookings as any || []} 
      totalRevenue={totalRevenue}
    />
  )
}