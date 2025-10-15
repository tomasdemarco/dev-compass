import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemovableBadgeProps {
  label: string;
  onRemove: () => void;
  className?: string;
}

const RemovableBadge: React.FC<RemovableBadgeProps> = ({ label, onRemove, className }) => {
  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent any parent onClick handlers from being triggered
    onRemove();
  };

  return (
    <span
      className={cn(
        "flex items-center justify-center gap-1 bg-secondary text-secondary-foreground rounded-full pl-2.5 pr-1 py-0.5 text-xs",
        className
      )}
    >
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        className="flex-shrink-0 rounded-full p-0.5 hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-destructive"
        onClick={handleRemoveClick}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
};

export default RemovableBadge;
