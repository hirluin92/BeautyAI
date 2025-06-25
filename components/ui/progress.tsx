import * as React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  className?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}
        {...props}
      >
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export default Progress; 