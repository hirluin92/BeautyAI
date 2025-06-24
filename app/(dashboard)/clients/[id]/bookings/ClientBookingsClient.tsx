'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Euro, User, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface Client {
  id: string
  full_name: string
  email?: string
  phone?: string
}

interface Booking {
  id: string
  start_at: string
  end_at: string
  status: string
  price: number
  service?: {
    id: string
    name: string
    price: number
    duration_minutes: number
    category: string
  }
  staff?: {
    id: string
    full_name: string
    role: string
  }
}

interface ClientBookingsClientProps {
  client: Client
  bookings: Booking[]
}

export default function ClientBookingsClient({ client, bookings }: ClientBookingsClientProps) {
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
    total: bookings.length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    noShow: bookings.filter(b => b.status === 'no_show').length,
    totalSpent: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.price || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link href={`/clients/${client.id}`} className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Torna al cliente
              </Link>
            </div>
            <Link 
              href={`/bookings/new?client=${client.id}`}
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
          
          {bookings.length > 0 ? (
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
                  {bookings.map((booking) => (
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
                  href={`/bookings/new?client=${client.id}`}
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