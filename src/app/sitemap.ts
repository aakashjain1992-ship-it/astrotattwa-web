import type { MetadataRoute } from 'next'
import { RASHI_MAP } from '@/lib/horoscope/rashiMap'

const BASE_URL = 'https://astrotattwa.com'
const HOROSCOPE_TYPES = ['daily', 'weekly', 'monthly'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                               lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/kundli`,                   lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BASE_URL}/kundli-milan`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.90 },
    { url: `${BASE_URL}/muhurta/marriage`,         lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${BASE_URL}/panchang`,                 lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/festival`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/numerology`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/numerology/compatibility`, lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE_URL}/book-consultancy`,         lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const horoscopePages: MetadataRoute.Sitemap = HOROSCOPE_TYPES.flatMap(type =>
    RASHI_MAP.map(rashi => ({
      url: `${BASE_URL}/horoscope/${type}/${rashi.slug}`,
      lastModified: now,
      changeFrequency: type === 'daily' ? 'daily' : type === 'weekly' ? 'weekly' : 'monthly',
      priority: type === 'daily' ? 0.8 : type === 'weekly' ? 0.7 : 0.6,
    } as MetadataRoute.Sitemap[number]))
  )

  return [...staticPages, ...horoscopePages]
}
