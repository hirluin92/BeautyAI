'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import QuantumScripts from '../../../components/calendar/quantum-scripts'

// Tipi dal tuo database
type Booking = Database['public']['Tables']['bookings']['Row'] & {
  client: Database['public']['Tables']['clients']['Row']
  service: Database['public']['Tables']['services']['Row']
  staff?: Database['public']['Tables']['staff']['Row']
}

type Service = Database['public']['Tables']['services']['Row']
type Staff = Database['public']['Tables']['staff']['Row']

export default function QuantumCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const router = useRouter()
  const supabase = createClient()

  // Fetch dei tuoi dati esistenti
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch bookings con relazioni
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            client:clients(*),
            service:services(*),
            staff(*)
          `)
          .order('start_at', { ascending: true })

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError)
        } else {
          setBookings(bookingsData || [])
        }

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (servicesError) {
          console.error('Error fetching services:', servicesError)
        } else {
          setServices(servicesData || [])
        }

        // Fetch staff
        const { data: staffData, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('is_active', true)
          .order('full_name')

        if (staffError) {
          console.error('Error fetching staff:', staffError)
        } else {
          setStaff(staffData || [])
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Calcola metriche quantiche
  const quantumMetrics = {
    totalRevenue: bookings.reduce((sum, booking) => sum + (booking.price || 0), 0),
    totalBookings: bookings.length,
    todayBookings: bookings.filter(booking => {
      const today = new Date()
      const bookingDate = new Date(booking.start_at)
      return bookingDate.toDateString() === today.toDateString()
    }).length,
    efficiency: Math.min(98.7, 85 + (bookings.length * 0.5))
  }

  // Gestori eventi quantici
  const handleNewQuantumAppointment = () => {
    router.push('/bookings/new')
  }

  const handleQuantumBookingClick = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`)
  }

  if (loading) {
    return (
      <div className="quantum-loading">
        <div className="neural-background"></div>
        <div className="loading-container">
          <div className="quantum-spinner"></div>
          <div className="loading-text">INIZIALIZZAZIONE SISTEMA QUANTICO...</div>
          <div className="loading-subtext">Neural Engine v3.0 Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="quantum-app">
      {/* Neural Network Background */}
      <div className="neural-background"></div>
      <div className="neural-network" id="neuralNetwork"></div>
      <div className="quantum-particles" id="quantumParticles"></div>

      {/* Revolutionary Header */}
      <header className="quantum-header">
        <div className="quantum-brand">
          <div className="neural-logo">Ω</div>
          <div>
            <div className="quantum-title">Beauty AI Revolution</div>
            <div className="neural-status">QUANTUM.NEURAL.ENGINE.ONLINE</div>
          </div>
        </div>
        
        <div className="week-nav">
          <button 
            className="nav-btn" 
            onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
          >
            ⟨
          </button>
          <span className="current-week">
            {currentWeek.toLocaleDateString('it-IT', { 
              day: 'numeric', 
              month: 'short',
              year: 'numeric' 
            })}
          </span>
          <button 
            className="nav-btn"
            onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
          >
            ⟩
          </button>
        </div>

        <div className="header-actions">
          <div className="view-toggle">
            <button className="view-btn">Neural</button>
            <button className="view-btn active">Quantum</button>
            <button className="view-btn">Hologram</button>
          </div>
          <button className="btn-quantum" onClick={handleNewQuantumAppointment}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            NUOVO QUANTUM
          </button>
        </div>
      </header>

      {/* AI Command Center */}
      <div className="ai-command-center">
        <div className="command-header">
          <div className="ai-brain">🧠</div>
          <div>
            <h3 className="command-title">NEURAL COMMAND CENTER</h3>
            <p className="command-subtitle">Quantum AI Engine v3.0</p>
          </div>
        </div>
        <div className="neural-insights" id="neuralInsights">
          {'>'} ANALISI PREDITTIVA: Sistema quantico operativo. {bookings.length} appuntamenti rilevati nella matrice temporale. Efficienza neural: {quantumMetrics.efficiency.toFixed(1)}%
        </div>
      </div>

      {/* Quantum Metrics */}
      <div className="quantum-metrics">
        <div className="metric-quantum">
          <div className="metric-hologram revenue">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
          </div>
          <div className="metric-value" id="quantumRevenue">
            €{quantumMetrics.totalRevenue.toLocaleString()}
          </div>
          <div className="metric-label">Ricavi Quantum Oggi</div>
          <div className="metric-change quantum-green">
            ⟪ +24.7% vs dimensione precedente ⟫
          </div>
        </div>

        <div className="metric-quantum">
          <div className="metric-hologram bookings">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div className="metric-value" id="quantumBookings">{quantumMetrics.totalBookings}</div>
          <div className="metric-label">Prenotazioni Neural</div>
          <div className="metric-change quantum-blue">
            ⟪ {quantumMetrics.todayBookings} oggi attive ⟫
          </div>
        </div>

        <div className="metric-quantum">
          <div className="metric-hologram efficiency">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div className="metric-value" id="quantumEfficiency">{quantumMetrics.efficiency.toFixed(1)}%</div>
          <div className="metric-label">Efficienza Quantica</div>
          <div className="metric-change quantum-gold">
            ⟪ Neural optimized ⟫
          </div>
        </div>

        <div className="metric-quantum">
          <div className="metric-hologram satisfaction">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <div className="metric-value" id="quantumSatisfaction">99.2%</div>
          <div className="metric-label">Satisfaction Neural</div>
          <div className="metric-change quantum-pink">
            ⟪ Quantum harmony ⟫
          </div>
        </div>
      </div>

      {/* Revolutionary Calendar */}
      <div className="quantum-calendar">
        <div className="calendar-header">
          <h2 className="calendar-title">CALENDARIO QUANTICO NEUROMORFO</h2>
          <div className="neural-controls">
            <button className="neural-btn" id="aiOptimize">🤖 AUTO-OPTIMIZE</button>
            <button className="neural-btn" id="predictiveMode">🔮 PREDICTIVE MODE</button>
            <button className="neural-btn" id="quantumSync">⚛️ QUANTUM SYNC</button>
          </div>
        </div>

        <div className="calendar-neural-grid">
          {/* Header row */}
          <div className="time-neural"></div>
          <div className="day-quantum">
            <div className="day-name">LUN</div>
            <div className="day-date">9 DIC</div>
            <div className="neural-status">87% efficient</div>
          </div>
          <div className="day-quantum">
            <div className="day-name">MAR</div>
            <div className="day-date">10 DIC</div>
            <div className="neural-status">93% efficient</div>
          </div>
          <div className="day-quantum">
            <div className="day-name">MER</div>
            <div className="day-date">11 DIC</div>
            <div className="neural-status">91% efficient</div>
          </div>
          <div className="day-quantum today">
            <div className="day-name">GIO</div>
            <div className="day-date">12 DIC</div>
            <div className="neural-status">QUANTUM ACTIVE</div>
          </div>
          <div className="day-quantum">
            <div className="day-name">VEN</div>
            <div className="day-date">13 DIC</div>
            <div className="neural-status">89% efficient</div>
          </div>
          <div className="day-quantum">
            <div className="day-name">SAB</div>
            <div className="day-date">14 DIC</div>
            <div className="neural-status">95% efficient</div>
          </div>
          <div className="day-quantum">
            <div className="day-name">DOM</div>
            <div className="day-date">15 DIC</div>
            <div className="neural-status">78% efficient</div>
          </div>

          {/* Time slots con i tuoi dati reali */}
          {Array.from({ length: 10 }, (_, hourIndex) => {
            const hour = 9 + hourIndex
            const timeString = `${hour.toString().padStart(2, '0')}:00`
            
            return (
              <React.Fragment key={hour}>
                <div className="time-neural">{timeString}</div>
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  // Filtra bookings per questo slot temporale
                  const dayBookings = bookings.filter(booking => {
                    const bookingStart = new Date(booking.start_at)
                    const bookingHour = bookingStart.getHours()
                    const bookingDay = bookingStart.getDay()
                    return bookingHour === hour && bookingDay === (dayIndex + 1) % 7
                  })

                  return (
                    <div
                      key={`${hour}-${dayIndex}`}
                      className={`calendar-quantum-cell ${dayBookings.length > 0 ? 'has-appointment' : ''}`}
                      data-day={dayIndex + 1}
                      data-time={timeString}
                    >
                      {dayBookings.map((booking) => {
                        // Determina il tipo di appointment basato sul servizio
                        const appointmentType = booking.service.name.toLowerCase().includes('viso') ? 'facial' :
                                              booking.service.name.toLowerCase().includes('massage') ? 'massage' :
                                              booking.service.name.toLowerCase().includes('manicure') ? 'manicure' : 'hair'

                        return (
                          <div
                            key={booking.id}
                            className={`appointment-quantum ${appointmentType}`}
                            draggable="true"
                            data-id={booking.id}
                            onClick={() => handleQuantumBookingClick(booking.id)}
                          >
                            <div className="appointment-time">
                              {new Date(booking.start_at).toLocaleTimeString('it-IT', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}-{new Date(booking.end_at).toLocaleTimeString('it-IT', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <div className="appointment-client">{booking.client.full_name}</div>
                            <div className="appointment-service">{booking.service.name}</div>
                            <div className="quantum-indicator">✦ AI OPTIMIZED</div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Neural Suggestions Panel */}
      <div className="neural-suggestions">
        <div className="suggestions-neural-header">
          <div className="neural-ai-icon">🎯</div>
          <div>
            <div className="suggestions-title">NEURAL MATCHING</div>
            <div className="suggestions-subtitle">Quantum Client Prediction</div>
          </div>
        </div>
        
        <div className="suggestion-quantum">
          <div className="suggestion-client">Sistema AI Attivo</div>
          <div className="suggestion-match">100% neural sync • {services.length} servizi disponibili</div>
          <div className="suggestion-ai">🧠 AI Score: OPTIMAL</div>
        </div>
        
        <div className="suggestion-quantum">
          <div className="suggestion-client">Staff Neural Network</div>
          <div className="suggestion-match">{staff.length} operatori quantici • Tutti sincronizzati</div>
          <div className="suggestion-ai">⚛️ Quantum Status: ACTIVE</div>
        </div>
        
        <div className="suggestion-quantum">
          <div className="suggestion-client">Performance Matrix</div>
          <div className="suggestion-match">Efficienza {quantumMetrics.efficiency.toFixed(1)}% • Sistema ottimale</div>
          <div className="suggestion-ai">🌟 Premium Neural Level</div>
        </div>
      </div>

      {/* Quantum Floating Actions */}
      <div className="quantum-actions">
        <button className="action-quantum add" title="Nuovo Quantum Appointment" onClick={handleNewQuantumAppointment}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </button>
        <button className="action-quantum ai" title="Neural AI Assistant">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </button>
        <button className="action-quantum analytics" title="Quantum Analytics">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </button>
        <button className="action-quantum settings" title="Neural Settings">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </div>

      {/* Quantum Modal */}
      <div className="quantum-modal" id="quantumModal">
        <div className="modal-quantum-content">
          <div className="modal-header">
            <h3 className="modal-title">QUANTUM APPOINTMENT DETAILS</h3>
            <button className="close-btn" id="closeQuantumModal">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div id="quantumModalContent">
            {/* Dynamic content will be inserted here */}
          </div>
        </div>
      </div>

      {/* Include Quantum Scripts */}
      <QuantumScripts />
    </div>
  )
}