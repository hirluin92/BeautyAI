'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, addMinutes, parseISO } from 'date-fns'
import { Calendar, Clock, User, Package, DollarSign, AlertCircle, Loader2, Check, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { User as UserType, BookingStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'
import ClientQuickAddButton from '@/components/clients/client-quick-add-button'

interface Client {
  id: string
  full_name: string
  phone: string
  email: string | null
}

interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
  category: string | null
}

interface BookingFormProps {
  organizationId: string
  clients: Client[]
  services: Service[]
  staff: UserType[]
  defaultDate?: string
  defaultTime?: string
  defaultClientId?: string
  defaultServiceId?: string
  bookingId?: string
  mode?: 'create' | 'edit'
}

export default function BookingForm({
  organizationId,
  clients,
  services,
  staff,
  defaultDate,
  defaultTime,
  defaultClientId,
  defaultServiceId,
  bookingId,
  mode = 'create'
}: BookingFormProps) {
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    client_id: defaultClientId || '',
    service_id: defaultServiceId || '',
    staff_id: '',
    date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
    time: defaultTime || '09:00',
    notes: '',
    status: 'pending' as BookingStatus
  })

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [showNewClientModal, setShowNewClientModal] = useState(false)

  // Update selected service when service_id changes
  useEffect(() => {
    const service = services.find(s => s.id === formData.service_id)
    setSelectedService(service || null)
  }, [formData.service_id, services])

  // Load booking data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && bookingId) {
      loadBooking()
    }
  }, [bookingId, mode])

  const loadBooking = async () => {
    if (!bookingId) return

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (error || !data) {
      setError('Errore nel caricamento della prenotazione')
      return
    }

    const startDate = new Date(data.start_at)
    setFormData({
      client_id: data.client_id || '',
      service_id: data.service_id || '',
      staff_id: data.staff_id || '',
      date: format(startDate, 'yyyy-MM-dd'),
      time: format(startDate, 'HH:mm'),
      notes: data.notes || '',
      status: data.status || 'pending'
    })
  }

  // Check availability when date/time/staff changes
  useEffect(() => {
    if (formData.date && formData.time && selectedService) {
      checkAvailability()
    }
  }, [formData.date, formData.time, formData.staff_id, selectedService])

  const checkAvailability = async () => {
    if (!selectedService || !formData.staff_id) {
      setAvailabilityError(null)
      return
    }

    setCheckingAvailability(true)
    setAvailabilityError(null)

    try {
      const startDateTime = `${formData.date}T${formData.time}:00+02:00`
      const endDateTime = format(
        addMinutes(parseISO(startDateTime), selectedService.duration_minutes),
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      )

      const { data, error } = await supabase.rpc('check_booking_conflict', {
        p_organization_id: organizationId,
        p_staff_id: formData.staff_id,
        p_start_at: startDateTime,
        p_end_at: endDateTime,
        p_exclude_booking_id: mode === 'edit' ? bookingId : undefined
      })

      if (error) throw error

      if (data === true) {
        setAvailabilityError('Questo orario non è disponibile per il membro dello staff selezionato')
      }
    } catch (error) {
      console.error('Error checking availability:', error)
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (availabilityError) {
      setError('Risolvi prima i conflitti di disponibilità')
      return
    }

    if (!selectedService) {
      setError('Seleziona un servizio')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const startDateTime = `${formData.date}T${formData.time}:00+02:00`
      const endDateTime = format(
        addMinutes(parseISO(startDateTime), selectedService.duration_minutes),
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      )

      const bookingData = {
        organization_id: organizationId,
        client_id: formData.client_id,
        service_id: formData.service_id,
        staff_id: formData.staff_id || null,
        start_at: startDateTime,
        end_at: endDateTime,
        status: formData.status,
        price: selectedService.price,
        notes: formData.notes || null,
        source: 'manual'
      }

      if (mode === 'edit' && bookingId) {
        const { error } = await supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', bookingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('bookings')
          .insert(bookingData)

        if (error) throw error
      }

      router.push('/calendar')
    } catch (error: any) {
      console.error('Error saving booking:', error)
      setError(error.message || 'Errore nel salvataggio della prenotazione')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/calendar')
  }

  const handleClientCreated = (clientId: string) => {
    setFormData(prev => ({ ...prev, client_id: clientId }))
    router.refresh()
  }

  // Generate time slots (every 15 minutes from 9:00 to 19:00)
  const timeSlots = []
  for (let hour = 9; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category || 'Altri'
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <span className="text-red-600">{error}</span>
          </div>
        )}

        {/* Client Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliente
          </label>
          <div className="flex gap-2">
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value="">Seleziona un cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.full_name} ({client.phone})
                </option>
              ))}
            </select>
            <ClientQuickAddButton
              organizationId={organizationId}
              onClientCreated={handleClientCreated}
            />
          </div>
        </div>

        {/* Service Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servizio
          </label>
          <select
            value={formData.service_id}
            onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          >
            <option value="">Seleziona un servizio</option>
            {Object.entries(servicesByCategory).map(([category, services]) => (
              <optgroup key={category} label={category}>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({formatCurrency(service.price)})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Staff Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Staff
          </label>
          <select
            value={formData.staff_id}
            onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          >
            <option value="">Seleziona un membro dello staff</option>
            {staff.map(member => (
              <option key={member.id} value={member.id}>
                {member.full_name} ({member.role || 'staff'})
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orario
            </label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Aggiungi note o richieste speciali..."
          />
        </div>

        {/* Availability Check */}
        {checkingAvailability && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center">
            <Loader2 className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
            <span className="text-blue-600">Verifica disponibilità...</span>
          </div>
        )}

        {availabilityError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <span className="text-red-600">{availabilityError}</span>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading || !!availabilityError}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {mode === 'edit' ? 'Aggiorna' : 'Crea'} Prenotazione
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )
}