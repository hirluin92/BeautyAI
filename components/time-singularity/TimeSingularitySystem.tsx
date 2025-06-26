'use client'
import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  Settings,
  Zap,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Star,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Timer,
  Target,
  Sparkles,
  Cpu,
  Brain,
  Atom,
  Layers,
  Grid,
  List,
  Clock3,
  Hourglass,
  Activity
} from 'lucide-react';

interface TimeSlot {
  id: string
  start: string
  end: string
  duration: number
  type: 'available' | 'booked' | 'blocked' | 'optimal' | 'quantum'
  efficiency: number
  revenue_potential: number
  staff_id?: string
  client_id?: string
  service_id?: string
  booking_id?: string
  ai_generated: boolean
  quantum_score: number
}

interface StaffMember {
  id: string
  name: string
  role: string
  specializations: string[]
  efficiency_rating: number
  hourly_rate: number
  availability_pattern: string[]
  quantum_sync: boolean
}

interface QuantumCalendarData {
  date: string
  total_slots: number
  booked_slots: number
  optimal_slots: number
  quantum_slots: number
  efficiency_score: number
  revenue_forecast: number
  ai_recommendations: string[]
  time_distortions: {
    created: number
    duration_saved: number
    revenue_gained: number
  }
}

export default function TimeSingularitySystem() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'quantum'>('quantum')
  const [selectedStaff, setSelectedStaff] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [quantumMode, setQuantumMode] = useState(true)
  const [aiOptimizing, setAiOptimizing] = useState(false)

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [calendarData, setCalendarData] = useState<QuantumCalendarData | null>(null)

  // Mock data initialization
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      
      // Simulate API loading
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockStaff: StaffMember[] = [
        {
          id: '1',
          name: 'Sofia Romano',
          role: 'Senior Estetista',
          specializations: ['Viso', 'Anti-aging', 'Peeling'],
          efficiency_rating: 95,
          hourly_rate: 80,
          availability_pattern: ['morning', 'afternoon'],
          quantum_sync: true
        },
        {
          id: '2',
          name: 'Marco Bianchi',
          role: 'Hair Stylist',
          specializations: ['Taglio', 'Colore', 'Styling'],
          efficiency_rating: 88,
          hourly_rate: 70,
          availability_pattern: ['afternoon', 'evening'],
          quantum_sync: true
        },
        {
          id: '3',
          name: 'Anna Verdi',
          role: 'Massoterapista',
          specializations: ['Massaggio', 'Rilassamento', 'Terapeutico'],
          efficiency_rating: 92,
          hourly_rate: 75,
          availability_pattern: ['morning', 'evening'],
          quantum_sync: false
        }
      ]

      const mockSlots: TimeSlot[] = generateQuantumTimeSlots()
      
      const mockCalendarData: QuantumCalendarData = {
        date: currentDate.toISOString().split('T')[0],
        total_slots: 48,
        booked_slots: 32,
        optimal_slots: 12,
        quantum_slots: 8,
        efficiency_score: 87,
        revenue_forecast: 2340,
        ai_recommendations: [
          'Crea 3 slot quantici da 45min per massimizzare ricavi',
          'Sposta 2 appuntamenti per ottimizzare flusso clienti',
          'Implementa pausa intelligente alle 14:30 per +15% efficienza'
        ],
        time_distortions: {
          created: 6,
          duration_saved: 180,
          revenue_gained: 420
        }
      }

      setStaff(mockStaff)
      setTimeSlots(mockSlots)
      setCalendarData(mockCalendarData)
      setLoading(false)
    }

    initializeData()
  }, [currentDate])

  const generateQuantumTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const baseDate = currentDate.toISOString().split('T')[0]
    
    // Generate slots from 9:00 to 19:00
    for (let hour = 9; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const endTime = minute === 30 
          ? `${(hour + 1).toString().padStart(2, '0')}:00`
          : `${hour.toString().padStart(2, '0')}:30`
        
        const slot: TimeSlot = {
          id: `${baseDate}_${startTime}`,
          start: `${baseDate}T${startTime}:00`,
          end: `${baseDate}T${endTime}:00`,
          duration: 30,
          type: Math.random() > 0.6 ? 'booked' : Math.random() > 0.7 ? 'optimal' : Math.random() > 0.8 ? 'quantum' : 'available',
          efficiency: Math.floor(Math.random() * 40) + 60,
          revenue_potential: Math.floor(Math.random() * 100) + 50,
          ai_generated: Math.random() > 0.7,
          quantum_score: Math.floor(Math.random() * 100),
          staff_id: Math.random() > 0.5 ? ['1', '2', '3'][Math.floor(Math.random() * 3)] : undefined
        }
        
        slots.push(slot)
      }
    }
    
    return slots
  }

  const runQuantumOptimization = async () => {
    setAiOptimizing(true)
    
    // Simulate AI optimization
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Update slots with optimized data
    const optimizedSlots = timeSlots.map(slot => ({
      ...slot,
      efficiency: Math.min(slot.efficiency + Math.floor(Math.random() * 20), 100),
      quantum_score: Math.min(slot.quantum_score + Math.floor(Math.random() * 15), 100),
      type: slot.type === 'available' && Math.random() > 0.6 ? 'optimal' : slot.type
    }))
    
    setTimeSlots(optimizedSlots)
    setAiOptimizing(false)
  }

  const getSlotColor = (slot: TimeSlot) => {
    switch (slot.type) {
      case 'booked': return 'bg-blue-500 border-blue-600'
      case 'optimal': return 'bg-green-500 border-green-600'
      case 'quantum': return 'bg-purple-500 border-purple-600 animate-pulse'
      case 'blocked': return 'bg-gray-400 border-gray-500'
      default: return 'bg-gray-200 border-gray-300 hover:bg-gray-300'
    }
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600 bg-green-50'
    if (efficiency >= 75) return 'text-blue-600 bg-blue-50'
    if (efficiency >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-purple-500/30 rounded-full animate-spin border-t-purple-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Atom className="w-12 h-12 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Inizializzazione Time Singularity</h3>
            <p className="text-purple-300">Calibrando dimensioni temporali...</p>
            <div className="w-64 mx-auto bg-purple-900/50 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl mr-4">
                    <Clock3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white">TIME SINGULARITY</h1>
                    <p className="text-purple-300">Calendario Multidimensionale Quantico</p>
                  </div>
                </div>
                <p className="text-xl text-gray-300 max-w-2xl">
                  Piega il tempo-spazio per creare slot impossibili e massimizzare ogni minuto
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={runQuantumOptimization}
                  disabled={aiOptimizing}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {aiOptimizing ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  {aiOptimizing ? 'Ottimizzando...' : 'Quantum Boost'}
                </button>
                
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl p-1">
                  {['day', 'week', 'month', 'quantum'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === mode 
                          ? 'bg-white text-purple-600 shadow-lg' 
                          : 'text-white hover:bg-white/20'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantum Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Timer className="w-8 h-8 text-orange-400" />
                  <span className="text-2xl font-bold text-white">{calendarData?.quantum_slots}</span>
                </div>
                <p className="text-orange-300 font-medium">Slot Quantici</p>
                <p className="text-gray-400 text-sm">+{calendarData?.time_distortions.duration_saved}min salvati</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-green-400" />
                  <span className="text-2xl font-bold text-white">{calendarData?.efficiency_score}%</span>
                </div>
                <p className="text-green-300 font-medium">Efficienza</p>
                <p className="text-gray-400 text-sm">+12% vs scorsa settimana</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <span className="text-2xl font-bold text-white">€{calendarData?.revenue_forecast}</span>
                </div>
                <p className="text-purple-300 font-medium">Revenue Forecast</p>
                <p className="text-gray-400 text-sm">+€{calendarData?.time_distortions.revenue_gained} da quantum</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Brain className="w-8 h-8 text-cyan-400" />
                  <span className="text-2xl font-bold text-white">{calendarData?.time_distortions.created}</span>
                </div>
                <p className="text-cyan-300 font-medium">Distorsioni Create</p>
                <p className="text-gray-400 text-sm">Oggi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Staff Panel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Quantum Staff</h3>
            
            <div className="space-y-4">
              {staff.map((member) => (
                <div 
                  key={member.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedStaff === member.id 
                      ? 'bg-purple-500/30 border-purple-400' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedStaff(selectedStaff === member.id ? 'all' : member.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{member.name}</h4>
                    {member.quantum_sync && (
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{member.role}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${getEfficiencyColor(member.efficiency_rating)}`}>
                      {member.efficiency_rating}% Efficiency
                    </span>
                    <span className="text-sm text-gray-400">€{member.hourly_rate}/h</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.specializations.slice(0, 2).map((spec, index) => (
                      <span key={index} className="px-1 py-0.5 text-xs bg-white/10 text-gray-300 rounded">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:opacity-90 transition-all">
              <Plus className="w-4 h-4 inline mr-2" />
              Aggiungi Staff
            </button>
          </div>

          {/* Main Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              {/* Calendar Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <h2 className="text-2xl font-bold text-white">
                      {currentDate.toLocaleDateString('it-IT', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h2>
                    
                    <button
                      onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantumMode(!quantumMode)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        quantumMode 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white/20 text-gray-300 hover:bg-white/30'
                      }`}
                    >
                      <Atom className="w-4 h-4 inline mr-2" />
                      Quantum Mode
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 gap-2">
                  {/* Hour Labels and Slots */}
                  {Array.from({ length: 10 }, (_, hourIndex) => {
                    const hour = hourIndex + 9
                    const hourSlots = timeSlots.filter(slot => {
                      const slotHour = parseInt(slot.start.split('T')[1].split(':')[0])
                      return slotHour === hour
                    })
                    
                    return (
                      <div key={hour} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1 text-right text-white font-medium">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                        
                        <div className="col-span-11 grid grid-cols-2 gap-1">
                          {hourSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`h-12 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${getSlotColor(slot)} ${
                                quantumMode && slot.ai_generated ? 'shadow-lg shadow-purple-500/50' : ''
                              }`}
                              title={`${slot.start.split('T')[1].slice(0, 5)} - ${slot.end.split('T')[1].slice(0, 5)}\nEfficiency: ${slot.efficiency}%\nRevenue: €${slot.revenue_potential}\nQuantum Score: ${slot.quantum_score}`}
                            >
                              <div className="h-full flex items-center justify-center relative">
                                {slot.type === 'quantum' && (
                                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                                )}
                                {slot.type === 'optimal' && (
                                  <Star className="w-3 h-3 text-white" />
                                )}
                                {slot.type === 'booked' && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                                
                                {quantumMode && slot.ai_generated && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-ping" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="p-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded mr-2" />
                      <span className="text-gray-300 text-sm">Disponibile</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded mr-2" />
                      <span className="text-gray-300 text-sm">Prenotato</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2" />
                      <span className="text-gray-300 text-sm">Ottimale</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-500 rounded mr-2 animate-pulse" />
                      <span className="text-gray-300 text-sm">Quantum</span>
                    </div>
                  </div>
                  
                  <div className="text-gray-400 text-sm">
                    {timeSlots.filter(s => s.type === 'booked').length} / {timeSlots.length} slot occupati
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-400" />
            Raccomandazioni AI Quantiche
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {calendarData?.ai_recommendations.map((recommendation, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm">{recommendation}</p>
                    <button className="mt-2 text-purple-400 text-xs hover:text-purple-300 transition-colors">
                      Applica →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quantum Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full opacity-60 animate-ping" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-cyan-400 rounded-full opacity-40 animate-pulse" />
        <div className="absolute bottom-1/4 left-2/3 w-1.5 h-1.5 bg-orange-400 rounded-full opacity-50 animate-bounce" />
      </div>
    </div>
  )
} 