import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Calendar, Clock, User, Package, Phone, Mail, Euro,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { UserWithOrganization, BookingWithRelations } from '@/types'
import ClientBookingHistory from '@/components/bookings/client-booking-history'
import DeleteBookingForm from '@/components/bookings/delete-booking-form'

interface BookingDetailPageProps {
  params: {
    id: string
  }
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single()

  if (userError || !userData) redirect('/login')
  const typedUserData = userData as UserWithOrganization

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      *,
      client:clients(id, full_name, phone, email),
      service:services(id, name, duration_minutes, price, category),
      staff:users!bookings_staff_id_fkey(id, full_name, role)
    `)
    .eq('id', params.id)
    .eq('organization_id', typedUserData.organization_id!)
    .single()

  if (bookingError || !booking) notFound()

  const typedBooking = booking as unknown as BookingWithRelations

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />
      case 'completed': return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />
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
      case 'confirmed': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      case 'completed': return 'text-blue-600 bg-blue-50'
      case 'no_show': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/calendar" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Torna al calendario
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/bookings/${params.id}/edit`} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              <Edit className="w-4 h-4 mr-2" /> Modifica
            </Link>
            <DeleteBookingForm bookingId={params.id} />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900">Dettagli Prenotazione</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(typedBooking.status || '')}`}>
            {getStatusIcon(typedBooking.status || '')}
            {getStatusText(typedBooking.status || '')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Appuntamento</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Data</p>
                <p className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {format(parseISO(typedBooking.start_at), 'EEEE d MMMM yyyy', { locale: it })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Orario</p>
                <p className="font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  {format(parseISO(typedBooking.start_at), 'HH:mm')} - {format(parseISO(typedBooking.end_at), 'HH:mm')}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">Servizio</p>
              <p className="font-medium flex items-center">
                <Package className="w-4 h-4 mr-2 text-gray-400" /> {typedBooking.service?.name}
              </p>
              <p className="text-sm text-gray-500">Durata: {typedBooking.service?.duration_minutes} minuti</p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Prezzo</p>
              <p className="text-2xl font-bold text-indigo-600 flex items-center">
                <Euro className="w-5 h-5 mr-1" /> {typedBooking.price}
              </p>
            </div>
            {typedBooking.staff && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">Operatore</p>
                <p className="font-medium flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" /> {typedBooking.staff.full_name} <span className="ml-2 text-sm text-gray-500">({typedBooking.staff.role})</span>
                </p>
              </div>
            )}
            {typedBooking.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Note</p>
                <p className="text-gray-800">{typedBooking.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Prenotazione creata</p>
                  <p className="text-sm text-gray-500">{typedBooking.created_at ? format(parseISO(typedBooking.created_at), 'dd/MM/yyyy HH:mm') : ''}</p>
                </div>
              </div>
              {typedBooking.status === 'cancelled' && typedBooking.cancelled_at && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Prenotazione cancellata</p>
                    <p className="text-sm text-gray-500">{format(parseISO(typedBooking.cancelled_at), 'dd/MM/yyyy HH:mm')}</p>
                    {typedBooking.cancellation_reason && (
                      <p className="text-sm text-gray-600 mt-1">Motivo: {typedBooking.cancellation_reason}</p>
                    )}
                  </div>
                </div>
              )}
              {typedBooking.updated_at !== typedBooking.created_at && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Ultima modifica</p>
                    <p className="text-sm text-gray-500">{typedBooking.updated_at ? format(parseISO(typedBooking.updated_at), 'dd/MM/yyyy HH:mm') : ''}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Cliente</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nome Completo</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" /> {typedBooking.client?.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefono</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" /> {typedBooking.client?.phone}
                </p>
              </div>
              {typedBooking.client?.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" /> {typedBooking.client.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Storico Prenotazioni</h2>
            {typedBooking.client && (
              <ClientBookingHistory clientId={typedBooking.client.id} excludeBookingId={typedBooking.id} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
