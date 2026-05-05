import type { HouseInfo as HouseData } from '@/types/astrology';
import type { ChartInsight } from '@/components/chart/ChartFocusMode';

// Vedic sign lords (1-indexed, classic rulerships — Mars rules both Aries and Scorpio)
const SIGN_LORDS: Record<number, string> = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon',
  5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Mars',
  9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter',
};

const RASHI_NAMES: Record<number, string> = {
  1: 'Aries', 2: 'Taurus', 3: 'Gemini', 4: 'Cancer',
  5: 'Leo', 6: 'Virgo', 7: 'Libra', 8: 'Scorpio',
  9: 'Sagittarius', 10: 'Capricorn', 11: 'Aquarius', 12: 'Pisces',
};

const PLANET_FULL: Record<string, string> = {
  Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury',
  Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn',
  Rahu: 'Rahu', Ketu: 'Ketu',
};

const NATURAL_BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
const KENDRA_HOUSES = new Set([1, 4, 7, 10]);
const TRIKONA_HOUSES = new Set([1, 5, 9]);
const DUSTHANA_HOUSES = new Set([6, 8, 12]);

function planetList(planets: Array<{ key: string }>): string {
  return planets.map(p => PLANET_FULL[p.key] || p.key).join(', ');
}

function findPlanetHouse(houses: HouseData[], planetKey: string): HouseData | undefined {
  return houses.find(h => h.planets.some(p => p.key === planetKey));
}

export function generateChartInsights(
  houses: HouseData[],
  chartType: 'lagna' | 'moon' | 'd9'
): ChartInsight[] {
  const insights: ChartInsight[] = [];

  // Collect dignity flags
  const exalted = houses.flatMap(h => h.planets.filter(p => p.statusFlags.includes('↑')));
  const debilitated = houses.flatMap(h => h.planets.filter(p => p.statusFlags.includes('↓')));
  const combust = houses.flatMap(h => h.planets.filter(p => p.statusFlags.includes('C')));
  const retrograde = houses.flatMap(h => h.planets.filter(p => p.statusFlags.includes('R')));

  if (chartType === 'lagna') {
    // 1. Lagna lord placement
    const lagnaHouse = houses.find(h => h.houseNumber === 1);
    if (lagnaHouse) {
      const lagnaLordKey = SIGN_LORDS[lagnaHouse.rasiNumber];
      const lagnaLordHouse = findPlanetHouse(houses, lagnaLordKey);
      if (lagnaLordHouse) {
        const isKendra = KENDRA_HOUSES.has(lagnaLordHouse.houseNumber);
        const isTrikona = TRIKONA_HOUSES.has(lagnaLordHouse.houseNumber);
        const isDusthana = DUSTHANA_HOUSES.has(lagnaLordHouse.houseNumber);
        const placement = isKendra || isTrikona ? 'strong' : isDusthana ? 'challenging' : 'neutral';
        const type: ChartInsight['type'] = placement === 'strong' ? 'strength' : placement === 'challenging' ? 'challenge' : 'highlight';
        const note = isKendra ? 'angular placement — strong vitality and presence'
          : isTrikona ? 'trikona placement — dharmic and purposeful life'
          : isDusthana ? `in ${lagnaLordHouse.houseNumber}th house — resilience and hidden strength`
          : `in ${lagnaLordHouse.houseNumber}th house`;
        insights.push({
          type,
          icon: isKendra || isTrikona ? '⭐' : isDusthana ? '⚠️' : '🔍',
          text: `Lagna lord ${lagnaLordKey} is in ${RASHI_NAMES[lagnaLordHouse.rasiNumber]} — ${note}`,
        });
      }
    }

    // 2. Exalted planets
    exalted.forEach(p => {
      const h = findPlanetHouse(houses, p.key)!;
      insights.push({
        type: 'strength',
        icon: '↑',
        text: `${p.key} exalted in ${RASHI_NAMES[h.rasiNumber]} (house ${h.houseNumber}) — peak dignity, strong results`,
      });
    });

    // 3. Debilitated planets
    debilitated.forEach(p => {
      const h = findPlanetHouse(houses, p.key)!;
      insights.push({
        type: 'challenge',
        icon: '↓',
        text: `${p.key} debilitated in ${RASHI_NAMES[h.rasiNumber]} (house ${h.houseNumber}) — this area needs conscious cultivation`,
      });
    });

    // 4. Stellium (3+ planets in one house)
    houses.forEach(h => {
      if (h.planets.length >= 3) {
        const houseTheme: Record<number, string> = {
          1: 'self and identity', 2: 'wealth and family', 3: 'courage and communication',
          4: 'home and emotions', 5: 'creativity and children', 6: 'health and service',
          7: 'partnerships and marriage', 8: 'transformation and longevity',
          9: 'dharma and fortune', 10: 'career and public life',
          11: 'gains and social network', 12: 'liberation and foreign lands',
        };
        insights.push({
          type: 'highlight',
          icon: '🌟',
          text: `${h.planets.length} planets in ${h.houseNumber}th house (${houseTheme[h.houseNumber] || ''}) — this life area is heavily activated`,
        });
      }
    });

    // 5. Benefics in kendras (excluding stellium houses already covered)
    const beneficsInKendra = houses
      .filter(h => KENDRA_HOUSES.has(h.houseNumber))
      .flatMap(h => h.planets.filter(p => NATURAL_BENEFICS.has(p.key)));
    if (beneficsInKendra.length >= 2) {
      insights.push({
        type: 'strength',
        icon: '🪐',
        text: `${planetList(beneficsInKendra)} in angular houses — natural grace and opportunities flow toward you`,
      });
    }

    // 6. Combust planets
    if (combust.length > 0) {
      insights.push({
        type: 'challenge',
        icon: '☀️',
        text: `${planetList(combust)} combust — ${combust.length === 1 ? 'its' : 'their'} significations are overpowered by the Sun's ego; inner work unlocks them`,
      });
    }

    // 7. Retrograde planets
    if (retrograde.length > 0) {
      insights.push({
        type: 'highlight',
        icon: 'R',
        text: `${planetList(retrograde)} retrograde — internalized, karmic energy; past-life themes resurface through ${retrograde.length > 1 ? 'these planets' : 'this planet'}`,
      });
    }

    // 8. 9th and 10th house activity (if not already in stellium)
    const ninth = houses.find(h => h.houseNumber === 9);
    const tenth = houses.find(h => h.houseNumber === 10);
    if (ninth && ninth.planets.length > 0 && ninth.planets.length < 3) {
      insights.push({
        type: 'highlight',
        icon: '🙏',
        text: `${planetList(ninth.planets)} in 9th house — dharma, higher wisdom, and fortune are active themes`,
      });
    }
    if (tenth && tenth.planets.length > 0 && tenth.planets.length < 3) {
      insights.push({
        type: 'highlight',
        icon: '💼',
        text: `${planetList(tenth.planets)} in 10th house — career and public recognition carry ${tenth.planets.map(p => p.key).join(' and ')}'s signature`,
      });
    }
  }

  if (chartType === 'moon') {
    // Moon chart: house 1 IS the Moon's position — show what's with it
    const firstHouse = houses.find(h => h.houseNumber === 1);
    if (firstHouse && firstHouse.planets.length > 0) {
      // These planets are conjunct Moon
      const conjunct = firstHouse.planets.filter(p => p.key !== 'Moon');
      if (conjunct.length > 0) {
        insights.push({
          type: 'highlight',
          icon: '🌙',
          text: `${planetList(conjunct)} conjunct Moon — ${conjunct.length === 1 ? 'this planet' : 'these planets'} deeply color your emotional nature and mental world`,
        });
      }
    }

    // Benefics in kendra from Moon
    const moonKendras = houses.filter(h => KENDRA_HOUSES.has(h.houseNumber));
    const moonBenefics = moonKendras.flatMap(h => h.planets.filter(p => NATURAL_BENEFICS.has(p.key)));
    if (moonBenefics.length >= 2) {
      insights.push({
        type: 'strength',
        icon: '🌟',
        text: `${planetList(moonBenefics)} in kendras from Moon — emotional stability and mental clarity are strong (Gaja Kesari-type pattern)`,
      });
    }

    // Exalted / debilitated in Moon chart
    exalted.forEach(p => {
      const h = findPlanetHouse(houses, p.key)!;
      insights.push({
        type: 'strength',
        icon: '↑',
        text: `${p.key} exalted in ${RASHI_NAMES[h.rasiNumber]} — emotional strength in this planet's domain`,
      });
    });

    debilitated.forEach(p => {
      const h = findPlanetHouse(houses, p.key)!;
      insights.push({
        type: 'challenge',
        icon: '↓',
        text: `${p.key} debilitated in ${RASHI_NAMES[h.rasiNumber]} — emotional blocks around this planet's themes`,
      });
    });

    // Retrograde
    if (retrograde.length > 0) {
      insights.push({
        type: 'highlight',
        icon: 'R',
        text: `${planetList(retrograde)} retrograde — deeply internalized emotional patterns, karmic processing`,
      });
    }

    // Dusthana planets affecting emotional well-being
    const dusthanaPlanets = houses
      .filter(h => DUSTHANA_HOUSES.has(h.houseNumber))
      .flatMap(h => h.planets);
    if (dusthanaPlanets.length >= 3) {
      insights.push({
        type: 'challenge',
        icon: '⚠️',
        text: `${dusthanaPlanets.length} planets in dusthana houses (6/8/12) — emotional resilience is a key life theme`,
      });
    }
  }

  if (chartType === 'd9') {
    // D9: marriage, dharma, inner soul
    const seventhHouse = houses.find(h => h.houseNumber === 7);
    if (seventhHouse && seventhHouse.planets.length > 0) {
      const spouseQualities: Record<string, string> = {
        Jupiter: 'wisdom and generosity', Venus: 'beauty and refinement',
        Moon: 'nurturing and sensitivity', Mercury: 'intelligence and communication',
        Sun: 'confidence and leadership', Mars: 'energy and drive',
        Saturn: 'discipline and maturity', Rahu: 'unconventional qualities',
        Ketu: 'spiritual depth and detachment',
      };
      const spouseDesc = seventhHouse.planets
        .map(p => spouseQualities[p.key] || p.key)
        .join(', ');
      insights.push({
        type: 'highlight',
        icon: '💍',
        text: `D9 7th house: ${planetList(seventhHouse.planets)} — spouse may bring ${spouseDesc}`,
      });
    }

    // Venus placement in D9 (marriage significator)
    const venusHouse = findPlanetHouse(houses, 'Venus');
    if (venusHouse) {
      const isAuspicious = KENDRA_HOUSES.has(venusHouse.houseNumber) || TRIKONA_HOUSES.has(venusHouse.houseNumber);
      insights.push({
        type: isAuspicious ? 'strength' : 'highlight',
        icon: '💑',
        text: `Venus in D9 ${venusHouse.houseNumber}th house (${RASHI_NAMES[venusHouse.rasiNumber]}) — ${isAuspicious ? 'strong relationship harmony and love life' : 'relationship growth through ' + venusHouse.houseNumber + 'th house themes'}`,
      });
    }

    // Jupiter in D9 (dharma significator)
    const jupiterHouse = findPlanetHouse(houses, 'Jupiter');
    if (jupiterHouse) {
      insights.push({
        type: 'highlight',
        icon: '🙏',
        text: `Jupiter in D9 ${jupiterHouse.houseNumber}th house — spiritual wisdom and dharmic path are channeled through ${RASHI_NAMES[jupiterHouse.rasiNumber]}`,
      });
    }

    // Exalted in D9
    exalted.forEach(p => {
      const h = findPlanetHouse(houses, p.key)!;
      insights.push({
        type: 'strength',
        icon: '↑',
        text: `${p.key} exalted in D9 (${RASHI_NAMES[h.rasiNumber]}) — inner soul strength; this planet gives its best in the navamsa`,
      });
    });

    // Debilitated in D9
    debilitated.forEach(p => {
      const h = findPlanetHouse(houses, p.key)!;
      insights.push({
        type: 'challenge',
        icon: '↓',
        text: `${p.key} debilitated in D9 (${RASHI_NAMES[h.rasiNumber]}) — soul-level lessons around this planet's domain`,
      });
    });
  }

  // Fallback
  if (insights.length === 0) {
    const total = houses.reduce((sum, h) => sum + h.planets.length, 0);
    insights.push({
      type: 'highlight',
      icon: '📊',
      text: `${total} planets spread across the chart — a balanced distribution with no single concentrated theme`,
    });
  }

  return insights.slice(0, 6); // Cap at 6 to keep the panel clean
}
