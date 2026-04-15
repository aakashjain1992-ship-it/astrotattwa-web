/**
 * verify-moon-phases.ts
 * Reads stored tithi_start/tithi_end from DB and checks the Moon-Sun elongation
 * at those exact timestamps matches the expected crossing angles.
 */
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import swe from 'swisseph'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

;(swe as any).swe_set_ephe_path(path.join(process.cwd(), 'public', 'ephe'))

function jdFromDate(date: Date): number {
  const s = swe as any
  return s.swe_julday(
    date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600,
    s.SE_GREG_CAL
  )
}

function elongation(jdUt: number): number {
  const s = swe as any
  const flags = s.SEFLG_SWIEPH
  const moon = s.swe_calc_ut(jdUt, s.SE_MOON, flags)
  const sun  = s.swe_calc_ut(jdUt, s.SE_SUN,  flags)
  const mLon = Array.isArray(moon.data) ? moon.data[0] : moon.longitude
  const sLon = Array.isArray(sun.data)  ? sun.data[0]  : sun.longitude
  let diff = mLon - sLon
  if (diff < 0) diff += 360
  return diff
}

/** Smallest angular difference between two angles (0-180) */
function angDiff(a: number, b: number): number {
  const d = Math.abs(((a - b + 180 + 360) % 360) - 180)
  return d
}

async function main() {
  const { data: rows, error } = await supabase
    .from('festival_calendar')
    .select('date, name, type, tithi_start, tithi_end')
    .in('type', ['purnima', 'amavasya'])
    .order('date')

  if (error) { console.error(error.message); process.exit(1) }

  console.log('\nVerification: Moon-Sun elongation at stored tithi_start and tithi_end\n')
  console.log('  St  Date        Name                           Type       Start°   End°   Dur    OK')
  console.log('  --  ----------  -----------------------------  ---------  -------  -----  -----  --')

  let ok = 0
  let warn = 0

  for (const r of rows!) {
    const startElong = elongation(jdFromDate(new Date(r.tithi_start)))
    const endElong   = elongation(jdFromDate(new Date(r.tithi_end)))

    const expectedStart = r.type === 'purnima' ? 168 : 348
    const expectedEnd   = r.type === 'purnima' ? 180 : 0   // 0° = new moon (360° wrap)

    const startErr = angDiff(startElong, expectedStart)
    const endErr   = angDiff(endElong,   expectedEnd)
    const isOk     = startErr < 0.15 && endErr < 0.15

    const durationHrs = (new Date(r.tithi_end).getTime() - new Date(r.tithi_start).getTime()) / 3600000
    const durOk = durationHrs > 10 && durationHrs < 30

    if (isOk && durOk) {
      ok++
    } else {
      warn++
    }

    const status = (isOk && durOk) ? '✓' : '⚠'
    const durStr = durOk ? durationHrs.toFixed(1) + 'h' : '!' + durationHrs.toFixed(1) + 'h'

    console.log(
      `  ${status}   ${r.date}  ${r.name.padEnd(29)} ${r.type.padEnd(9)}` +
      `  ${startElong.toFixed(2).padStart(6)}°  ${endElong.toFixed(2).padStart(5)}°  ${durStr.padStart(5)}`
    )
  }

  console.log(`\nSummary: ${ok} correct ✓   ${warn} issues ⚠`)
  console.log('\nExpected angles: Purnima start=168°, end=180° | Amavasya start=348°, end=0°/360°')
}

main().catch(err => { console.error(err); process.exit(1) })
