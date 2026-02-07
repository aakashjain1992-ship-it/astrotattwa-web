import type { PlanetData, AscendantData } from '../chartHelpers';
import type { HouseData } from '@/components/chart/diamond';
import { buildLagnaHouses, buildMoonHouses, buildNavamsaHouses, buildDasamsaHouses } from '../chartHelpers';
import { buildHoraHouses } from './d2-hora';
import { buildDrekkanaHouses } from './d3-drekkana';
import { buildSaptamsaHouses } from './d7-saptamsa';
import { buildDwadamsamsaHouses } from './d12-dwadasamsa';

export type DivisionalChartId = 'd1' | 'd2' | 'd3' | 'd7' | 'd9' | 'd10' | 'd12' | 'moon';

export function calculateDivisionalChart(
  chartId: DivisionalChartId,
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseData[] {
  switch (chartId) {
    case 'd1': return buildLagnaHouses(planets, ascendant);
    case 'd2': return buildHoraHouses(planets, ascendant);
    case 'd3': return buildDrekkanaHouses(planets, ascendant);
    case 'd7': return buildSaptamsaHouses(planets, ascendant);
    case 'd9': return buildNavamsaHouses(planets, ascendant);
    case 'd10': return buildDasamsaHouses(planets, ascendant);
    case 'd12': return buildDwadamsamsaHouses(planets, ascendant);
    case 'moon': return buildMoonHouses(planets, ascendant);
    default:
      const _exhaustive: never = chartId;
      throw new Error(`Unknown chart ID: ${_exhaustive}`);
  }
}

export function isChartImplemented(chartId: string): boolean {
  const implementedCharts = ['d1', 'd2', 'd3', 'd7', 'd9', 'd10', 'd12', 'moon'];
  return implementedCharts.includes(chartId);
}

export * from './d2-hora';
export * from './d3-drekkana';
export * from './d7-saptamsa';
export * from './d12-dwadasamsa';
