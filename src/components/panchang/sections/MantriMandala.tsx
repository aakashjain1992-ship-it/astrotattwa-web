import { CollapsibleSection } from '../CollapsibleSection'
import type { PanchangData } from '@/lib/panchang/types'

const PLANET_EMOJI: Record<string, string> = {
  Sun: '☀️', Moon: '🌙', Mars: '♂️', Mercury: '☿', Jupiter: '♃', Venus: '♀️', Saturn: '♄',
  Rahu: '☊', Ketu: '☋',
}

function Role({ role, planet }: { role: string; planet: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 text-sm">
      <span className="text-muted-foreground">{role}</span>
      <span className="font-medium">{PLANET_EMOJI[planet] ?? ''} {planet}</span>
    </div>
  )
}

export function MantriMandalaSection({ data }: { data: PanchangData }) {
  const mm = data.mantriMandala
  return (
    <CollapsibleSection id="mantrimandala" title={`Mantri Mandala of Vikram Samvat ${mm.vsYear}`}>
      <div className="pt-1">
        <Role role="Raja (King)" planet={mm.raja} />
        <Role role="Mantri (Minister)" planet={mm.mantri} />
        <Role role="Sasyadhipati (Crops)" planet={mm.sasyadhipati} />
        <Role role="Dhanadhipati (Wealth)" planet={mm.dhanadhipati} />
        <Role role="Rasadhipati (Liquids)" planet={mm.rasadhipati} />
        <Role role="Senadhipati (Army)" planet={mm.senadhipati} />
        <Role role="Dhanyadhipati (Grains)" planet={mm.dhanyadhipati} />
        <Role role="Meghadhipati (Rain)" planet={mm.meghadhipati} />
        <Role role="Nirasadhipati (Metals)" planet={mm.nirasadhipati} />
        <Role role="Phaladhipati (Fruits)" planet={mm.phaladhipati} />
      </div>
    </CollapsibleSection>
  )
}
