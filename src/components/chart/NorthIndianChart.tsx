'use client';

import { cn } from '@/lib/utils';
import type { ChartData } from '@/types/chart-display';
import { buildHouses, type HouseSystem } from '@/lib/utils/chartHelpers';
import { HouseBlock } from './HouseBlock';

interface NorthIndianChartProps {
  chartData: ChartData;
  onPlanetClick?: (planetKey: string) => void;
  onHouseClick?: (houseNumber: number) => void;
  showHouseNumbers?: boolean;
  houseSystem?: HouseSystem;
  className?: string;
}

export function NorthIndianChart({
  chartData,
  onPlanetClick,
  onHouseClick,
  showHouseNumbers = false,
  houseSystem = 'whole-sign',
  className,
}: NorthIndianChartProps) {
  const houses = buildHouses(chartData, houseSystem);
  const getHouse = (num: number) => houses[num - 1];
  
  return (
    <div className={cn('w-full max-w-[600px] mx-auto', 'aspect-square', 'p-4', className)}>
      <div className="relative w-full h-full">
        {/* SVG Diamond Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Outer border */}
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-slate-500" />
          
          {/* Diamond lines */}
          {/* Top-left to bottom-right diagonal */}
          <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-slate-500" />
          
          {/* Top-right to bottom-left diagonal */}
          <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-slate-500" />
          
          {/* Horizontal center line */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-slate-500" />
          
          {/* Vertical center line */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-slate-500" />
        </svg>
        
        {/* House blocks positioned in diamond layout */}
        <div className="absolute inset-0">
          {/* Row 1 - Top: Houses 2, 1 (Lagna), 12 */}
          <div className="absolute top-0 left-0 w-1/3 h-1/4">
            <HouseBlock house={getHouse(2)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(2)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
          <div className="absolute top-0 left-1/3 w-1/3 h-1/4">
            <HouseBlock house={getHouse(1)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(1)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-1/4">
            <HouseBlock house={getHouse(12)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(12)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
          
          {/* Row 2: Houses 3, 11 */}
          <div className="absolute top-1/4 left-0 w-1/3 h-1/4">
            <HouseBlock house={getHouse(3)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(3)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
          <div className="absolute top-1/4 right-0 w-1/3 h-1/4">
            <HouseBlock house={getHouse(11)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(11)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
          
          {/* Row 3: Houses 4, 10 */}
          <div className="absolute top-1/2 left-0 w-1/3 h-1/4">
            <HouseBlock house={getHouse(4)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(4)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
          <div className="absolute top-1/2 right-0 w-1/3 h-1/4">
            <HouseBlock house={getHouse(10)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(10)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
          
          {/* Row 4 - Bottom: Houses 5, 6, 7, 8, 9 */}
          <div className="absolute bottom-0 left-0 w-1/3 h-1/4">
            <HouseBlock house={getHouse(5)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(5)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
          
          {/* Bottom center split: Houses 6, 7 */}
          <div className="absolute bottom-0 left-1/3 w-1/6 h-1/4">
            <HouseBlock house={getHouse(6)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(6)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
          <div className="absolute bottom-0 left-1/2 w-1/6 h-1/4">
            <HouseBlock house={getHouse(7)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(7)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
          
          {/* Houses 8, 9 */}
          <div className="absolute bottom-0 right-1/3 w-1/6 h-1/4">
            <HouseBlock house={getHouse(8)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(8)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
          <div className="absolute bottom-0 right-0 w-1/3 h-1/4">
            <HouseBlock house={getHouse(9)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(9)} showHouseNumber={showHouseNumbers} className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
