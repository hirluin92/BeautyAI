'use client'

import Link from 'next/link'
import { ArrowLeft, Edit, Calendar, Phone, Mail, MessageSquare, Euro, Clock, Tag } from 'lucide-react'
import { Client, UserWithOrganization, BookingWithRelations } from '@/types'
import ClientQuickActions from '@/components/clients/client-quick-actions'

interface ClientDetailClientProps {
  client: any
  bookings: any[]
  userData: any
}

export default function ClientDetailClient({ client, bookings, userData }: ClientDetailClientProps) {
  if (!client) {
    return <div>Cliente non trovato</div>
  }

  // Calculate stats
  const totalBookings = client.visit_count || 0
  const totalSpent = Number(client.total_spent || 0)
  const avgSpent = totalBookings > 0 ? totalSpent / totalBookings : 0

  const formatPhone = (phone: string) => {
    if (phone.startsWith('+39')) {
      return phone.replace('+39', '+39 ').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
    }
    return phone
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'no_show':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confermato'
      case 'pending':
        return 'In attesa'
      case 'cancelled':
        return 'Cancellato'
      case 'completed':
        return 'Completato'
      case 'no_show':
        return 'Non presentato'
      default:
        return status
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link 
              href="/clients"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Torna ai clienti
            </Link>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/clients/${client.id}/edit`}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifica
            </Link>
            <Link
              href={`/bookings/new?client=${client.id}`}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Nuova Prenotazione
            </Link>
          </div>
        </div>
      </div>

      {/* Client Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <span className="text-indigo-600 font-bold text-xl">
                    {client.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{client.full_name}</h1>
                  <p className="text-gray-600">Cliente dal {formatDate(client.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Telefono</p>
                    <a href={`tel:${client.phone}`} className="text-gray-900 hover:text-indigo-600">
                      {formatPhone(client.phone)}
                    </a>
                  </div>
                </div>

                {client.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a href={`mailto:${client.email}`} className="text-gray-900 hover:text-indigo-600">
                        {client.email}
                      </a>
                    </div>
                  </div>
                )}

                {client.whatsapp_phone && (
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">WhatsApp</p>
                      <span className="text-gray-900">
                        {formatPhone(client.whatsapp_phone)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {client.birth_date && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Data di nascita</p>
                      <span className="text-gray-900">
                        {formatDate(client.birth_date)}
                      </span>
                    </div>
                  </div>
                )}

                {client.last_visit_at && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Ultima visita</p>
                      <span className="text-gray-900">
                        {formatDate(client.last_visit_at)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <Tag className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Tag</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {client.notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Note</h3>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {client.notes}
                </p>
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Storico Appuntamenti</h2>
                <Link
                  href={`/clients/${client.id}/bookings`}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Vedi tutti
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {bookings.length > 0 ? (
                bookings.map((booking: any) => (
                  <div key={booking.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {booking.service?.name || 'Servizio non specificato'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status || 'pending')}`}>
                            {getStatusText(booking.status || 'pending')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDateTime(booking.start_at)}
                          </span>
                          {booking.staff && (
                            <span>Operatore: {booking.staff.full_name}</span>
                          )}
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-gray-600 mt-2">
                            Note: {booking.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-lg font-semibold text-gray-900">
                          <Euro className="w-4 h-4 mr-1" />
                          {Number(booking.price || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nessun appuntamento
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Questo cliente non ha ancora prenotazioni
                  </p>
                  <Link
                    href={`/bookings/new?client=${client.id}`}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Prenota Primo Appuntamento
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiche</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Visite totali</span>
                <span className="text-xl font-bold text-gray-900">{totalBookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Spesa totale</span>
                <span className="text-xl font-bold text-gray-900">€{totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Spesa media</span>
                <span className="text-xl font-bold text-gray-900">€{avgSpent.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <ClientQuickActions client={client} />

          {/* Client Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Suggerimenti</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Controlla le preferenze del cliente</li>
              <li>• Ricorda allergies o sensibilità</li>
              <li>• Proponi trattamenti stagionali</li>
              {totalBookings === 0 && (
                <li>• Cliente nuovo: invia promemoria WhatsApp</li>
              )}
              {totalBookings > 5 && (
                <li>• Cliente fedele: considera offerte speciali</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
} 