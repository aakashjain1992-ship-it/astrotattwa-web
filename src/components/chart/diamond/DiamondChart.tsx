'use client';

import { cn } from '@/lib/utils';
import { DiamondGrid } from './DiamondGrid';
import {
  HOUSE_POSITIONS,
  RASHI_POSITIONS,
  CHART_SIZES,
  type HouseData,
  type ChartSize,
} from './constants';

interface DiamondChartProps {
  houses: HouseData[];
  title?: string;
  subtitle?: string;
  size?: ChartSize;
  showRashiNumbers?: boolean;
  showAscLabel?: boolean;
  showHouseNumbers?: boolean;
  onPlanetClick?: (planetKey: string) => void;
  onHouseClick?: (houseNumber: number) => void;
  className?: string;
}

/**
 * Check if house is a triangular corner (less space)
 */
function isTriangularHouse(houseNumber: number): boolean {
  return [2, 3, 5, 6, 8, 9, 11, 12].includes(houseNumber);
}

/**
 * Calculate grid position for a planet
 * IMPROVED: Better spacing for 5-6 planets
 */
function getPlanetGridPosition(
  index: number,
  totalPlanets: number
): { offsetX: number; offsetY: number } {
  // 1-2 planets: Vertical stack
  if (totalPlanets <= 2) {
    return {
      offsetX: 0,
      offsetY: index * 45 - ((totalPlanets - 1) * 45) / 2,
    };
  }

  // 3-4 planets: 2x2 grid
  if (totalPlanets <= 4) {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const gridWidth = 40;
    const gridHeight = 35;
    
    return {
      offsetX: col * gridWidth - gridWidth / 2,
      offsetY: row * gridHeight - ((Math.ceil(totalPlanets / 2) - 1) * gridHeight) / 2,
    };
  }

  // 5-6 planets: 3-column grid with WIDER spacing
  const row = Math.floor(index / 3);
  const col = index % 3;
  const gridWidth = 38;   // Was 32px, now 38px - more space!
  const gridHeight = 30;  // Was 32px, now 30px - slightly tighter vertically
  
  return {
    offsetX: col * gridWidth - gridWidth,
    offsetY: row * gridHeight - ((Math.ceil(totalPlanets / 3) - 1) * gridHeight) / 2,
  };
}

/**
 * Get dynamic rashi number position
 */
function getRashiNumberPosition(
  houseNumber: number,
  planetCount: number
): { x: number; y: number } {
  const basePos = RASHI_POSITIONS[houseNumber];
  
  if (planetCount >= 3) {
    const adjustments: Record<number, { dx: number; dy: number }> = {
      1: { dx: 0, dy: -15 },
      2: { dx: -20, dy: -10 },
      3: { dx: -25, dy: 0 },
      4: { dx: -25, dy: 0 },
      5: { dx: -25, dy: 0 },
      6: { dx: -20, dy: 10 },
      7: { dx: 0, dy: 15 },
      8: { dx: 20, dy: 10 },
      9: { dx: 25, dy: 0 },
      10: { dx: 25, dy: 0 },
      11: { dx: 25, dy: 0 },
      12: { dx: 20, dy: -10 },
    };
    
    const adjustment = adjustments[houseNumber] || { dx: 0, dy: 0 };
    return {
      x: basePos.x + adjustment.dx,
      y: basePos.y + adjustment.dy,
    };
  }
  
  return basePos;
}

/**
 * DiamondChart with improved crowded house handling
 * 
 * FONT STRATEGY:
 * - Diamond houses (1,4,7,10): Always large (18px)
 * - Triangle with 1-3 planets: Large (18px)
 * - Triangle with 4 planets: Medium (14px)
 * - Triangle with 5 planets: Small (11px) - IMPROVED
 * - Triangle with 6 planets: Tiny (10px) - IMPROVED
 */
export function DiamondChart({
  houses,
  title,
  subtitle,
  size = 'lg',
  showRashiNumbers = true,
  showAscLabel = true,
  showHouseNumbers = false,
  onPlanetClick,
  onHouseClick,
  className,
}: DiamondChartProps) {
  const sizeConfig = CHART_SIZES[size];
  const ascendantHouse = houses.find((h) => h.isAscendant);

  /**
   * Smart font sizing based on house type and planet count
   * 
   * IMPROVED: More aggressive reduction for 5-6 planets
   */
  const getFontSizes = (houseNumber: number, planetCount: number) => {
    // Diamond houses (1,4,7,10): Always use larger fonts - plenty of space
    if (!isTriangularHouse(houseNumber)) {
      return {
        degree: 10,
        symbol: 18,
        status: 10,
        arrow: 16,
      };
    }
    
    // Triangular houses: Progressive reduction based on crowding
    if (planetCount === 6) {
      // 6 planets: VERY tight - minimal fonts
      return {
        degree: 0,     // Hide degrees to save space
        symbol: 10,    // Very small
        status: 7,     // Tiny
        arrow: 9,      // Small
      };
    }
    
    if (planetCount === 5) {
      // 5 planets: Tight - small fonts
      return {
        degree: 7,     // Small degrees
        symbol: 11,    // Small symbols
        status: 7,     // Small status
        arrow: 10,     // Small arrows
      };
    }
    
    if (planetCount === 4) {
      // 4 planets: Medium reduction
      return {
        degree: 9,
        symbol: 14,
        status: 9,
        arrow: 12,
      };
    }
    
    // 1-3 planets: Comfortable, use large fonts
    return {
      degree: 10,
      symbol: 18,
      status: 10,
      arrow: 16,
    };
  };

  /**
   * Get exaltation/debilitation status
   */
  const getDigbalaStatus = (statusFlags: string[]): 'exalted' | 'debilitated' | null => {
    if (statusFlags.includes('↑')) return 'exalted';
    if (statusFlags.includes('↓')) return 'debilitated';
    return null;
  };

  /**
   * Get other status flags (excluding ↑ and ↓)
   */
  const getOtherFlags = (statusFlags: string[]): string[] => {
    return statusFlags.filter(f => f !== '↑' && f !== '↓');
  };

  return (
    <div className={cn('w-full mx-auto', className)} style={{ maxWidth: sizeConfig.maxWidth }}>
      {title && (
        <div className="text-center mb-2">
          <h3 className="text-lg font-semibold text-[hsl(var(--chart-text))]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-[hsl(var(--chart-text-secondary))]">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="aspect-square">
        <DiamondGrid>
          {/* Rashi Numbers */}
          {showRashiNumbers && houses.map((house) => {
            const pos = getRashiNumberPosition(house.houseNumber, house.planets.length);
            return (
              <text
                key={`rashi-${house.houseNumber}`}
                x={pos.x}
                y={pos.y}
                fontSize="16"
                fontWeight="500"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[hsl(var(--chart-text-secondary))]"
              >
                {house.rasiNumber}
              </text>
            );
          })}

          {/* House Numbers (debug) */}
          {showHouseNumbers && houses.map((house) => {
            const pos = HOUSE_POSITIONS[house.houseNumber];
            return (
              <text
                key={`house-num-${house.houseNumber}`}
                x={pos.x}
                y={pos.y - 70}
                fontSize="11"
                fontWeight="400"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[hsl(var(--chart-text-secondary))] opacity-50"
              >
                H{house.houseNumber}
              </text>
            );
          })}

          {/* ASC Label */}
          {showAscLabel && ascendantHouse && (
            <text
              x={300}
              y={220}
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[hsl(var(--chart-asc))]"
            >
              ASC
            </text>
          )}

          {/* Planets */}
          {houses.map((house) => {
            if (house.planets.length === 0) return null;

            const basePos = HOUSE_POSITIONS[house.houseNumber];
            const fontSizes = getFontSizes(house.houseNumber, house.planets.length);

            return (
              <g key={`planets-house-${house.houseNumber}`}>
                {house.planets.map((planet, index) => {
                  const gridPos = getPlanetGridPosition(index, house.planets.length);
                  const x = basePos.x + gridPos.offsetX;
                  const y = basePos.y + gridPos.offsetY;
                  const isClickable = !!onPlanetClick;

                  const digbalaStatus = getDigbalaStatus(planet.statusFlags);
                  const otherFlags = getOtherFlags(planet.statusFlags);

                  return (
                    <g
                      key={`planet-${planet.key}`}
                      onClick={() => onPlanetClick?.(planet.key)}
                      style={{ cursor: isClickable ? 'pointer' : 'default' }}
                      role={isClickable ? 'button' : undefined}
                      tabIndex={isClickable ? 0 : undefined}
                      aria-label={`${planet.key} at ${planet.degree}°${planet.statusFlags.length > 0 ? `, ${planet.statusFlags.join(' ')}` : ''}`}
                    >
                     {/* Planet Symbol with arrow prefix */}
                      <text
                        x={x}
                        y={y}
                        fontSize={fontSizes.symbol}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {/* Green ↑ for exalted */}
                        {digbalaStatus === 'exalted' && (
                          <tspan className="fill-green-500">↑</tspan>
                        )}
                        
                        {/* Red ↓ for debilitated */}
                        {digbalaStatus === 'debilitated' && (
                          <tspan className="fill-red-500">↓</tspan>
                        )}
                        
                        {/* Planet symbol */}
                        <tspan className="fill-[hsl(var(--chart-text))]">{planet.symbol}</tspan>
                      </text>

                      {/* Degree (top-right superscript) - Hide if 6 planets */}
                      {fontSizes.degree > 0 && (
                        <text
                          x={x + (fontSizes.symbol / 2 + 2)}
                          y={y - (fontSizes.symbol / 3)}
                          fontSize={fontSizes.degree}
                          textAnchor="start"
                          dominantBaseline="middle"
                          className="fill-[hsl(var(--chart-text-secondary))]"
                        >
                          {Math.round(planet.degree)}°
                        </text>
                      )}

                      {/* Other Status Flags (R, C, D, S) - Below planet */}
                      {otherFlags.length > 0 && (
                        <text
                          x={x}
                          y={y + (fontSizes.symbol / 2 + 3)}
                          fontSize={fontSizes.status}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-[hsl(var(--chart-status))]"
                        >
                          {otherFlags.join(' ')}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Clickable House Overlays */}
          {onHouseClick && houses.map((house) => {
            const pos = HOUSE_POSITIONS[house.houseNumber];
            return (
              <circle
                key={`click-house-${house.houseNumber}`}
                cx={pos.x}
                cy={pos.y}
                r="50"
                fill="transparent"
                onClick={() => onHouseClick(house.houseNumber)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`House ${house.houseNumber}, ${house.rasiName}`}
              />
            );
          })}
        </DiamondGrid>
      </div>
    </div>
  );
}
