// app/(dashboard)/dashboard/page.tsx - Con Debugging Migliorato
import { requireAuth } from '@/lib/supabase/requireAuth'
import { 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Euro,
  Sparkles,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react'

export default async function DashboardPage() {
  const { userData, supabase } = await requireAuth()

  console.log('🔍 User Data:', {
    userId: userData.id,
    organizationId: userData.organization_id,
    role: userData.role
  })

  // 📊 DATI REALI - Statistiche oggi
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

  console.log('📅 Date Range:', {
    today: today.toISOString(),
    startOfDay: startOfDay.toISOString(),
    endOfDay: endOfDay.toISOString()
  })

  // Prenotazioni di oggi - Con debugging migliorato e relazione staff corretta
  const { data: todayBookings, error: todayError } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(full_name, phone, email),
      service:services(name, price, duration_minutes),
      staff:staff(full_name, email)
    `)
    .eq('organization_id', userData.organization_id)
    .gte('start_at', startOfDay.toISOString())
    .lte('start_at', endOfDay.toISOString())
    .order('start_at', { ascending: true })

  if (todayError) {
    console.error('❌ Error fetching today bookings:', {
      error: todayError,
      message: todayError.message,
      details: todayError.details,
      hint: todayError.hint,
      code: todayError.code
    })
  }

  console.log('📋 Today Bookings Result:', {
    count: todayBookings?.length || 0,
    data: todayBookings?.slice(0, 2) || [] // Log first 2 for debugging
  })

  // Statistiche generali - Con error handling
  const { count: totalClients, error: clientsError } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', userData.organization_id)

  if (clientsError) {
    console.error('❌ Error fetching clients count:', clientsError)
  }

  const { count: totalServices, error: servicesError } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', userData.organization_id)
    .eq('is_active', true)

  if (servicesError) {
    console.error('❌ Error fetching services count:', servicesError)
  }

  const { count: totalStaff, error: staffError } = await supabase
    .from('staff')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', userData.organization_id)
    .eq('is_active', true)

  if (staffError) {
    console.error('❌ Error fetching staff count:', staffError)
  }

  // Prenotazioni della settimana per calcolare ricavi
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // Domenica
  startOfWeek.setHours(0, 0, 0, 0)

  const { data: weekBookings, error: weekError } = await supabase
    .from('bookings')
    .select('price, status')
    .eq('organization_id', userData.organization_id)
    .gte('start_at', startOfWeek.toISOString())
    .in('status', ['confirmed', 'completed'])

  if (weekError) {
    console.error('❌ Error fetching week bookings:', weekError)
  }

  // Prenotazioni del mese scorso per confronto
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)

  const { count: lastMonthBookings, error: lastMonthError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', userData.organization_id)
    .gte('start_at', lastMonth.toISOString())
    .lte('start_at', endOfLastMonth.toISOString())

  if (lastMonthError) {
    console.error('❌ Error fetching last month bookings:', lastMonthError)
  }

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const { count: thisMonthBookings, error: thisMonthError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', userData.organization_id)
    .gte('start_at', thisMonth.toISOString())

  if (thisMonthError) {
    console.error('❌ Error fetching this month bookings:', thisMonthError)
  }

  // Calcoli statistiche - Con fallback sicuri
  const todayBookingsCount = todayBookings?.length || 0
  const weekRevenue = weekBookings?.reduce((sum, booking) => sum + (booking.price || 0), 0) || 0
  const monthlyGrowth = lastMonthBookings && thisMonthBookings 
    ? Math.round(((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100)
    : 0

  // Conteggi per status - Con controlli di sicurezza
  const pendingBookings = todayBookings?.filter(b => b.status === 'pending').length || 0
  const confirmedBookings = todayBookings?.filter(b => b.status === 'confirmed').length || 0
  const completedBookings = todayBookings?.filter(b => b.status === 'completed').length || 0

  // Prossime prenotazioni (prossime 5)
  const nextBookings = todayBookings?.slice(0, 5) || []

  console.log('📊 Final Stats:', {
    todayBookingsCount,
    weekRevenue,
    monthlyGrowth,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    totalClients,
    totalServices,
    totalStaff
  })

  return (
    <div className="space-y-8">
      {/* Debug Info - Solo in development */}
      {process.env.NODE_ENV === 'development' && todayError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <h3 className="text-red-300 font-bold mb-2">⚠️ Debug Info</h3>
          <pre className="text-red-200 text-sm overflow-auto">
            {JSON.stringify({ todayError, userData: { id: userData.id, organization_id: userData.organization_id } }, null, 2)}
          </pre>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Benvenuto, {userData.full_name}! 👋
          </h1>
          <p className="text-white/70">
            Ecco la situazione di <strong>{userData.organization.name}</strong> oggi
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3">
          <a 
            href="/bookings/new"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Nuova Prenotazione
          </a>
          <a 
            href="/clients/new"
            className="px-4 py-2 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Nuovo Cliente
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Bookings */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Prenotazioni Oggi</p>
              <p className="text-3xl font-bold text-white mt-1">{todayBookingsCount}</p>
              {/* Indicatore errore */}
              {todayError && (
                <p className="text-red-400 text-xs mt-1">⚠️ Errore caricamento</p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {pendingBookings > 0 && (
              <div className="flex items-center gap-1 text-yellow-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{pendingBookings} in attesa</span>
              </div>
            )}
            {pendingBookings === 0 && !todayError && (
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Tutto confermato</span>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Revenue */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Ricavi Settimana</p>
              <p className="text-3xl font-bold text-white mt-1">€{weekRevenue.toFixed(0)}</p>
              {weekError && (
                <p className="text-red-400 text-xs mt-1">⚠️ Errore caricamento</p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Euro className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {monthlyGrowth > 0 ? (
              <div className="flex items-center gap-1 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">+{monthlyGrowth}%</span>
              </div>
            ) : monthlyGrowth < 0 ? (
              <div className="flex items-center gap-1 text-red-400">
                <TrendingUp className="w-4 h-4 rotate-180" />
                <span className="text-sm font-medium">{monthlyGrowth}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-white/60">
                <span className="text-sm font-medium">Stabile</span>
              </div>
            )}
            <span className="text-white/60 text-sm">vs mese scorso</span>
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Clienti Totali</p>
              <p className="text-3xl font-bold text-white mt-1">{totalClients || 0}</p>
              {clientsError && (
                <p className="text-red-400 text-xs mt-1">⚠️ Errore caricamento</p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1 text-blue-400">
              <UserCheck className="w-4 h-4" />
              <span className="text-sm font-medium">{totalServices || 0} servizi</span>
            </div>
          </div>
        </div>

        {/* Team Status */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-6 border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-medium">Team Attivo</p>
              <p className="text-3xl font-bold text-white mt-1">{totalStaff || 1}</p>
              {staffError && (
                <p className="text-red-400 text-xs mt-1">⚠️ Errore caricamento</p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-indigo-200 text-sm">
              {userData.role === 'owner' ? 'Tu sei il proprietario' : `Ruolo: ${userData.role}`}
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Bookings */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Prenotazioni di Oggi ({todayBookingsCount})
              </h2>
              <a 
                href="/bookings"
                className="text-purple-300 hover:text-purple-200 text-sm font-medium"
              >
                Vedi tutte
              </a>
            </div>
            
            {todayError ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-300 mb-2">Errore nel caricamento delle prenotazioni</p>
                <p className="text-white/60 text-sm">Controlla la console per maggiori dettagli</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Riprova
                </button>
              </div>
            ) : nextBookings.length > 0 ? (
              <div className="space-y-4">
                {nextBookings.map((booking) => {
                  const startTime = new Date(booking.start_at).toLocaleTimeString('it-IT', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                  
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {booking.client?.full_name?.split(' ').map(n => n[0]).join('') || 'N/A'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{booking.client?.full_name || 'Cliente sconosciuto'}</p>
                          <p className="text-white/60 text-sm">{booking.service?.name || 'Servizio non specificato'}</p>
                          {booking.staff && (
                            <p className="text-white/50 text-xs">Con: {booking.staff.full_name}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white font-medium">{startTime}</p>
                          <p className="text-white/60 text-sm">€{booking.price || 0}</p>
                        </div>
                        
                        <div className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300' : ''}
                          ${booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                          ${booking.status === 'completed' ? 'bg-blue-500/20 text-blue-300' : ''}
                          ${booking.status === 'cancelled' ? 'bg-red-500/20 text-red-300' : ''}
                        `}>
                          {booking.status === 'confirmed' && 'Confermata'}
                          {booking.status === 'pending' && 'In attesa'}
                          {booking.status === 'completed' && 'Completata'}
                          {booking.status === 'cancelled' && 'Cancellata'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">Nessuna prenotazione per oggi</p>
                <a 
                  href="/bookings/new"
                  className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Crea la prima prenotazione
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Stato Prenotazioni</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-white/80">In attesa</span>
                </div>
                <span className="text-white font-medium">{pendingBookings}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white/80">Confermati</span>
                </div>
                <span className="text-white font-medium">{confirmedBookings}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-white/80">Completati</span>
                </div>
                <span className="text-white font-medium">{completedBookings}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Azioni Rapide</h3>
            
            <div className="space-y-3">
              <a 
                href="/calendar"
                className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              >
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-white">Apri Calendario</span>
              </a>
              
              <a 
                href="/clients"
                className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              >
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-white">Gestisci Clienti</span>
              </a>
              
              <a 
                href="/services"
                className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-white">Gestisci Servizi</span>
              </a>
            </div>
          </div>

          {/* Organization Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">La Tua Attività</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-white/60 text-sm">Nome</p>
                <p className="text-white font-medium">{userData.organization.name}</p>
              </div>
              
              <div>
                <p className="text-white/60 text-sm">Piano</p>
                <p className="text-white font-medium capitalize">{userData.organization.plan_type}</p>
              </div>
              
              <div>
                <p className="text-white/60 text-sm">Il tuo ruolo</p>
                <p className="text-white font-medium capitalize">{userData.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}