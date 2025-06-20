// app/(dashboard)/bookings/new/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UserWithOrganization } from '@/types'
import BookingForm from '@/components/bookings/booking-form'

interface PageProps {
  searchParams: Promise<{ date?: string; time?: string; client?: string; service?: string }>
}

export default async function NewBookingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user data with organization
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    redirect('/login')
  }

  const typedUserData = userData as UserWithOrganization

  // Get clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, phone, email')
    .eq('organization_id', typedUserData.organization_id!)
    .order('full_name')

  // Get active services
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price, category')
    .eq('organization_id', typedUserData.organization_id!)
    .eq('is_active', true)
    .order('category, name')

  // Get staff
  const { data: staff } = await supabase
    .from('users')
    .select('id, full_name, role, email, avatar_url, created_at, is_active, last_login_at, organization_id, phone, updated_at')
    .eq('organization_id', typedUserData.organization_id!)
    .eq('is_active', true)
    .order('full_name')

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link 
            href="/calendar"
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Torna al calendario
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Nuova Prenotazione</h1>
        <p className="text-gray-600 mt-2">
          Crea un nuovo appuntamento per un cliente
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <BookingForm 
          organizationId={typedUserData.organization_id!}
          clients={clients || []}
          services={services || []}
          staff={staff || []}
          defaultDate={params.date}
          defaultTime={params.time}
          defaultClientId={params.client}
          defaultServiceId={params.service}
        />
      </div>
    </>
  )
}