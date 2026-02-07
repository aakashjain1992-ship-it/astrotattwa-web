import type { PlanetData, AscendantData } from '../chartHelpers';
import type { HouseData } from '@/components/chart/diamond';
import { RASHI_NAMES, PLANET_SYMBOLS } from '../chartHelpers';

export function getSaptamsaSign(longitude: number): number {
  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;
  const saptamsaPart = Math.floor(degreeInSign / (30 / 7));
  const isOddSign = signIndex % 2 === 0;
  const startSign = isOddSign ? signIndex : (signIndex + 6) % 12;
  const resultSignIndex = (startSign + saptamsaPart) % 12;
  return resultSignIndex + 1;
}

export function buildSaptamsaHouses(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): HouseData[] {
  const ascLongitude = (ascendant.signNumber - 1) * 30 + ascendant.degreeInSign;
  const ascSaptamsaSign = getSaptamsaSign(ascLongitude);
  const houses: HouseData[] = [];
  
  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const rasiNumber = ((ascSaptamsaSign - 1 + i) % 12) + 1;
    houses.push({
      houseNumber,
      rasiNumber,
      rasiName: RASHI_NAMES[rasiNumber - 1],
      planets: [],
      isAscendant: houseNumber === 1,
    });
  }
  
  Object.entries(planets).forEach(([planetKey, planetData]) => {
    const saptamsaSign = getSaptamsaSign(planetData.longitude);
    const houseIndex = (saptamsaSign - ascSaptamsaSign + 12) % 12;
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
