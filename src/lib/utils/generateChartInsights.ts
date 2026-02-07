import type { HouseData } from '@/components/chart/diamond';
import type { ChartInsight } from '@/components/chart/ChartFocusMode';

/**
 * Generate contextual insights for a chart
 * Analyzes planet positions and generates meaningful insights
 */
export function generateChartInsights(
  houses: HouseData[],
  chartType: 'lagna' | 'moon' | 'd9'
): ChartInsight[] {
  const insights: ChartInsight[] = [];
  
  // Find planets with status flags
  const exaltedPlanets: string[] = [];
  const debilitatedPlanets: string[] = [];
  const retrogradePlanets: string[] = [];
  const combustPlanets: string[] = [];
  
  houses.forEach((house) => {
    house.planets.forEach((planet) => {
      if (planet.statusFlags.includes('↑')) {
        exaltedPlanets.push(planet.key);
      }
      if (planet.statusFlags.includes('↓')) {
        debilitatedPlanets.push(planet.key);
      }
      if (planet.statusFlags.includes('R')) {
        retrogradePlanets.push(planet.key);
      }
      if (planet.statusFlags.includes('C')) {
        combustPlanets.push(planet.key);
      }
    });
  });
  
  // Strengths
  if (exaltedPlanets.length > 0) {
    insights.push({
      type: 'strength',
      icon: '↑',
      text: `${exaltedPlanets.join(', ')} exalted - brings strong positive results`,
    });
  }
  
  // Check for powerful house placements
  const firstHouse = houses.find(h => h.houseNumber === 1);
  if (firstHouse && firstHouse.planets.length > 0) {
    insights.push({
      type: 'highlight',
      icon: '🌟',
      text: `${firstHouse.planets.map(p => p.key).join(', ')} in ${chartType === 'lagna' ? 'Ascendant' : '1st house'}`,
    });
  }
  
  // Challenges
  if (debilitatedPlanets.length > 0) {
    insights.push({
      type: 'challenge',
      icon: '↓',
      text: `${debilitatedPlanets.join(', ')} debilitated - needs conscious effort`,
    });
  }
  
  if (combustPlanets.length > 0) {
    insights.push({
      type: 'challenge',
      icon: '☀️',
      text: `${combustPlanets.join(', ')} combust - energy overshadowed by Sun`,
    });
  }
  
  // Retrograde insights
  if (retrogradePlanets.length > 0) {
    insights.push({
      type: 'highlight',
      icon: 'R',
      text: `${retrogradePlanets.join(', ')} retrograde - internalized energy, karmic lessons`,
    });
  }
  
  // Chart-specific insights
  if (chartType === 'lagna') {
    // Check 10th house (career)
    const tenthHouse = houses.find(h => h.houseNumber === 10);
    if (tenthHouse && tenthHouse.planets.length > 0) {
      insights.push({
        type: 'highlight',
        icon: '💼',
        text: `Strong 10th house: ${tenthHouse.planets.map(p => p.key).join(', ')} influences career`,
      });
    }
    
    // Check 7th house (relationships)
    const seventhHouse = houses.find(h => h.houseNumber === 7);
    if (seventhHouse && seventhHouse.planets.length > 0) {
      insights.push({
        type: 'highlight',
        icon: '💑',
        text: `7th house: ${seventhHouse.planets.map(p => p.key).join(', ')} affects partnerships`,
      });
    }
  }
  
  if (chartType === 'moon') {
    insights.push({
      type: 'highlight',
      icon: '🌙',
      text: 'Moon chart shows emotional patterns and mental state',
    });
  }
  
  if (chartType === 'd9') {
    insights.push({
      type: 'highlight',
      icon: '💍',
      text: 'D9 reveals marriage compatibility and dharma',
    });
    
    // Check 7th house in D9
    const seventhHouse = houses.find(h => h.houseNumber === 7);
    if (seventhHouse && seventhHouse.planets.length > 0) {
      insights.push({
        type: 'strength',
        icon: '💑',
        text: `D9 7th house: ${seventhHouse.planets.map(p => p.key).join(', ')} - spouse qualities`,
      });
    }
  }
  
  // Default insight if none generated
  if (insights.length === 0) {
    insights.push({
      type: 'highlight',
      icon: '📊',
      text: `${houses.reduce((sum, h) => sum + h.planets.length, 0)} planets distributed across houses`,
    });
  }
  
  return insights;
}
