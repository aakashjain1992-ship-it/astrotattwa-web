'use client'
import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'
import { cn } from '@/lib/utils'

const PANCHAKA_STYLE: Record<string, string> = {
  good:   'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  roga:   'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  mrityu: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  agni:   'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  raja:   'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  chora:  'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
}

const PANCHAKA_LABEL: Record<string, string> = {
  good:   '✓ Good',
  roga:   'Roga',
  mrityu: 'Mrityu',
  agni:   'Agni',
  raja:   '⚠ Raja',
  chora:  'Chora',
}

function Badge({ type }: { type: string }) {
  return (
    <span className={cn(
      'text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap',
      PANCHAKA_STYLE[type] ?? PANCHAKA_STYLE.good
    )}>
      {PANCHAKA_LABEL[type] ?? type}
    </span>
  )
}

export function UdayaLagnaSection({ data }: { data: PanchangData }) {
  const slots = data.udayaLagnaSlots
  const pSlots = data.panchakaSlots ?? []

  return (
    <CollapsibleSection id="udayalagna" title="Panchaka Rahita Muhurta and Udaya Lagna">
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* ── Left: Panchaka Rahita Muhurta ─────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Panchaka Rahita Muhurta
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2 text-muted-foreground font-medium">Time</th>
                  <th className="text-left pb-2 text-muted-foreground font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {pSlots.map((s, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    <td className="py-1.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {s.startTime}{s.endTime ? ` – ${s.endTime}` : '+'}
                    </td>
                    <td className="py-1.5 pl-2">
                      <Badge type={s.panchakaType} />
                    </td>
                  </tr>
                ))}
                {pSlots.length === 0 && (
                  <tr><td colSpan={2} className="py-4 text-xs text-muted-foreground text-center">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right: Udaya Lagna ────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Udaya Lagna
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2 text-muted-foreground font-medium">Lagna</th>
                  <th className="text-left pb-2 text-muted-foreground font-medium">Time</th>
                  <th className="text-left pb-2 text-muted-foreground font-medium">Quality</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    <td className="py-1.5 font-medium">{slot.lagnaName}</td>
                    <td className="py-1.5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {slot.startTime} – {slot.endTime}
                    </td>
                    <td className="py-1.5 pl-2">
                      <Badge type={slot.panchakaType} />
                    </td>
                  </tr>
                ))}
                {slots.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-xs text-muted-foreground text-center">
                    Lagna data unavailable
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </CollapsibleSection>
  )
}
