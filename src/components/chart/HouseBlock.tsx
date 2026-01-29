'use client';

import { cn } from '@/lib/utils';
import type { HouseInfo } from '@/types/chart-display';
import { PlanetDisplay } from './PlanetDisplay';

interface HouseBlockProps {
  house: HouseInfo;
  onPlanetClick?: (planetKey: string) => void;
  onHouseClick?: () => void;
  showHouseNumber?: boolean;
  className?: string;
}

export function HouseBlock({
  house,
  onPlanetClick,
  onHouseClick,
  showHouseNumber = false,
  className,
}: HouseBlockProps) {
  const hasPlanets = house.planets.length > 0;
  
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center',
        'p-2',
        'border border-slate-300 dark:border-slate-600',
        'bg-slate-50 dark:bg-slate-900',
        'transition-colors duration-200',
        onHouseClick && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800',
        house.isAscendant && 'ring-2 ring-blue-500 dark:ring-blue-400',
        className
      )}
      onClick={onHouseClick}
      role={onHouseClick ? 'button' : undefined}
      tabIndex={onHouseClick ? 0 : undefined}
      aria-label={`House ${house.houseNumber}, ${house.rasiName}, ${hasPlanets ? `contains ${house.planets.length} planet${house.planets.length > 1 ? 's' : ''}` : 'empty'}`}
    >
      {showHouseNumber && (
        <div className="absolute top-1 left-1 text-[10px] text-slate-400 dark:text-slate-600">
          {house.houseNumber}
        </div>
      )}
      
      <div className="absolute top-1 right-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {house.rasiNumber}
      </div>
      
      <div className="flex flex-col items-center justify-center gap-2 flex-1 w-full">
        {hasPlanets ? (
          house.planets.map((planet) => (
            <PlanetDisplay
              key={planet.key}
              planet={planet}
              onClick={() => onPlanetClick?.(planet.key)}
            />
          ))
        ) : (
          <div className="text-xs text-slate-300 dark:text-slate-700" />
        )}
      </div>
      
      {house.isAscendant && (
        <div className="absolute bottom-1 left-0 right-0 text-center">
          <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
            ASC
          </span>
        </div>
      )}
    </div>
  );
}
