import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'

export function ChandraTaraSection({ data }: { data: PanchangData }) {
  const { chandrabalam, tarabalam } = data
  return (
    <CollapsibleSection id="chandratara" title="Chandrabalam & Tarabalam">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Chandrabalam */}
        <div>
          <h4 className="text-sm font-semibold mb-2">
            Chandrabalam
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              (Current Moon: {chandrabalam.currentMoonRashi})
            </span>
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            Favorable for people with these birth rashis:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {chandrabalam.favorableRashis.map(rashi => (
              <span key={rashi} className="text-xs bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full font-medium">
                {rashi}
              </span>
            ))}
          </div>
        </div>

        {/* Tarabalam */}
        <div>
          <h4 className="text-sm font-semibold mb-2">
            Tarabalam
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              (Current: {tarabalam.currentNakshatra})
            </span>
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            Favorable for birth nakshatras:
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {tarabalam.favorableNakshatras.map(nak => (
              <span key={nak} className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-medium">
                {nak}
              </span>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}
