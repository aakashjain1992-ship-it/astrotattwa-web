/**
 * Display priority — sort detected yogas/doshas for the free-tier "top 3 / top 2" view.
 *
 *   priority = score
 *            + categoryWeight
 *            + (currentlyActive ? 10 : 0)
 *            + lifeAreaImportanceBonus
 *            - (challenging && score < 35 ? 10 : 0)
 */

import type { YogaResult, DoshaResult, YogaDisplayCard, LifeArea } from './types'
import { categoryWeight, strengthLabelText, severityLabelText } from './scoring'
import { YOGA_MEANINGS, DOSHA_MEANINGS } from './meanings'

const HIGH_IMPORTANCE_LIFE_AREAS: ReadonlySet<LifeArea> = new Set<LifeArea>([
  'career',
  'wealth',
  'marriage',
  'health',
])

function lifeAreaBonus(areas: LifeArea[]): number {
  let b = 0
  for (const a of areas) if (HIGH_IMPORTANCE_LIFE_AREAS.has(a)) b += 2
  return Math.min(8, b)
}

export function computeYogaPriority(y: YogaResult): number {
  let p = y.score + categoryWeight(y.category) + lifeAreaBonus(y.lifeAreas)
  if (y.currentlyActive) p += 10
  if (y.nature === 'challenging' && y.score < 35) p -= 10
  return p
}

export function computeDoshaPriority(d: DoshaResult): number {
  let p = d.score + categoryWeight('dosha') + lifeAreaBonus(d.lifeAreas)
  if (d.currentlyActive) p += 10
  if (d.score < 35) p -= 10
  return p
}

function yogaToCard(y: YogaResult): YogaDisplayCard {
  const meaning = YOGA_MEANINGS[y.id]
  return {
    id: y.id,
    name: y.name,
    category: y.category,
    nature: y.nature,
    score: y.score,
    label: strengthLabelText(y.strength),
    shortMeaning: meaning?.shortMeaning ?? '',
    displayPriority: computeYogaPriority(y),
  }
}

function doshaToCard(d: DoshaResult): YogaDisplayCard {
  const meaning = DOSHA_MEANINGS[d.id]
  return {
    id: d.id,
    name: d.name,
    category: 'dosha',
    nature: 'challenging',
    score: d.score,
    label: severityLabelText(d.severity) + (d.isReduced ? ' — partly reduced' : ''),
    shortMeaning: meaning?.shortMeaning ?? '',
    displayPriority: computeDoshaPriority(d),
  }
}

/**
 * Top-N positive yogas (default 3).
 * Already-detected list is required (filter `present` before passing in).
 */
export function selectTopPositive(
  yogas: YogaResult[],
  n = 3,
): YogaDisplayCard[] {
  return yogas
    .filter((y) => y.nature === 'positive' && y.present && y.score > 0)
    .map(yogaToCard)
    .sort((a, b) => b.displayPriority - a.displayPriority)
    .slice(0, n)
}

/**
 * Top-N challenging items (default 2).
 * Combines challenging yogas (e.g. Kemadruma, Paap Kartari, Guru Chandal)
 * AND all detected doshas — both qualify as "challenging patterns".
 */
export function selectTopChallenging(
  yogas: YogaResult[],
  doshas: DoshaResult[],
  n = 2,
): YogaDisplayCard[] {
  const challengingYogas = yogas
    .filter((y) => y.nature === 'challenging' && y.present && y.score > 0)
    .map(yogaToCard)
  const doshaCards = doshas
    .filter((d) => d.present && d.score > 0)
    .map(doshaToCard)
  return [...challengingYogas, ...doshaCards]
    .sort((a, b) => b.displayPriority - a.displayPriority)
    .slice(0, n)
}
