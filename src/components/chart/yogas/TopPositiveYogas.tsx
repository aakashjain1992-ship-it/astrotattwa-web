'use client'

import type { YogaDisplayCard, YogaResult } from '@/lib/astrology/yogas/types'
import { YogaCard } from './YogaCard'
import { EmptyState } from './EmptyState'

interface TopPositiveYogasProps {
  items: YogaDisplayCard[]
  allYogas: YogaResult[]
  emptyMessage: string | null
}

export function TopPositiveYogas({ items, allYogas, emptyMessage }: TopPositiveYogasProps) {
  if (items.length === 0) {
    return (
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>
          Top Positive Yogas
        </h3>
        <EmptyState message={emptyMessage ?? 'No positive yogas detected in this chart.'} />
      </section>
    )
  }

  // Resolve display cards to full YogaResult objects (preserving priority order)
  const resolved = items
    .map(card => allYogas.find(y => y.id === card.id))
    .filter((y): y is YogaResult => !!y)

  const [hero, ...rest] = resolved

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>
        Top Positive Yogas
      </h3>
      <div className="space-y-2.5">
        {hero && (
          <YogaCard yoga={hero} defaultExpanded hero />
        )}
        {rest.map(yoga => (
          <YogaCard key={yoga.id} yoga={yoga} />
        ))}
      </div>
    </section>
  )
}
