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
  HOUR_HEIGHT: 160,
  START_HOUR: 9,
  END_HOUR: 18,
  SNAP_MINUTES: 5,
  MIN_DURATION_MINUTES: 20,
  DRAG_THRESHOLD_PX: 3,
  CLICK_MAX_DURATION_MS: 200,
  BUFFER_MINUTES: 0,
  MOBILE_HOUR_HEIGHT: 120,
  COMPACT_HOUR_HEIGHT: 80
} as const

// Modern color system for services
const SERVICE_COLORS = [
  { bg: 'bg-gradient-to-br from-violet-500 to-purple-600', border: 'border-violet-500', text: 'text-white', accent: '#8b5cf6', light: 'bg-violet-50', lightText: 'text-violet-800' },
  { bg: 'bg-gradient-to-br from-blue-500 to-cyan-600', border: 'border-blue-500', text: 'text-white', accent: '#3b82f6', light: 'bg-blue-50', lightText: 'text-blue-800' },
  { bg: 'bg-gradient-to-br from-emerald-500 to-teal-600', border: 'border-emerald-500', text: 'text-white', accent: '#10b981', light: 'bg-emerald-50', lightText: 'text-emerald-800' },
  { bg: 'bg-gradient-to-br from-pink-500 to-rose-600', border: 'border-pink-500', text: 'text-white', accent: '#ec4899', light: 'bg-pink-50', lightText: 'text-pink-800' },
  { bg: 'bg-gradient-to-br from-amber-500 to-orange-600', border: 'border-amber-500', text: 'text-white', accent: '#f59e0b', light: 'bg-amber-50', lightText: 'text-amber-800' },
  { bg: 'bg-gradient-to-br from-indigo-500 to-blue-600', border: 'border-indigo-500', text: 'text-white', accent: '#6366f1', light: 'bg-indigo-50', lightText: 'text-indigo-800' },
  { bg: 'bg-gradient-to-br from-red-500 to-pink-600', border: 'border-red-500', text: 'text-white', accent: '#ef4444', light: 'bg-red-50', lightText: 'text-red-800' },
  { bg: 'bg-gradient-to-br from-green-500 to-emerald-600', border: 'border-green-500', text: 'text-white', accent: '#22c55e', light: 'bg-green-50', lightText: 'text-green-800' },
]

// ==================== UTILITY FUNCTIONS ====================
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-500 text-white shadow-emerald-200'
    case 'pending':
      return 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-500 text-white shadow-amber-200'
    case 'completed':
      return 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500 text-white shadow-blue-200'
    case 'cancelled':
      return 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-400 text-white shadow-gray-200'
    case 'no_show':
      return 'bg-gradient-to-br from-red-500 to-pink-600 border-red-500 text-white shadow-red-200'
    default:
      return 'bg-gradient-to-br from-violet-500 to-purple-600 border-violet-500 text-white shadow-violet-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed': return <CheckCircle className="w-3 h-3" />
    case 'pending': return <Clock className="w-3 h-3" />
    case 'completed': return <CheckCircle className="w-3 h-3" />
    case 'cancelled': return <XCircle className="w-3 h-3" />
    case 'no_show': return <AlertCircle className="w-3 h-3" />
    default: return <Clock className="w-3 h-3" />
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

// ==================== CUSTOM HOOKS ====================
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

// ==================== CALENDAR EVENT COMPONENT ====================
interface CalendarEventProps {
  booking: Booking
  onUpdate: (bookingId: string, newStart: Date, newEnd: Date) => Promise<void>
  onClick: (id: string) => void
  dayContainerRef: React.RefObject<HTMLDivElement | null>
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
  // Local state for optimistic rendering
  const [localStartAt, setLocalStartAt] = useState(booking.start_at)
  const [localEndAt, setLocalEndAt] = useState(booking.end_at)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<'top' | 'bottom' | null>(null)
  const [previewTime, setPreviewTime] = useState<{ start: string; end: string } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
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

    const top = Math.max(0, (startMinutes - workStartMinutes) / minutesPerPixel)
    const height = Math.max(isMobile ? 35 : 40, (endMinutes - startMinutes) / minutesPerPixel)

    return { top, height }
  }, [startDate, endDate, hourHeight, isMobile])

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
    const minDuration = CALENDAR_CONFIG.MIN_DURATION_MINUTES * 60 * 1000 // Convert to milliseconds
    const duration = newEnd.getTime() - newStart.getTime()
    
    if (duration < minDuration) {
      return `Durata minima: ${CALENDAR_CONFIG.MIN_DURATION_MINUTES} minuti`
    }
    
    if (newStart.getHours() < CALENDAR_CONFIG.START_HOUR) {
      return `Orario non disponibile prima delle ${CALENDAR_CONFIG.START_HOUR}:00`
    }
    
    if (newEnd.getHours() >= CALENDAR_CONFIG.END_HOUR) {
      return `Orario non disponibile dopo le ${CALENDAR_CONFIG.END_HOUR}:00`
    }
    
    return null
  }, [])

  // Drag handlers
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
      
      // Validation
      const validationError = validateTimeSlot(newStartTime, newEndTime)
      const hasOverlap = checkOverlap(newStartTime, newEndTime)
      
      setPreviewTime({
        start: formatTimeForTooltip(newTime.hours, newTime.minutes),
        end: formatTimeForTooltip(newEndTime.getHours(), newEndTime.getMinutes())
      })
      
      setError(validationError || (hasOverlap ? 'Sovrapposizione con altro appuntamento' : null))
      setTooltipPosition({ x: e.clientX + 10, y: e.clientY - 10 })
      
      eventRef.current.style.transform = `translateY(${deltaY}px)`
      eventRef.current.style.zIndex = '100'
      eventRef.current.style.opacity = validationError || hasOverlap ? '0.6' : '0.9'
    }

    const handleMouseUp = async (e: MouseEvent) => {
      if (!interactionRef.current.isActive || !eventRef.current) return

      const deltaY = e.clientY - interactionRef.current.startMouseY
      const elapsed = Date.now() - interactionRef.current.startTime
      
      eventRef.current.style.transform = ''
      eventRef.current.style.zIndex = ''
      eventRef.current.style.opacity = ''
      setIsDragging(false)
      setPreviewTime(null)
      interactionRef.current.isActive = false
      
      if (interactionRef.current.hasMoved && elapsed > CALENDAR_CONFIG.CLICK_MAX_DURATION_MS) {
        const newTop = Math.max(0, interactionRef.current.initialTop + deltaY)
        const newTime = pixelsToTime(newTop)
        const newStart = new Date(startDate)
        newStart.setHours(newTime.hours, newTime.minutes, 0, 0)
        const newEnd = new Date(newStart.getTime() + duration)
      
        const validationError = validateTimeSlot(newStart, newEnd)
        if (!validationError && !checkOverlap(newStart, newEnd)) {
          try {
            setIsUpdating(true)
            await onUpdate(booking.id, newStart, newEnd)
            setError(null)
          } catch (error) {
            console.error('Drag update failed:', error)
            setError('Errore durante l\'aggiornamento')
          } finally {
            setIsUpdating(false)
          }
        } else {
          setError(validationError || 'Sovrapposizione con altro appuntamento')
          setTimeout(() => setError(null), 3000)
        }
      }
      
      interactionRef.current.hasMoved = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [booking, startDate, endDate, isDragging, getEventStyle, pixelsToTime, checkOverlap, validateTimeSlot, onUpdate, isMobile])

  // Resize handlers
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
      
      // Validation
      const validationError = validateTimeSlot(previewStart, previewEnd)
      const hasOverlap = checkOverlap(previewStart, previewEnd)
      
      setPreviewTime({
        start: formatTimeForTooltip(previewStart.getHours(), previewStart.getMinutes()),
        end: formatTimeForTooltip(previewEnd.getHours(), previewEnd.getMinutes())
      })
      
      setError(validationError || (hasOverlap ? 'Sovrapposizione con altro appuntamento' : null))
      setTooltipPosition({ x: e.clientX + 10, y: e.clientY - 10 })
      
      eventRef.current.style.opacity = validationError || hasOverlap ? '0.6' : '0.9'
    }

    const handleMouseUp = async (e: MouseEvent) => {
      if (!interactionRef.current.isActive || !eventRef.current) return
      
      eventRef.current.style.opacity = ''
      setIsResizing(null)
      setPreviewTime(null)
      interactionRef.current.isActive = false
      
      if (interactionRef.current.hasMoved) {
        const deltaY = e.clientY - interactionRef.current.startMouseY
        
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
        if (!validationError && !checkOverlap(newStart, newEnd)) {
          try {
            setIsUpdating(true)
            await onUpdate(booking.id, newStart, newEnd)
            setError(null)
          } catch (error) {
            console.error('Resize update failed:', error)
            setError('Errore durante l\'aggiornamento')
          } finally {
            setIsUpdating(false)
          }
        } else {
          setError(validationError || 'Sovrapposizione con altro appuntamento')
          setTimeout(() => setError(null), 3000)
        }
      }
      
      interactionRef.current.hasMoved = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [booking, startDate, endDate, isResizing, getEventStyle, pixelsToTime, checkOverlap, validateTimeSlot, onUpdate, isMobile])

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
        className={`absolute left-1 right-1 rounded-xl shadow-lg cursor-pointer select-none backdrop-blur-sm border-2 ${getStatusColor(booking.status)} ${
          isDragging || isResizing ? 'opacity-90 shadow-2xl scale-105' : 'shadow-lg hover:shadow-xl'
        } ${error ? 'ring-2 ring-red-400 ring-opacity-50' : ''} transition-all duration-200 hover:scale-[1.02] group`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          minHeight: isMobile ? '35px' : '40px',
          zIndex: isDragging || isResizing ? 100 : 10,
        }}
        onMouseDown={handleDragStart}
        onClick={handleClick}
        title={`${booking.client.full_name} - ${booking.service.name}`}
      >
        {/* Loading indicator */}
        {isUpdating && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Loader className="w-4 h-4 text-white animate-spin" />
          </div>
        )}

        {/* Resize handle top */}
        {!isMobile && (
          <div
            className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize group-hover:bg-white/20 transition-colors rounded-t-xl"
            onMouseDown={(e) => handleResizeStart('top', e)}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
          </div>
        )}
        
        {/* Content area */}
        <div className="px-3 py-2 h-full flex flex-col justify-center pointer-events-none overflow-hidden">
          {height >= (isMobile ? 50 : 60) ? (
            // Full layout for larger events
            <div className="w-full space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm truncate flex items-center gap-2">
                  {getStatusIcon(booking.status)}
                  {format(startDate, 'HH:mm')}
                </div>
                <div className="text-xs opacity-90 font-medium">
                  €{booking.price}
                </div>
              </div>
              
              <div className="font-semibold text-base truncate">
                {booking.client.full_name}
              </div>
              
              <div className="text-xs opacity-80 truncate bg-white/10 px-2 py-1 rounded-lg">
                {booking.service.name}
              </div>
              
              {height >= (isMobile ? 80 : 100) && booking.staff && (
                <div className="text-xs opacity-70 truncate flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {booking.staff.full_name}
                </div>
              )}
              
              {height >= (isMobile ? 100 : 120) && booking.client.phone && (
                <div className="text-xs opacity-70 truncate flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {booking.client.phone}
                </div>
              )}
              
              {height >= (isMobile ? 120 : 140) && (
                <div className="text-xs opacity-70 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(durationMinutes)}</span>
                </div>
              )}
            </div>
          ) : height >= (isMobile ? 35 : 50) ? (
            // Medium layout
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-sm truncate flex items-center gap-1">
                  {getStatusIcon(booking.status)}
                  {format(startDate, 'HH:mm')}
                </div>
                <div className="text-xs opacity-90">
                  €{booking.price}
                </div>
              </div>
              <div className="font-medium text-sm truncate">
                {booking.client.full_name}
              </div>
            </div>
          ) : (
            // Compact layout for small events
            <div className="flex items-center space-x-2 w-full min-w-0">
              <span className="font-bold text-xs whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                {getStatusIcon(booking.status)}
                {format(startDate, 'HH:mm')}
              </span>
              <span className="text-xs truncate flex-1 font-medium">
                {booking.client.full_name}
              </span>
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white/40" 
                style={{ backgroundColor: serviceColor.accent }}
                title={booking.service.name}
              />
            </div>
          )}
        </div>
        
        {/* Resize handle bottom */}
        {!isMobile && (
          <div
            className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize group-hover:bg-white/20 transition-colors rounded-b-xl"
            onMouseDown={(e) => handleResizeStart('bottom', e)}
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl" />
          </div>
        )}
      </div>
      
      {/* Enhanced tooltip */}
      {(isDragging || isResizing) && previewTime && (
        <div
          className={`fixed z-[200] px-6 py-4 rounded-2xl shadow-2xl text-sm font-medium pointer-events-none border backdrop-blur-sm ${
            error 
              ? 'bg-gradient-to-r from-red-900 to-pink-900 text-white border-red-500/50' 
              : 'bg-gradient-to-r from-indigo-900 to-purple-900 text-white border-indigo-500/50'
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
              <div className="text-xs opacity-80">
                {error || (isDragging ? '📍 Spostando appuntamento' : isResizing === 'top' ? '⬆️ Modificando inizio' : '⬇️ Modificando fine')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && !isDragging && !isResizing && (
        <div className="fixed bottom-4 right-4 z-[300] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </>
  )
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
        <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
        <div className="flex-1 h-0.5 bg-red-500 shadow-sm" />
        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-md ml-2 font-medium">
          {format(currentTime, 'HH:mm')}
        </div>
      </div>
    </div>
  )
}

// ==================== DAY VIEW COMPONENT ====================
function DayView({ 
  currentDate, 
  bookings, 
  onUpdate, 
  onClick,
  isMobile,
  hourHeight
}: {
  currentDate: Date
  bookings: Booking[]
  onUpdate: (bookingId: string, newStart: Date, newEnd: Date) => Promise<void>
  onClick: (id: string) => void
  isMobile: boolean
  hourHeight: number
}) {
  const dayRef = useRef<HTMLDivElement>(null)
  const isToday = isSameDay(currentDate, new Date())
  
  const workingHours = Array.from(
    { length: CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR }, 
    (_, i) => CALENDAR_CONFIG.START_HOUR + i
  )

  const todayStats = useMemo(() => {
    const confirmed = bookings.filter(b => b.status === 'confirmed').length
    const pending = bookings.filter(b => b.status === 'pending').length
    const revenue = bookings.reduce((sum, b) => sum + b.price, 0)
    return { total: bookings.length, confirmed, pending, revenue }
  }, [bookings])

  return (
    <div className="h-full flex flex-col">
      {/* Day header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-800 mb-2">
            {format(currentDate, 'd')}
          </h2>
          <p className="text-slate-600 text-lg mb-3">
            {format(currentDate, 'EEEE, d MMMM yyyy', { locale: it })}
          </p>
          
          {/* Day stats */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-100">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{todayStats.total} appuntamenti</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-100">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">{todayStats.confirmed} confermati</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-violet-50 px-4 py-2 rounded-xl border border-purple-100">
              <Euro className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">€{todayStats.revenue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Time column */}
          <div className="bg-slate-50/90 backdrop-blur-sm border-r border-slate-200 w-20 sticky left-0 z-10">
            {workingHours.map((hour) => (
              <div
                key={hour}
                className="flex items-center justify-end pr-4 text-sm text-slate-500 font-medium border-b border-slate-100"
                style={{ height: `${hourHeight}px` }}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day column */}
          <div
            ref={dayRef}
            className={`flex-1 relative ${isToday ? 'bg-purple-50/30' : 'bg-white'}`}
            style={{ minHeight: `${workingHours.length * hourHeight}px` }}
          >
            {/* Hour lines */}
            {workingHours.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-b border-slate-100"
                style={{ top: `${(hour - CALENDAR_CONFIG.START_HOUR) * hourHeight}px` }}
              />
            ))}
            
            {/* Current time indicator */}
            {isToday && <CurrentTimeIndicator hourHeight={hourHeight} />}
            
            {/* Bookings */}
            {bookings.map((booking) => (
              <CalendarEvent
                key={booking.id}
                booking={booking}
                onUpdate={onUpdate}
                onClick={onClick}
                dayContainerRef={dayRef}
                allBookings={bookings}
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
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 })
  const endDate = new Date(startDate.getTime() + 41 * 24 * 60 * 60 * 1000) // 6 weeks

  const monthDays = []
  for (let day = new Date(startDate); day <= endDate; day.setDate(day.getDate() + 1)) {
    monthDays.push(new Date(day))
  }

  const getBookingsForDay = useCallback((day: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.start_at), day)
    )
  }, [bookings])

  const monthStats = useMemo(() => {
    const monthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.start_at)
      return bookingDate.getMonth() === currentDate.getMonth() && 
             bookingDate.getFullYear() === currentDate.getFullYear()
    })
    
    return {
      total: monthBookings.length,
      confirmed: monthBookings.filter(b => b.status === 'confirmed').length,
      revenue: monthBookings.reduce((sum, b) => sum + b.price, 0)
    }
  }, [bookings, currentDate])

  return (
    <div className="h-full flex flex-col">
      {/* Month header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {format(currentDate, 'MMMM yyyy', { locale: it })}
          </h2>
          
          {/* Month stats */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-100">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{monthStats.total} appuntamenti</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-100">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">{monthStats.confirmed} confermati</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-violet-50 px-4 py-2 rounded-xl border border-purple-100">
              <Euro className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">€{monthStats.revenue}</span>
            </div>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
            <div key={day} className="bg-slate-100 px-4 py-3 text-center">
              <span className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                {day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Month grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden h-full">
          {monthDays.map((day, index) => {
            const dayBookings = getBookingsForDay(day)
            const isCurrentMonth = day.getMonth() === currentDate.getMonth()
            const isToday = isSameDay(day, new Date())
            const isSelected = isSameDay(day, currentDate)
            
            return (
              <div
                key={index}
                className={`bg-white p-2 min-h-[120px] cursor-pointer hover:bg-slate-50 transition-colors ${
                  !isCurrentMonth ? 'opacity-50' : ''
                } ${isToday ? 'bg-purple-50' : ''} ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => onDateSelect(day)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                  } ${isToday ? 'text-purple-600 font-bold' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {dayBookings.length > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isToday 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-slate-100 text-slate-600'
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
                        className={`text-xs p-1 rounded-md ${serviceColor.light} ${serviceColor.lightText} truncate cursor-pointer hover:shadow-sm transition-shadow`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onClick(booking.id)
                        }}
                        title={`${format(new Date(booking.start_at), 'HH:mm')} - ${booking.client.full_name} - ${booking.service.name}`}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(booking.status)}
                          <span className="font-medium">{format(new Date(booking.start_at), 'HH:mm')}</span>
                          <span className="truncate">{booking.client.full_name}</span>
                        </div>
                      </div>
                    )
                  })}
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-slate-500 text-center py-1">
                      +{dayBookings.length - 3} altri
                    </div>
                  )}
                </div>
              </div>
            )
          })}
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
  console.log("[DEBUG] NUOVO CALENDAR VIEW RENDERED");
  console.log('[DEBUG] PROPS CALENDAR VIEW', { bookings, services, staff, viewType, currentDate });
  const router = useRouter()
  const isMobile = useIsMobile()
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dayRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({})
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
    let filtered = bookings
    
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

  // Enhanced update booking function
  const updateBooking = useCallback(async (bookingId: string, newStart: Date, newEnd: Date) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_at: newStart.toISOString(),
          end_at: newEnd.toISOString(),
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Errore durante l\'aggiornamento')
      }
      
      if (onOptimisticBookingUpdate) {
        onOptimisticBookingUpdate(bookingId, newStart.toISOString(), newEnd.toISOString())
      }
      
      refreshBookings?.()
    } catch (error) {
      console.error('Error updating booking:', error)
      throw error
    }
  }, [onOptimisticBookingUpdate, refreshBookings])

  const handleBookingClick = useCallback((bookingId: string) => {
    router.push(`/bookings/${bookingId}`)
  }, [router])

  // Generate week days
  const weekDays = useMemo(() => {
    if (viewType !== 'week') return []
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [currentDate, viewType])

  // Generate working hours
  const workingHours = useMemo(() => {
    return Array.from({ length: CALENDAR_CONFIG.END_HOUR - CALENDAR_CONFIG.START_HOUR }, (_, i) => 
      CALENDAR_CONFIG.START_HOUR + i
    )
  }, [])

  // Get bookings for specific day
  const getBookingsForDay = useCallback((day: Date) => {
    return filteredBookings.filter(booking => 
      isSameDay(new Date(booking.start_at), day)
    )
  }, [filteredBookings])

  // Enhanced statistics
  const todayStats = useMemo(() => {
    const today = new Date()
    const todayBookings = getBookingsForDay(today)
    
    return {
      total: todayBookings.length,
      confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
      pending: todayBookings.filter(b => b.status === 'pending').length,
      completed: todayBookings.filter(b => b.status === 'completed').length,
      revenue: todayBookings.reduce((sum, b) => sum + b.price, 0),
      upcomingToday: todayBookings.filter(b => {
        const bookingTime = new Date(b.start_at)
        return bookingTime > new Date() && (b.status === 'confirmed' || b.status === 'pending')
      }).length
    }
  }, [getBookingsForDay])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedService) count++
    if (selectedStaff) count++
    if (showOnlyMyBookings) count++
    if (searchQuery) count++
    return count
  }, [selectedService, selectedStaff, showOnlyMyBookings, searchQuery])

  const clearAllFilters = useCallback(() => {
    setSelectedService('')
    setSelectedStaff('')
    setShowOnlyMyBookings(false)
    setSearchQuery('')
  }, [])

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Navigation and title */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('prev')}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-110"
                title="Periodo precedente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800">
                  {viewType === 'month' 
                    ? format(currentDate, 'MMMM yyyy', { locale: it })
                    : format(currentDate, 'MMMM yyyy', { locale: it })
                  }
                </h1>
                <p className="text-sm text-slate-600">
                  {viewType === 'week' && `Settimana ${format(currentDate, 'w')}`}
                  {viewType === 'day' && format(currentDate, 'EEEE d MMMM', { locale: it })}
                  {viewType === 'month' && `${filteredBookings.length} appuntamenti`}
                </p>
              </div>
              
              <button
                onClick={() => onNavigate('next')}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-110"
                title="Periodo successivo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick stats */}
            {!isMobile && (
              <div className="hidden lg:flex items-center gap-4 ml-8">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-100">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">{todayStats.total} oggi</span>
                </div>
                
                <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2 rounded-lg border border-emerald-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">{todayStats.confirmed} confermati</span>
                </div>
                
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-violet-50 px-3 py-2 rounded-lg border border-purple-100">
                  <Euro className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">€{todayStats.revenue}</span>
                </div>

                {todayStats.upcomingToday > 0 && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 rounded-lg border border-amber-100">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">{todayStats.upcomingToday} in arrivo</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls and filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={isMobile ? "Cerca..." : "Cerca cliente, servizio..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all w-full md:w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View toggles */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              {['day', 'week', 'month'].map((view) => (
                <button
                  key={view}
                  onClick={() => onChangeView(view as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    viewType === view
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {view === 'day' && (isMobile ? 'G' : 'Giorno')}
                  {view === 'week' && (isMobile ? 'S' : 'Settimana')}
                  {view === 'month' && (isMobile ? 'M' : 'Mese')}
                </button>
              ))}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-2 rounded-xl transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Filtri"
            >
              <Filter className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Add booking */}
            <button
              onClick={() => router.push('/bookings/new')}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuovo</span>
            </button>
          </div>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-slate-50/90 backdrop-blur-sm rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* My bookings toggle */}
              <div className="flex items-center">
                <button
                  onClick={() => setShowOnlyMyBookings(!showOnlyMyBookings)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showOnlyMyBookings
                      ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {showOnlyMyBookings ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Solo le mie
                </button>
              </div>

              {/* Staff filter */}
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
              >
                <option value="">Tutti gli operatori</option>
                {safeStaff.map((staffMember) => (
                  <option key={staffMember.id} value={staffMember.id}>
                    {staffMember.full_name}
                  </option>
                ))}
              </select>

              {/* Service filter */}
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
              >
                <option value="">Tutti i servizi</option>
                {safeServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>

              {/* Clear filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAllFilters}
                  disabled={activeFiltersCount === 0}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancella filtri
                </button>
                {activeFiltersCount > 0 && (
                  <span className="text-xs text-slate-500">
                    {activeFiltersCount} filtro{activeFiltersCount > 1 ? 'i' : ''} attivo{activeFiltersCount > 1 ? 'i' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-hidden">
        {viewType === 'week' && (
          <div className="h-full flex flex-col">
            {/* Week days header */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 px-6 py-3">
              <div className="grid grid-cols-8 gap-4">
                <div className="text-sm font-medium text-slate-500"></div>
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, new Date())
                  const dayBookings = getBookingsForDay(day)
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={`text-center cursor-pointer p-2 rounded-lg transition-all hover:bg-slate-50 ${
                        isToday ? 'bg-purple-50 ring-2 ring-purple-200' : ''
                      }`}
                      onClick={() => setCurrentDate(day)}
                    >
                      <div className={`text-sm font-medium ${isToday ? 'text-purple-600' : 'text-slate-600'}`}>
                        {format(day, 'EEE', { locale: it })}
                      </div>
                      <div className={`text-2xl font-bold mt-1 ${isToday ? 'text-purple-600' : 'text-slate-800'}`}>
                        {format(day, 'd')}
                      </div>
                      {dayBookings.length > 0 && (
                        <div className="mt-1 flex justify-center">
                          <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                            isToday 
                              ? 'bg-purple-100 text-purple-600' 
                              : 'bg-slate-100 text-slate-600'
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
                <div className="bg-slate-50/90 backdrop-blur-sm border-r border-slate-200 sticky left-0 z-10">
                  {workingHours.map((hour) => (
                    <div
                      key={hour}
                      className="flex items-center justify-end pr-4 text-sm text-slate-500 font-medium border-b border-slate-100"
                      style={{ height: `${hourHeight}px` }}
                    >
                      <span className="bg-white px-2 py-1 rounded-md shadow-sm">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* Days columns */}
                {weekDays.map((day) => {
                  const dayKey = format(day, 'yyyy-MM-dd')
                  if (!dayRefs.current[dayKey]) {
                    dayRefs.current[dayKey] = React.createRef()
                  }
                  
                  const dayBookings = getBookingsForDay(day)
                  const isToday = isSameDay(day, new Date())
                  
                  return (
                    <div
                      key={dayKey}
                      ref={dayRefs.current[dayKey]}
                      className={`relative border-r border-slate-200 ${
                        isToday ? 'bg-purple-50/30' : 'bg-white'
                      } hover:bg-slate-50/50 transition-colors`}
                      style={{ minHeight: `${workingHours.length * hourHeight}px` }}
                    >
                      {/* Hour lines */}
                      {workingHours.map((hour) => (
                        <div
                          key={hour}
                          className="absolute left-0 right-0 border-b border-slate-100"
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
                          onClick={handleBookingClick}
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
        )}

        {viewType === 'day' && (
          <DayView
            currentDate={currentDate}
            bookings={getBookingsForDay(currentDate)}
            onUpdate={updateBooking}
            onClick={handleBookingClick}
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
      </div>

      {/* Mobile stats overlay */}
      {isMobile && (
        <div className="bg-white/90 backdrop-blur-sm border-t border-slate-200 px-4 py-3">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-lg font-bold text-slate-800">{todayStats.total}</div>
              <div className="text-xs text-slate-600">Oggi</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{todayStats.confirmed}</div>
              <div className="text-xs text-slate-600">Confermati</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">€{todayStats.revenue}</div>
              <div className="text-xs text-slate-600">Incasso</div>
            </div>
            {todayStats.upcomingToday > 0 && (
              <div>
                <div className="text-lg font-bold text-amber-600">{todayStats.upcomingToday}</div>
                <div className="text-xs text-slate-600">In arrivo</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {userLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg">
            <Loader className="w-5 h-5 animate-spin text-purple-600" />
            <span className="text-slate-600 font-medium">Caricamento calendario...</span>
          </div>
        </div>
      )}
    </div>
  )
}