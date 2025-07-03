'use client'

import React from 'react'
import { QuantumMetricCard } from '@/components/ui/quantum/quantum-metric-card'
import { QuantumCalendar } from '@/components/calendar/quantum-calendar'
import { QuantumCard } from '@/components/ui/quantum/quantum-card'

interface QuantumDashboardProps {
  metrics?: {
    revenue: string
    bookings: number
    efficiency: string
    satisfaction: string
  }
}

export const QuantumDashboard: React.FC<QuantumDashboardProps> = ({
  metrics = {
    revenue: '€3,247',
    bookings: 156,
    efficiency: '98.7%',
    satisfaction: '99.2%'
  }
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      {/* Neural Header */}
      <QuantumCard variant="neural" className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white">
              Ω
            </div>
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-wider">
                Beauty AI Revolution
              </h1>
              <p className="text-cyan-400 font-mono text-sm">
                QUANTUM.NEURAL.ENGINE.ONLINE
              </p>
            </div>
          </div>
        </div>
      </QuantumCard>
      {/* AI Command Center */}
      <QuantumCard variant="hologram" className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
            🧠
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">NEURAL COMMAND CENTER</h3>
            <p className="text-slate-400">Quantum AI Engine v3.0</p>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-6 border border-cyan-500/20">
          <div className="font-mono text-cyan-400 text-sm mb-2">
            &gt; ANALISI PREDITTIVA IN CORSO...
          </div>
          <p className="text-slate-300 leading-relaxed">
            Giovedì 14:30 rappresenta il momento ottimale quantico per trattamento premium. 
            Algoritmo neurale rileva 97.3% probabilità conversione con ROI €127. 
            Pattern comportamentali indicano cliente target: "luxury quantum seeker".
          </p>
        </div>
      </QuantumCard>
      {/* Quantum Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <QuantumMetricCard
          icon="💰"
          title="Ricavi Quantum Oggi"
          value={metrics.revenue}
          change="+24.7% vs dimensione precedente"
          trend="up"
          variant="neural"
        />
        <QuantumMetricCard
          icon="📅"
          title="Prenotazioni Neural"
          value={metrics.bookings}
          change="+18.9% efficienza algoritmica"
          trend="up"
          variant="hologram"
        />
        <QuantumMetricCard
          icon="⚡"
          title="Efficienza Quantica"
          value={metrics.efficiency}
          change="+6.4% vs matrice base"
          trend="up"
          variant="glass"
        />
        <QuantumMetricCard
          icon="❤️"
          title="Satisfaction Neural"
          value={metrics.satisfaction}
          change="+3.8% felicità clienti"
          trend="up"
          variant="neural"
        />
      </div>
      {/* Quantum Calendar */}
      <QuantumCalendar />
    </div>
  )
} 