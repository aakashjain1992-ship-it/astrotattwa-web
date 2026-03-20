/**
 * Planetary Relationship Engine
 * Natural (Naisargika) + Temporary (Tatkalika) + Compound (Panchadha) Maitri
 */

import type { NaturalRelationship } from './types';

const NATURAL_FRIENDS: Record<string, string[]> = {
  Sun:     ['Moon', 'Mars', 'Jupiter'],
  Moon:    ['Sun', 'Mercury'],
  Mars:    ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus:   ['Mercury', 'Saturn'],
  Saturn:  ['Mercury', 'Venus'],
  Rahu:    ['Mercury', 'Venus', 'Saturn'],
  Ketu:    ['Mercury', 'Venus', 'Saturn'],
};

const NATURAL_ENEMIES: Record<string, string[]> = {
  Sun:     ['Venus', 'Saturn'],
  Moon:    [],
  Mars:    ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus:   ['Sun', 'Moon'],
  Saturn:  ['Sun', 'Moon', 'Mars'],
  Rahu:    ['Sun', 'Moon', 'Mars'],
  Ketu:    ['Sun', 'Moon', 'Mars'],
};

export function getNaturalRelationship(planet: string, other: string): NaturalRelationship {
  if ((NATURAL_FRIENDS[planet] ?? []).includes(other)) return 'friend';
  if ((NATURAL_ENEMIES[planet] ?? []).includes(other)) return 'enemy';
  return 'neutral';
}

export function getTemporaryRelationship(fromSign: number, toSign: number): NaturalRelationship {
  if (fromSign === toSign) return 'enemy';
  const diff = ((toSign - fromSign + 12) % 12);
  return [1, 2, 3, 9, 10, 11].includes(diff) ? 'friend' : 'enemy';
}

export function getCompoundRelationship(
  natural: NaturalRelationship, temporary: NaturalRelationship
): 'great_friend' | 'friend' | 'neutral' | 'enemy' | 'great_enemy' {
  if (natural === 'friend'  && temporary === 'friend')  return 'great_friend';
  if (natural === 'friend'  && temporary === 'enemy')   return 'neutral';
  if (natural === 'neutral' && temporary === 'friend')  return 'friend';
  if (natural === 'neutral' && temporary === 'enemy')   return 'enemy';
  if (natural === 'enemy'   && temporary === 'friend')  return 'neutral';
  if (natural === 'enemy'   && temporary === 'enemy')   return 'great_enemy';
  return 'neutral';
}

export function getPlanetSignRelationship(
  planet: string, occupiedSign: number, signLord: string,
  planetSigns: Record<string, number>
): 'great_friend' | 'friend' | 'neutral' | 'enemy' | 'great_enemy' {
  if (planet === signLord) return 'great_friend';
  const natural  = getNaturalRelationship(planet, signLord);
  const lordSign = planetSigns[signLord];
  if (!lordSign) return natural === 'friend' ? 'friend' : natural === 'enemy' ? 'enemy' : 'neutral';
  const temporary = getTemporaryRelationship(occupiedSign, lordSign);
  return getCompoundRelationship(natural, temporary);
}

export const SIGN_LORDS: Record<number, string> = {
  1:'Mars', 2:'Venus', 3:'Mercury', 4:'Moon', 5:'Sun',
  6:'Mercury', 7:'Venus', 8:'Mars', 9:'Jupiter', 10:'Saturn', 11:'Saturn', 12:'Jupiter',
};
