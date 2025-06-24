'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Menu, Filter } from 'lucide-react'
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
  isSameMonth
} from 'date-fns'
import { it } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import React from 'react'

export interface Booking {
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
  refreshBookings?: () => void
  onOptimisticBookingUpdate?: (bookingId: string, newStart: string, newEnd: string) => void
}

// Costanti del calendario
const CALENDAR_CONFIG = {
  HOUR_HEIGHT: 160,
  START_HOUR: 9,
  END_HOUR: 18,
  SNAP_MINUTES: 5,
  MIN_DURATION_MINUTES: 20,
  DRAG_THRESHOLD_PX: 3,
  CLICK_MAX_DURATION_MS: 200,
  BUFFER_MINUTES: 0  // Intervallo minimo tra appuntamenti (0, 5, 10, 15 minuti)
} as const

// Componente CalendarEvent ottimizzato
interface CalendarEventProps {
  booking: Booking
  onUpdate: (bookingId: string, newStart: Date, newEnd: Date) => Promise<void>
  onClick: (id: string) => void
  dayContainerRef: React.RefObject<HTMLDivElement | null>
  allBookings: Booking[]
}

function CalendarEvent({
  booking,
  onUpdate,
  onClick,
  dayContainerRef,
  allBookings
}: CalendarEventProps) {
  // Stati locali per rendering ottimistico
  const [localStartAt, setLocalStartAt] = useState(booking.start_at)
  const [localEndAt, setLocalEndAt] = useState(booking.end_at)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null)
  const [previewTime, setPreviewTime] = useState<{ start: string; end: string } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  
  const eventRef = useRef<HTMLDivElement>(null)
  const interactionRef = useRef({
    startMouseY: 0,
    startTime: 0,
    hasMoved: false,
    initialTop: 0,
    initialHeight: 0,
    isActive: false
  })

  // Sync con props
  useEffect(() => {
    setLocalStartAt(booking.start_at)
    setLocalEndAt(booking.end_at)
  }, [booking.start_at, booking.end_at])

  const startDate = new Date(localStartAt)
  const endDate = new Date(localEndAt)

  // Utility functions
  const minutesPerPixel = 60 / CALENDAR_CONFIG.HOUR_HEIGHT

  const getEventStyle = useCallback(() => {
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes()
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes()
    const workStartMinutes = CALENDAR_CONFIG.START_HOUR * 60

    const top = Math.max(0, (startMinutes - workStartMinutes) / minutesPerPixel)
    const height = Math.max(40, (endMinutes - startMinutes) / minutesPerPixel)

    // Debug per capire il problema di posizionamento
    if (booking.client.full_name.includes("Daniela")) {
      console.log('📐 Event position debug:', {
        bookingId: booking.id,
        clientName: booking.client.full_name,
        startTime: format(startDate, 'HH:mm:ss'),
        endTime: format(endDate, 'HH:mm:ss'),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startMinutes,
        endMinutes,
        durationMinutes: endMinutes - startMinutes,
        calculatedHeight: height,
        localStartAt,
        localEndAt
      })
    }

    return { top, height }
  }, [startDate, endDate, minutesPerPixel, booking, localStartAt, localEndAt])

  const pixelsToTime = useCallback((pixels: number) => {
    const totalMinutes = CALENDAR_CONFIG.START_HOUR * 60 + (pixels * minutesPerPixel)
    // Usa Math.floor per snap simmetrico
    const snappedMinutes = Math.floor(totalMinutes / CALENDAR_CONFIG.SNAP_MINUTES) * CALENDAR_CONFIG.SNAP_MINUTES
    const hours = Math.floor(snappedMinutes / 60)
    const minutes = snappedMinutes % 60
    return {
      hours: Math.max(CALENDAR_CONFIG.START_HOUR, Math.min(CALENDAR_CONFIG.END_HOUR, hours)),
      minutes: Math.max(0, Math.min(59, minutes))
    }
  }, [minutesPerPixel])

  const formatTimeForTooltip = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const checkOverlap = useCallback((newStart: Date, newEnd: Date): boolean => {
    return allBookings.some(other => {
      if (other.id === booking.id) return false
      
      const otherStart = new Date(other.start_at)
      const otherEnd = new Date(other.end_at)
      
      // Check same day
      if (otherStart.toDateString() !== newStart.toDateString()) return false
      
      // Aggiungi il buffer time agli orari per il controllo sovrapposizione
      const bufferMs = CALENDAR_CONFIG.BUFFER_MINUTES * 60 * 1000
      const bufferedOtherEnd = new Date(otherEnd.getTime() + bufferMs)
      const bufferedNewEnd = new Date(newEnd.getTime() + bufferMs)
      
      // Check overlap con buffer
      // Un appuntamento può iniziare esattamente quando finisce l'altro solo se BUFFER_MINUTES = 0
      if (CALENDAR_CONFIG.BUFFER_MINUTES === 0) {
        // Permetti appuntamenti contigui (stesso minuto)
        return (newStart < otherEnd && newEnd > otherStart)
      } else {
        // Richiedi un buffer tra gli appuntamenti
      return (newStart < bufferedOtherEnd && bufferedNewEnd > otherStart)
      }
    })
  }, [allBookings, booking.id])

  const getServiceColor = (serviceId: string) => {
    // Genera un colore consistente basato sull'ID del servizio
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#14B8A6', // teal
      '#F97316', // orange
    ]
    const index = serviceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800 border-l-4 border-green-500',
      pending: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500',
      cancelled: 'bg-red-100 text-red-800 border-l-4 border-red-500',
      completed: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
      no_show: 'bg-gray-100 text-gray-800 border-l-4 border-gray-500'
    }
    return colors[status as keyof typeof colors] || colors.no_show
  }

  // Event Handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!eventRef.current || isResizing) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const { top } = getEventStyle()
    
    interactionRef.current = {
      startMouseY: e.clientY,
      startTime: Date.now(),
      hasMoved: false,
      initialTop: top,
      initialHeight: 0,
      isActive: true
    }
    
    setIsDragging(true)
    setTooltipPosition({ x: e.clientX + 10, y: e.clientY - 10 })
    
    const duration = endDate.getTime() - startDate.getTime()

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactionRef.current.isActive || !eventRef.current) return
      
      const deltaY = e.clientY - interactionRef.current.startMouseY
    
      if (Math.abs(deltaY) > CALENDAR_CONFIG.DRAG_THRESHOLD_PX) {
        interactionRef.current.hasMoved = true
      }

      const newTop = Math.max(0, interactionRef.current.initialTop + deltaY)
      const newTime = pixelsToTime(newTop)
      const newStartTime = new Date(startDate)
      newStartTime.setHours(newTime.hours, newTime.minutes, 0, 0)
      const newEndTime = new Date(newStartTime.getTime() + duration)
      
      setPreviewTime({
        start: formatTimeForTooltip(newTime.hours, newTime.minutes),
        end: formatTimeForTooltip(newEndTime.getHours(), newEndTime.getMinutes())
      })
      setTooltipPosition({ x: e.clientX + 10, y: e.clientY - 10 })
      
      eventRef.current.style.transform = `translateY(${deltaY}px)`
      eventRef.current.style.zIndex = '100'
    }

    const handleMouseUp = async (e: MouseEvent) => {
      if (!interactionRef.current.isActive || !eventRef.current) return

      const deltaY = e.clientY - interactionRef.current.startMouseY
      const elapsed = Date.now() - interactionRef.current.startTime
      
      // Reset visuals SEMPRE - rimuovi solo gli stili temporanei del drag
      eventRef.current.style.transform = ''
      eventRef.current.style.zIndex = ''
      setIsDragging(false)
      setPreviewTime(null)
      interactionRef.current.isActive = false
      
      // Check if it was a drag
      if (interactionRef.current.hasMoved && elapsed > CALENDAR_CONFIG.CLICK_MAX_DURATION_MS) {
        const newTop = Math.max(0, interactionRef.current.initialTop + deltaY)
        const newTime = pixelsToTime(newTop)
        const newStart = new Date(startDate)
        newStart.setHours(newTime.hours, newTime.minutes, 0, 0)
        const newEnd = new Date(newStart.getTime() + duration)
      
        if (!checkOverlap(newStart, newEnd)) {
          try {
            await onUpdate(booking.id, newStart, newEnd)
          } catch (error) {
            console.error('Drag update failed:', error)
          }
        } else {
          alert('Impossibile spostare: sovrapposizione con altro appuntamento')
        }
      }
      
      // Reset hasMoved per permettere il click successivo
      interactionRef.current.hasMoved = false
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [booking, startDate, endDate, isResizing, getEventStyle, pixelsToTime, checkOverlap, onUpdate])

  const handleResizeStart = useCallback((type: 'top' | 'bottom', e: React.MouseEvent) => {
    if (!eventRef.current || isDragging) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const { top, height } = getEventStyle()
    
    interactionRef.current = {
      startMouseY: e.clientY,
      startTime: Date.now(),
      hasMoved: false,
      initialTop: top,
      initialHeight: height,
      isActive: true
    }
    
    setIsResizing(type)
    setTooltipPosition({ x: e.clientX + 10, y: e.clientY - 10 })
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactionRef.current.isActive || !eventRef.current) return
      
      const deltaY = e.clientY - interactionRef.current.startMouseY
      
      if (Math.abs(deltaY) > CALENDAR_CONFIG.DRAG_THRESHOLD_PX) {
        interactionRef.current.hasMoved = true
      }
      
      let previewStart = startDate
      let previewEnd = endDate
      
      if (type === 'top') {
        const newTop = Math.max(0, interactionRef.current.initialTop + deltaY)
        const newTime = pixelsToTime(newTop)
        previewStart = new Date(startDate)
        previewStart.setHours(newTime.hours, newTime.minutes, 0, 0)
      } else {
        const newHeight = Math.max(40, interactionRef.current.initialHeight + deltaY)
        const endPixels = interactionRef.current.initialTop + newHeight
        const newTime = pixelsToTime(endPixels)
        previewEnd = new Date(endDate)
        previewEnd.setHours(newTime.hours, newTime.minutes, 0, 0)
      }
      
      setPreviewTime({
        start: formatTimeForTooltip(previewStart.getHours(), previewStart.getMinutes()),
        end: formatTimeForTooltip(previewEnd.getHours(), previewEnd.getMinutes())
      })
      setTooltipPosition({ x: e.clientX + 10, y: e.clientY - 10 })
      eventRef.current.style.zIndex = '100'
    }
    
    const handleMouseUp = async (e: MouseEvent) => {
      if (!interactionRef.current.isActive || !eventRef.current) return
      
      const deltaY = e.clientY - interactionRef.current.startMouseY
      const elapsed = Date.now() - interactionRef.current.startTime
      
      // Log dettagliato per debug
      console.log('MOUSEUP:', {
        type,
        localStartAt,
        localEndAt,
        bookingStart: booking.start_at,
        bookingEnd: booking.end_at,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Reset visuals SEMPRE - rimuovi tutti gli stili inline
      eventRef.current.removeAttribute('style')
      setIsResizing(null)
      setPreviewTime(null)
      interactionRef.current.isActive = false
      
      // Check if it was a resize
      if (interactionRef.current.hasMoved && elapsed > CALENDAR_CONFIG.CLICK_MAX_DURATION_MS) {
        let newStart = startDate
        let newEnd = endDate
        
        if (type === 'top') {
          const newTop = Math.max(0, interactionRef.current.initialTop + deltaY)
          const newTime = pixelsToTime(newTop)
          newStart = new Date(startDate)
          newStart.setHours(newTime.hours, newTime.minutes, 0, 0)
        } else {
          const newHeight = Math.max(40, interactionRef.current.initialHeight + deltaY)
          const endPixels = interactionRef.current.initialTop + newHeight
          const newTime = pixelsToTime(endPixels)
          newEnd = new Date(endDate) // Usa endDate come base
          newEnd.setHours(newTime.hours, newTime.minutes, 0, 0)
        }
        
        // Check minimum duration
        const durationMinutes = (newEnd.getTime() - newStart.getTime()) / (60 * 1000)
        if (durationMinutes >= CALENDAR_CONFIG.MIN_DURATION_MINUTES && !checkOverlap(newStart, newEnd)) {
          setLocalStartAt(newStart.toISOString())
          setLocalEndAt(newEnd.toISOString())
          
          try {
            await onUpdate(booking.id, newStart, newEnd)
          } catch (error) {
            console.error('Resize update failed:', error)
            setLocalStartAt(booking.start_at)
            setLocalEndAt(booking.end_at)
          }
        } else if (durationMinutes < CALENDAR_CONFIG.MIN_DURATION_MINUTES) {
          alert(`La durata minima è di ${CALENDAR_CONFIG.MIN_DURATION_MINUTES} minuti`)
        } else {
          alert('Impossibile ridimensionare: sovrapposizione con altro appuntamento')
        }
      }
      
      // Reset hasMoved per permettere il click successivo
      interactionRef.current.hasMoved = false
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [booking, startDate, endDate, isDragging, getEventStyle, pixelsToTime, checkOverlap, onUpdate])

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only trigger click if no interaction is active and no movement occurred
    if (!isDragging && !isResizing && !interactionRef.current.hasMoved) {
      e.stopPropagation()
      console.log('🎯 Click on booking:', booking.id, booking.client.full_name)
      onClick(booking.id)
    } else {
      console.log('🚫 Click blocked:', { 
        isDragging, 
        isResizing, 
        hasMoved: interactionRef.current.hasMoved 
      })
    }
  }, [isDragging, isResizing, onClick, booking.id, booking.client.full_name])

  const { top, height } = getEventStyle()
  // Log dettagliato per debug
  console.log('DEBUG:', {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    top,
    height,
    localStartAt,
    localEndAt,
    bookingStart: booking.start_at,
    bookingEnd: booking.end_at
  });

  return (
    <>
      <div
        ref={eventRef}
        className={`absolute left-1 right-1 rounded-lg shadow-sm cursor-pointer select-none ${getStatusColor(booking.status)} ${
          isDragging || isResizing ? 'opacity-90' : ''
        } transition-shadow duration-200 hover:shadow-md`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          minHeight: '40px',
          zIndex: isDragging || isResizing ? 100 : 10  // z-index esplicito per stare sopra le linee
        }}
        onMouseDown={handleDragStart}
        onClick={handleClick}
      >
        {/* Resize handle top */}
        <div
          className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize group"
          onMouseDown={(e) => handleResizeStart('top', e)}
      >
          <div className="absolute inset-x-0 top-0 h-1 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
              </div>

        {/* Content */}
        <div className="h-full overflow-hidden flex items-center pointer-events-none px-2 py-1">
          {height >= 60 ? (
            // Layout normale per appuntamenti con altezza sufficiente
            <div className="w-full">
              <div className="font-semibold text-sm truncate">
                {format(startDate, 'HH:mm')} {booking.client.full_name}
              </div>
              <div className="text-xs opacity-75 truncate mt-0.5">
                {booking.service.name}
              </div>
              {height >= 80 && booking.staff && (
                <div className="text-xs opacity-60 truncate mt-0.5">
                  👤 {booking.staff.full_name}
                </div>
              )}
            </div>
          ) : (
            // Layout compatto per appuntamenti piccoli (altezza < 60px)
            <div className="flex items-center space-x-2 w-full min-w-0">
              <span className="font-medium text-xs whitespace-nowrap flex-shrink-0">
                {format(startDate, 'HH:mm')}
              </span>
              <span className="text-xs truncate flex-1 font-medium">
                {booking.client.full_name}
              </span>
              {/* Indicatore colorato per il servizio quando non c'è spazio */}
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: getServiceColor(booking.service.id) }}
                title={booking.service.name}
              />
            </div>
          )}
        </div>
        
        {/* Resize handle bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize group"
          onMouseDown={(e) => handleResizeStart('bottom', e)}
        >
          <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg" />
        </div>
      </div>
      
      {/* Tooltip during interaction */}
      {(isDragging || isResizing) && previewTime && (
        <div
          className="fixed z-[200] bg-indigo-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium pointer-events-none border border-indigo-600"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">🕒</span>
            <span className="text-base font-bold">{previewTime.start} - {previewTime.end}</span>
          </div>
          <div className="text-xs opacity-90 mt-1 text-center">
            {isDragging ? '📍 Spostando' : isResizing === 'top' ? '⬆️ Inizio' : '⬇️ Fine'}
          </div>
        </div>
      )}
    </>
  )
}

// Hook per rilevare mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Hook per gestire l'utente loggato
function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error getting current user:', error)
        } else {
          setCurrentUser(user)
        }
      } catch (error) {
        console.error('Error in getCurrentUser:', error)
      } finally {
        setLoading(false)
      }
    }

    getCurrentUser()
  }, [supabase])

  return { currentUser, loading }
}

// Main CalendarView component
export default function CalendarView({ 
  bookings, 
  services, 
  staff, 
  viewType, 
  currentDate, 
  onNavigate, 
  onChangeView, 
  setCurrentDate, 
  refreshBookings,
  onOptimisticBookingUpdate
}: CalendarViewProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const dayRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({})
  const { currentUser, loading: userLoading } = useCurrentUser()
  
  // Stato per il filtro "Tutte / Solo le mie"
  const [showOnlyMyBookings, setShowOnlyMyBookings] = useState(false)
  
  // Filtra le prenotazioni in base al filtro
  const filteredBookings = useMemo(() => {
    let filtered = bookings
    
    // Filtro per "Solo le mie" prenotazioni
    if (showOnlyMyBookings && currentUser) {
      filtered = filtered.filter(booking => {
        return booking.staff?.id === currentUser.id
      })
    }
    
    // Filtri esistenti per servizio e staff
    if (selectedService) {
      filtered = filtered.filter(booking => booking.service.id === selectedService)
    }
    if (selectedStaff) {
      filtered = filtered.filter(booking => booking.staff?.id === selectedStaff)
    }
    
    return filtered
  }, [bookings, showOnlyMyBookings, currentUser, selectedService, selectedStaff])

  // Safe arrays
  const safeServices = Array.isArray(services) ? services : []
  const safeStaff = Array.isArray(staff) ? staff : []

  // Calculate days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthStartWeek = startOfWeek(monthStart, { weekStartsOn: 1 })
  const monthEndWeek = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const monthDays = eachDayOfInterval({ start: monthStartWeek, end: monthEndWeek })

  const workingHours = Array.from({ length: 10 }, (_, i) => i + 9)

  // Group bookings by day
  const bookingsByDay = useMemo(() => {
    const grouped: Record<string, Booking[]> = {}
    
    filteredBookings.forEach(booking => {
      const dateKey = format(new Date(booking.start_at), 'yyyy-MM-dd')
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(booking)
    })
    
    return grouped
  }, [filteredBookings])

  // Initialize refs for each day
  const daysToShow = viewType === 'week' ? weekDays : [currentDate]
  daysToShow.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd')
    if (!dayRefs.current[dateKey]) {
      dayRefs.current[dateKey] = React.createRef<HTMLDivElement>()
    }
  })

  const navigate = (direction: 'prev' | 'next') => {
    if (viewType === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1))
    } else if (viewType === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
    } else {
      setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1))
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

  const handleBookingUpdate = async (bookingId: string, newStart: Date, newEnd: Date) => {
    // Aggiornamento ottimistico
    if (typeof onOptimisticBookingUpdate === 'function') {
      onOptimisticBookingUpdate(bookingId, newStart.toISOString(), newEnd.toISOString())
    }
    try {
      // Mantieni gli orari locali quando invii al server
      // Il server dovrebbe gestire la conversione UTC se necessario
      const requestBody = {
          id: bookingId,
          start_at: newStart.toISOString(),
          end_at: newEnd.toISOString()
      }
      
      console.log('📤 Sending PATCH request:', requestBody)

      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Update successful:', result)
      // Non serve refresh qui, la UI è già aggiornata
    } catch (error: any) {
      // In caso di errore, fai il refresh per riallineare la UI
      if (typeof refreshBookings === 'function') {
        refreshBookings()
      }
      console.error('💥 Error updating booking:', error)
      alert(`Errore nell'aggiornamento: ${error?.message || 'Errore sconosciuto'}`)
      throw error // Re-throw per gestire il rollback nello stato locale
    }
  }

  // Month view
  const renderMonthView = () => {
    const weeks = []
    for (let i = 0; i < monthDays.length; i += 7) {
      weeks.push(monthDays.slice(i, i + 7))
    }

    return (
      <div className="grid grid-rows-6 h-full">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

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
                    {dayBookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className="text-xs p-1 rounded bg-blue-100 cursor-pointer"
                        onClick={() => handleBookingClick(booking.id)}
                      >
                        <div className="font-medium truncate">
                          {format(new Date(booking.start_at), 'HH:mm')} {booking.client.full_name}
                        </div>
                      </div>
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

  // Week/Day view - Google Calendar style
  const renderTimeGridView = () => {
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-30">
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

          {/* Time grid */}
          <div className="relative">
            {workingHours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b-2 border-gray-400">
                <div className="p-4 text-sm text-gray-600 border-r border-gray-100 h-[160px] flex flex-col relative">
                  <div className="font-medium text-base mb-2">
                    {hour === 9 ? '09:00' : `${hour}:00`}
                  </div>
                  {/* Orari intermedi più spaziati */}
                  <div className="absolute top-12 text-sm text-gray-500 font-medium">
                    {hour.toString().padStart(2, '0')}:15
                  </div>
                  <div className="absolute top-20 text-sm text-gray-600 font-medium">
                    {hour.toString().padStart(2, '0')}:30
                  </div>
                  <div className="absolute top-28 text-sm text-gray-500 font-medium">
                    {hour.toString().padStart(2, '0')}:45
                  </div>
                </div>
                {daysToShow.map((day, dayIndex) => {
                  const dateKey = format(day, 'yyyy-MM-dd')
                  const dayBookings = bookingsByDay[dateKey] || []

                  return (
                    <div
                      key={dayIndex}
                      ref={dayRefs.current[dateKey]}
                      className="relative border-l border-gray-100 h-[160px]"
                    >
                      {/* Grid lines corrette - più marcate sugli orari pieni - con pointer-events-none per non bloccare i click */}
                      {/* :15 - linea sottile */}
                      <div className="absolute left-0 right-0 h-px bg-gray-200 opacity-40 pointer-events-none" style={{top: '25%', zIndex: 1}}></div>
                      {/* :30 - linea media (mezz'ora) */}
                      <div className="absolute left-0 right-0 h-px bg-gray-300 opacity-70 pointer-events-none" style={{top: '50%', zIndex: 1}}></div>
                      {/* :45 - linea sottile */}
                      <div className="absolute left-0 right-0 h-px bg-gray-200 opacity-40 pointer-events-none" style={{top: '75%', zIndex: 1}}></div>
                      
                      {/* Linee ogni 5 minuti (molto sottili) */}
                      <div className="absolute left-0 right-0 h-px bg-gray-100 opacity-25 pointer-events-none" style={{top: '12.5%', zIndex: 1}}></div> {/* :07.5 */}
                      <div className="absolute left-0 right-0 h-px bg-gray-100 opacity-25 pointer-events-none" style={{top: '37.5%', zIndex: 1}}></div> {/* :22.5 */}
                      <div className="absolute left-0 right-0 h-px bg-gray-100 opacity-25 pointer-events-none" style={{top: '62.5%', zIndex: 1}}></div> {/* :37.5 */}
                      <div className="absolute left-0 right-0 h-px bg-gray-100 opacity-25 pointer-events-none" style={{top: '87.5%', zIndex: 1}}></div> {/* :52.5 */}
                      
                      {/* Render events only in the first hour to avoid duplication - DOPO le linee così stanno sopra */}
                      {hour === 9 && dayBookings.map((booking) => (
                        <CalendarEvent
                          key={booking.id + booking.start_at + booking.end_at}
                          booking={booking}
                          onUpdate={handleBookingUpdate}
                          onClick={handleBookingClick}
                          dayContainerRef={dayRefs.current[dateKey]}
                          allBookings={filteredBookings}
                        />
                      ))}
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

  // Drawer filtri mobile
  const FiltersDrawer = () => (
    <div className={`fixed inset-0 z-50 ${showFilters ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Filtri</h3>
          <button onClick={() => setShowFilters(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-4">
          {/* Filtro "Tutte / Solo le mie" */}
          {!userLoading && currentUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prenotazioni
              </label>
              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setShowOnlyMyBookings(false)}
                  className={`flex-1 py-2 px-3 text-sm rounded ${
                    !showOnlyMyBookings 
                      ? 'bg-white shadow text-gray-900' 
                      : 'text-gray-600'
                  }`}
                >
                  Tutte
                </button>
                <button
                  onClick={() => setShowOnlyMyBookings(true)}
                  className={`flex-1 py-2 px-3 text-sm rounded ${
                    showOnlyMyBookings 
                      ? 'bg-white shadow text-gray-900' 
                      : 'text-gray-600'
                  }`}
                >
                  Solo le mie
                </button>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servizio
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Tutti i servizi</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operatore
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Tutti gli operatori</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>{member.full_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile header luxury
  const MobileHeader = () => (
    <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-30 md:hidden bg-gradient-to-r from-indigo-100 via-pink-50 to-white shadow-lg" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
      <button onClick={() => {
        const evt = new CustomEvent('openSidebar')
        window.dispatchEvent(evt)
      }} aria-label="Menu" className="p-2 rounded-full hover:bg-indigo-100 transition-colors">
        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <div className="flex flex-col items-center">
        <h1 className="text-xl font-bold tracking-tight text-indigo-500" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>Calendario</h1>
        {showOnlyMyBookings && currentUser && (
          <span className="text-xs text-pink-600 font-medium">Solo le mie prenotazioni</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setShowFilters(true)} aria-label="Filtri" className="p-2 rounded-full hover:bg-pink-100 transition-colors">
          <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-7.414 7.414A1 1 0 0013 15.414V19a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" /></svg>
        </button>
        <button onClick={() => router.push('/bookings/new')} aria-label="Nuova prenotazione" className="p-2 rounded-full bg-indigo-400 text-white shadow-md hover:bg-pink-400 hover:text-indigo-700 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
    </div>
  )

  // Force day view on mobile
  const effectiveViewType = isMobile ? 'day' : viewType

  return (
    <div className={`min-h-screen ${isMobile ? 'bg-gradient-to-b from-pink-50 via-white to-indigo-50' : 'bg-white rounded-lg shadow-lg p-4 max-w-5xl mx-auto min-h-[80vh]'}`} style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
      {/* Header mobile luxury */}
      {isMobile && <MobileHeader />}
      {/* Header desktop luxury */}
      {!isMobile && (
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-100 via-pink-50 to-white rounded-t-lg shadow-sm" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
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
            {/* Filtro "Tutte / Solo le mie" */}
            {!userLoading && currentUser && (
              <div className="flex items-center space-x-2 bg-gray-100 rounded-md px-3 py-1">
                <span className="text-sm font-medium text-gray-700">Prenotazioni:</span>
                <button
                  onClick={() => setShowOnlyMyBookings(false)}
                  className={`px-2 py-1 text-xs rounded ${
                    !showOnlyMyBookings 
                      ? 'bg-white shadow text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tutte
                </button>
                <button
                  onClick={() => setShowOnlyMyBookings(true)}
                  className={`px-2 py-1 text-xs rounded ${
                    showOnlyMyBookings 
                      ? 'bg-white shadow text-gray-900' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Solo le mie
                </button>
              </div>
            )}
            
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
        
            <div className="flex items-center bg-gray-100 rounded-md">
              <button
                onClick={() => onChangeView('day')}
                className={`px-3 py-1 text-sm ${effectiveViewType === 'day' ? 'bg-white shadow' : ''} rounded-l-md`}
              >
                Giorno
              </button>
              <button
                onClick={() => onChangeView('week')}
                className={`px-3 py-1 text-sm ${effectiveViewType === 'week' ? 'bg-white shadow' : ''}`}
              >
                Settimana
              </button>
              <button
                onClick={() => onChangeView('month')}
                className={`px-3 py-1 text-sm ${effectiveViewType === 'month' ? 'bg-white shadow' : ''} rounded-r-md`}
              >
                Mese
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Filtri drawer mobile luxury */}
      {isMobile && <FiltersDrawer />}
      {/* Calendar Content luxury */}
      <div className={`flex-1 ${isMobile ? 'p-0' : 'overflow-auto'} w-full`}>
        <div className={`${isMobile ? 'bg-white rounded-t-2xl shadow-md p-2 mt-2' : ''}`} style={{ minHeight: isMobile ? '80vh' : undefined }}>
          {effectiveViewType === 'month' ? renderMonthView() : renderTimeGridView()}
        </div>
      </div>
    </div>
  )
}

// Export both as default and named export
export { CalendarView }