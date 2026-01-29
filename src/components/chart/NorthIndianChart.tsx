'use client';

import { cn } from '@/lib/utils';
import type { ChartData } from '@/types/chart-display';
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
  showHouseNumbers = false,
  houseSystem = 'whole-sign',
  className,
}: NorthIndianChartProps) {
  const houses = buildHouses(chartData, houseSystem);
  
  // Coordinates for 600x600 viewBox
  // Square corners: A(0,600), B(600,600), C(600,0), D(0,0)
  // Center: O(300,300)
  // Midpoints: M1(300,600), M2(600,300), M3(300,0), M4(0,300)
  
  // House positions calculated from geometric intersections
  const housePositions: Record<number, { x: number; y: number }> = {
    1: { x: 300, y: 450 },   // Top center
    2: { x: 150, y: 525 },   // Top left
    3: { x: 75, y: 450 },    // Left top
    4: { x: 75, y: 300 },    // Left center
    5: { x: 75, y: 150 },    // Left bottom
    6: { x: 150, y: 75 },    // Bottom left
    7: { x: 300, y: 150 },   // Bottom center
    8: { x: 450, y: 75 },    // Bottom right
    9: { x: 525, y: 150 },   // Right bottom
    10: { x: 525, y: 300 },  // Right center
    11: { x: 525, y: 450 },  // Right top
    12: { x: 450, y: 525 },  // Top right
  };
  
  // Rashi numbers at edges
  const rashiPositions: Record<number, { x: number; y: number }> = {
    1: { x: 300, y: 560 },
    2: { x: 120, y: 540 },
    3: { x: 40, y: 450 },
    4: { x: 40, y: 300 },
    5: { x: 40, y: 150 },
    6: { x: 120, y: 60 },
    7: { x: 300, y: 40 },
    8: { x: 480, y: 60 },
    9: { x: 560, y: 150 },
    10: { x: 560, y: 300 },
    11: { x: 560, y: 450 },
    12: { x: 480, y: 540 },
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
        {/* Background */}
        <rect width="600" height="600" fill="currentColor" className="text-slate-950 dark:text-slate-950" />
        
        {/* 1. Outer square border */}
        <rect x="0" y="0" width="600" height="600" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        
        {/* 2. Two main diagonals */}
        {/* A(0,600) to C(600,0) - top-left to bottom-right */}
        <line x1="0" y1="600" x2="600" y2="0" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        
        {/* B(600,600) to D(0,0) - top-right to bottom-left */}
        <line x1="600" y1="600" x2="0" y2="0" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        
        {/* 3. Four midpoint-to-opposite-vertex lines */}
        {/* M1(300,600) to D(0,0) - top midpoint to bottom-left */}
        <line x1="300" y1="600" x2="0" y2="0" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        
        {/* M2(600,300) to A(0,600) - right midpoint to top-left */}
        <line x1="600" y1="300" x2="0" y2="600" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        
        {/* M3(300,0) to B(600,600) - bottom midpoint to top-right */}
        <line x1="300" y1="0" x2="600" y2="600" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        
        {/* M4(0,300) to C(600,0) - left midpoint to bottom-right */}
        <line x1="0" y1="300" x2="600" y2="0" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        
        {/* Render rashi numbers */}
        {houses.map((house) => {
          const pos = rashiPositions[house.houseNumber];
          return (
            <text
              key={`rashi-${house.houseNumber}`}
              x={pos.x}
              y={pos.y}
              fontSize="16"
              fontWeight="500"
              fill="currentColor"
              className="text-slate-500 dark:text-slate-500"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {house.rasiNumber}
            </text>
          );
        })}
        
        {/* House numbers (debug) */}
        {showHouseNumbers && houses.map((house) => {
          const pos = housePositions[house.houseNumber];
          return (
            <text
              key={`house-num-${house.houseNumber}`}
              x={pos.x - 60}
              y={pos.y - 50}
              fontSize="14"
              fill="currentColor"
              className="text-slate-600 dark:text-slate-600"
              textAnchor="middle"
            >
              H{house.houseNumber}
            </text>
          );
        })}
        
        {/* ASC label */}
        {houses[0].isAscendant && (
          <text
            x={300}
            y={390}
            fontSize="16"
            fontWeight="bold"
            fill="currentColor"
            className="text-blue-500 dark:text-blue-400"
            textAnchor="middle"
          >
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
                  <g
                    key={planet.key}
                    onClick={() => onPlanetClick?.(planet.key)}
                    style={{ cursor: onPlanetClick ? 'pointer' : 'default' }}
                  >
                    <text x={basePos.x} y={y - 12} fontSize="13" fill="currentColor" className="text-slate-400 dark:text-slate-400" textAnchor="middle">
                      {planet.degree}
                    </text>
                    <text x={basePos.x} y={y + 5} fontSize="18" fontWeight="bold" fill="currentColor" className={cn('font-bold', colorClass)} textAnchor="middle">
                      {planet.symbol}
                    </text>
                    {planet.statusFlags.length > 0 && (
                      <text x={basePos.x} y={y + 22} fontSize="12" fill="currentColor" className="text-orange-600 dark:text-orange-400" textAnchor="middle">
                        {planet.statusFlags.join(' ')}
                      </text>
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
          return (
            <circle
              key={`click-${house.houseNumber}`}
              cx={pos.x}
              cy={pos.y}
              r="50"
              fill="transparent"
              onClick={() => onHouseClick(house.houseNumber)}
              style={{ cursor: 'pointer' }}
            />
          );
        })}
      </svg>
    </div>
  );
}
