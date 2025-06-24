import { requireAuth } from '@/lib/supabase/requireAuth'
import NewBookingClient from './NewBookingClient'

export default async function NewBookingPage() {
  const { userData, supabase } = await requireAuth()

  // Fetch initial data
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price, category')
    .eq('organization_id', userData.organization_id)
    .eq('is_active', true)
    .order('name')

  const { data: staff } = await supabase
    .from('staff')
    .select('id, full_name')
    .eq('organization_id', userData.organization_id)
    .eq('is_active', true)
    .order('full_name')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, phone, email')
    .eq('organization_id', userData.organization_id)
    .order('full_name')

  return (
    <NewBookingClient
      services={services || []}
      staff={staff || []}
      clients={clients || []}
      userData={userData}
    />
  )
}