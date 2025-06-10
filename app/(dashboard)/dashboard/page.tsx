import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, Euro, Package, MessageSquare, BarChart3, Settings, LogOut } from 'lucide-react'
import { UserWithOrganization, BookingWithRelations } from '@/types'

async function getStats(organizationId: string) {
  const supabase = await createClient()
  
  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Count bookings for today
  const { count: todayBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('start_at', today.toISOString())
    .lt('start_at', tomorrow.toISOString())

  // Count total clients
  const { count: totalClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  // Count active services
  const { count: activeServices } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('is_active', true)

  // Calculate this month's revenue (simplified)
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const { data: monthlyRevenue } = await supabase
    .from('bookings')
    .select('price')
    .eq('organization_id', organizationId)
    .eq('status', 'completed')
    .gte('start_at', firstDayOfMonth.toISOString())

  const totalRevenue = monthlyRevenue?.reduce((sum, booking) => sum + Number(booking.price), 0) || 0

  return {
    todayBookings: todayBookings || 0,
    totalClients: totalClients || 0,
    activeServices: activeServices || 0,
    monthlyRevenue: totalRevenue
  }
}

export default async function DashboardPage() {
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

  // Type assertion con il nostro tipo custom
  const typedUserData = userData as UserWithOrganization

  // Get stats
  const stats = await getStats(typedUserData.organization_id!)

  // Get recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(full_name),
      service:services(name)
    `)
    .eq('organization_id', typedUserData.organization_id!)
    .order('created_at', { ascending: false })
    .limit(5)

  const typedBookings = recentBookings as BookingWithRelations[] | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Beauty AI</h2>
          <p className="text-sm text-gray-600">{typedUserData.organization?.name}</p>
        </div>
        
        <nav className="mt-8">
          <Link href="/dashboard" className="flex items-center px-6 py-3 bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700">
            <BarChart3 className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/calendar" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            <Calendar className="w-5 h-5 mr-3" />
            Calendario
          </Link>
          <Link href="/clients" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            <Users className="w-5 h-5 mr-3" />
            Clienti
          </Link>
          <Link href="/services" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            <Package className="w-5 h-5 mr-3" />
            Servizi
          </Link>
          <Link href="/chat" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            <MessageSquare className="w-5 h-5 mr-3" />
            Chat WhatsApp
          </Link>
          <Link href="/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            <Settings className="w-5 h-5 mr-3" />
            Impostazioni
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex items-center text-gray-700 hover:text-red-600 w-full">
              <LogOut className="w-5 h-5 mr-3" />
              Esci
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Ciao {typedUserData.full_name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Ecco un riepilogo della tua attività di oggi
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Appuntamenti Oggi</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayBookings}</p>
              </div>
              <div className="bg-indigo-50 rounded-full p-3">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clienti Totali</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
              </div>
              <div className="bg-green-50 rounded-full p-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Servizi Attivi</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeServices}</p>
              </div>
              <div className="bg-purple-50 rounded-full p-3">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ricavi del Mese</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">€{stats.monthlyRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-yellow-50 rounded-full p-3">
                <Euro className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Prenotazioni Recenti</h2>
            </div>
            <div className="p-6">
              {typedBookings && typedBookings.length > 0 ? (
                <div className="space-y-4">
                  {typedBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{booking.client?.full_name}</p>
                        <p className="text-sm text-gray-600">{booking.service?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">€{Number(booking.price).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.start_at).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nessuna prenotazione recente</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Azioni Rapide</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link href="/bookings/new" className="block w-full text-center bg-indigo-600 text-white rounded-md px-4 py-3 hover:bg-indigo-700 transition">
                Nuova Prenotazione
              </Link>
              <Link href="/clients/new" className="block w-full text-center bg-gray-100 text-gray-700 rounded-md px-4 py-3 hover:bg-gray-200 transition">
                Aggiungi Cliente
              </Link>
              <Link href="/services/new" className="block w-full text-center bg-gray-100 text-gray-700 rounded-md px-4 py-3 hover:bg-gray-200 transition">
                Nuovo Servizio
              </Link>
            </div>
          </div>
        </div>

        {/* Plan Info */}
        {typedUserData.organization?.plan_type === 'free' && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Piano Gratuito - {typedUserData.organization?.client_count || 0}/50 clienti
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Stai utilizzando il piano gratuito. Passa a Premium per clienti illimitati e funzionalità avanzate.
                </p>
                <div className="mt-4">
                  <Link href="/settings/billing" className="text-sm font-medium text-yellow-800 hover:text-yellow-900">
                    Passa a Premium →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}