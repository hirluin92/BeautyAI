// app/(dashboard)/calendar/page.tsx
'use client'

import { useEffect, useState } from 'react'
import CalendarView from '@/components/calendar/calendar-view'
import type { Booking } from '@/components/calendar/calendar-view'
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'

export default function CalendarPage() {
  const [viewType, setViewType] = useState<'week' | 'month' | 'day'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<{ id: string; name: string }[]>([])
  const [staff, setStaff] = useState<{ id: string; full_name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calcola intervallo in base alla vista
  const getRange = () => {
    if (viewType === 'week') {
      const from = startOfWeek(currentDate, { weekStartsOn: 1 })
      const to = addDays(endOfWeek(currentDate, { weekStartsOn: 1 }), 1)
      return { from, to }
    } else if (viewType === 'month') {
      const from = startOfMonth(currentDate)
      const to = addDays(endOfMonth(currentDate), 1)
      return { from, to }
    } else {
      const from = currentDate
      const to = addDays(currentDate, 1)
      return { from, to }
    }
  }

  // Fetch dinamica bookings
  const refreshBookings = async () => {
    const { from, to } = getRange()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/bookings?from=${format(from, 'yyyy-MM-dd')}&to=${format(to, 'yyyy-MM-dd')}`)
      const data = await response.json()
      
      console.log('Bookings API response:', data)
      
      // Gestisci diversi formati di risposta
      let bookingsArray = []
      if (Array.isArray(data)) {
        bookingsArray = data
      } else if (data && Array.isArray(data.data)) {
        bookingsArray = data.data
      } else if (data && Array.isArray(data.bookings)) {
        bookingsArray = data.bookings
      } else {
        console.warn('Unexpected bookings data format:', data)
        bookingsArray = []
      }
      
      // Formatta i bookings
      const formattedBookings = bookingsArray.map((booking: any) => ({
        id: booking.id,
        start_at: booking.start_at,
        end_at: booking.end_at,
        status: booking.status || 'confirmed',
        client: {
          id: booking.client?.id || booking.client_id || '',
          full_name: booking.client?.full_name || 'Cliente',
          phone: booking.client?.phone || ''
        },
        service: {
          id: booking.service?.id || booking.service_id || '',
          name: booking.service?.name || 'Servizio',
          duration_minutes: booking.service?.duration_minutes || 60,
          price: booking.service?.price || 0
        },
        staff: booking.staff ? {
          id: booking.staff.id || booking.staff_id,
          full_name: booking.staff.full_name || 'Staff'
        } : undefined
      }))
      
      console.log('Formatted bookings:', formattedBookings)
      setBookings(formattedBookings)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError('Errore nel caricamento appuntamenti')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshBookings()
  }, [currentDate, viewType])

  // Fetch services e staff all'avvio
  useEffect(() => {
    // Fetch services
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        console.log('Services API response:', data)
        
        let servicesArray = []
        if (Array.isArray(data)) {
          servicesArray = data
        } else if (data && Array.isArray(data.data)) {
          servicesArray = data.data
        } else if (data && Array.isArray(data.services)) {
          servicesArray = data.services
        } else {
          console.warn('Unexpected services data format:', data)
          servicesArray = []
        }
        
        const formattedServices = servicesArray.map((service: any) => ({
          id: service.id,
          name: service.name || 'Servizio'
        }))
        setServices(formattedServices)
      })
      .catch((err) => {
        console.error('Error fetching services:', err)
        setServices([])
      })

    // Fetch staff
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        console.log('Staff API response:', data)
        
        let staffArray = []
        if (Array.isArray(data)) {
          staffArray = data
        } else if (data && Array.isArray(data.data)) {
          staffArray = data.data
        } else if (data && Array.isArray(data.staff)) {
          staffArray = data.staff
        } else {
          console.warn('Unexpected staff data format:', data)
          staffArray = []
        }
        
        const formattedStaff = staffArray.map((member: any) => ({
          id: member.id,
          full_name: member.full_name || 'Staff'
        }))
        setStaff(formattedStaff)
      })
      .catch((err) => {
        console.error('Error fetching staff:', err)
        setStaff([])
      })
  }, [])

  // Navigazione
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (viewType === 'week') {
      setCurrentDate(direction === 'prev' ? addDays(currentDate, -7) : addDays(currentDate, 7))
    } else if (viewType === 'month') {
      setCurrentDate(direction === 'prev' ? addDays(startOfMonth(currentDate), -1) : addDays(endOfMonth(currentDate), 1))
    } else {
      setCurrentDate(direction === 'prev' ? addDays(currentDate, -1) : addDays(currentDate, 1))
    }
  }

  // Aggiornamento ottimistico di un booking
  const handleOptimisticBookingUpdate = (bookingId: string, newStart: string, newEnd: string) => {
    console.log('Optimistic update:', { bookingId, newStart, newEnd })
    setBookings(prev => prev.map(b =>
      b.id === bookingId
        ? { ...b, start_at: newStart, end_at: newEnd }
        : b
    ))
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 hidden md:block">
        <h1 className="text-3xl font-bold text-gray-900">Calendario Appuntamenti</h1>
      </div>
      
      {loading && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
          Caricamento appuntamenti...
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex-1 min-h-0">
        <CalendarView
          bookings={bookings.filter(b => b && b.status !== 'cancelled')}
          viewType={viewType}
          currentDate={currentDate}
          onNavigate={handleNavigate}
          onChangeView={setViewType}
          setCurrentDate={setCurrentDate}
          services={services}
          staff={staff}
          refreshBookings={refreshBookings}
          onOptimisticBookingUpdate={handleOptimisticBookingUpdate}
        />
      </div>
    </div>
  )
}