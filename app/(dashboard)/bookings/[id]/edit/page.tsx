import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import EditBookingClient from './EditBookingClient'
import { DynamicPageProps } from '@/lib/utils'

export default async function EditBookingPage({ params }: DynamicPageProps<{ id: string }>) {
  const { userData, supabase } = await requireAuth()
  
  // ✅ FIXED: await params per Next.js 15
  const { id } = await params

  // Fetch booking
  const { data: booking, error: bookingError } = await supabase
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

  if (bookingError || !booking) {
    notFound()
  }

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
