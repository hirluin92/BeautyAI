import { requireAuth } from '@/lib/supabase/requireAuth'
import RevolutionaryDashboard from '@/components/dashboard/RevolutionaryDashboard'

export default async function RevolutionPage() {
  const { userData, supabase } = await requireAuth()

  // Fetch data for the revolutionary dashboard
  const [bookingsResponse, clientsResponse, servicesResponse, staffResponse] = await Promise.all([
    supabase.from('bookings').select('id, start_at, end_at, status, client:clients(full_name), service:services(name, price)').eq('organization_id', userData.organization_id).order('start_at', { ascending: false }).limit(10),
    supabase.from('clients').select('id, full_name, created_at').eq('organization_id', userData.organization_id).order('created_at', { ascending: false }).limit(5),
    supabase.from('services').select('id, name, price').eq('organization_id', userData.organization_id).eq('is_active', true),
    supabase.from('staff').select('id, full_name').eq('organization_id', userData.organization_id).eq('is_active', true)
  ])

  const dashboardData = {
    userData,
    organizationId: userData.organization_id,
    bookings: bookingsResponse.data || [],
    clients: clientsResponse.data || [],
    services: servicesResponse.data || [],
    staff: staffResponse.data || []
  }

  return <RevolutionaryDashboard data={dashboardData} />
} 