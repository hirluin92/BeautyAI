'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import CalendarView from '@/components/calendar/calendar-view'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { it } from 'date-fns/locale'
import { Database } from '@/types/database'

type BookingWithRelations = Database['public']['Tables']['bookings']['Row'] & {
  client: Database['public']['Tables']['clients']['Row'] | null
  service: Database['public']['Tables']['services']['Row'] | null
  staff: Database['public']['Tables']['staff']['Row'] | null
}

type PartialService = Pick<Database['public']['Tables']['services']['Row'], 'id' | 'name' | 'duration_minutes' | 'price'>
type PartialStaff = Pick<Database['public']['Tables']['staff']['Row'], 'id' | 'full_name'>
type User = Database['public']['Tables']['users']['Row']

interface CalendarClientProps {
  initialData: {
    bookings: BookingWithRelations[]
    services: PartialService[]
    staff: PartialStaff[]
    currentUser: User
    organizationId: string
  }
}

// Booking interface that matches the new calendar component
interface Booking {
  id: string
  start_at: string
  end_at: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  price: number
  notes?: string
  client: {
    id: string
    full_name: string
    phone?: string
    email?: string
  }
  service: {
    id: string
    name: string
    duration_minutes: number
    price: number
  }
  staff?: {
    id: string
    full_name: string
    email?: string
  }
}

export default function CalendarClient({ initialData }: CalendarClientProps) {
  const supabase = createClient()
  
  const [bookings, setBookings] = useState<BookingWithRelations[]>(initialData.bookings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<'week' | 'month' | 'day'>('week')

  // Convert bookings to the expected format and filter out incomplete ones
  const validBookings: Booking[] = bookings
    .filter(booking => booking.client && booking.service)
    .map(booking => ({
      id: booking.id,
      start_at: booking.start_at,
      end_at: booking.end_at,
      status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show',
      price: booking.price || 0,
      notes: booking.notes || undefined,
      client: {
        id: booking.client!.id,
        full_name: booking.client!.full_name,
        phone: booking.client!.phone || undefined,
        email: booking.client!.email || undefined
      },
      service: {
        id: booking.service!.id,
        name: booking.service!.name,
        duration_minutes: booking.service!.duration_minutes,
        price: booking.service!.price
      },
      staff: booking.staff ? {
        id: booking.staff.id,
        full_name: booking.staff.full_name,
        email: booking.staff.email || undefined
      } : undefined
    }))

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Calculate date range based on view type
      let startDate: Date
      let endDate: Date
      
      if (viewType === 'week') {
        startDate = startOfWeek(currentDate, { locale: it })
        endDate = endOfWeek(currentDate, { locale: it })
      } else if (viewType === 'month') {
        startDate = startOfMonth(currentDate)
        endDate = endOfMonth(currentDate)
      } else {
        startDate = new Date(currentDate)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(currentDate)
        endDate.setHours(23, 59, 59, 999)
      }

      // Load bookings with staff info
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          client:clients(id, full_name, phone, email),
          service:services(id, name, duration_minutes, price),
          staff:staff(id, full_name, email)
        `)
        .eq('organization_id', initialData.organizationId)
        .gte('start_at', startDate.toISOString())
        .lte('start_at', endDate.toISOString())
        .order('start_at')

      if (bookingsError) throw bookingsError

      setBookings(bookingsData || [])
      
    } catch (error) {
      console.error('Error loading calendar data:', error)
      setError('Errore nel caricamento del calendario')
    } finally {
      setLoading(false)
    }
  }, [currentDate, viewType, supabase, initialData.organizationId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    if (viewType === 'week') {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7)
      } else {
        newDate.setDate(newDate.getDate() + 7)
      }
    } else if (viewType === 'month') {
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
    } else {
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1)
      } else {
        newDate.setDate(newDate.getDate() + 1)
      }
    }
    
    setCurrentDate(newDate)
  }

  const handleChangeView = (view: 'week' | 'month' | 'day') => {
    setViewType(view)
  }

  const refreshBookings = () => {
    loadData()
  }

  // Optimistic update handler for better UX
  const handleOptimisticBookingUpdate = useCallback((bookingId: string, newStart: string, newEnd: string) => {
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, start_at: newStart, end_at: newEnd }
          : booking
      )
    )
  }, [])

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Caricamento calendario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-red-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Errore</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Riprova
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CalendarView
      bookings={validBookings}
      services={initialData.services}
      staff={initialData.staff}
      viewType={viewType}
      currentDate={currentDate}
      onNavigate={handleNavigate}
      onChangeView={handleChangeView}
      setCurrentDate={setCurrentDate}
      refreshBookings={refreshBookings}
      onOptimisticBookingUpdate={handleOptimisticBookingUpdate}
    />
  )
}