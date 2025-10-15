import React from 'react';
import Link from 'next/link';
import { TAG_STYLES, DEFAULT_TAG_STYLE } from '@/lib/tag-styles';
import { cn } from '@/lib/utils';

// --- Type Definitions ---

export type BadgeType = 'status' | 'tag' | 'custom';

// --- Style Logic ---

const statusClasses: { [key: string]: string } = {
  success: 'bg-green-600 text-white',
  failed: 'bg-red-600 text-white',
  running: 'bg-blue-600 text-white',
  warning: 'bg-yellow-500 text-white',
};

// --- Component Props ---

interface StyledBadgeProps {
  type: BadgeType;
  text: string;
  icon?: React.ElementType;
  href?: string;
  className?: string;
}

// --- Component ---

const StyledBadge: React.FC<StyledBadgeProps> = ({ type, text, icon: Icon, href, className = '' }) => {
  if (!text) {
    return null; // Do not render if text is not provided
  }

  let styleClasses = '';

  if (type === 'status') {
    styleClasses = statusClasses[text.toLowerCase()] || 'bg-gray-400 text-white';
  } else if (type === 'tag') {
    styleClasses = TAG_STYLES[text.toLowerCase()] || DEFAULT_TAG_STYLE;
  }

  const content = (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold select-none transition-colors',
        styleClasses,
        { 'hover:brightness-90': !!href },
        className
      )}
      title={text}
    >
      {Icon && <Icon className="h-4 w-4 mr-1.5" />}
      {text}
    </span>
  );

  if (href) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </Link>
    );
  }

  return content;
};

export default StyledBadge;
