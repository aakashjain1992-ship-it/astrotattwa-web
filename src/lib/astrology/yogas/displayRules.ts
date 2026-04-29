/**
 * De-duplication rules for display.
 *
 * 1. Dharma-Karmadhipati and Raj Yoga (9th-10th lord) detect the same condition.
 *    When both present, keep Dharma-Karmadhipati (the better-named card) and drop the other.
 * 2. When Durudhura is present, Sunapha + Anapha conditions are also met.
 *    Keep Durudhura and drop the other two — their info is included in Durudhura's note.
 */

import type { YogaResult } from './types'

export function applyDisplayRules(yogas: YogaResult[]): YogaResult[] {
  const byId = new Map<string, YogaResult>()
  for (const y of yogas) byId.set(y.id, y)

  // Rule 1: Dharma-Karmadhipati supersedes Raj 9-10
  if (byId.get('dharmaKarmadhipati')?.present) {
    byId.delete('rajYoga9_10')
  }

  // Rule 2: Durudhura supersedes Sunapha + Anapha
  if (byId.get('durudhura')?.present) {
    byId.delete('sunapha')
    byId.delete('anapha')
  }

  return Array.from(byId.values())
}
