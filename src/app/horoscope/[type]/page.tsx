import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const VALID_TYPES = ['daily', 'weekly', 'monthly']

// Supabase sign mapping (lowercase) to rashi slug
const SIGN_TO_RASHI: Record<string, string> = {
  aries: 'aries', taurus: 'taurus', gemini: 'gemini', cancer: 'cancer',
  leo: 'leo', virgo: 'virgo', libra: 'libra', scorpio: 'scorpio',
  sagittarius: 'sagittarius', capricorn: 'capricorn', aquarius: 'aquarius', pisces: 'pisces',
  // Sanskrit names from panchang
  mesha: 'aries', vrishabha: 'taurus', mithuna: 'gemini', karka: 'cancer',
  simha: 'leo', kanya: 'virgo', tula: 'libra', vrishchika: 'scorpio',
  dhanu: 'sagittarius', makara: 'capricorn', kumbha: 'aquarius', meena: 'pisces',
}

export default async function HoroscopeTypePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  if (!VALID_TYPES.includes(type)) notFound()

  // Try to get logged-in user's favorite chart Moon sign for auto-select
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: chart } = await supabase
        .from('charts')
        .select('moon_sign')
        .eq('user_id', user.id)
        .eq('is_favorite', true)
        .maybeSingle()

      if (chart?.moon_sign) {
        const rashiSlug = SIGN_TO_RASHI[chart.moon_sign.toLowerCase()]
        if (rashiSlug) redirect(`/horoscope/${type}/${rashiSlug}`)
      }
    }
  } catch {
    // Silently fall through to default
  }

  redirect(`/horoscope/${type}/aries`)
}
