/**
 * De-duplication rules for display.
 *
 * When Durudhura is present, Sunapha + Anapha conditions are also met.
 * Keep Durudhura and drop the other two — their info is included in Durudhura's note.
 */

import type { YogaResult } from './types'

export function applyDisplayRules(yogas: YogaResult[]): YogaResult[] {
  const byId = new Map<string, YogaResult>()
  for (const y of yogas) byId.set(y.id, y)

  // Durudhura supersedes Sunapha + Anapha (Moon yoga equivalents)
  if (byId.get('durudhura')?.present) {
    byId.delete('sunapha')
    byId.delete('anapha')
  }

  // Ubhayachari supersedes Vesi + Vosi (solar yoga equivalents)
  if (byId.get('ubhayachari')?.present) {
    byId.delete('vesi')
    byId.delete('vosi')
  }

  return Array.from(byId.values())
}
