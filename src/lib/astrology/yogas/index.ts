/**
 * Yoga & Dosha engine — public entry point.
 *
 * `analyzeYogas(input)` runs every detector, applies de-duplication,
 * computes display priorities, aggregates life-area impact, and returns
 * a `YogaAnalysisResponse` with only present yogas/doshas (per spec).
 */

import type { YogaEngineInput, YogaAnalysisResponse, YogaResult, DoshaResult } from './types'

import { detectPanchaMahapurusha } from './detectors/panchaMahapurusha'
import { detectMoonYogas } from './detectors/moonYogas'
import { detectConjunctionYogas } from './detectors/conjunctionYogas'
import { detectVipreetRaj } from './detectors/vipreetRaj'
import { detectRajYogas } from './detectors/rajYogas'
import { detectSpecialYogas } from './detectors/specialYogas'
import { detectDoshas } from './detectors/doshas'

import { applyDisplayRules } from './displayRules'
import { selectTopPositive, selectTopChallenging } from './displayPriority'
import { aggregateLifeAreaImpact } from './lifeAreas'
import { NO_YOGAS_TEXT, NO_DOSHAS_TEXT } from './empty-states'

export type {
  YogaResult,
  DoshaResult,
  YogaAnalysisResponse,
  LifeArea,
  LifeAreaImpact,
  YogaDisplayCard,
  YogaCategory,
  YogaNature,
  StrengthLabel,
  SeverityLabel,
  YogaScoreBreakdown,
  DoshaScoreBreakdown,
  YogaEngineInput,
  CurrentDashaContext,
  YogaSummaryMetrics,
} from './types'

function buildSummaryText(yogas: YogaResult[], doshas: DoshaResult[]): string {
  if (yogas.length === 0 && doshas.length === 0) {
    return 'No classical yoga or dosha combinations are strongly formed in this chart. A full reading also depends on planet strength, dashas, houses, and divisional charts.'
  }
  const parts: string[] = []
  if (yogas.length > 0) {
    parts.push(
      `Your chart shows ${yogas.length} supportive yoga${yogas.length === 1 ? '' : 's'}`,
    )
  }
  if (doshas.length > 0) {
    const reduced = doshas.filter((d) => d.isReduced).length
    parts.push(
      `${doshas.length} challenging pattern${doshas.length === 1 ? '' : 's'} ${reduced > 0 ? `(${reduced} partly reduced)` : ''}`.trim(),
    )
  }
  return parts.join(' and ') + '.'
}

export function analyzeYogas(input: YogaEngineInput): YogaAnalysisResponse {
  // 1. Run all detectors
  const allRawYogas: YogaResult[] = [
    ...detectPanchaMahapurusha(input),
    ...detectMoonYogas(input),
    ...detectConjunctionYogas(input),
    ...detectVipreetRaj(input),
    ...detectRajYogas(input),
    ...detectSpecialYogas(input),
  ]
  const allRawDoshas: DoshaResult[] = detectDoshas(input)

  // 2. Filter to only present items with score > 0 (per spec — never show absent items)
  const presentYogas = allRawYogas.filter((y) => y.present && y.score > 0)
  const presentDoshas = allRawDoshas.filter((d) => d.present && d.score > 0)

  // 3. Apply display de-duplication rules (Dharma-Karmadhipati, Durudhura)
  const dedupedYogas = applyDisplayRules(presentYogas)

  // 4. Top selections for free-tier view
  const topPositive = selectTopPositive(dedupedYogas, 3)
  const topChallenging = selectTopChallenging(dedupedYogas, presentDoshas, 2)

  // 5. Aggregate life-area impact
  const lifeAreas = aggregateLifeAreaImpact(dedupedYogas, presentDoshas)

  // 6. Summary metrics
  const positiveCount = dedupedYogas.filter((y) => y.nature === 'positive').length
  const challengingCount =
    dedupedYogas.filter((y) => y.nature === 'challenging').length + presentDoshas.length
  const strongest = [...dedupedYogas]
    .filter((y) => y.nature === 'positive')
    .sort((a, b) => b.score - a.score)[0]
  const mostImportantDosha = [...presentDoshas].sort((a, b) => b.score - a.score)[0]
  const activeNow = dedupedYogas.find((y) => y.currentlyActive)

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    summary: {
      text: buildSummaryText(dedupedYogas, presentDoshas),
      metrics: {
        positiveYogasFound: positiveCount,
        challengingPatternsFound: challengingCount,
        strongestYoga: strongest?.name ?? null,
        mostImportantCaution: mostImportantDosha?.name ?? null,
        currentlyActive: activeNow?.name ?? null,
      },
    },
    topPositive,
    topChallenging,
    allYogas: dedupedYogas,
    allDoshas: presentDoshas,
    lifeAreas,
    emptyYogasMessage: dedupedYogas.length === 0 ? NO_YOGAS_TEXT : null,
    emptyDoshasMessage: presentDoshas.length === 0 ? NO_DOSHAS_TEXT : null,
  }
}
