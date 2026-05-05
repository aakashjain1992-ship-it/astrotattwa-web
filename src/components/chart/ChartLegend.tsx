'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PLANET_SYMBOLS, PLANET_FULL_NAMES } from '@/types/astrology';
import { ChevronDown } from 'lucide-react';

interface ChartLegendProps {
  variant?: 'sidebar' | 'accordion';
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ChartLegend({ variant = 'sidebar', className, isOpen: isOpenProp, onToggle }: ChartLegendProps) {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenInternal;
  const handleToggle = onToggle ?? (() => setIsOpenInternal(v => !v));
  
  const content = (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Planet Symbols
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(PLANET_SYMBOLS).map(([key, symbol]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="font-bold text-blue-600 dark:text-blue-400 w-6">{symbol}</span>
              <span className="text-slate-600 dark:text-slate-400">
                {PLANET_FULL_NAMES[key as keyof typeof PLANET_SYMBOLS]}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Status Flags
        </h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-start gap-2">
            <span className="font-bold text-orange-600 dark:text-orange-400 w-4">R</span>
            <span className="text-slate-600 dark:text-slate-400">Retrograde</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-orange-600 dark:text-orange-400 w-4">C</span>
            <span className="text-slate-600 dark:text-slate-400">Combust</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-orange-600 dark:text-orange-400 w-4">D</span>
            <span className="text-slate-600 dark:text-slate-400">Deep Combust</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-orange-600 dark:text-orange-400 w-4">S</span>
            <span className="text-slate-600 dark:text-slate-400">Stationary</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-green-600 dark:text-green-400 w-4">↑</span>
            <span className="text-slate-600 dark:text-slate-400">Exalted</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-red-600 dark:text-red-400 w-4">↓</span>
            <span className="text-slate-600 dark:text-slate-400">Debilitated</span>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (variant === 'accordion') {
    return (
      <div className={cn('border rounded-lg', className)}>
        <button type="button" onClick={handleToggle} className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors">
          <span className="font-semibold text-sm">Chart Legend</span>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
        </button>
        {isOpen && <div className="p-4 pt-0 border-t">{content}</div>}
      </div>
    );
  }
  
  return (
    <div className={cn('p-4 border rounded-lg bg-white dark:bg-slate-950', className)}>
      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Chart Legend</h2>
      {content}
    </div>
  );
}
