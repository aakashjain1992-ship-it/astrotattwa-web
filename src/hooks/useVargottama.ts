/**
 * useVargottama Hook
 * 
 * React hook for detecting vargottama planets
 * Convenience wrapper around detectVargottama and getVargottamaInsights
 * 
 * Usage:
 * ```tsx
 * const { vargottamaPlanets, insights } = useVargottama(d1Houses, d9Houses);
 * ```
 */

import { useMemo } from 'react';
import { detectVargottama, getVargottamaInsights, type VargottamaPlanet } from '@/lib/astrology/vargottama';
import type { HouseInfo as HouseData } from '@/types/astrology';
import type { ChartInsight } from '@/components/chart/divisional/ChartInsights';

export interface UseVargottamaReturn {
  /** Detected vargottama planets */
  vargottamaPlanets: VargottamaPlanet[];
  
  /** Generated insights in ChartInsight format */
  insights: ChartInsight[];
  
  /** Whether any vargottama planets were found */
  hasVargottama: boolean;
  
  /** Count of vargottama planets */
  count: number;
}

/**
 * Hook to detect and analyze vargottama planets
 * 
 * @param d1Houses - Houses from D1 (Lagna) chart
 * @param d9Houses - Houses from D9 (Navamsa) chart
 * @returns Vargottama planets and insights
 */
export function useVargottama(
  d1Houses: HouseData[],
  d9Houses: HouseData[]
): UseVargottamaReturn {
  const vargottamaPlanets = useMemo(
    () => detectVargottama(d1Houses, d9Houses),
    [d1Houses, d9Houses]
  );
  
  const insights = useMemo(
    () => getVargottamaInsights(vargottamaPlanets),
    [vargottamaPlanets]
  );
  
  return {
    vargottamaPlanets,
    insights,
    hasVargottama: vargottamaPlanets.length > 0,
    count: vargottamaPlanets.length,
  };
}
