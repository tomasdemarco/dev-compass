import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info } from 'lucide-react';

interface InlineAlertProps {
  variant?: 'error' | 'info';
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InlineAlert: React.FC<InlineAlertProps> = ({ 
  variant = 'info', 
  title, 
  children, 
  className 
}) => {
  const isError = variant === 'error';

  return (
    <div
      className={cn(
        'w-full border-l-4 p-4',
        {
          'bg-destructive/10 border-destructive text-destructive': isError,
          'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300': !isError,
        },
        className
      )}
      role="alert"
    >
      <div className="flex items-center">
        {isError ? <AlertTriangle className="h-5 w-5 mr-3" /> : <Info className="h-5 w-5 mr-3" />}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="mt-2 ml-8 text-sm">
        {children}
      </div>
    </div>
  );
};

export default InlineAlert;
