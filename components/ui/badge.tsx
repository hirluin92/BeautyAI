// components/ui/badge.tsx - Badge con variant support
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

const variantStyles = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-input bg-background'
};

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className = '', 
  ...props 
}) => (
  <div 
    className={`
      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors
      ${variantStyles[variant]}
      ${className}
    `} 
    {...props}
  >
    {children}
  </div>
);