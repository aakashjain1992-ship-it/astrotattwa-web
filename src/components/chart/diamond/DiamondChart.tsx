'use client';

import { cn } from '@/lib/utils';
import { DiamondGrid } from './DiamondGrid';
import {
  HOUSE_POSITIONS,
  RASHI_POSITIONS,
  PLANET_SPACING,
  CHART_SIZES,
  type HouseData,
  type ChartSize,
} from './constants';

interface DiamondChartProps {
  /** Pre-built array of 12 houses with planets */
  houses: HouseData[];
  /** Chart title (e.g., "D1 - Lagna", "D9 - Navamsa") */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Size of the chart */
  size?: ChartSize;
  /** Show rashi numbers at edges (1-12) */
  showRashiNumbers?: boolean;
  /** Show "ASC" label in the ascendant house */
  showAscLabel?: boolean;
  /** Show house numbers (1-12) for debugging */
  showHouseNumbers?: boolean;
  /** Callback when a planet is clicked */
  onPlanetClick?: (planetKey: string) => void;
  /** Callback when a house is clicked */
  onHouseClick?: (houseNumber: number) => void;
  /** Additional className */
  className?: string;
}

/**
 * DiamondChart - Complete North Indian chart visualization
 * 
 * Features:
 * - Theme-aware colors (light/dark mode)
 * - Responsive sizing (sm/md/lg)
 * - Neutral planet colors (follows text color)
 * - Interactive house and planet clicks
 * - Reusable for D1, D9, D10, and other divisional charts
 * 
 * Usage:
 * ```tsx
 * <DiamondChart
 *   houses={buildLagnaHouses(chartData, 'whole-sign')}
 *   title="D1 - Lagna"
 *   showRashiNumbers
 *   showAscLabel
 *   onPlanetClick={(key) => console.log(key)}
 * />
 * ```
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

  // Find the ascendant house (should be house 1)
  const ascendantHouse = houses.find((h) => h.isAscendant);

  return (
    <div className={cn('w-full mx-auto', className)} style={{ maxWidth: sizeConfig.maxWidth }}>
      {/* Title */}
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

      {/* Chart */}
      <div className="aspect-square">
        <DiamondGrid>
          {/* Rashi Numbers at edges */}
          {showRashiNumbers && houses.map((house) => {
            const pos = RASHI_POSITIONS[house.houseNumber];
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

          {/* House Numbers (debug mode) */}
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

          {/* Planets in each house */}
          {houses.map((house) => {
            if (house.planets.length === 0) return null;

            const basePos = HOUSE_POSITIONS[house.houseNumber];
            const spacing = PLANET_SPACING.vertical;
            const totalHeight = (house.planets.length - 1) * spacing;
            const startY = basePos.y - totalHeight / 2;

            return (
              <g key={`planets-house-${house.houseNumber}`}>
                {house.planets.map((planet, index) => {
                  const y = startY + index * spacing;
                  const isClickable = !!onPlanetClick;

                  return (
                    <g
                      key={`planet-${planet.key}`}
                      onClick={() => onPlanetClick?.(planet.key)}
                      style={{ cursor: isClickable ? 'pointer' : 'default' }}
                      role={isClickable ? 'button' : undefined}
                      tabIndex={isClickable ? 0 : undefined}
                      aria-label={`${planet.key} at ${planet.degree}°${planet.statusFlags.length > 0 ? `, ${planet.statusFlags.join(' ')}` : ''}`}
                    >
                      {/* Degree */}
                      <text
                        x={basePos.x}
                        y={y - 10}
                        fontSize={PLANET_SPACING.fontSize.degree}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-[hsl(var(--chart-text-secondary))]"
                      >
                        {Math.round(planet.degree)}°
                      </text>

                      {/* Planet Symbol */}
                      <text
                        x={basePos.x}
                        y={y + 6}
                        fontSize={PLANET_SPACING.fontSize.symbol}
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-[hsl(var(--chart-text))]"
                      >
                        {planet.symbol}
                      </text>

                      {/* Status Flags (R, C, D, Ex, etc.) */}
                      {planet.statusFlags.length > 0 && (
                        <text
                          x={basePos.x}
                          y={y + 20}
                          fontSize={PLANET_SPACING.fontSize.status}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-[hsl(var(--chart-status))]"
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
