import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/supabase/requireAuth'
import BookingDetailClient from './BookingDetailClient'
import { DynamicPageProps } from '@/lib/utils'

export default async function BookingDetailPage({ params }: DynamicPageProps<{ id: string }>) {
  const { userData, supabase } = await requireAuth()
  
  // ✅ FIXED: await params per Next.js 15
  const { id } = await params

  // Fetch booking with relations
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(id, full_name, phone, email),
      service:services(id, name, duration_minutes, price),
      staff:staff(id, full_name)
    `)
    .eq('id', id)
    .eq('organization_id', userData.organization_id)
    .single()

  if (bookingError || !booking) {
    notFound()
  }

  return (
    <BookingDetailClient booking={booking} />
  )
}