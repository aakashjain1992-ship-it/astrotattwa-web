// Seed festival_calendar table with 2026-2027 Hindu festival data.
// Run: npx ts-node -e "require('./scripts/seed-festivals')"
// Or: npx tsx scripts/seed-festivals.ts
import { createClient } from '@supabase/supabase-js'
import { FESTIVAL_SEED_DATA } from '../src/lib/panchang/festivals'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  console.log(`Seeding ${FESTIVAL_SEED_DATA.length} festival records…`)

  // Clear existing seed data first to keep idempotent
  const { error: delError } = await supabase
    .from('festival_calendar')
    .delete()
    .gte('date', '2026-01-01')
    .lte('date', '2027-12-31')

  if (delError) {
    console.error('Delete error:', delError.message)
    process.exit(1)
  }

  const { error } = await supabase
    .from('festival_calendar')
    .insert(
      FESTIVAL_SEED_DATA.map(f => ({
        date: f.date,
        name: f.name,
        type: f.type,
        description: f.description ?? null,
        image_url: null,
      }))
    )

  if (error) {
    console.error('Seed error:', error.message)
    process.exit(1)
  }
  console.log('Festival seed complete.')
}

seed()
