'use client'

import React from 'react'
import { QuantumCard } from './quantum-card'

interface QuantumMetricCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  variant?: 'neural' | 'hologram' | 'glass'
}

export const QuantumMetricCard: React.FC<QuantumMetricCardProps> = ({
  icon,
  title,
  value,
  change,
  trend = 'neutral',
  variant = 'glass'
}) => {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-cyan-400'
  }

  return (
    <QuantumCard variant={variant} className="group cursor-pointer">
      {/* Icon Hologram */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <div className="text-cyan-400 text-2xl">
          {icon}
        </div>
      </div>
      {/* Value */}
      <div className="text-4xl font-black text-white mb-2 font-mono tracking-tight">
        {value}
      </div>
      {/* Title */}
      <div className="text-slate-400 font-semibold mb-3 uppercase tracking-wide text-sm">
        {title}
      </div>
      {/* Change Indicator */}
      {change && (
        <div className={`text-sm font-mono ${trendColors[trend]} flex items-center gap-1`}>
          <span className="text-xs">⟪</span>
          {change}
          <span className="text-xs">⟫</span>
        </div>
      )}
      {/* Neural Activity Indicator */}
      <div className="absolute top-4 right-4 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" />
    </QuantumCard>
  )
} 