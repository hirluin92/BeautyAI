'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfWeek, addDays, isSameDay, startOfDay, endOfDay } from 'date-fns'
import { it } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Plus,
  Clock,
  Users,
  Sparkles,
  Eye,
  EyeOff,
  Search,
  Settings,
  User,
  MapPin,
  Phone,
  Euro,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react'

// ==================== TYPES ====================
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

interface CalendarViewProps {
  bookings: Booking[]
  services: { id: string; name: string; price?: number; duration_minutes?: number }[]
  staff: { id: string; full_name: string; email?: string }[]
  viewType: 'week' | 'month' | 'day'
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next') => void
  onChangeView: (view: 'week' | 'month' | 'day') => void
  setCurrentDate: (date: Date) => void
  refreshBookings?: () => void
  onOptimisticBookingUpdate?: (bookingId: string, newStart: string, newEnd: string) => void
}

// ==================== CONSTANTS ====================
const CALENDAR_CONFIG = {
  HOUR_HEIGHT: 120,
  START_HOUR: 9,
  END_HOUR: 18,
  SNAP_MINUTES: 5,
  MIN_DURATION_MINUTES: 20,
  DRAG_THRESHOLD_PX: 3,
  CLICK_MAX_DURATION_MS: 200,
  BUFFER_MINUTES: 0,
  MOBILE_HOUR_HEIGHT: 100,
  COMPACT_HOUR_HEIGHT: 80,
  MIN_EVENT_HEIGHT: 40
} as const

// Dashboard-coherent colors - subtle and elegant glassmorphism style
const SERVICE_COLORS = [
  { 
    bg: 'bg-white/20 backdrop-blur-sm border border-purple-400/30', 
    text: 'text-white', 
    accent: '#a855f7',
    glow: 'shadow-purple-400/20'
  },
  { 
    bg: 'bg-white/20 backdrop-blur-sm border border-cyan-400/30', 
    text: 'text-white', 
    accent: '#06b6d4',
    glow: 'shadow-cyan-400/20'
  },
  { 
    bg: 'bg-white/20 backdrop-blur-sm border border-emerald-400/30', 
    text: 'text-white', 
    accent: '#10b981',
    glow: 'shadow-emerald-400/20'
  },
  { 
    bg: 'bg-white/20 backdrop-blur-sm border border-pink-400/30', 
    text: 'text-white', 
    accent: '#ec4899',
    glow: 'shadow-pink-400/20'
  },
  { 
    bg: 'bg-white/20 backdrop-blur-sm border border-orange-400/30', 
    text: 'text-white', 
    accent: '#f97316',
    glow: 'shadow-orange-400/20'
  },
  { 
    bg: 'bg-white/20 backdrop-blur-sm border border-blue-400/30', 
    text: 'text-white', 
    accent: '#3b82f6',
    glow: 'shadow-blue-400/20'
  },
  { 
    bg: 'bg-white/20 backdrop-blur-sm border border-rose-400/30', 
    text: 'text-white', 
    accent: '#f43f5e',
    glow: 'shadow-rose-400/20'
  },
  { 
    bg: 'bg-white/20 backdrop-blur-sm border border-teal-400/30', 
    text: 'text-white', 
    accent: '#14b8a6',
    glow: 'shadow-teal-400/20'
  },
]

// ==================== UTILITY FUNCTIONS ====================
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-white/20 backdrop-blur-sm border border-emerald-400/50 text-white shadow-emerald-400/30'
    case 'pending':
      return 'bg-white/20 backdrop-blur-sm border border-amber-400/50 text-white shadow-amber-400/30'
    case 'completed':
      return 'bg-white/20 backdrop-blur-sm border border-blue-400/50 text-white shadow-blue-400/30'
    case 'cancelled':
      return 'bg-white/10 backdrop-blur-sm border border-gray-400/50 text-white/70 shadow-gray-400/20'
    case 'no_show':
      return 'bg-white/20 backdrop-blur-sm border border-red-400/50 text-white shadow-red-400/30'
    default:
      return 'bg-white/20 backdrop-blur-sm border border-purple-400/50 text-white shadow-purple-400/30'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed': return <CheckCircle className="w-3 h-3 text-emerald-400" />
    case 'pending': return <Clock className="w-3 h-3 text-amber-400" />
    case 'completed': return <CheckCircle className="w-3 h-3 text-blue-400" />
    case 'cancelled': return <XCircle className="w-3 h-3 text-gray-400" />
    case 'no_show': return <AlertCircle className="w-3 h-3 text-red-400" />
    default: return <Clock className="w-3 h-3 text-purple-400" />
  }
}

const getServiceColor = (serviceId: string) => {
  const index = serviceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % SERVICE_COLORS.length
  return SERVICE_COLORS[index]
}

const formatTimeForTooltip = (hours: number, minutes: number) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

// Hook for current user
const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      setLoading(false)
    }
    getUser()
  }, [])
  
  return { currentUser, loading }
}

// ==================== CURRENT TIME INDICATOR ====================
function CurrentTimeIndicator({ hourHeight }: { hourHeight: number }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
  const workStartMinutes = CALENDAR_CONFIG.START_HOUR * 60
  const workEndMinutes = CALENDAR_CONFIG.END_HOUR * 60

  if (currentMinutes < workStartMinutes || currentMinutes > workEndMinutes) {
    return null
  }

  const topPosition = ((currentMinutes - workStartMinutes) / 60) * hourHeight

  return (
    <div
      className="absolute left-0 right-0 z-30 pointer-events-none"
      style={{ top: `${topPosition}px` }}
    >
      <div className="flex items-center">
        <div className="w-3 h-3 bg-pink-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
        <div className="flex-1 h-0.5 bg-pink-400 shadow-sm" />
        <div className="bg-pink-400 text-white text-xs px-2 py-1 rounded-md ml-2 font-medium">
          {format(currentTime, 'HH:mm')}
        </div>
      </div>
    </div>
  )
}

// ==================== CALENDAR EVENT WITH COMPLETE DRAG & DROP ====================
interface CalendarEventProps {
  booking: Booking
  onUpdate: (bookingId: string, newStart: Date, newEnd: Date) => Promise<void>
  onClick: (id: string) => void
  dayContainerRef: React.RefObject<HTMLDivElement>
  allBookings: Booking[]
  isMobile: boolean
  hourHeight: number
}

function CalendarEvent({
  booking,
  onUpdate,
  onClick,
  dayContainerRef,
  allBookings,
  isMobile,
  hourHeight
}: CalendarEventProps) {
  // Stati locali per rendering ottimistico
  const [localStartAt, setLocalStartAt] = useState(booking.start_at)
  const [localEndAt, setLocalEndAt] = useState(booking.end_at)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [previewTime, setPreviewTime] = useState({ start: '', end: '' })
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const eventRef = useRef<HTMLDivElement>(null)
  const interactionRef = useRef({
    startMouseY: 0,
    startTime: 0,
    hasMoved: false,
    initialTop: 0,
    initialHeight: 0,
    isActive: false
  })

  // Sync with props
  useEffect(() => {
    setLocalStartAt(booking.start_at)
    setLocalEndAt(booking.end_at)
  }, [booking.start_at, booking.end_at])

  const startDate = useMemo(() => new Date(localStartAt), [localStartAt])
  const endDate = useMemo(() => new Date(localEndAt), [localEndAt])

  // Utility functions
  const minutesPerPixel = 60 / hourHeight

  const getEventStyle = useCallback(() => {
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes()
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes()
    const workStartMinutes = CALENDAR_CONFIG.START_HOUR * 60
    const durationMinutes = endMinutes - startMinutes
    const top = ((startMinutes - workStartMinutes) / 60) * hourHeight
    const height = Math.max((durationMinutes / 60) * hourHeight, CALENDAR_CONFIG.MIN_EVENT_HEIGHT || 40)
    return { top, height }
  }, [startDate, endDate, hourHeight, booking.id])

  const pixelsToTime = useCallback((pixels: number) => {
    const totalMinutes = Math.round(pixels * minutesPerPixel)
    const workStartMinutes = CALENDAR_CONFIG.START_HOUR * 60
    const actualMinutes = workStartMinutes + totalMinutes
    const hours = Math.floor(actualMinutes / 60)
    const minutes = Math.round((actualMinutes % 60) / CALENDAR_CONFIG.SNAP_MINUTES) * CALENDAR_CONFIG.SNAP_MINUTES
    return { hours: Math.max(0, Math.min(23, hours)), minutes: Math.max(0, Math.min(59, minutes)) }
  }, [minutesPerPixel])

  const checkOverlap = useCallback((newStart: Date, newEnd: Date) => {
    return allBookings.some(otherBooking => {
      if (otherBooking.id === booking.id) return false
      const otherStart = new Date(otherBooking.start_at)
      const otherEnd = new Date(otherBooking.end_at)
      return (newStart < otherEnd && newEnd > otherStart)
    })
  }, [allBookings, booking.id])

  const validateTimeSlot = useCallback((newStart: Date, newEnd: Date) => {
    const duration = newEnd.getTime() - newStart.getTime()
    const minDuration = CALENDAR_CONFIG.MIN_DURATION_MINUTES * 60 * 1000
    
    if (duration < minDuration) {
      return `Durata minima: ${formatDuration(CALENDAR_CONFIG.MIN_DURATION_MINUTES)}`
    }
    
    if (newStart.getHours() < CALENDAR_CONFIG.START_HOUR) {
      return `Orario di inizio non valido (min: ${CALENDAR_CONFIG.START_HOUR}:00)`
    }
    
    if (newEnd.getHours() >= CALENDAR_CONFIG.END_HOUR) {
      return `Orario di fine non valido (max: ${CALENDAR_CONFIG.END_HOUR}:00)`
    }
    
    if (checkOverlap(newStart, newEnd)) {
      return 'Sovrapposizione con altro appuntamento'
    }
    
    return null
  }, [checkOverlap])

  // COMPLETE DRAG HANDLERS
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!eventRef.current || isResizing || isMobile) return
    
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
    setError(null)
    
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
      
      const validationError = validateTimeSlot(newStartTime, newEndTime)
      
      setPreviewTime({
        start: formatTimeForTooltip(newTime.hours, newTime.minutes),
        end: formatTimeForTooltip(newEndTime.getHours(), newEndTime.getMinutes())
      })
      setTooltipPosition({ x: e.clientX + 10, y: e.clientY - 10 })
      setError(validationError)
      
      eventRef.current.style.transform = `translateY(${deltaY}px)`
      eventRef.current.style.zIndex = '100'
      eventRef.current.style.opacity = validationError ? '0.7' : '0.9'
    }

    const handleMouseUp = async (e: MouseEvent) => {
      if (!interactionRef.current.isActive || !eventRef.current) return

      const deltaY = e.clientY - interactionRef.current.startMouseY
      const elapsed = Date.now() - interactionRef.current.startTime
      
      eventRef.current.style.transform = ''
      eventRef.current.style.zIndex = ''
      eventRef.current.style.opacity = ''
      setIsDragging(false)
      setPreviewTime({ start: '', end: '' })
      setError(null)
      interactionRef.current.isActive = false
      
      if (interactionRef.current.hasMoved && elapsed > CALENDAR_CONFIG.CLICK_MAX_DURATION_MS) {
        const newTop = Math.max(0, interactionRef.current.initialTop + deltaY)
        const newTime = pixelsToTime(newTop)
        const newStart = new Date(startDate)
        newStart.setHours(newTime.hours, newTime.minutes, 0, 0)
        const newEnd = new Date(newStart.getTime() + duration)
      
        const validationError = validateTimeSlot(newStart, newEnd)
        
        if (!validationError) {
          setIsUpdating(true)
          try {
            await onUpdate(booking.id, newStart, newEnd)
          } catch (error) {
            console.error('Drag update failed:', error)
            setError('Errore durante l\'aggiornamento')
          } finally {
            setIsUpdating(false)
          }
        }
      }
      
      interactionRef.current.hasMoved = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [booking, startDate, endDate, isDragging, getEventStyle, pixelsToTime, validateTimeSlot, onUpdate, isMobile])

  // COMPLETE RESIZE HANDLERS
  const handleResizeStart = useCallback((type: 'top' | 'bottom', e: React.MouseEvent) => {
    if (!eventRef.current || isDragging || isMobile) return
    
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
    setError(null)
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactionRef.current.isActive || !eventRef.current) return
      
      const deltaY = e.clientY - interactionRef.current.startMouseY
      
      if (Math.abs(deltaY) > CALENDAR_CONFIG.DRAG_THRESHOLD_PX) {
        interactionRef.current.hasMoved = true
      }
      
      let previewStart = startDate
      let previewEnd = endDate
      let validationError: string | null = null
      
      if (type === 'top') {
        const newTop = Math.max(0, interactionRef.current.initialTop + deltaY)
        const newTime = pixelsToTime(newTop)
        previewStart = new Date(startDate)
        previewStart.setHours(newTime.hours, newTime.minutes, 0, 0)
        validationError = validateTimeSlot(previewStart, endDate)
      } else {
        const newHeight = Math.max(40, interactionRef.current.initialHeight + deltaY)
        const endPixels = interactionRef.current.initialTop + newHeight
        const newTime = pixelsToTime(endPixels)
        previewEnd = new Date(endDate)
        previewEnd.setHours(newTime.hours, newTime.minutes, 0, 0)
        validationError = validateTimeSlot(startDate, previewEnd)
      }
      
      setPreviewTime({
        start: formatTimeForTooltip(previewStart.getHours(), previewStart.getMinutes()),
        end: formatTimeForTooltip(previewEnd.getHours(), previewEnd.getMinutes())
      })
      setTooltipPosition({ x: e.clientX + 10, y: e.clientY - 10 })
      setError(validationError)
      
      if (eventRef.current) {
        eventRef.current.style.opacity = validationError ? '0.7' : '0.9'
      }
    }

    const handleMouseUp = async (e: MouseEvent) => {
      if (!interactionRef.current.isActive || !eventRef.current) return
      
      const deltaY = e.clientY - interactionRef.current.startMouseY
      const elapsed = Date.now() - interactionRef.current.startTime
      
      eventRef.current.style.opacity = ''
      setIsResizing(null)
      setPreviewTime({ start: '', end: '' })
      setError(null)
      interactionRef.current.isActive = false
      
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
          newEnd = new Date(endDate)
          newEnd.setHours(newTime.hours, newTime.minutes, 0, 0)
        }
        
        const validationError = validateTimeSlot(newStart, newEnd)
        
        if (!validationError) {
          setIsUpdating(true)
          try {
            await onUpdate(booking.id, newStart, newEnd)
          } catch (error) {
            console.error('Resize update failed:', error)
            setError('Errore durante l\'aggiornamento')
          } finally {
            setIsUpdating(false)
          }
        }
      }
      
      interactionRef.current.hasMoved = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [booking, startDate, endDate, isResizing, getEventStyle, pixelsToTime, validateTimeSlot, onUpdate, isMobile])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isDragging && !isResizing && !interactionRef.current.hasMoved) {
      e.stopPropagation()
      onClick(booking.id)
    }
  }, [isDragging, isResizing, onClick, booking.id])

  const { top, height } = getEventStyle()
  const serviceColor = getServiceColor(booking.service.id)
  const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))

  return (
    <>
      <div
        ref={eventRef}
        className={`absolute left-1 right-1 rounded-xl cursor-pointer select-none transition-all duration-200 group ${getStatusColor(booking.status)} ${serviceColor.glow} ${
          isDragging || isResizing ? 'scale-105 shadow-2xl z-50' : 'shadow-lg'
        }`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          minHeight: '40px',
          zIndex: isDragging || isResizing ? 100 : 10,
        }}
        onMouseDown={handleDragStart}
        onClick={handleClick}
      >
        {/* FIX: Resize handle TOP - Più visibile e funzionale */}
        {!isMobile && height >= 60 && (
          <div
            className="absolute top-0 left-0 right-0 h-4 cursor-ns-resize z-20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center rounded-t-xl"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleResizeStart('top', e)
            }}
          >
            <div className="w-6 h-1 bg-white/60 rounded-full group-hover:bg-white/90 transition-all duration-200" />
          </div>
        )}
        
        {/* Content area */}
        <div className="px-3 py-2 h-full flex flex-col justify-center pointer-events-none overflow-hidden">
          {height >= (isMobile ? 50 : 60) ? (
            <div className="w-full space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm text-white flex items-center gap-2">
                  {getStatusIcon(booking.status)}
                  {format(startDate, 'HH:mm')}
                </div>
                <div className="text-xs text-white/90 font-medium bg-white/10 px-2 py-1 rounded-lg">
                  €{booking.price}
                </div>
              </div>
              <div className="font-bold text-base text-white truncate">
                {booking.client.full_name}
              </div>
              <div className="text-xs text-white/80 truncate bg-white/10 px-2 py-1 rounded-lg">
                {booking.service.name}
              </div>
              {/* FIX: Mostra durata effettiva */}
              {height >= (isMobile ? 80 : 100) && (
                <div className="text-xs text-white/70 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>
                    {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')} 
                    ({formatDuration(durationMinutes)})
                  </span>
                </div>
              )}
              {height >= (isMobile ? 100 : 120) && booking.staff && (
                <div className="text-xs text-white/70 truncate flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {booking.staff.full_name}
                </div>
              )}
            </div>
          ) : height >= (isMobile ? 35 : 50) ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-sm text-white flex items-center gap-1">
                  {getStatusIcon(booking.status)}
                  {format(startDate, 'HH:mm')}
                </div>
                <div className="text-xs text-white/90">
                  €{booking.price}
                </div>
              </div>
              <div className="font-medium text-sm text-white truncate">
                {booking.client.full_name}
              </div>
              <div className="text-xs text-white/70">
                {format(endDate, 'HH:mm')} • {formatDuration(durationMinutes)}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 w-full min-w-0">
              <span className="font-semibold text-xs text-white whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                {getStatusIcon(booking.status)}
                {format(startDate, 'HH:mm')}
              </span>
              <span className="text-xs text-white truncate flex-1 font-medium">
                {booking.client.full_name}
              </span>
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white/40" 
                style={{ backgroundColor: serviceColor.accent }}
                title={`${booking.service.name} - ${format(endDate, 'HH:mm')}`}
              />
            </div>
          )}
        </div>
        
        {/* FIX: Resize handle BOTTOM - Più visibile e funzionale */}
        {!isMobile && height >= 60 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize z-20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center rounded-b-xl"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleResizeStart('bottom', e)
            }}
          >
            <div className="w-6 h-1 bg-white/60 rounded-full group-hover:bg-white/90 transition-all duration-200" />
          </div>
        )}

        {/* Loading indicator */}
        {isUpdating && (
          <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
            <Loader className="w-4 h-4 animate-spin text-white" />
          </div>
        )}
      </div>
      
      {/* Tooltip COMPLETO */}
      {(isDragging || isResizing) && previewTime.start && (
        <div
          className={`fixed z-[200] text-white px-6 py-4 rounded-2xl shadow-2xl text-sm font-medium pointer-events-none border backdrop-blur-sm ${
            error 
              ? 'bg-gradient-to-r from-red-900/90 to-pink-900/90 border-red-500/50' 
              : 'bg-gradient-to-r from-slate-900/90 to-purple-900/90 border-purple-500/50'
          }`}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              error ? 'bg-red-500/20' : 'bg-white/10'
            }`}>
              {error ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-lg font-bold">{previewTime.start} - {previewTime.end}</div>
              <div className="text-xs text-white/80">
                {error || (isDragging ? '📍 Spostando appuntamento' : isResizing === 'top' ? '⬆️ Modificando inizio' : '⬇️ Modificando fine')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && !isDragging && !isResizing && (
        <div className="fixed bottom-4 right-4 z-[300] bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </>
  )
}

// ==================== WEEK VIEW COMPONENT ====================
function WeekView({ 
  currentDate, 
  bookings, 
  onClick, 
  onUpdate,
  services,
  staff,
  isMobile,
  hourHeight
}: {
  currentDate: Date
  bookings: Booking[]
  onClick: (id: string) => void
  onUpdate?: (bookingId: string, newStart: string, newEnd: string) => void
  services: any[]
  staff: any[]
  isMobile: boolean
  hourHeight: number
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const workingHours = Array.from({ length: CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR }, (_, i) => CALENDAR_CONFIG.START_HOUR + i)
  const dayRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({})

  const getBookingsForDay = (day: Date) => {
    const dayStart = startOfDay(day)
    const dayEnd = endOfDay(day)
    
    return bookings.filter(booking => {
      const bookingStart = new Date(booking.start_at)
      return bookingStart >= dayStart && bookingStart <= dayEnd
    })
  }

  const updateBooking = useCallback(async (bookingId: string, newStart: Date, newEnd: Date) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bookingId,
          start_at: newStart.toISOString(),
          end_at: newEnd.toISOString(),
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update booking')
      }
      
      if (onUpdate) {
        onUpdate(bookingId, newStart.toISOString(), newEnd.toISOString())
      }
    } catch (error) {
      console.error('❌ Error updating booking:', error)
      throw error
    }
  }, [onUpdate])

  return (
    <div className="h-full flex flex-col">
      {/* Week days header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-6 py-3">
        <div className="grid grid-cols-8 gap-4">
          <div className="text-sm font-medium text-white/60"></div>
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date())
            const dayBookings = getBookingsForDay(day)
            
            return (
              <div 
                key={day.toISOString()} 
                className={`text-center cursor-pointer p-3 rounded-xl transition-all hover:bg-white/10 ${
                  isToday ? 'bg-white/20 border border-white/30' : ''
                }`}
              >
                <div className={`text-sm font-medium ${isToday ? 'text-white' : 'text-white/80'}`}>
                  {format(day, 'EEE', { locale: it })}
                </div>
                <div className={`text-2xl font-bold mt-1 ${isToday ? 'text-white' : 'text-white/90'}`}>
                  {format(day, 'd')}
                </div>
                {dayBookings.length > 0 && (
                  <div className="mt-2 flex justify-center">
                    <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      isToday 
                        ? 'bg-white/30 text-white' 
                        : 'bg-white/20 text-white/80'
                    }`}>
                      {dayBookings.length}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Week calendar grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 h-full">
          {/* Time column */}
          <div className="bg-white/5 backdrop-blur-sm border-r border-white/20 sticky left-0 z-10">
            {workingHours.map((hour) => (
              <div
                key={hour}
                className="flex items-center justify-end pr-4 text-sm text-white/70 font-medium border-b border-white/10"
                style={{ height: `${hourHeight}px` }}
              >
                <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg text-white font-semibold">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Days columns */}
          {weekDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd')
            if (!dayRefs.current[dayKey]) {
              dayRefs.current[dayKey] = React.createRef() as React.RefObject<HTMLDivElement>
            }
            
            const dayBookings = getBookingsForDay(day)
            const isToday = isSameDay(day, new Date())
            
            return (
              <div
                key={dayKey}
                ref={dayRefs.current[dayKey]}
                className={`relative border-r border-white/10 ${
                  isToday ? 'bg-white/5' : 'bg-transparent'
                }`}
                style={{ minHeight: `${workingHours.length * hourHeight}px` }}
              >
                {/* Hour lines */}
                {workingHours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-b border-white/5"
                    style={{ top: `${(hour - CALENDAR_CONFIG.START_HOUR) * hourHeight}px` }}
                  />
                ))}
                
                {/* Current time indicator */}
                {isToday && <CurrentTimeIndicator hourHeight={hourHeight} />}
                
                {/* Bookings */}
                {dayBookings.map((booking) => (
                  <CalendarEvent
                    key={booking.id}
                    booking={booking}
                    onUpdate={updateBooking}
                    onClick={onClick}
                    dayContainerRef={dayRefs.current[dayKey]}
                    allBookings={dayBookings}
                    isMobile={isMobile}
                    hourHeight={hourHeight}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ==================== MONTH VIEW COMPONENT ====================
function MonthView({ 
  currentDate, 
  bookings, 
  onClick, 
  onDateSelect,
  services,
  staff
}: {
  currentDate: Date
  bookings: Booking[]
  onClick: (id: string) => void
  onDateSelect: (date: Date) => void
  services: any[]
  staff: any[]
}) {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 })
  const monthDays = Array.from({ length: 42 }, (_, i) => addDays(startDate, i))

  const getBookingsForDay = (day: Date) => {
    const dayStart = startOfDay(day)
    const dayEnd = endOfDay(day)
    
    return bookings.filter(booking => {
      const bookingStart = new Date(booking.start_at)
      return bookingStart >= dayStart && bookingStart <= dayEnd
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Month header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="grid grid-cols-7 gap-4">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-white/80 py-2">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Month grid */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-white/5">
        {monthDays.map((day) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth()
          const isToday = isSameDay(day, new Date())
          const dayBookings = getBookingsForDay(day)

          return (
            <div
              key={day.toISOString()}
              className={`p-3 min-h-32 cursor-pointer transition-all hover:bg-white/10 ${
                !isCurrentMonth ? 'text-white/30' : 'text-white'
              } ${isToday ? 'bg-white/20 border border-white/30' : 'bg-white/5'}`}
              onClick={() => onDateSelect(day)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  !isCurrentMonth ? 'text-white/30' : isToday ? 'text-white font-bold' : 'text-white/90'
                }`}>
                  {format(day, 'd')}
                </span>
                {dayBookings.length > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    isToday 
                      ? 'bg-white/30 text-white' 
                      : 'bg-white/20 text-white/80'
                  }`}>
                    {dayBookings.length}
                  </span>
                )}
              </div>
              
              {/* Day appointments */}
              <div className="space-y-1">
                {dayBookings.slice(0, 3).map((booking) => {
                  const serviceColor = getServiceColor(booking.service.id)
                  return (
                    <div
                      key={booking.id}
                      className={`text-xs p-2 rounded-md cursor-pointer transition-all hover:scale-105 ${serviceColor.bg} ${serviceColor.text} ${serviceColor.glow}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onClick(booking.id)
                      }}
                      title={`${format(new Date(booking.start_at), 'HH:mm')} - ${booking.client.full_name} - ${booking.service.name}`}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(booking.status)}
                        <span className="font-semibold">{format(new Date(booking.start_at), 'HH:mm')}</span>
                        <span className="truncate font-medium">{booking.client.full_name}</span>
                      </div>
                    </div>
                  )
                })}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-white/60 text-center py-1 bg-white/10 rounded-md">
                    +{dayBookings.length - 3} altri
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== DAY VIEW COMPONENT ====================
function DayView({ 
  currentDate, 
  bookings, 
  onClick, 
  onUpdate,
  services,
  staff,
  isMobile,
  hourHeight
}: {
  currentDate: Date
  bookings: Booking[]
  onClick: (id: string) => void
  onUpdate?: (bookingId: string, newStart: string, newEnd: string) => void
  services: any[]
  staff: any[]
  isMobile: boolean
  hourHeight: number
}) {
  const workingHours = Array.from({ length: CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR }, (_, i) => CALENDAR_CONFIG.START_HOUR + i)
  const dayRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>

  const dayBookings = useMemo(() => {
    const dayStart = startOfDay(currentDate)
    const dayEnd = endOfDay(currentDate)
    
    return bookings.filter(booking => {
      const bookingStart = new Date(booking.start_at)
      return bookingStart >= dayStart && bookingStart <= dayEnd
    })
  }, [bookings, currentDate])

  const updateBooking = useCallback(async (bookingId: string, newStart: Date, newEnd: Date) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bookingId,
          start_at: newStart.toISOString(),
          end_at: newEnd.toISOString(),
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update booking')
      }
      
      if (onUpdate) {
        onUpdate(bookingId, newStart.toISOString(), newEnd.toISOString())
      }
    } catch (error) {
      console.error('❌ Error updating booking:', error)
      throw error
    }
  }, [onUpdate])

  const isToday = isSameDay(currentDate, new Date())

  return (
    <div className="h-full flex flex-col">
      {/* Day header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${isToday ? 'text-white' : 'text-white/90'}`}>
            {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
          </div>
          <div className="text-white/70 text-sm mt-1">
            {dayBookings.length} appuntament{dayBookings.length !== 1 ? 'i' : 'o'}
          </div>
        </div>
      </div>

      {/* Day calendar grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 h-full">
          {/* Time column */}
          <div className="bg-white/5 backdrop-blur-sm border-r border-white/20 sticky left-0 z-10">
            {workingHours.map((hour) => (
              <div
                key={hour}
                className="flex items-center justify-end pr-4 text-sm text-white/70 font-medium border-b border-white/10"
                style={{ height: `${hourHeight}px` }}
              >
                <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg text-white font-semibold">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day column */}
          <div
            ref={dayRef}
            className={`relative ${isToday ? 'bg-white/5' : 'bg-transparent'}`}
            style={{ minHeight: `${workingHours.length * hourHeight}px` }}
          >
            {/* Hour lines */}
            {workingHours.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-b border-white/5"
                style={{ top: `${(hour - CALENDAR_CONFIG.START_HOUR) * hourHeight}px` }}
              />
            ))}
            
            {/* Current time indicator */}
            {isToday && <CurrentTimeIndicator hourHeight={hourHeight} />}
            
            {/* Bookings */}
            {dayBookings.map((booking) => (
              <CalendarEvent
                key={booking.id}
                booking={booking}
                onUpdate={updateBooking}
                onClick={onClick}
                dayContainerRef={dayRef}
                allBookings={dayBookings}
                isMobile={isMobile}
                hourHeight={hourHeight}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== MAIN CALENDAR VIEW COMPONENT ====================
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
  const [searchQuery, setSearchQuery] = useState('')
  const dayRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({})
  const { currentUser, loading: userLoading } = useCurrentUser()
  
  const [showOnlyMyBookings, setShowOnlyMyBookings] = useState(false)
  
  // Dynamic hour height based on view and device
  const hourHeight = useMemo(() => {
    if (isMobile) return CALENDAR_CONFIG.MOBILE_HOUR_HEIGHT
    if (viewType === 'week') return CALENDAR_CONFIG.COMPACT_HOUR_HEIGHT
    return CALENDAR_CONFIG.HOUR_HEIGHT
  }, [isMobile, viewType])
  
  // Enhanced filters
  const filteredBookings = useMemo(() => {
    let filtered = bookings || []
    
    if (showOnlyMyBookings && currentUser) {
      filtered = filtered.filter(booking => booking.staff?.id === currentUser.id)
    }
    
    if (selectedService) {
      filtered = filtered.filter(booking => booking.service.id === selectedService)
    }
    
    if (selectedStaff) {
      filtered = filtered.filter(booking => booking.staff?.id === selectedStaff)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(booking => 
        booking.client.full_name.toLowerCase().includes(query) ||
        booking.service.name.toLowerCase().includes(query) ||
        (booking.staff?.full_name.toLowerCase().includes(query)) ||
        booking.notes?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [bookings, showOnlyMyBookings, currentUser, selectedService, selectedStaff, searchQuery])

  const safeServices = Array.isArray(services) ? services : []
  const safeStaff = Array.isArray(staff) ? staff : []

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [currentDate])

  const handleBookingClick = useCallback((bookingId: string) => {
    router.push(`/bookings/${bookingId}`)
  }, [router])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedService) count++
    if (selectedStaff) count++
    if (searchQuery) count++
    if (showOnlyMyBookings) count++
    return count
  }, [selectedService, selectedStaff, searchQuery, showOnlyMyBookings])

  const clearAllFilters = useCallback(() => {
    setSelectedService('')
    setSelectedStaff('')
    setShowOnlyMyBookings(false)
    setSearchQuery('')
  }, [])

  // Statistiche rapide
  const todayStats = useMemo(() => {
    const today = new Date()
    const todayBookings = filteredBookings.filter(booking => 
      isSameDay(new Date(booking.start_at), today)
    )
    
    return {
      total: todayBookings.length,
      confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
      pending: todayBookings.filter(b => b.status === 'pending').length,
      revenue: todayBookings.reduce((sum, b) => sum + b.price, 0)
    }
  }, [filteredBookings])

  return (
    <div className="h-full flex flex-col">
      {/* Modern header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Navigation and title */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('prev')}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 text-white"
                title="Periodo precedente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">
                  {viewType === 'month' 
                    ? format(currentDate, 'MMMM yyyy', { locale: it })
                    : viewType === 'week'
                    ? `${format(weekDays[0], 'd MMM', { locale: it })} - ${format(weekDays[6], 'd MMM yyyy', { locale: it })}`
                    : format(currentDate, 'EEEE d MMMM yyyy', { locale: it })
                  }
                </h1>
                <p className="text-white/80 text-sm">
                  {filteredBookings.length} appuntament{filteredBookings.length !== 1 ? 'i' : 'o'}
                  {activeFiltersCount > 0 && ` (${activeFiltersCount} filtro${activeFiltersCount > 1 ? 'i' : ''} attivo${activeFiltersCount > 1 ? 'i' : ''})`}
                </p>
              </div>
              
              <button
                onClick={() => onNavigate('next')}
                className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 text-white"
                title="Periodo successivo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Stats rapide */}
            <div className="hidden lg:flex items-center gap-4 ml-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <CalendarIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">{todayStats.total} oggi</span>
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white">{todayStats.confirmed} confermati</span>
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">€{todayStats.revenue}</span>
              </div>
            </div>

            {/* View type buttons */}
            <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
              {(['day', 'week', 'month'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => onChangeView(view)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewType === view
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {view === 'day' ? 'Giorno' : view === 'week' ? 'Settimana' : 'Mese'}
                </button>
              ))}
            </div>
          </div>

          {/* Actions and filters */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Cerca appuntamenti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all w-64"
              />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-all duration-200 relative ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
              }`}
              title="Filtri"
            >
              <Filter className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Quick actions */}
            <button
              onClick={() => router.push('/bookings/new')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuovo
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex flex-wrap items-center gap-4">
              {/* Service filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white">Servizio:</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="" className="bg-gray-800">Tutti i servizi</option>
                  {safeServices.map((service) => (
                    <option key={service.id} value={service.id} className="bg-gray-800">
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Staff filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white">Staff:</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="" className="bg-gray-800">Tutto lo staff</option>
                  {safeStaff.map((member) => (
                    <option key={member.id} value={member.id} className="bg-gray-800">
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* My bookings only */}
              {currentUser && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyMyBookings}
                    onChange={(e) => setShowOnlyMyBookings(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-white">Solo i miei appuntamenti</span>
                </label>
              )}

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-white/80 hover:text-white underline"
                >
                  Cancella {activeFiltersCount} filtro{activeFiltersCount > 1 ? 'i' : ''} attivo{activeFiltersCount > 1 ? 'i' : ''}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-hidden">
        {viewType === 'week' && (
          <WeekView
            currentDate={currentDate}
            bookings={filteredBookings}
            onClick={handleBookingClick}
            onUpdate={onOptimisticBookingUpdate}
            services={safeServices}
            staff={safeStaff}
            isMobile={isMobile}
            hourHeight={hourHeight}
          />
        )}

        {viewType === 'month' && (
          <MonthView
            currentDate={currentDate}
            bookings={filteredBookings}
            onClick={handleBookingClick}
            onDateSelect={setCurrentDate}
            services={safeServices}
            staff={safeStaff}
          />
        )}

        {viewType === 'day' && (
          <DayView
            currentDate={currentDate}
            bookings={filteredBookings}
            onClick={handleBookingClick}
            onUpdate={onOptimisticBookingUpdate}
            services={safeServices}
            staff={safeStaff}
            isMobile={isMobile}
            hourHeight={hourHeight}
          />
        )}
      </div>

      {/* Floating stats dashboard-style */}
      <div className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-xl">
        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium">{filteredBookings.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">
              {new Set(filteredBookings.map(b => b.client.id)).size}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Euro className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">
              €{filteredBookings.reduce((sum, b) => sum + (b.price || 0), 0).toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}