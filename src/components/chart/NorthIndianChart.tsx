'use client';

import { cn } from '@/lib/utils';
import type { ChartData } from '@/types/chart-display';
import { buildHouses } from '@/lib/utils/chartHelpers';
import { HouseBlock } from './HouseBlock';

interface NorthIndianChartProps {
  chartData: ChartData;
  onPlanetClick?: (planetKey: string) => void;
  onHouseClick?: (houseNumber: number) => void;
  showHouseNumbers?: boolean;
  className?: string;
}

export function NorthIndianChart({
  chartData,
  onPlanetClick,
  onHouseClick,
  showHouseNumbers = false,
  className,
}: NorthIndianChartProps) {
  const houses = buildHouses(chartData);
  const getHouse = (num: number) => houses[num - 1];
  
  return (
    <div className={cn('w-full max-w-[600px] mx-auto', 'aspect-square', 'p-4', className)}>
      <div className="relative w-full h-full">
        <div className="absolute inset-0 border-2 border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-900" />
        
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0">
          <HouseBlock house={getHouse(3)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(3)} showHouseNumber={showHouseNumbers} className="col-start-1 row-start-1" />
          <HouseBlock house={getHouse(2)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(2)} showHouseNumber={showHouseNumbers} className="col-start-2 row-start-1" />
          <HouseBlock house={getHouse(12)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(12)} showHouseNumber={showHouseNumbers} className="col-start-3 row-start-1" />
          <HouseBlock house={getHouse(11)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(11)} showHouseNumber={showHouseNumbers} className="col-start-4 row-start-1" />
          
          <HouseBlock house={getHouse(4)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(4)} showHouseNumber={showHouseNumbers} className="col-start-1 row-start-2" />
          <HouseBlock house={getHouse(1)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(1)} showHouseNumber={showHouseNumbers} className="col-span-2 col-start-2 row-start-2" />
          <HouseBlock house={getHouse(10)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(10)} showHouseNumber={showHouseNumbers} className="col-start-4 row-start-2" />
          
          <HouseBlock house={getHouse(5)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(5)} showHouseNumber={showHouseNumbers} className="col-start-1 row-start-3" />
          <HouseBlock house={getHouse(9)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(9)} showHouseNumber={showHouseNumbers} className="col-start-4 row-start-3" />
          
          <HouseBlock house={getHouse(6)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(6)} showHouseNumber={showHouseNumbers} className="col-start-1 row-start-4" />
          <HouseBlock house={getHouse(7)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(7)} showHouseNumber={showHouseNumbers} className="col-start-2 row-start-4" />
          <HouseBlock house={getHouse(8)} onPlanetClick={onPlanetClick} onHouseClick={() => onHouseClick?.(8)} showHouseNumber={showHouseNumbers} className="col-start-3 row-start-4" />
        </div>
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-slate-500" />
          <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-slate-500" />
        </svg>
      </div>
    </div>
  );
}
