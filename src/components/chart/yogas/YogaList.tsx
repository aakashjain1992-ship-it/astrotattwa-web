'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { YogaResult, DoshaResult } from '@/lib/astrology/yogas/types'
import { YogaCard } from './YogaCard'
import { DoshaCard } from './DoshaCard'
import { EmptyState } from './EmptyState'

interface YogaListProps {
  yogas: YogaResult[]
  doshas: DoshaResult[]
}

const STRENGTH_RANK: Record<string, number> = {
  exceptional: 0, very_strong: 1, strong: 2, moderate: 3, weak: 4,
}

function byStrength(a: YogaResult, b: YogaResult): number {
  const ra = STRENGTH_RANK[a.strength ?? 'weak'] ?? 4
  const rb = STRENGTH_RANK[b.strength ?? 'weak'] ?? 4
  return ra !== rb ? ra - rb : b.score - a.score
}

export function YogaList({ yogas, doshas }: YogaListProps) {
  const [activeTab, setActiveTab] = useState<'yogas' | 'doshas'>('yogas')

  const sortedYogas = [...yogas].sort(byStrength)
  const sortedDoshas = [...doshas].sort((a, b) => b.score - a.score)

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit mb-5">
        {(['yogas', 'doshas'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              activeTab === t
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'yogas' ? `Yogas (${yogas.length})` : `Doshas (${doshas.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'yogas' && (
        sortedYogas.length > 0 ? (
          <div className="space-y-2.5">
            {sortedYogas.map((y) => <YogaCard key={y.id} yoga={y} />)}
          </div>
        ) : (
          <EmptyState message="No yogas detected in this chart." />
        )
      )}

      {activeTab === 'doshas' && (
        sortedDoshas.length > 0 ? (
          <div className="space-y-2.5">
            {sortedDoshas.map((d) => <DoshaCard key={d.id} dosha={d} />)}
          </div>
        ) : (
          <EmptyState message="No doshas detected in this chart." />
        )
      )}
    </div>
  )
}
