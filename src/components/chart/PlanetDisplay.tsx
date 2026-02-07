'use client';

import { cn } from '@/lib/utils';
import type { PlanetDisplayInfo } from '@/types/astrology';

interface PlanetDisplayProps {
  planet: PlanetDisplayInfo;
  onClick?: () => void;
  className?: string;
}

export function PlanetDisplay({ planet, onClick, className }: PlanetDisplayProps) {
  const hasFlags = planet.statusFlags.length > 0;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5',
        'min-w-[44px] min-h-[44px]',
        'rounded-sm',
        'transition-all duration-200',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        'active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        onClick && 'cursor-pointer',
        className
      )}
      aria-label={`${planet.key} at ${planet.degree} degrees ${planet.statusFlags.length > 0 ? `with flags: ${planet.statusFlags.join(', ')}` : ''}`}
    >
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-none">
        {planet.degree}
      </div>
      
      <div className={cn('text-base font-bold leading-none')}>
        {planet.symbol}
      </div>
      
      {hasFlags && (
        <div className="text-xs font-normal text-orange-600 dark:text-orange-400 leading-none">
          {planet.statusFlags.join(' ')}
        </div>
      )}
    </button>
  );
}
