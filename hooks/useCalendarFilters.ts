import { useState, useMemo } from 'react'
import { Booking } from '@/components/calendar/calendar-view'

interface CalendarFilters {
  selectedService: string
  selectedStaff: string
  selectedStatus: string
  selectedDateRange: {
    start: Date | null
    end: Date | null
  }
}

interface UseCalendarFiltersProps {
  bookings: Booking[]
  currentUserId?: string
}

export function useCalendarFilters({ bookings, currentUserId }: UseCalendarFiltersProps) {
  const [filters, setFilters] = useState<CalendarFilters>({
    selectedService: 'all',
    selectedStaff: 'all',
    selectedStatus: 'all',
    selectedDateRange: {
      start: null,
      end: null
    }
  })

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Filtro per servizio
      if (filters.selectedService && filters.selectedService !== 'all' && booking.service.id !== filters.selectedService) {
        return false
      }

      // Filtro per staff
      if (filters.selectedStaff && filters.selectedStaff !== 'all' && booking.staff?.id !== filters.selectedStaff) {
        return false
      }

      // Filtro per status
      if (filters.selectedStatus && filters.selectedStatus !== 'all' && booking.status !== filters.selectedStatus) {
        return false
      }

      // Filtro per range di date
      if (filters.selectedDateRange.start || filters.selectedDateRange.end) {
        const bookingDate = new Date(booking.start_at)
        
        if (filters.selectedDateRange.start && bookingDate < filters.selectedDateRange.start) {
          return false
        }
        
        if (filters.selectedDateRange.end && bookingDate > filters.selectedDateRange.end) {
          return false
        }
      }

      return true
    })
  }, [bookings, filters])

  const updateFilter = <K extends keyof CalendarFilters>(
    key: K, 
    value: CalendarFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      selectedService: 'all',
      selectedStaff: 'all',
      selectedStatus: 'all',
      selectedDateRange: {
        start: null,
        end: null
      }
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.selectedService && filters.selectedService !== 'all') count++
    if (filters.selectedStaff && filters.selectedStaff !== 'all') count++
    if (filters.selectedStatus && filters.selectedStatus !== 'all') count++
    if (filters.selectedDateRange.start || filters.selectedDateRange.end) count++
    return count
  }

  return {
    filters,
    filteredBookings,
    updateFilter,
    resetFilters,
    getActiveFiltersCount
  }
} 