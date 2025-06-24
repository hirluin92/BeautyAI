'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, DollarSign, Package, Clock, ChevronDown, ChevronUp, TrendingUp, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Booking {
  id: string
  start_at: string
  end_at: string
  price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  client?: {
    id: string
    full_name: string
    phone?: string
  }
  service?: {
    id: string
    name: string
    duration_minutes: number
  }
  staff?: {
    id: string
    full_name: string
  }
}

interface DashboardStatsClientProps {
  organizationId: string
}

interface DashboardStats {
  todayBookings: Booking[]
  totalClients: number
  activeServices: number
  monthlyRevenue: number
  todayRevenue: number
  loading: boolean
}

export default function DashboardStatsClient({ organizationId }: DashboardStatsClientProps) {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: [],
    totalClients: 0,
    activeServices: 0,
    monthlyRevenue: 0,
    todayRevenue: 0,
    loading: true
  })
  
  const [showTodayDetails, setShowTodayDetails] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/dashboard/stats?organizationId=${organizationId}`)
      if (response.ok) {
        const data = await response.json()
        setStats({
          ...data,
          loading: false
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  // Auto-refresh ogni 5 minuti
  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5 * 60 * 1000) // 5 minuti
    return () => clearInterval(interval)
  }, [organizationId])

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStats()
    setRefreshing(false)
  }

  // Calculate stats from today's bookings
  const confirmedBookings = stats.todayBookings.filter(b => b.status === 'confirmed')
  const completedBookings = stats.todayBookings.filter(b => b.status === 'completed')
  const pendingBookings = stats.todayBookings.filter(b => b.status === 'pending')

  // Get next appointment
  const nextAppointment = stats.todayBookings
    .filter(b => new Date(b.start_at) > new Date() && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())[0]

  if (stats.loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Prenotazioni Oggi */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prenotazioni Oggi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {confirmedBookings.length} confermate • {completedBookings.length} completate
            </p>
            {pendingBookings.length > 0 && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {pendingBookings.length} in attesa
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clienti Totali */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clienti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Base clienti registrata
            </p>
          </CardContent>
        </Card>

        {/* Incasso Oggi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incasso Oggi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Da {completedBookings.length} servizi completati
            </p>
          </CardContent>
        </Card>

        {/* Servizi Attivi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servizi Attivi</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeServices}</div>
            <p className="text-xs text-muted-foreground">
              Servizi disponibili per prenotazioni
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prossimo Appuntamento */}
      {nextAppointment && (
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2 text-indigo-600" />
              Prossimo Appuntamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">
                  {new Date(nextAppointment.start_at).toLocaleTimeString('it-IT', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                <p className="text-muted-foreground">
                  {nextAppointment.client?.full_name} • {nextAppointment.service?.name}
                </p>
                {nextAppointment.staff && (
                  <p className="text-sm text-muted-foreground">
                    con {nextAppointment.staff.full_name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">€{nextAppointment.price.toFixed(2)}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  nextAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  nextAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {nextAppointment.status === 'confirmed' ? 'Confermato' :
                   nextAppointment.status === 'pending' ? 'In Attesa' :
                   nextAppointment.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appuntamenti di Oggi - Expandable */}
      {stats.todayBookings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Tutti gli Appuntamenti di Oggi ({stats.todayBookings.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Aggiorna"
                >
                  <TrendingUp className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowTodayDetails(!showTodayDetails)}
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {showTodayDetails ? 'Nascondi' : 'Mostra'}
                  {showTodayDetails ? 
                    <ChevronUp className="h-4 w-4 ml-1" /> : 
                    <ChevronDown className="h-4 w-4 ml-1" />
                  }
                </button>
              </div>
            </div>
          </CardHeader>
          
          {showTodayDetails && (
            <CardContent>
              <div className="space-y-3">
                {stats.todayBookings
                  .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
                  .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="font-mono text-sm font-medium">
                          {new Date(booking.start_at).toLocaleTimeString('it-IT', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.service?.duration_minutes}min
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{booking.client?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{booking.service?.name}</p>
                        {booking.staff && (
                          <p className="text-xs text-muted-foreground">con {booking.staff.full_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">€{booking.price.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status === 'confirmed' ? 'Confermato' :
                         booking.status === 'completed' ? 'Completato' :
                         booking.status === 'pending' ? 'In Attesa' :
                         booking.status === 'cancelled' ? 'Cancellato' :
                         booking.status === 'no_show' ? 'No Show' :
                         booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Monthly Revenue Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Performance Mensile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Incasso Mensile</p>
              <p className="text-2xl font-bold">€{stats.monthlyRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Media Giornaliera</p>
              <p className="text-2xl font-bold">
                €{(stats.monthlyRevenue / new Date().getDate()).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 