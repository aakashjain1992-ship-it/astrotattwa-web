import type { PlanetData, AscendantData } from '../chartHelpers';
import type { HouseData } from '@/components/chart/diamond';
import { RASHI_NAMES, PLANET_SYMBOLS } from '../chartHelpers';

export function getDrekkanaSign(longitude: number): number {
  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;
  const drekkanaIndex = Math.floor(degreeInSign / 10);
  const offsets = [0, 4, 8];
  const resultSignIndex = (signIndex + offsets[drekkanaIndex]) % 12;
  return resultSignIndex + 1;
}

export function buildDrekkanaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseData[] {
  const ascLongitude = (ascendant.signNumber - 1) * 30 + ascendant.degreeInSign;
  const ascDrekkanaSign = getDrekkanaSign(ascLongitude);
  const houses: HouseData[] = [];
  
  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const rasiNumber = ((ascDrekkanaSign - 1 + i) % 12) + 1;
    houses.push({
      houseNumber,
      rasiNumber,
      rasiName: RASHI_NAMES[rasiNumber - 1],
      planets: [],
      isAscendant: houseNumber === 1,
    });
  }
  
  Object.entries(planets).forEach(([planetKey, planetData]) => {
    const drekkanaSign = getDrekkanaSign(planetData.longitude);
    const houseIndex = (drekkanaSign - ascDrekkanaSign + 12) % 12;
    const statusFlags: string[] = [];
    if (planetData.retrograde) statusFlags.push('R');
    
    houses[houseIndex].planets.push({
      key: planetKey,
      symbol: PLANET_SYMBOLS[planetKey] || planetKey.substring(0, 2),
      degree: planetData.degreeInSign,
      longitude: planetData.longitude,
      statusFlags,
    });
  });
  
  houses.forEach(house => {
    house.planets.sort((a, b) => a.degree - b.degree);
  });
  
  return houses;
}
