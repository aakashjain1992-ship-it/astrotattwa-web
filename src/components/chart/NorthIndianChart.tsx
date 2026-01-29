'use client';

import { cn } from '@/lib/utils';
import type { ChartData } from '@/types/chart-display';
import { buildHouses, type HouseSystem } from '@/lib/utils/chartHelpers';
import { PlanetDisplay } from './PlanetDisplay';

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
  
  // Coordinates extracted from Figma SVG (viewBox: 606x604)
  // Positions for planet areas (center of each house diamond)
  const planetPositions: Record<number, { x: number; y: number }> = {
    1: { x: 303, y: 180 },   // Top center (Lagna)
    2: { x: 165, y: 90 },    // Top left
    3: { x: 75, y: 205 },    // Mid-left top
    4: { x: 165, y: 320 },   // Mid-left bottom
    5: { x: 75, y: 435 },    // Bottom left
    6: { x: 165, y: 530 },   // Bottom left-center
    7: { x: 303, y: 470 },   // Bottom center
    8: { x: 441, y: 530 },   // Bottom right-center
    9: { x: 531, y: 435 },   // Bottom right
    10: { x: 441, y: 320 },  // Mid-right bottom
    11: { x: 531, y: 205 },  // Mid-right top
    12: { x: 441, y: 90 },   // Top right
  };
  
  // Positions for rashi numbers
  const rashiPositions: Record<number, { x: number; y: number }> = {
    1: { x: 303, y: 60 },    // Top center
    2: { x: 120, y: 50 },    // Top left
    3: { x: 30, y: 90 },     // Left side top
    4: { x: 120, y: 245 },   // Left side
    5: { x: 30, y: 390 },    // Left side bottom
    6: { x: 120, y: 500 },   // Bottom left
    7: { x: 303, y: 370 },   // Bottom center
    8: { x: 486, y: 500 },   // Bottom right
    9: { x: 576, y: 390 },   // Right side bottom
    10: { x: 486, y: 245 },  // Right side
    11: { x: 576, y: 90 },   // Right side top
    12: { x: 486, y: 50 },   // Top right
  };
  
  const ascPosition = { x: 303, y: 260 }; // ASC label for house 1
  
  return (
    <div className={cn('w-full max-w-[600px] mx-auto', 'aspect-square', className)}>
      <svg viewBox="0 0 606 604" className="w-full h-full">
        {/* Background */}
        <rect width="606" height="604" fill="currentColor" className="text-slate-950 dark:text-slate-950" />
        
        {/* Diamond lines from Figma */}
        <line x1="602.707" y1="1.71374" x2="1.70714" y2="602.714" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        <line x1="1.70593" y1="1.29836" x2="604.706" y2="602.298" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        <line x1="3" y1="1" x2="603" y2="1" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        <line x1="605" y1="2" x2="605" y2="602" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        <line x1="604" y1="603" x2="4" y2="603" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        <line x1="1" y1="602" x2="1" y2="2" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        <line x1="303" y1="1" x2="303" y2="302" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        <line x1="303" y1="302" x2="303" y2="603" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        <line x1="1" y1="302" x2="303" y2="302" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        <line x1="303" y1="302" x2="605" y2="302" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-slate-500" />
        
        {/* Render rashi numbers */}
        {houses.map((house) => {
          const pos = rashiPositions[house.houseNumber];
          return (
            <text
              key={`rashi-${house.houseNumber}`}
              x={pos.x}
              y={pos.y}
              fontSize="14"
              fill="currentColor"
              className="text-slate-400 dark:text-slate-500 font-medium"
              textAnchor="middle"
            >
              {house.rasiNumber}
            </text>
          );
        })}
        
        {/* Render house numbers (debug mode) */}
        {showHouseNumbers && houses.map((house) => {
          const pos = planetPositions[house.houseNumber];
          return (
            <text
              key={`house-num-${house.houseNumber}`}
              x={pos.x - 50}
              y={pos.y - 40}
              fontSize="12"
              fill="currentColor"
              className="text-slate-600 dark:text-slate-600 font-normal"
              textAnchor="middle"
            >
              {house.houseNumber}
            </text>
          );
        })}
        
        {/* Render ASC label for house 1 */}
        {houses[0].isAscendant && (
          <text
            x={ascPosition.x}
            y={ascPosition.y}
            fontSize="14"
            fill="currentColor"
            className="text-blue-500 dark:text-blue-400 font-bold"
            textAnchor="middle"
          >
            ASC
          </text>
        )}
        
        {/* Render planets in each house */}
        {houses.map((house) => {
          if (house.planets.length === 0) return null;
          
          const basePos = planetPositions[house.houseNumber];
          const spacing = 60;
          const totalHeight = (house.planets.length - 1) * spacing;
          const startY = basePos.y - totalHeight / 2;
          
          return (
            <g key={`planets-${house.houseNumber}`}>
              {house.planets.map((planet, index) => {
                const y = startY + (index * spacing);
                
                // Planet color based on type
                let colorClass = 'text-orange-600 dark:text-orange-400';
                if (['Moon', 'Mercury', 'Jupiter', 'Venus'].includes(planet.key)) {
                  colorClass = 'text-blue-600 dark:text-blue-400';
                } else if (['Rahu', 'Ketu'].includes(planet.key)) {
                  colorClass = 'text-purple-600 dark:text-purple-400';
                }
                
                return (
                  <g
                    key={planet.key}
                    onClick={() => onPlanetClick?.(planet.key)}
                    style={{ cursor: onPlanetClick ? 'pointer' : 'default' }}
                  >
                    {/* Planet degree */}
                    <text
                      x={basePos.x}
                      y={y - 10}
                      fontSize="12"
                      fill="currentColor"
                      className="text-slate-400 dark:text-slate-400"
                      textAnchor="middle"
                    >
                      {planet.degree}
                    </text>
                    
                    {/* Planet symbol */}
                    <text
                      x={basePos.x}
                      y={y + 8}
                      fontSize="16"
                      fill="currentColor"
                      className={cn('font-bold', colorClass)}
                      textAnchor="middle"
                    >
                      {planet.symbol}
                    </text>
                    
                    {/* Status flags */}
                    {planet.statusFlags.length > 0 && (
                      <text
                        x={basePos.x}
                        y={y + 24}
                        fontSize="11"
                        fill="currentColor"
                        className="text-orange-600 dark:text-orange-400"
                        textAnchor="middle"
                      >
                        {planet.statusFlags.join(' ')}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        
        {/* Clickable house areas (invisible overlays) */}
        {onHouseClick && houses.map((house) => {
          const pos = planetPositions[house.houseNumber];
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
