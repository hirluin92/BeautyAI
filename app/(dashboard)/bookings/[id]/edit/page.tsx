// app/(dashboard)/bookings/[id]/edit/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import BookingForm from '@/components/bookings/booking-form'
import { UserWithOrganization } from '@/types'

export default async function EditBookingPage({ params }: { params: { id: string } }) {
  const bookingId = params.id
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()

  if (userError || !userData) redirect('/login')
  const typedUser = userData as UserWithOrganization

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('organization_id', typedUser.organization_id!)
    .single()

  if (bookingError || !booking) notFound()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, phone, email')
    .eq('organization_id', typedUser.organization_id!)
    .order('full_name')

  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price, category')
    .eq('organization_id', typedUser.organization_id!)
    .eq('is_active', true)
    .order('category, name')

  const { data: staff } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('organization_id', typedUser.organization_id!)
    .eq('is_active', true)
    .order('full_name')

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Modifica Prenotazione</h1>
      </div>
      {/* Form */}
      <div className="max-w-2xl">
        <BookingForm
          mode="edit"
          bookingId={bookingId}
          organizationId={typedUser.organization_id!}
          clients={clients || []}
          services={services || []}
          staff={staff?.map(user => ({
            id: user.id,
            full_name: user.full_name,
            role: user.role,
            email: '',
            avatar_url: null,
            created_at: null,
            is_active: true,
            last_login_at: null,
            organization_id: typedUser.organization_id,
            phone: null,
            updated_at: null
          })) || []}
        />
      </div>
    </>
  )
}
