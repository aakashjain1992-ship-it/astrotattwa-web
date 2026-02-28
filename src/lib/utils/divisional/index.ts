/**
 * Divisional Charts Integration
 * Central hub for all divisional chart calculations
 */

import type { PlanetData, AscendantData, HouseInfo } from '@/types/astrology';

import { buildLagnaHouses, buildMoonHouses } from '../chartHelpers';
import { buildHoraHouses } from './d2-hora';
import { buildDrekkanaHouses } from './d3-drekkana';
import { buildChaturtamsaHouses } from './d4-chaturthamsa';
import { buildPanchamamsaHouses } from './d5-panchamamsa';       
import { buildShashtamsaHouses } from './d6-shashtamsa';         
import { buildSaptamsaHouses } from './d7-saptamsa';
import { buildAshtamsaHouses } from './d8-ashtamsa';             
import { buildNavamsaHouses } from './d9-navamsa';
import { buildDasamsaHouses } from './d10-dasamsa';
import { buildEkadasamsaHouses } from './d11-ekadasamsa';        
import { buildDwadamsamsaHouses } from './d12-dwadasamsa';
import { buildShodasamsaHouses } from './d16-shodasamsa';        
import { buildVimsamsaHouses } from './d20-vimshamsa';           
import { buildSiddhamsaHouses } from './d24-siddhamsa';          
import { buildBhamsaHouses } from './d27-bhamsa';                
import { buildTrimsamsaHouses } from './d30-trimsamsa';
import { buildKhavedamsaHouses } from './d40-khavedamsa';        
import { buildAkshavedamsaHouses } from './d45-akshavedamsa';    
import { buildShashtiamsaHouses } from './d60-shashtiamsa';

export type DivisionalChartId = 
  | 'd1' 
  | 'd2' 
  | 'd3' 
  | 'd4' 
  | 'd5'   
  | 'd6'   
  | 'd7' 
  | 'd8'   
  | 'd9' 
  | 'd10' 
  | 'd11'  
  | 'd12' 
  | 'd16'  
  | 'd20'  
  | 'd24'  
  | 'd27'  
  | 'd30'
  | 'd40'
  | 'd45'
  | 'd60'
  | 'moon';

export function calculateDivisionalChart(
  chartId: DivisionalChartId,
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseInfo[] {
  switch (chartId) {
    case 'd1': return buildLagnaHouses(planets, ascendant);
    case 'd2': return buildHoraHouses(planets, ascendant);
    case 'd3': return buildDrekkanaHouses(planets, ascendant);
    case 'd4': return buildChaturtamsaHouses(planets, ascendant);
    case 'd5': return buildPanchamamsaHouses(planets, ascendant);    
    case 'd6': return buildShashtamsaHouses(planets, ascendant);     
    case 'd7': return buildSaptamsaHouses(planets, ascendant);
    case 'd8': return buildAshtamsaHouses(planets, ascendant);       
    case 'd9': return buildNavamsaHouses(planets, ascendant);
    case 'd10': return buildDasamsaHouses(planets, ascendant);
    case 'd11': return buildEkadasamsaHouses(planets, ascendant);    
    case 'd12': return buildDwadamsamsaHouses(planets, ascendant);
    case 'd16': return buildShodasamsaHouses(planets, ascendant);    
    case 'd20': return buildVimsamsaHouses(planets, ascendant);      
    case 'd24': return buildSiddhamsaHouses(planets, ascendant);     
    case 'd27': return buildBhamsaHouses(planets, ascendant);        
    case 'd30': return buildTrimsamsaHouses(planets, ascendant);
    case 'd40': return buildKhavedamsaHouses(planets, ascendant);
    case 'd45': return buildAkshavedamsaHouses(planets, ascendant);
    case 'd60': return buildShashtiamsaHouses(planets, ascendant);
    case 'moon': return buildMoonHouses(planets, ascendant);
    default:
      const _exhaustive: never = chartId;
      throw new Error(`Unknown chart ID: ${_exhaustive}`);
  }
}

export function isChartImplemented(chartId: string): boolean {
  const implementedCharts = [
    'd1', 
    'd2', 
    'd3', 
    'd4', 
    'd5',   
    'd6',   
    'd7', 
    'd8',   
    'd9', 
    'd10', 
    'd11',  
    'd12', 
    'd16',  
    'd20',  
    'd24',  
    'd27',  
    'd30',
    'd40',
    'd45',
    'd60',
    'moon'
  ];
  return implementedCharts.includes(chartId);
}

// Export all wrapper modules
export * from './d2-hora';
export * from './d3-drekkana';
export * from './d4-chaturthamsa';
export * from './d5-panchamamsa';      
export * from './d6-shashtamsa';       
export * from './d7-saptamsa';
export * from './d8-ashtamsa';         
export * from './d9-navamsa';
export * from './d10-dasamsa';
export * from './d11-ekadasamsa';      
export * from './d12-dwadasamsa';
export * from './d16-shodasamsa';      
export * from './d20-vimshamsa';       
export * from './d24-siddhamsa';       
export * from './d27-bhamsa';          
export * from './d30-trimsamsa';
export * from './d40-khavedamsa';
export * from './d45-akshavedamsa';
export * from './d60-shashtiamsa';
