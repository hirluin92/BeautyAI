'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Clock, User, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addWeeks, 
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  addDays,
  subDays,
  isSameMonth,
  getDay
} from 'date-fns'
import { it } from 'date-fns/locale'

interface Booking {
  id: string
  start_at: string
  end_at: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  client: {
    id: string
    full_name: string
    phone: string
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
  }
}

interface CalendarViewProps {
  bookings: Booking[]
  services: { id: string; name: string }[]
  staff: { id: string; full_name: string }[]
  viewType: 'week' | 'month' | 'day'
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next') => void
  onChangeView: (view: 'week' | 'month' | 'day') => void
  setCurrentDate: (date: Date) => void
}

export default function CalendarView({ bookings, services, staff, viewType, currentDate, onNavigate, onChangeView, setCurrentDate }: CalendarViewProps) {
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedStaff, setSelectedStaff] = useState<string>('')

  // Fix: fallback se services o staff non sono array
  const safeServices = Array.isArray(services) ? services : [];
  const safeStaff = Array.isArray(staff) ? staff : [];

  // Calculate days based on view type
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthStartWeek = startOfWeek(monthStart, { weekStartsOn: 1 })
  const monthEndWeek = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const monthDays = eachDayOfInterval({ start: monthStartWeek, end: monthEndWeek })

  // Working hours (9:00 - 19:00)
  const workingHours = Array.from({ length: 10 }, (_, i) => i + 9)

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (selectedService && booking.service.id !== selectedService) return false
      if (selectedStaff && booking.staff?.id !== selectedStaff) return false
      return true
    })
  }, [bookings, selectedService, selectedStaff])

  // Group bookings by day and hour
  const bookingsByDayAndHour = useMemo(() => {
    const grouped: Record<string, Record<number, Booking[]>> = {}
    
    filteredBookings.forEach(booking => {
      const date = new Date(booking.start_at)
      const dateKey = format(date, 'yyyy-MM-dd')
      const hour = date.getHours()
      
      if (!grouped[dateKey]) grouped[dateKey] = {}
      if (!grouped[dateKey][hour]) grouped[dateKey][hour] = []
      grouped[dateKey][hour].push(booking)
    })
    
    return grouped
  }, [filteredBookings])

  // Group bookings by day (for month view)
  const bookingsByDay = useMemo(() => {
    const grouped: Record<string, Booking[]> = {}
    
    filteredBookings.forEach(booking => {
      const dateKey = format(new Date(booking.start_at), 'yyyy-MM-dd')
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(booking)
    })
    
    return grouped
  }, [filteredBookings])

  const navigate = (direction: 'prev' | 'next') => {
    if (viewType === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1))
    } else if (viewType === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
    } else {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getViewTitle = () => {
    if (viewType === 'day') {
      return format(currentDate, 'd MMMM yyyy', { locale: it })
    } else if (viewType === 'week') {
      return `${format(weekStart, 'd MMM', { locale: it })} - ${format(weekEnd, 'd MMM yyyy', { locale: it })}`
    } else {
      return format(currentDate, 'MMMM yyyy', { locale: it })
    }
  }

  const handleBookingClick = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`)
  }

  // Render Month View
  const renderMonthView = () => {
    const weeks = []
    for (let i = 0; i < monthDays.length; i += 7) {
      weeks.push(monthDays.slice(i, i + 7))
    }

    return (
      <div className="grid grid-rows-6 h-full">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 flex-1">
            {week.map((day, dayIdx) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayBookings = bookingsByDay[dateKey] || []
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={dayIdx}
                  className={`border-r border-b border-gray-200 p-2 min-h-[100px] ${
                    !isCurrentMonth ? 'bg-gray-50' : ''
                  } ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking, idx) => (
                      <button
                        key={booking.id}
                        onClick={() => handleBookingClick(booking.id)}
                        className={`block w-full text-left px-1 py-0.5 text-xs rounded truncate ${getStatusColor(booking.status)} hover:opacity-80`}
                      >
                        {format(new Date(booking.start_at), 'HH:mm')} - {booking.client.full_name}
                      </button>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayBookings.length - 3} altri
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  // Render Week/Day View
  const renderTimeGridView = () => {
    const daysToShow = viewType === 'week' ? weekDays : [currentDate]

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="p-4 text-sm font-medium text-gray-700">Orario</div>
            {daysToShow.map((day, index) => (
              <div
                key={index}
                className={`p-4 text-center border-l border-gray-200 ${
                  isSameDay(day, new Date()) ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-900">
                  {format(day, 'EEEE', { locale: it })}
                </div>
                <div className={`text-2xl font-bold ${
                  isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="bg-white">
            {workingHours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
                <div className="p-3 text-sm text-gray-600 border-r border-gray-100">
                  {`${hour.toString().padStart(2, '0')}:00`}
                </div>
                {daysToShow.map((day, dayIndex) => {
                  const dateKey = format(day, 'yyyy-MM-dd')
                  const hourBookings = bookingsByDayAndHour[dateKey]?.[hour] || []
                  
                  return (
                    <div
                      key={dayIndex}
                      className="relative p-2 border-l border-gray-100 min-h-[60px]"
                    >
                      <div className="space-y-1">
                        {hourBookings.map((booking) => (
                          <button
                            key={booking.id}
                            onClick={() => handleBookingClick(booking.id)}
                            className={`block w-full text-left p-2 rounded text-xs ${getStatusColor(booking.status)} hover:shadow-md transition-shadow`}
                          >
                            <div className="font-medium truncate">
                              {format(new Date(booking.start_at), 'HH:mm')} - {booking.client.full_name}
                            </div>
                            <div className="truncate text-xs opacity-75">
                              {booking.service.name}
                            </div>
                            {booking.staff && (
                              <div className="truncate text-xs opacity-75">
                                {booking.staff.full_name}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">{getViewTitle()}</h2>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigate('prev')}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm font-medium rounded-md hover:bg-gray-100"
              >
                Oggi
              </button>
              <button
                onClick={() => navigate('next')}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Filters */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Tutti i servizi</option>
              {safeServices.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
            
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Tutto lo staff</option>
              {safeStaff.map(member => (
                <option key={member.id} value={member.id}>{member.full_name}</option>
              ))}
            </select>

            {/* View Type */}
            <div className="flex items-center bg-gray-100 rounded-md">
              <button
                onClick={() => onChangeView('day')}
                className={`px-3 py-1 text-sm ${viewType === 'day' ? 'bg-white shadow' : ''} rounded-l-md`}
              >
                Giorno
              </button>
              <button
                onClick={() => onChangeView('week')}
                className={`px-3 py-1 text-sm ${viewType === 'week' ? 'bg-white shadow' : ''}`}
              >
                Settimana
              </button>
              <button
                onClick={() => onChangeView('month')}
                className={`px-3 py-1 text-sm ${viewType === 'month' ? 'bg-white shadow' : ''} rounded-r-md`}
              >
                Mese
              </button>
            </div>

            {/* New Booking Button */}
            <button
              onClick={() => router.push('/bookings/new')}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuova Prenotazione
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto">
        {viewType === 'month' ? renderMonthView() : renderTimeGridView()}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-gray-600">Confermato</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-gray-600">In attesa</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-gray-600">Completato</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-gray-600">Cancellato</span>
          </div>
        </div>
      </div>
    </div>
  )
}