'use client'

import React, { useState, useEffect } from 'react'
import { QuantumCard } from '@/components/ui/quantum/quantum-card'
import { QuantumButton } from '@/components/ui/quantum/quantum-button'

interface QuantumCalendarProps {
  bookings?: any[]
  onBookingClick?: (booking: any) => void
  onSlotClick?: (date: Date, time: string) => void
}

export const QuantumCalendar: React.FC<QuantumCalendarProps> = ({
  bookings = [],
  onBookingClick,
  onSlotClick
}) => {
  const [selectedView, setSelectedView] = useState<'neural' | 'quantum' | 'hologram'>('neural')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const days = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM']
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']

  // Funzione deterministico per l'efficienza basata sull'indice
  const getEfficiency = (index: number) => {
    const baseEfficiency = 85
    const variation = (index * 7) % 15 // Variazione deterministica
    return baseEfficiency + variation
  }

  return (
    <QuantumCard variant="neural" className="p-8">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-white uppercase tracking-wider">
          CALENDARIO QUANTICO
        </h2>
        <div className="flex gap-3">
          <QuantumButton
            variant="neural"
            size="sm"
            onClick={() => setSelectedView('neural')}
          >
            🧠 Neural Mode
          </QuantumButton>
          <QuantumButton
            variant="quantum"
            size="sm"
            onClick={() => setSelectedView('quantum')}
          >
            ⚛️ Quantum Sync
          </QuantumButton>
          <QuantumButton
            variant="hologram"
            size="sm"
            onClick={() => setSelectedView('hologram')}
          >
            🌟 Hologram View
          </QuantumButton>
        </div>
      </div>
      {/* Calendar Grid */}
      <div className="grid grid-cols-8 gap-2 mb-4">
        {/* Time Column Header */}
        <div className="text-cyan-400 font-mono text-sm"></div>
        {/* Day Headers */}
        {days.map((day, index) => (
          <div
            key={day}
            className={`
              text-center p-4 rounded-xl font-bold uppercase tracking-wide
              ${index === 3 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-slate-800/50 text-slate-300'}
            `}
          >
            <div className="text-lg">{day}</div>
            <div className="text-xs opacity-70">
              {9 + index} DIC
            </div>
            <div className="text-xs mt-1 font-mono">
              {index === 3 ? 'QUANTUM ACTIVE' : `${getEfficiency(index)}% efficient`}
            </div>
          </div>
        ))}
      </div>
      {/* Time Slots */}
      {timeSlots.map((time) => (
        <div key={time} className="grid grid-cols-8 gap-2 mb-2">
          {/* Time Label */}
          <div className="flex items-center justify-center text-cyan-400 font-mono font-bold">
            {time}
          </div>
          {/* Day Cells */}
          {days.map((day, dayIndex) => (
            <div
              key={`${time}-${day}`}
              className="h-24 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer relative group"
              onClick={() => onSlotClick?.(new Date(), time)}
            >
              {/* Random quantum appointments for demo - solo sul client */}
              {isClient && (dayIndex + timeSlots.indexOf(time)) % 3 === 0 && (
                <div className="absolute inset-2 bg-gradient-to-r from-purple-600/80 to-pink-600/80 rounded-lg p-3 text-white text-xs">
                  <div className="font-bold">Cliente Quantum</div>
                  <div className="opacity-80">Neural Treatment</div>
                  <div className="text-xs mt-1 opacity-60">✦ AI OPTIMIZED</div>
                </div>
              )}
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      ))}
    </QuantumCard>
  )
} 