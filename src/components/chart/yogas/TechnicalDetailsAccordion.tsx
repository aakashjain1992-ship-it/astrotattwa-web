'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { YogaScoreBreakdown, DoshaScoreBreakdown } from '@/lib/astrology/yogas/types'

interface TechnicalDetailsAccordionProps {
  technicalReason: string
  planetsInvolved: string[]
  housesInvolved: number[]
  scoreBreakdown: YogaScoreBreakdown | DoshaScoreBreakdown
  /** When true, skip the wrapper/toggle and render content directly (parent controls visibility) */
  noWrapper?: boolean
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-xs py-0.5">
      <span style={{ color: 'var(--text3)' }}>{label}</span>
      <span className="font-mono font-medium" style={{ color: 'var(--text2)' }}>{value > 0 ? `+${value}` : value}</span>
    </div>
  )
}

function TechnicalContent({
  technicalReason, planetsInvolved, housesInvolved, scoreBreakdown,
}: Omit<TechnicalDetailsAccordionProps, 'noWrapper'>) {
  return (
    <div className="space-y-3">
      {planetsInvolved.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text3)' }}>Planets involved</p>
          <p className="text-xs" style={{ color: 'var(--text2)' }}>{planetsInvolved.join(', ')}</p>
        </div>
      )}
      {housesInvolved.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text3)' }}>Houses involved</p>
          <p className="text-xs" style={{ color: 'var(--text2)' }}>{housesInvolved.join(', ')}</p>
        </div>
      )}
      <div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text3)' }}>Why it formed</p>
        <div className="space-y-1.5">
          {technicalReason.split('\n\n').filter(Boolean).map((para, i) => (
            <p key={i} className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'var(--text2)' }}>{para}</p>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text3)' }}>Score breakdown</p>
        {'base' in scoreBreakdown && (
          <div className="space-y-0.5">
            {Object.entries(scoreBreakdown)
              .filter(([k]) => k !== 'final')
              .map(([k, v]) => (
                <ScoreRow key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())} value={v as number} />
              ))}
            <div className="flex justify-between text-xs pt-1.5 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="font-semibold" style={{ color: 'var(--text)' }}>Final score</span>
              <span className="font-mono font-semibold" style={{ color: 'var(--text)' }}>{scoreBreakdown.final}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function TechnicalDetailsAccordion({
  technicalReason, planetsInvolved, housesInvolved, scoreBreakdown, noWrapper = false,
}: TechnicalDetailsAccordionProps) {
  const [open, setOpen] = useState(false)

  if (noWrapper) {
    return <TechnicalContent technicalReason={technicalReason} planetsInvolved={planetsInvolved} housesInvolved={housesInvolved} scoreBreakdown={scoreBreakdown} />
  }

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs font-medium w-full text-left"
        style={{ color: 'var(--text3)' }}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        Technical details
      </button>
      {open && (
        <div className="mt-3">
          <TechnicalContent technicalReason={technicalReason} planetsInvolved={planetsInvolved} housesInvolved={housesInvolved} scoreBreakdown={scoreBreakdown} />
        </div>
      )}
    </div>
  )
}
