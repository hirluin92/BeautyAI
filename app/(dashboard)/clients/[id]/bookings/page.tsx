import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Euro, User, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { UserWithOrganization } from '@/types'

interface ClientBookingsPageProps {
  params: {
    id: string
  }
}

export default async function ClientBookingsPage({ params }: ClientBookingsPageProps) {
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

  // Get client data
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('organization_id', typedUserData.organization_id!)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // Get client's bookings with related data
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services(id, name, price, duration_minutes, category),
      staff:users!bookings_staff_id_fkey(id, full_name, role)
    `)
    .eq('client_id', params.id)
    .eq('organization_id', typedUserData.organization_id!)
    .order('start_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'no_show': return <XCircle className="w-4 h-4 text-gray-600" />
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confermato'
      case 'pending': return 'In attesa'
      case 'cancelled': return 'Cancellato'
      case 'completed': return 'Completato'
      case 'no_show': return 'No show'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate statistics
  const stats = {
    total: bookings?.length || 0,
    completed: bookings?.filter(b => b.status === 'completed').length || 0,
    cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
    noShow: bookings?.filter(b => b.status === 'no_show').length || 0,
    totalSpent: bookings?.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.price || 0), 0) || 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Same as other pages */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Beauty AI</h2>
          <p className="text-sm text-gray-600">{typedUserData.organization?.name}</p>
        </div>
        
        <nav className="mt-8">
          <Link href="/dashboard" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            Dashboard
          </Link>
          <Link href="/calendar" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            Calendario
          </Link>
          <Link href="/clients" className="flex items-center px-6 py-3 bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700">
            <span className="mr-3">👥</span>
            Clienti
          </Link>
          <Link href="/services" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50">
            Servizi
          </Link>
        </nav>
      </aside>

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link href={`/clients/${params.id}`} className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Torna al cliente
              </Link>
            </div>
            <Link 
              href={`/bookings/new?client=${params.id}`}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Nuova Prenotazione
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Storico Appuntamenti - {client.full_name}
          </h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Totale Appuntamenti</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Completati</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Cancellati</div>
            <div className="mt-2 text-3xl font-bold text-red-600">{stats.cancelled}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">No Show</div>
            <div className="mt-2 text-3xl font-bold text-gray-600">{stats.noShow}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Totale Speso</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">€{stats.totalSpent}</div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lista Appuntamenti</h2>
          </div>
          
          {bookings && bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data e Ora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servizio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operatore
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durata
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prezzo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {format(new Date(booking.start_at), 'dd MMM yyyy', { locale: it })}
                            <span className="text-gray-500 ml-2">
                              {format(new Date(booking.start_at), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.service?.name || 'Servizio eliminato'}
                            </div>
                            {booking.service?.category && (
                              <div className="text-xs text-gray-500">
                                {booking.service.category}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {booking.staff?.full_name || 'Non assegnato'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {booking.service?.duration_minutes || '-'} min
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(booking.status)}
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Euro className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {booking.price || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link 
                          href={`/bookings/${booking.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Dettagli
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun appuntamento</h3>
              <p className="mt-1 text-sm text-gray-500">
                Questo cliente non ha ancora appuntamenti registrati.
              </p>
              <div className="mt-6">
                <Link
                  href={`/bookings/new?client=${params.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Crea Primo Appuntamento
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}