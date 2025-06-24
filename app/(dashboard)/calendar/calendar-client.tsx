'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import CalendarView from '@/components/calendar/calendar-view'
import CalendarFilters from '@/components/calendar/calendar-filters'
import { useCalendarFilters } from '@/hooks/useCalendarFilters'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { it } from 'date-fns/locale'

interface CalendarClientProps {
  initialData: {
    bookings: any[]
    services: any[]
    staff: any[]
    currentUser: {
      id: string
      full_name: string
      organization_id: string
    }
    organizationId: string
  }
}

export default function CalendarClient({ initialData }: CalendarClientProps) {
  const supabase = createClient()
  
  const [bookings, setBookings] = useState<any[]>(initialData.bookings)
  const [services, setServices] = useState<any[]>(initialData.services)
  const [staff, setStaff] = useState<any[]>(initialData.staff)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUser] = useState<any>(initialData.currentUser)
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<'week' | 'month' | 'day'>('week')

  // Use calendar filters hook
  const {
    filters,
    filteredBookings,
    updateFilter,
    resetFilters,
    getActiveFiltersCount
  } = useCalendarFilters({
    bookings,
    currentUserId: currentUser?.id
  })

  const loadData = async () => {
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
        startDate = currentDate
        endDate = currentDate
      }

      // Load bookings with staff info
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          client:clients(id, full_name, phone),
          service:services(id, name, duration_minutes, price),
          staff:staff(id, full_name)
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
  }

  useEffect(() => {
    loadData()
  }, [currentDate, viewType])

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
    // Trigger a reload of the current data
    setCurrentDate(new Date(currentDate))
  }

  const handleFilterChange = (key: string, value: any) => {
    updateFilter(key as any, value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento calendario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Advanced Filters */}
      <div className="container mx-auto px-4 py-6">
        <CalendarFilters
          services={services}
          staff={staff}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={resetFilters}
          activeFiltersCount={getActiveFiltersCount()}
          currentUser={currentUser}
        />
      </div>

      {/* Calendar View */}
      <CalendarView
        bookings={filteredBookings}
        services={services}
        staff={staff}
        viewType={viewType}
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onChangeView={handleChangeView}
        setCurrentDate={setCurrentDate}
        refreshBookings={refreshBookings}
      />
    </div>
  )
} 