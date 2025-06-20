// components/ui/separator.tsx
import React from 'react';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({ 
  orientation = 'horizontal', 
  className = '', 
  ...props 
}) => (
  <div
    className={`
      ${orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px'} 
      bg-gray-200 
      ${className}
    `}
    {...props}
  />
);
