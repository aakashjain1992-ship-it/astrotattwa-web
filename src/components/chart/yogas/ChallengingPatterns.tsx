'use client'

import type { YogaDisplayCard, DoshaResult } from '@/lib/astrology/yogas/types'
import { DoshaCard } from './DoshaCard'
import { EmptyState } from './EmptyState'

interface ChallengingPatternsProps {
  items: YogaDisplayCard[]
  allDoshas: DoshaResult[]
  emptyMessage: string | null
  isLocked?: boolean
  onSignIn?: () => void
}

export function ChallengingPatterns({ items, allDoshas, emptyMessage, isLocked, onSignIn }: ChallengingPatternsProps) {
  if (items.length === 0) {
    return (
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>
          Challenging Patterns
        </h3>
        <EmptyState message={emptyMessage ?? 'No challenging patterns detected in this chart.'} />
      </section>
    )
  }

  const resolved = items
    .map(card => allDoshas.find(d => d.id === card.id))
    .filter((d): d is DoshaResult => !!d)

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>
        Challenging Patterns
      </h3>
      <div className="space-y-2.5">
        {resolved.map(dosha => (
          <DoshaCard key={dosha.id} dosha={dosha} isLocked={isLocked} onSignIn={onSignIn} />
        ))}
      </div>
    </section>
  )
}
