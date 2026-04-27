/**
 * Yoga → Life-area mapping + aggregation.
 *
 * Each detected yoga/dosha contributes weighted score to one or more life areas.
 * Final per-area score = sum of (yoga.score × sign) clamped to [-100, +100],
 * then mapped to a display level.
 */

import type { LifeArea, LifeAreaImpact, YogaResult, DoshaResult } from './types'

export const YOGA_LIFE_AREAS: Record<string, LifeArea[]> = {
  // Pancha Mahapurusha
  ruchaka: ['career', 'health'],
  bhadra: ['education', 'career'],
  hamsa: ['spirituality', 'wealth', 'family'],
  malavya: ['marriage', 'wealth', 'health'],
  shasha: ['career', 'wealth'],

  // Moon yogas
  gajaKesari: ['education', 'career', 'emotional_life', 'spirituality'],
  sunapha: ['wealth', 'career'],
  anapha: ['wealth', 'health', 'emotional_life'],
  durudhura: ['wealth', 'family', 'emotional_life'],
  kemadruma: ['emotional_life', 'family'],

  // Conjunction yogas
  budhaditya: ['education', 'career', 'emotional_life'],
  guruChandal: ['spirituality', 'education', 'family'],

  // Vipreet Raj
  harsha: ['health', 'career'],
  sarala: ['health', 'career', 'spirituality'],
  vimala: ['wealth', 'spirituality'],

  // Raj / wealth
  rajYoga9_10: ['career', 'wealth', 'family'],
  kendraTrikona: ['career', 'wealth'],
  dharmaKarmadhipati: ['career', 'wealth', 'spirituality'],
  lakshmi: ['wealth', 'family', 'marriage'],
  amala: ['career'],
  vasumati: ['wealth'],

  // Special
  neechaBhanga: ['career', 'spirituality'],
  parivartana: ['career', 'wealth'],
  dhana: ['wealth'],
  shubhaKartari: ['emotional_life', 'health'],
  paapKartari: ['emotional_life', 'health'],

  // Doshas
  kaalSarp: ['emotional_life', 'spirituality', 'family'],
  mangal: ['marriage', 'emotional_life'],
  grahan: ['emotional_life', 'family'],
  angarak: ['emotional_life', 'wealth'],
  vish: ['emotional_life', 'health'],
}

export const ALL_LIFE_AREAS: readonly LifeArea[] = [
  'career',
  'wealth',
  'marriage',
  'education',
  'children',
  'health',
  'family',
  'spirituality',
  'emotional_life',
]

/** Map a net score to a display level. */
function scoreToLevel(net: number): LifeAreaImpact['level'] {
  if (net >= 60) return 'strong_support'
  if (net >= 30) return 'good_support'
  if (net >= 10) return 'moderate_support'
  if (net <= -30) return 'challenging'
  if (net <= -10) return 'needs_effort'
  return 'neutral'
}

export function aggregateLifeAreaImpact(
  yogas: YogaResult[],
  doshas: DoshaResult[],
): LifeAreaImpact[] {
  const totals = new Map<LifeArea, { net: number; contributors: string[] }>()
  for (const a of ALL_LIFE_AREAS) totals.set(a, { net: 0, contributors: [] })

  for (const y of yogas) {
    if (!y.present) continue
    const sign = y.nature === 'positive' ? 1 : -1
    for (const area of y.lifeAreas) {
      const t = totals.get(area)
      if (!t) continue
      t.net += sign * y.score * 0.5 // 0.5 normaliser so multiple yogas don't blow scale
      t.contributors.push(y.name)
    }
  }
  for (const d of doshas) {
    if (!d.present) continue
    const intensity = d.isReduced ? 0.6 : 1
    for (const area of d.lifeAreas) {
      const t = totals.get(area)
      if (!t) continue
      t.net -= d.score * 0.5 * intensity
      t.contributors.push(d.name)
    }
  }

  const result: LifeAreaImpact[] = []
  for (const area of ALL_LIFE_AREAS) {
    const t = totals.get(area)!
    const net = Math.max(-100, Math.min(100, Math.round(t.net)))
    result.push({
      area,
      netScore: net,
      level: scoreToLevel(net),
      contributingYogas: t.contributors,
    })
  }
  return result
}

export const LIFE_AREA_LABEL: Record<LifeArea, string> = {
  career: 'Career',
  wealth: 'Wealth',
  marriage: 'Marriage',
  education: 'Education',
  children: 'Children',
  health: 'Health',
  family: 'Family',
  spirituality: 'Spiritual Growth',
  emotional_life: 'Emotional Life',
}
