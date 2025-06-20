import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Calendar, Euro, Clock, Tag, Activity } from 'lucide-react'
import { Service, UserWithOrganization, BookingWithRelations } from '@/types'

interface ServiceDetailPageProps {
  params: {
    id: string
  }
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
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

  // Get service data
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
    .eq('organization_id', typedUserData.organization_id!)
    .single()

  if (serviceError || !service) {
    notFound()
  }

  const typedService = service as Service

  // Get service's bookings statistics
  const { data: bookings, count: totalBookings } = await supabase
    .from('bookings')
    .select('*, client:clients(full_name), staff:users(full_name)', { count: 'exact' })
    .eq('service_id', params.id)
    .order('start_at', { ascending: false })
    .limit(10)

  const typedBookings = bookings as BookingWithRelations[] | null

  // Calculate revenue
  const { data: revenueData } = await supabase
    .from('bookings')
    .select('price')
    .eq('service_id', params.id)
    .in('status', ['completed', 'confirmed'])

  const totalRevenue = revenueData?.reduce((sum, booking) => sum + (booking.price || 0), 0) || 0

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}min`
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center mb-4">
            <Link 
              href="/services"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Torna ai servizi
            </Link>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/services/${params.id}/edit`}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifica
            </Link>
            <Link
              href={`/bookings/new?service=${params.id}`}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Prenota Ora
            </Link>
          </div>
        </div>
      </div>

      {/* Service Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{typedService.name}</h1>
                {typedService.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mt-2">
                    <Tag className="w-4 h-4 mr-1" />
                    {typedService.category}
                  </span>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                typedService.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {typedService.is_active ? 'Attivo' : 'Inattivo'}
              </span>
            </div>

            {typedService.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Descrizione</h3>
                <p className="text-gray-600">{typedService.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 mb-1">
                  <Euro className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Prezzo</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">€{typedService.price.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-700 mb-1">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Durata</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(typedService.duration_minutes)}</p>
              </div>
            </div>
          </div>

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
                        <p className="font-medium text-gray-900">{booking.client?.full_name || 'Cliente eliminato'}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(booking.start_at).toLocaleDateString('it-IT')} alle {new Date(booking.start_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">€{Number(booking.price).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 capitalize">{booking.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Nessuna prenotazione per questo servizio</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Prenotazioni Totali</p>
                <p className="text-2xl font-bold text-gray-900">{totalBookings || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fatturato Totale</p>
                <p className="text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Prezzo Medio</p>
                <p className="text-xl font-semibold text-gray-900">€{typedService.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
            <div className="space-y-3">
              <Link
                href={`/bookings/new?service=${params.id}`}
                className="block w-full text-center bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700"
              >
                Nuova Prenotazione
              </Link>
              <Link
                href={`/services/${params.id}/edit`}
                className="block w-full text-center bg-gray-100 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-200"
              >
                Modifica Servizio
              </Link>
              <button
                className="block w-full text-center bg-red-50 text-red-600 rounded-md px-4 py-2 hover:bg-red-100"
                onClick={() => alert('Funzione statistiche avanzate in arrivo!')}
              >
                Visualizza Report
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Activity className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">Suggerimento</p>
                <p className="text-sm text-blue-700 mt-1">
                  Mantieni aggiornati prezzi e durate per garantire una corretta gestione del calendario e dei pagamenti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}