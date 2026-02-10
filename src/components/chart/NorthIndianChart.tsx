'use client';

import { cn } from '@/lib/utils';
import type { ChartData } from '@/types/astrology';
import { buildHouses, type HouseSystem } from '@/lib/utils/chartHelpers';

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
  showHouseNumbers: _showHouseNumbers = false,
  houseSystem = 'whole-sign',
  className,
}: NorthIndianChartProps) {
  // Fix: pass planets and ascendant separately, not the whole chartData
  const houses = buildHouses(chartData.planets, chartData.ascendant, houseSystem);
  
  // House 1 at TOP (12 o'clock), going ANTI-CLOCKWISE
  const housePositions: Record<number, { x: number; y: number }> = {
    1: { x: 300, y: 150 },   // Top center (12 o'clock) - ASC
    2: { x: 150, y: 75 },    // Top-left (11 o'clock)
    3: { x: 75, y: 150 },    // Left-top (10 o'clock)
    4: { x: 75, y: 300 },    // Left-center (9 o'clock)
    5: { x: 75, y: 450 },    // Left-bottom (8 o'clock)
    6: { x: 150, y: 525 },   // Bottom-left (7 o'clock)
    7: { x: 300, y: 450 },   // Bottom center (6 o'clock)
    8: { x: 450, y: 525 },   // Bottom-right (5 o'clock)
    9: { x: 525, y: 450 },   // Right-bottom (4 o'clock)
    10: { x: 525, y: 300 },  // Right-center (3 o'clock)
    11: { x: 525, y: 150 },  // Right-top (2 o'clock)
    12: { x: 450, y: 75 },   // Top-right (1 o'clock)
  };
  
  // Rashi numbers at edges (anti-clockwise from top)
  const rashiPositions: Record<number, { x: number; y: number }> = {
    1: { x: 300, y: 40 },    // Top
    2: { x: 120, y: 60 },    // Top-left
    3: { x: 40, y: 150 },    // Left-top
    4: { x: 40, y: 300 },    // Left-center
    5: { x: 40, y: 450 },    // Left-bottom
    6: { x: 120, y: 540 },   // Bottom-left
    7: { x: 300, y: 560 },   // Bottom
    8: { x: 480, y: 540 },   // Bottom-right
    9: { x: 560, y: 450 },   // Right-bottom
    10: { x: 560, y: 300 },  // Right-center
    11: { x: 560, y: 150 },  // Right-top
    12: { x: 480, y: 60 },   // Top-right
  };
  
  const getPlanetColor = (key: string) => {
    if (['Moon', 'Mercury', 'Jupiter', 'Venus'].includes(key)) {
      return 'text-blue-600 dark:text-blue-400';
    }
    if (['Rahu', 'Ketu'].includes(key)) {
      return 'text-purple-600 dark:text-purple-400';
    }
    return 'text-orange-600 dark:text-orange-400';
  };
  
  return (
    <div className={cn('w-full max-w-[600px] mx-auto', 'aspect-square', className)}>
      <svg viewBox="0 0 600 600" className="w-full h-full">
        <rect width="600" height="600" fill="currentColor" className="text-slate-950" />
        
        {/* Outer square */}
        <rect x="0" y="0" width="600" height="600" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
        
        {/* Two main diagonals */}
        <line x1="0" y1="600" x2="600" y2="0" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
        <line x1="600" y1="600" x2="0" y2="0" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
        
        {/* Midpoint-to-midpoint diamond */}
        <line x1="300" y1="600" x2="600" y2="300" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
        <line x1="600" y1="300" x2="300" y2="0" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
        <line x1="300" y1="0" x2="0" y2="300" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
        <line x1="0" y1="300" x2="300" y2="600" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
        
        {/* Rashi numbers */}
        {houses.map((house) => {
          const pos = rashiPositions[house.houseNumber];
          return (
            <text key={`rashi-${house.houseNumber}`} x={pos.x} y={pos.y} fontSize="16" fontWeight="500" fill="currentColor" className="text-slate-500" textAnchor="middle" dominantBaseline="middle">
              {house.rasiNumber}
            </text>
          );
        })}
        
        {/* ASC label for house 1 */}
        {houses[0].isAscendant && (
          <text x={300} y={220} fontSize="16" fontWeight="bold" fill="currentColor" className="text-blue-500" textAnchor="middle">
            ASC
          </text>
        )}
        
        {/* Planets */}
        {houses.map((house) => {
          if (house.planets.length === 0) return null;
          const basePos = housePositions[house.houseNumber];
          const spacing = 50;
          const totalHeight = (house.planets.length - 1) * spacing;
          const startY = basePos.y - totalHeight / 2;
          
          return (
            <g key={`planets-${house.houseNumber}`}>
              {house.planets.map((planet, index) => {
                const y = startY + (index * spacing);
                const colorClass = getPlanetColor(planet.key);
                
                return (
                  <g key={planet.key} onClick={() => onPlanetClick?.(planet.key)} style={{ cursor: onPlanetClick ? 'pointer' : 'default' }}>
                    <text x={basePos.x} y={y - 12} fontSize="13" fill="currentColor" className="text-slate-400" textAnchor="middle">{planet.degree}</text>
                    <text x={basePos.x} y={y + 5} fontSize="18" fontWeight="bold" fill="currentColor" className={colorClass} textAnchor="middle">{planet.symbol}</text>
                    {planet.statusFlags.length > 0 && (
                      <text x={basePos.x} y={y + 22} fontSize="12" fill="currentColor" className="text-orange-600" textAnchor="middle">{planet.statusFlags.join(' ')}</text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        
        {/* Clickable overlays */}
        {onHouseClick && houses.map((house) => {
          const pos = housePositions[house.houseNumber];
          return <circle key={`click-${house.houseNumber}`} cx={pos.x} cy={pos.y} r="50" fill="transparent" onClick={() => onHouseClick(house.houseNumber)} style={{ cursor: 'pointer' }} />;
        })}
      </svg>
    </div>
  );
}
