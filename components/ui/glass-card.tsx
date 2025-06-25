// components/ui/glass-card.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 transition-all duration-500 hover:bg-white/15 hover:border-white/30 hover:shadow-2xl hover:shadow-white/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}