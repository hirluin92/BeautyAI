// app/(dashboard)/calendar/page.tsx
'use client'

import { useEffect, useState } from 'react'
import CalendarView from '@/components/calendar/calendar-view'
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'

export default function CalendarPage() {
  const [viewType, setViewType] = useState<'week' | 'month' | 'day'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState([])
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
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
  useEffect(() => {
    const { from, to } = getRange()
    setLoading(true)
    setError(null)
    fetch(`/api/bookings?from=${format(from, 'yyyy-MM-dd')}&to=${format(to, 'yyyy-MM-dd')}`)
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(() => setError('Errore nel caricamento appuntamenti'))
      .finally(() => setLoading(false))
  }, [currentDate, viewType])

  // Fetch services e staff all'avvio
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(() => setError('Errore nel caricamento servizi'))
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => setStaff(data))
      .catch(() => setError('Errore nel caricamento staff'))
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

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Calendario Appuntamenti</h1>
        <button onClick={() => setViewType(viewType === 'week' ? 'month' : 'week')} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
          Vista: {viewType === 'week' ? 'Settimana' : 'Mese'}
        </button>
      </div>
      {loading && <div className="mb-4">Caricamento appuntamenti...</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <CalendarView
        bookings={bookings}
        viewType={viewType}
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onChangeView={setViewType}
        setCurrentDate={setCurrentDate}
        services={services}
        staff={staff}
      />
    </>
  )
}