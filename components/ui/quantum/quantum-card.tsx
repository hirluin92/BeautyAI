'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface QuantumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'neural' | 'hologram' | 'glass'
  glowEffect?: boolean
  children: React.ReactNode
}

export const QuantumCard: React.FC<QuantumCardProps> = ({
  variant = 'glass',
  glowEffect = false,
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    neural: 'bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/20',
    hologram: 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30',
    glass: 'bg-white/5 backdrop-blur-xl border-white/10'
  }

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-500 relative overflow-hidden',
        'hover:scale-[1.02] hover:shadow-2xl',
        variantStyles[variant],
        glowEffect && 'shadow-[0_0_30px_rgba(0,212,255,0.3)]',
        className
      )}
      {...props}
    >
      {/* Quantum Scan Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
      {/* Neural Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
        <div className="absolute bottom-6 left-6 w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
      </div>
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  )
} 