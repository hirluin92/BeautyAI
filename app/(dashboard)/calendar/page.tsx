// app/(dashboard)/calendar/page.tsx - CALENDARIO ORIGINALE COMPLETO
import { requireAuth } from '@/lib/supabase/requireAuth'
import CalendarClient from './calendar-client'

export default async function CalendarPage() {
  const { userData, supabase } = await requireAuth()

  // Fetch initial bookings (current week)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1)
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(id, full_name, phone, email, notification_preferences),
      service:services(id, name, duration_minutes, price),
      staff:staff(id, full_name)
    `)
    .eq('organization_id', userData.organization_id)
    .gte('start_at', startOfWeek.toISOString())
    .lte('start_at', endOfWeek.toISOString())
    .order('start_at')

  const { data: services } = await supabase
    .from('services')
    .select('id, name')
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
    <CalendarClient
      initialData={{
        bookings: bookings || [],
        services: services || [],
        staff: staff || [],
        currentUser: {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name,
          organization_id: userData.organization_id,
          role: userData.role,
          is_active: userData.is_active,
          created_at: (userData as { created_at?: string }).created_at || '',
          updated_at: (userData as { updated_at?: string }).updated_at || '',
          avatar_url: (userData as { avatar_url?: string | null }).avatar_url || null,
          phone: (userData as { phone?: string | null }).phone || null
        },
        organizationId: userData.organization_id
      }}
    />
  )
}