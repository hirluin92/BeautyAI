'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, addMinutes, parseISO } from 'date-fns'
import { Calendar, Clock, User, Package, DollarSign, AlertCircle, Loader2, Check, UserPlus, Save, Scissors } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { User as UserType, BookingStatus, Booking, BookingInsert } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { bookingSchema, BookingInput } from '@/lib/validation/booking'
import ClientQuickAddButton from '@/components/clients/client-quick-add-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  staff: Staff[]
  defaultDate?: string
  defaultTime?: string
  defaultClientId?: string
  defaultServiceId?: string
  bookingId?: string
  mode?: 'create' | 'edit'
  booking?: Booking & {
    status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show'
  }
  onBookingCreated?: (bookingId: string) => void
}

interface Staff {
  id: string
  full_name: string
}

// Validation schema - status is required and cannot be undefined
const bookingFormSchema = z.object({
  client_id: z.string().min(1, 'Cliente obbligatorio'),
  service_id: z.string().min(1, 'Servizio obbligatorio'),
  staff_id: z.string().optional(),
  date: z.string().min(1, 'Data obbligatoria'),
  time: z.string().min(1, 'Orario obbligatorio'),
  status: z.enum(['confirmed', 'pending', 'cancelled', 'completed', 'no_show']),
  notes: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingFormSchema>

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
  mode = 'create',
  booking,
  onBookingCreated
}: BookingFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState(booking?.client_id || defaultClientId || '')
  const [selectedServiceId, setSelectedServiceId] = useState(booking?.service_id || defaultServiceId || '')
  const [selectedStaffId, setSelectedStaffId] = useState(booking?.staff_id || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      client_id: booking?.client_id || defaultClientId || '',
      service_id: booking?.service_id || defaultServiceId || '',
      staff_id: booking?.staff_id || '',
      date: booking?.date || '',
      time: booking?.time || '',
      status: booking?.status || 'confirmed', // Always provide a value, never undefined
      notes: booking?.notes || '',
    }
  })

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load clients - RIMUOVI il filtro is_active se la colonna non esiste
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, full_name, phone, email')
          .eq('organization_id', organizationId)
          // .eq('is_active', true) // COMMENTA O RIMUOVI questa riga se causa errore 400
          .order('full_name')

        if (clientsError) {
          console.error('Error loading clients:', clientsError)
        } else if (clientsData && clientsData.length > 0) {
          // Only set default if no value is already set
          if (!selectedClientId) {
            setValue('client_id', clientsData[0].id)
            setSelectedClientId(clientsData[0].id)
          }
        }

        // Load services - RIMUOVI il filtro is_active se la colonna non esiste
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, name, price, duration_minutes, category')
          .eq('organization_id', organizationId)
          // .eq('is_active', true) // COMMENTA O RIMUOVI questa riga se causa errore 400
          .order('name')

        if (servicesError) {
          console.error('Error loading services:', servicesError)
        } else if (servicesData && servicesData.length > 0) {
          // Find the service if one is already selected
          const service = selectedServiceId 
            ? servicesData.find(s => s.id === selectedServiceId) || servicesData[0]
            : servicesData[0]
          
          setSelectedService(service)
          if (!selectedServiceId) {
            setValue('service_id', service.id)
            setSelectedServiceId(service.id)
          }
        }

        // Load staff - RIMUOVI il filtro is_active se la colonna non esiste
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('id, full_name')
          .eq('organization_id', organizationId)
          // .eq('is_active', true) // COMMENTA O RIMUOVI questa riga se causa errore 400
          .order('full_name')

        if (staffError) {
          console.error('Error loading staff:', staffError)
        } else if (staffData && staffData.length > 0 && !selectedStaffId) {
          setSelectedStaffId(staffData[0].id)
          setValue('staff_id', staffData[0].id)
        }

      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [organizationId, supabase, setValue, selectedClientId, selectedServiceId, selectedStaffId])

  // Update selected service when service_id changes
  useEffect(() => {
    const service = services.find(s => s.id === selectedServiceId)
    setSelectedService(service || null)
  }, [selectedServiceId, services])

  const loadBooking = useCallback(async () => {
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
    reset({
      client_id: data.client_id || '',
      service_id: data.service_id || '',
      staff_id: data.staff_id || '',
      date: format(startDate, 'yyyy-MM-dd'),
      time: format(startDate, 'HH:mm'),
      notes: data.notes || '',
      status: data.status || 'confirmed', // Ensure status is never undefined
    })
  }, [bookingId, supabase, reset])

  const checkAvailability = useCallback(async () => {
    if (!selectedService || !selectedStaffId) {
      setAvailabilityError(null)
      return
    }

    setCheckingAvailability(true)
    setAvailabilityError(null)

    try {
      const date = watch('date')
      const time = watch('time')
      const startDateTime = `${date}T${time}:00+02:00`
      const endDateTime = format(
        addMinutes(parseISO(startDateTime), selectedService.duration_minutes),
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      )

      const { data, error } = await supabase.rpc('check_booking_conflict', {
        p_organization_id: organizationId,
        p_staff_id: selectedStaffId,
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
  }, [selectedService, selectedStaffId, watch, supabase, organizationId, mode, bookingId])

  // Load booking data when component mounts or bookingId changes
  useEffect(() => {
    if (mode === 'edit' && bookingId) {
      loadBooking()
    }
  }, [mode, bookingId, loadBooking])

  // Check availability when date/time/staff changes
  useEffect(() => {
    const date = watch('date')
    const time = watch('time')
    if (date && time && selectedService && selectedStaffId) {
      checkAvailability()
    }
  }, [watch, selectedStaffId, selectedService, checkAvailability])

  const onSubmit = async (data: BookingFormData) => {
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
      const startDateTime = `${data.date}T${data.time}:00+02:00`
      const endDateTime = format(
        addMinutes(parseISO(startDateTime), selectedService.duration_minutes),
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      )

      const bookingData: BookingInsert = {
        organization_id: organizationId,
        client_id: data.client_id,
        service_id: data.service_id,
        staff_id: data.staff_id || null,
        start_at: startDateTime,
        end_at: endDateTime,
        status: data.status,
        price: selectedService.price,
        notes: data.notes?.trim() || null,
        source: 'manual'
      }

      if (mode === 'edit' && bookingId) {
        const { error } = await supabase
          .from('bookings')
          .update(bookingData)
          .eq('id', bookingId)

        if (error) throw error
      } else {
        const { data: newBooking, error } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select()
          .single()

        if (error) throw error

        setSuccess(true)
        if (onBookingCreated) {
          onBookingCreated(newBooking.id)
        } else {
          setTimeout(() => {
            router.push(`/bookings/${newBooking.id}`)
          }, 1000)
        }
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Errore nel salvataggio della prenotazione'
      console.error('Error saving booking:', error)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const handleClientCreated = (clientId: string) => {
    setSelectedClientId(clientId)
    setValue('client_id', clientId)
    setShowNewClientModal(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Prenotazione {mode === 'create' ? 'creata' : 'aggiornata'} con successo!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PRIMA RIGA */}
        
        {/* Cliente - Prima colonna, prima riga */}
        <div>
          <Label htmlFor="client_id">
            <User className="inline w-4 h-4 mr-2" />
            Cliente *
          </Label>
          <div className="flex gap-2 mt-1 items-center w-full">
            <select
              {...register('client_id')}
              id="client_id"
              className={`flex-1 min-w-0 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.client_id ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Seleziona cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name} - {client.phone}
                </option>
              ))}
            </select>
            <div className="flex-shrink-0">
              <ClientQuickAddButton
                organizationId={organizationId}
                onClientCreated={handleClientCreated}
              />
            </div>
          </div>
          {errors.client_id && (
            <p className="text-sm text-red-500 mt-1">{errors.client_id.message?.toString()}</p>
          )}
        </div>

        {/* Servizio - Seconda colonna, prima riga */}
<div>
  <Label htmlFor="service_id">
    <Scissors className="inline w-4 h-4 mr-2" />
    Servizio *
  </Label>
  <div className="mt-1">
    <Select
      value={selectedServiceId}
      onValueChange={(value) => {
        setSelectedServiceId(value)
        setValue('service_id', value)
      }}
    >
      <SelectTrigger className={errors.service_id ? 'border-red-500' : ''}>
        <SelectValue placeholder="Seleziona un servizio" />
      </SelectTrigger>
      <SelectContent 
        className="z-[9999]"
        position="popper"
        sideOffset={4}
      >
        {services.map((service) => (
          <SelectItem key={service.id} value={service.id}>
            {service.name} - {formatCurrency(service.price)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {errors.service_id && (
      <p className="text-sm text-red-500 mt-1">{errors.service_id.message?.toString()}</p>
    )}
  </div>
</div>

        {/* SECONDA RIGA */}
        
        {/* Staff - Prima colonna, seconda riga */}
        <div>
          <Label htmlFor="staff_id">Staff</Label>
          <Select
            value={selectedStaffId}
            onValueChange={(value) => {
              setSelectedStaffId(value)
              setValue('staff_id', value)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona staff (opzionale)" />
            </SelectTrigger>
            <SelectContent>
              {staff.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stato - Seconda colonna, seconda riga */}
        <div>
          <Label htmlFor="status">Stato</Label>
          <select
            {...register('status')}
            id="status"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="confirmed">Confermata</option>
            <option value="pending">In attesa</option>
            <option value="cancelled">Cancellata</option>
            <option value="completed">Completata</option>
            <option value="no_show">No show</option>
          </select>
        </div>

        {/* TERZA RIGA - Data e Orario affiancati */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">
                <Calendar className="inline w-4 h-4 mr-2" />
                Data *
              </Label>
              <Input
                {...register('date')}
                type="date"
                id="date"
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date.message?.toString()}</p>
              )}
            </div>

            <div>
              <Label htmlFor="time">
                <Clock className="inline w-4 h-4 mr-2" />
                Orario *
              </Label>
              <Input
                {...register('time')}
                type="time"
                id="time"
                className={errors.time ? 'border-red-500' : ''}
              />
              {errors.time && (
                <p className="text-sm text-red-500 mt-1">{errors.time.message?.toString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* QUARTA RIGA - Dettagli servizio */}
        {selectedService && (
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Dettagli servizio</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <Package className="w-4 h-4 text-gray-400 mr-2" />
                <span>{selectedService.name}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                <span>{selectedService.duration_minutes} min</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                <span>{formatCurrency(selectedService.price)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Messaggi di disponibilità */}
        {checkingAvailability && (
          <div className="md:col-span-2 flex items-center text-blue-600">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Verifica disponibilità...</span>
          </div>
        )}

        {availabilityError && (
          <div className="md:col-span-2 flex items-center text-red-600">
            <AlertCircle className="w-4 w-4 mr-2" />
            <span>{availabilityError}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="md:col-span-2">
        <Label htmlFor="notes">Note</Label>
        <textarea
          {...register('notes')}
          id="notes"
          placeholder="Note aggiuntive sulla prenotazione..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          Annulla
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Crea prenotazione' : 'Aggiorna prenotazione'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}