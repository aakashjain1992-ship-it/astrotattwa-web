import type { PersonMilanData, MilanResult, MilanVerdict, VerdictLevel, ManglikPersonStatus } from './types'
import {
  scoreVarna,
  scoreVashya,
  scoreTara,
  scoreYoni,
  scoreGrahaMaitri,
  scoreGana,
  scoreBhakoot,
  scoreNadi,
} from './kutas'
import { VARNA_BY_SIGN } from './tables'
import type { DoshaResult } from '@/lib/astrology/yogas/types'

function getVerdict(score: number): MilanVerdict {
  let level: VerdictLevel
  let label: string
  let description: string

  if (score >= 30) {
    level = 'excellent'
    label = 'Excellent Match'
    description = 'Highly compatible. Strong harmony across all life areas — spiritual, emotional, and physical.'
  } else if (score >= 25) {
    level = 'good'
    label = 'Good Match'
    description = 'Compatible match with good prospects for a harmonious life together.'
  } else if (score >= 18) {
    level = 'acceptable'
    label = 'Acceptable Match'
    description = 'Moderate compatibility. Some differences exist but can be managed with understanding.'
  } else {
    level = 'low'
    label = 'Low Compatibility'
    description = 'Significant differences in temperament and life energies. Careful consideration advised.'
  }

  return { level, label, description }
}

function buildManglikPersonStatus(dosha: DoshaResult | null): ManglikPersonStatus {
  if (!dosha || !dosha.present) {
    return { isManglik: false, marsHouseLagna: 0, isReduced: false, severity: null }
  }
  return {
    isManglik: true,
    marsHouseLagna: dosha.housesInvolved[0] ?? 0,
    isReduced: dosha.isReduced,
    severity: dosha.severity,
    chartNarrative: dosha.chartNarrative,
  }
}

/** Enrich a raw chart output into the subset of data needed for Ashtkoot scoring */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractMilanData(name: string, chartData: any): PersonMilanData {
  const moon = chartData.planets['Moon']
  if (!moon) throw new Error(`Moon not found in chart for ${name}`)

  const av = chartData.avakahada
  const varna = VARNA_BY_SIGN[moon.signNumber]

  return {
    name,
    moonSignNumber: moon.signNumber,
    moonSign: moon.sign,
    nakshatraIndex: moon.kp.nakshatraIndex,
    nakshatraName: av.nakshatra ?? moon.kp.nakshatraName,
    gana: av.gana ?? 'Manushya',
    yoni: av.yoni ?? 'Horse',
    nadi: av.nadi ?? 'Adi',
    varna: varna?.name ?? 'Shudra',
    vashya: av.vashya ?? 'Human',
  }
}

export function ashtkootScore(
  boy: PersonMilanData,
  girl: PersonMilanData,
  mangal1: DoshaResult | null,
  mangal2: DoshaResult | null,
): MilanResult {
  const kutas = [
    scoreVarna(boy, girl),
    scoreVashya(boy, girl),
    scoreTara(boy, girl),
    scoreYoni(boy, girl),
    scoreGrahaMaitri(boy, girl),
    scoreGana(boy, girl),
    scoreBhakoot(boy, girl),
    scoreNadi(boy, girl),
  ]

  const totalScore = Math.round(kutas.reduce((sum, k) => sum + k.score, 0) * 10) / 10
  const p1 = buildManglikPersonStatus(mangal1)
  const p2 = buildManglikPersonStatus(mangal2)

  return {
    person1: { name: boy.name, moonSign: boy.moonSign, nakshatra: boy.nakshatraName, moonSignNumber: boy.moonSignNumber, nakshatraIndex: boy.nakshatraIndex, gana: boy.gana, yoni: boy.yoni, nadi: boy.nadi, vashya: boy.vashya, varna: boy.varna },
    person2: { name: girl.name, moonSign: girl.moonSign, nakshatra: girl.nakshatraName, moonSignNumber: girl.moonSignNumber, nakshatraIndex: girl.nakshatraIndex, gana: girl.gana, yoni: girl.yoni, nadi: girl.nadi, vashya: girl.vashya, varna: girl.varna },
    kutas,
    totalScore,
    maxScore: 36,
    percentage: Math.round((totalScore / 36) * 100),
    verdict: getVerdict(totalScore),
    manglikStatus: {
      person1: p1,
      person2: p2,
      doubleManglik: p1.isManglik && p2.isManglik,
    },
  }
}
