'use client';

import { GRID_LINES } from './constants';

interface DiamondGridProps {
  /** Children to render inside the grid (planets, labels, etc.) */
  children?: React.ReactNode;
  /** Optional className for the container */
  className?: string;
}

/**
 * DiamondGrid - Pure SVG grid for North Indian chart layout
 * 
 * This component renders only the diamond geometry:
 * - Outer square border
 * - Two corner-to-corner diagonals
 * - Inner diamond (midpoint-to-midpoint)
 * 
 * Colors are theme-aware using CSS variables from globals.css:
 * - --chart-bg: Background color
 * - --chart-grid: Grid line color
 */
export function DiamondGrid({ children, className }: DiamondGridProps) {
  return (
    <svg 
      viewBox="0 0 600 600" 
      className={`w-full h-full ${className || ''}`}
      role="img"
      aria-label="Vedic astrology chart grid"
    >
      {/* Background */}
      <rect 
        width="600" 
        height="600" 
        className="fill-[hsl(var(--chart-bg))]"
      />
      
      {/* Outer square border */}
      <rect 
        x={GRID_LINES.outerSquare.x}
        y={GRID_LINES.outerSquare.y}
        width={GRID_LINES.outerSquare.width}
        height={GRID_LINES.outerSquare.height}
        fill="none"
        strokeWidth="2"
        className="stroke-[hsl(var(--chart-grid))]"
      />
      
      {/* Corner-to-corner diagonals */}
      {GRID_LINES.diagonals.map((line, index) => (
        <line
          key={`diagonal-${index}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          strokeWidth="2"
          className="stroke-[hsl(var(--chart-grid))]"
        />
      ))}
      
      {/* Inner diamond (midpoint-to-midpoint) */}
      {GRID_LINES.innerDiamond.map((line, index) => (
        <line
          key={`diamond-${index}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          strokeWidth="2"
          className="stroke-[hsl(var(--chart-grid))]"
        />
      ))}
      
      {/* Children (rashi numbers, planets, ASC label, etc.) */}
      {children}
    </svg>
  );
}
