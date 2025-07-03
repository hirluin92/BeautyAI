'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const quantumButtonVariants = cva(
  'relative inline-flex items-center justify-center font-bold transition-all duration-300 overflow-hidden group',
  {
    variants: {
      variant: {
        neural: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500',
        quantum: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500',
        hologram: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500',
        ghost: 'border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
      },
      size: {
        sm: 'px-4 py-2 text-sm rounded-lg',
        md: 'px-6 py-3 text-base rounded-xl',
        lg: 'px-8 py-4 text-lg rounded-2xl',
        icon: 'w-12 h-12 rounded-xl'
      }
    },
    defaultVariants: {
      variant: 'neural',
      size: 'md'
    }
  }
)

interface QuantumButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof quantumButtonVariants> {
  children: React.ReactNode
  loading?: boolean
}

export const QuantumButton: React.FC<QuantumButtonProps> = ({
  variant,
  size,
  className,
  children,
  loading = false,
  ...props
}) => {
  return (
    <button
      className={cn(
        quantumButtonVariants({ variant, size }),
        'hover:scale-105 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]',
        className
      )}
      disabled={loading}
      {...props}
    >
      {/* Quantum Scan Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      {/* Neural Pulse */}
      <div className="absolute inset-0 rounded-inherit border border-white/20 animate-pulse opacity-0 group-hover:opacity-100" />
      <span className="relative z-10 flex items-center gap-2">
        {loading && (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        {children}
      </span>
    </button>
  )
} 