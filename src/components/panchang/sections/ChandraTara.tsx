import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'
import { computeChandrabalam, computeTarabalam } from '@/lib/panchang/chandrabalam'

function RashiBadges({ rashis }: { rashis: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {rashis.map(rashi => (
        <span key={rashi} className="text-xs bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full font-medium">
          {rashi}
        </span>
      ))}
    </div>
  )
}

function NakBadges({ naks }: { naks: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
      {naks.map(nak => (
        <span key={nak} className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-medium">
          {nak}
        </span>
      ))}
    </div>
  )
}

function TransitionLabel({ time, prefix }: { time: string; prefix: 'till' | 'from' }) {
  return (
    <span className="ml-1 text-amber-600 dark:text-amber-400">
      ({prefix} {time})
    </span>
  )
}

export function ChandraTaraSection({ data }: { data: PanchangData }) {
  const { chandrabalam, tarabalam } = data

  // Chandrabalam after-transition (if Moon changes rashi mid-day)
  const moonRashiChanges = !!data.moonRashiChangeTime
  const afterRashiIndex = (data.moonPosition.rashiIndex + 1) % 12
  const chandrababalamAfter = moonRashiChanges ? computeChandrabalam(afterRashiIndex) : null

  // Tarabalam after-transition (if Moon changes nakshatra mid-day)
  const nakshatraChanges = data.nakshatra.length > 1
  // NakshatraEntry.index is 1-indexed; computeTarabalam expects 0-indexed
  const tarabalamAfter = nakshatraChanges
    ? computeTarabalam(data.nakshatra[1].index - 1)
    : null
  const nakTransitionTime = nakshatraChanges ? data.nakshatra[0].endTime : null

  return (
    <CollapsibleSection id="chandratara" title="Chandrabalam & Tarabalam">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

        {/* ── Chandrabalam ─────────────────────────────────────────────── */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Chandrabalam</h4>

          {/* Before transition (or all-day if no transition) */}
          <div className={chandrababalamAfter ? 'mb-4' : ''}>
            <p className="text-xs text-muted-foreground mb-1.5">
              Moon in {chandrabalam.currentMoonRashi}
              {moonRashiChanges && <TransitionLabel time={data.moonRashiChangeTime!} prefix="till" />}
            </p>
            <RashiBadges rashis={chandrabalam.favorableRashis} />
          </div>

          {/* After transition */}
          {chandrababalamAfter && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Moon in {chandrababalamAfter.currentMoonRashi}
                <TransitionLabel time={data.moonRashiChangeTime!} prefix="from" />
              </p>
              <RashiBadges rashis={chandrababalamAfter.favorableRashis} />
            </div>
          )}
        </div>

        {/* ── Tarabalam ─────────────────────────────────────────────────── */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Tarabalam</h4>

          {/* Before transition (or all-day if no transition) */}
          <div className={tarabalamAfter ? 'mb-4' : ''}>
            <p className="text-xs text-muted-foreground mb-1.5">
              Moon in {tarabalam.currentNakshatra}
              {nakshatraChanges && nakTransitionTime && (
                <TransitionLabel time={nakTransitionTime} prefix="till" />
              )}
            </p>
            <NakBadges naks={tarabalam.favorableNakshatras} />
          </div>

          {/* After transition */}
          {tarabalamAfter && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Moon in {tarabalamAfter.currentNakshatra}
                {nakTransitionTime && (
                  <TransitionLabel time={nakTransitionTime} prefix="from" />
                )}
              </p>
              <NakBadges naks={tarabalamAfter.favorableNakshatras} />
            </div>
          )}
        </div>

      </div>
    </CollapsibleSection>
  )
}
