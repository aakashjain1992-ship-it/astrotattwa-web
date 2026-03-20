/**
 * Neecha Bhanga — Debilitation Cancellation
 * 5 classical Parashari rules. NB: shifts delivery from obstructed to delayed.
 * Does NOT restore full structural strength — reduces weakness severity only.
 */

import type { NeechaBhangaResult } from './types';
import type { PlanetData, AscendantData } from '@/types/astrology';

const EXALT_SIGN: Record<string,number>  = {Sun:1,Moon:2,Mars:10,Mercury:6,Jupiter:4,Venus:12,Saturn:7};
const DEBIL_SIGN: Record<string,number>  = {Sun:7,Moon:8,Mars:4,Mercury:12,Jupiter:10,Venus:6,Saturn:1};
const SIGN_LORD:  Record<number,string>  = {1:'Mars',2:'Venus',3:'Mercury',4:'Moon',5:'Sun',6:'Mercury',7:'Venus',8:'Mars',9:'Jupiter',10:'Saturn',11:'Saturn',12:'Jupiter'};
const EXALTED_IN: Record<number,string>  = {1:'Sun',2:'Moon',4:'Jupiter',6:'Mercury',7:'Saturn',10:'Mars',12:'Venus'};

function kendraFrom(ref: number): number[] {
  return [0,3,6,9].map(o => ((ref-1+o)%12)+1);
}

function inKendra(sign: number, lagna: number, moon: number): boolean {
  return kendraFrom(lagna).includes(sign) || kendraFrom(moon).includes(sign);
}

function has7thAspect(from: number, to: number): boolean {
  return ((to - from + 12) % 12) === 6;
}

export function checkNeechaBhanga(
  planet: string, planets: Record<string, PlanetData>, ascendant: AscendantData
): NeechaBhangaResult {
  const pd = planets[planet];
  if (!pd?.debilitated) return { isApplied: false };

  const debilSign = DEBIL_SIGN[planet];
  const slKey     = SIGN_LORD[debilSign];
  const lagna     = ascendant.signNumber;
  const moon      = planets.Moon?.signNumber ?? lagna;
  const rules: string[] = [];

  const sl = planets[slKey];
  if (sl && inKendra(sl.signNumber, lagna, moon))
    rules.push(`${slKey} (sign lord of debil sign) is in kendra`);

  const epKey = EXALTED_IN[debilSign];
  if (epKey) {
    const ep = planets[epKey];
    if (ep && inKendra(ep.signNumber, lagna, moon))
      rules.push(`${epKey} (exalted in this sign) is in kendra`);
  }

  const exSign = EXALT_SIGN[planet];
  if (exSign) {
    const eslKey = SIGN_LORD[exSign];
    const esl    = planets[eslKey];
    if (esl && inKendra(esl.signNumber, lagna, moon))
      rules.push(`${eslKey} (lord of exaltation sign) is in kendra`);
  }

  if (inKendra(pd.signNumber, lagna, moon))
    rules.push(`${planet} itself in kendra`);

  if (sl && has7thAspect(sl.signNumber, pd.signNumber))
    rules.push(`${slKey} aspects ${planet} by 7th`);

  if (rules.length === 0) return { isApplied: false };

  return {
    isApplied: true,
    rule: rules[0],
    description: rules.length > 1
      ? `${rules.length} NB conditions met — ${rules[0]}`
      : `Neecha Bhanga: ${rules[0]}`,
  };
}
