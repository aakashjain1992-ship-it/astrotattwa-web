import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HoroscopeShell } from '@/components/horoscope/HoroscopeShell'
import { supabaseAdmin } from '@/lib/supabase/server-admin'
import { getRashiBySlug, RASHI_SLUGS } from '@/lib/horoscope/rashiMap'
import type { HoroscopeRow } from '@/types/horoscope'

const VALID_TYPES = ['daily', 'weekly', 'monthly']

type Params = { type: string; rashi: string }

async function fetchInitialHoroscope(type: string, rashi: string): Promise<HoroscopeRow | null> {
  const today = new Date().toISOString().slice(0, 10)

  // Try to find horoscope covering today
  const { data } = await supabaseAdmin
    .from('horoscopes')
    .select('id, rashi, type, sign_type, period_start, period_end, content_en, content_hi, planet_context, published_at')
    .eq('type', type)
    .eq('rashi', rashi)
    .eq('sign_type', 'moon')
    .lte('period_start', today)
    .gte('period_end', today)
    .order('period_start', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (data) return data as HoroscopeRow

  // Fallback to most recent
  const { data: fallback } = await supabaseAdmin
    .from('horoscopes')
    .select('id, rashi, type, sign_type, period_start, period_end, content_en, content_hi, planet_context, published_at')
    .eq('type', type)
    .eq('rashi', rashi)
    .eq('sign_type', 'moon')
    .order('period_start', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (fallback as HoroscopeRow) ?? null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { type, rashi } = await params
  const rashiInfo = getRashiBySlug(rashi)
  if (!rashiInfo || !VALID_TYPES.includes(type)) return {}

  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  const title = `${rashiInfo.nameEn} ${typeLabel} Horoscope — ${today}`
  const description = `${typeLabel} horoscope for ${rashiInfo.nameEn} (${rashiInfo.nameHi}). Moon sign and Sun sign Vedic predictions for ${today}. Career, love, health and lucky insights.`

  return {
    title,
    description,
    alternates: { canonical: `/horoscope/${type}/${rashi}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://astrotattwa.com/horoscope/${type}/${rashi}`,
    },
    twitter: { card: 'summary', title, description },
  }
}

export default async function HoroscopeRashiPage({ params }: { params: Promise<Params> }) {
  const { type, rashi } = await params

  if (!VALID_TYPES.includes(type) || !RASHI_SLUGS.includes(rashi)) notFound()

  const rashiInfo = getRashiBySlug(rashi)!
  const initialData = await fetchInitialHoroscope(type, rashi)

  const today = new Date().toISOString().slice(0, 10)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${rashiInfo.nameEn} ${type} horoscope`,
    datePublished: initialData?.published_at ?? today,
    dateModified: initialData?.published_at ?? today,
    publisher: { '@type': 'Organization', name: 'Astrotattwa', url: 'https://astrotattwa.com' },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://astrotattwa.com' },
        { '@type': 'ListItem', position: 2, name: 'Horoscope', item: 'https://astrotattwa.com/horoscope' },
        { '@type': 'ListItem', position: 3, name: `${type.charAt(0).toUpperCase() + type.slice(1)}`, item: `https://astrotattwa.com/horoscope/${type}` },
        { '@type': 'ListItem', position: 4, name: rashiInfo.nameEn, item: `https://astrotattwa.com/horoscope/${type}/${rashi}` },
      ],
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="min-h-screen bg-background">
        <HoroscopeShell
          initialType={type as 'daily' | 'weekly' | 'monthly'}
          initialRashi={rashi}
          initialData={initialData}
          today={today}
        />
      </main>
      <Footer />
    </>
  )
}
