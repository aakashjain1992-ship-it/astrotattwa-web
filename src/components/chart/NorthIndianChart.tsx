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
  
  // Define diamond positions (x, y as percentages, width, height)
  // viewBox is 0 0 1000 1000 for precision
  const housePolygons: Record<number, string> = {
    // Top row
    2: '125,0 375,125 250,250 0,125',       // Top-left triangle
    1: '375,125 625,125 500,250 250,250',   // Top-center diamond (Lagna)
    12: '625,125 1000,125 750,250 500,250', // Top-right triangle
    
    // Second row
    3: '0,125 250,250 125,375 0,250',       // Left side
    11: '750,250 1000,250 1000,375 875,375', // Right side
    
    // Third row
    4: '0,250 125,375 125,500 0,375',       // Left side
    10: '875,375 1000,375 1000,500 875,500', // Right side
    
    // Fourth row
    5: '0,375 125,500 125,625 0,500',       // Left side
    9: '875,500 1000,500 1000,625 875,625', // Right side
    
    // Bottom row
    6: '0,625 125,750 250,750 125,625',     // Bottom-left triangle
    7: '250,750 500,750 375,875 250,875',   // Bottom-center-left
    8: '500,750 750,750 625,875 500,875',   // Bottom-center-right
  };
  
  // Calculate center points for planet placement
  const houseCenters: Record<number, {x: number, y: number}> = {
    2: {x: 185, y: 125},
    1: {x: 437, y: 187},
    12: {x: 687, y: 125},
    3: {x: 62, y: 250},
    11: {x: 937, y: 312},
    4: {x: 62, y: 375},
    10: {x: 937, y: 437},
    5: {x: 62, y: 500},
    9: {x: 937, y: 562},
    6: {x: 125, y: 687},
    7: {x: 312, y: 812},
    8: {x: 562, y: 812},
  };
  
  return (
    <div className={cn('w-full max-w-[600px] mx-auto', 'aspect-square', 'p-4', className)}>
      <svg 
        viewBox="0 0 1000 1000" 
        className="w-full h-full"
        style={{ background: 'transparent' }}
      >
        {/* Draw all house polygons */}
        {Object.entries(housePolygons).map(([houseNum, points]) => {
          const house = houses[parseInt(houseNum) - 1];
          const isAscendant = house.isAscendant;
          
          return (
            <g key={houseNum}>
              {/* House polygon */}
              <polygon
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={cn(
                  'text-slate-400 dark:text-slate-600',
                  isAscendant && 'stroke-blue-500 dark:stroke-blue-400 stroke-[4]'
                )}
                onClick={() => onHouseClick?.(parseInt(houseNum))}
                style={{ cursor: onHouseClick ? 'pointer' : 'default' }}
              />
              
              {/* House number */}
              {showHouseNumbers && (
                <text
                  x={houseCenters[parseInt(houseNum)].x - 80}
                  y={houseCenters[parseInt(houseNum)].y - 60}
                  fontSize="24"
                  className="fill-slate-400 dark:fill-slate-600 font-medium"
                >
                  {houseNum}
                </text>
              )}
              
              {/* Rashi number (always show) */}
              <text
                x={houseCenters[parseInt(houseNum)].x + 50}
                y={houseCenters[parseInt(houseNum)].y - 60}
                fontSize="28"
                className="fill-slate-500 dark:fill-slate-500 font-semibold"
              >
                {house.rasiNumber}
              </text>
              
              {/* Ascendant label */}
              {isAscendant && (
                <text
                  x={houseCenters[parseInt(houseNum)].x - 30}
                  y={houseCenters[parseInt(houseNum)].y + 80}
                  fontSize="22"
                  className="fill-blue-600 dark:fill-blue-400 font-bold"
                >
                  ASC
                </text>
              )}
            </g>
          );
        })}
        
        {/* Draw planets in each house */}
        {houses.map((house) => {
          const center = houseCenters[house.houseNumber];
          if (!center || house.planets.length === 0) return null;
          
          return (
            <g key={`planets-${house.houseNumber}`}>
              {house.planets.map((planet, idx) => {
                const yOffset = idx * 70 - (house.planets.length - 1) * 35;
                
                return (
                  <g 
                    key={planet.key}
                    transform={`translate(${center.x - 20}, ${center.y + yOffset})`}
                    onClick={() => onPlanetClick?.(planet.key)}
                    style={{ cursor: onPlanetClick ? 'pointer' : 'default' }}
                  >
                    {/* Planet degree */}
                    <text
                      x="0"
                      y="0"
                      fontSize="20"
                      className="fill-slate-500 dark:fill-slate-400 font-medium"
                    >
                      {planet.degree}
                    </text>
                    
                    {/* Planet symbol */}
                    <text
                      x="0"
                      y="28"
                      fontSize="26"
                      className={cn(
                        'font-bold',
                        planet.key === 'Rahu' || planet.key === 'Ketu'
                          ? 'fill-purple-600 dark:fill-purple-400'
                          : ['Moon', 'Mercury', 'Jupiter', 'Venus'].includes(planet.key)
                          ? 'fill-blue-600 dark:fill-blue-400'
                          : 'fill-orange-600 dark:fill-orange-400'
                      )}
                    >
                      {planet.symbol}
                    </text>
                    
                    {/* Status flags */}
                    {planet.statusFlags.length > 0 && (
                      <text
                        x="0"
                        y="48"
                        fontSize="18"
                        className="fill-orange-600 dark:fill-orange-400 font-normal"
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
        
        {/* Outer border */}
        <rect
          x="0"
          y="0"
          width="1000"
          height="1000"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-400 dark:text-slate-500"
        />
      </svg>
    </div>
  );
}
