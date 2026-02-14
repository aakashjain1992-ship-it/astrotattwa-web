import { NextRequest, NextResponse } from 'next/server';
import { find as findTimezone } from 'geo-tz';
import { createClient } from '@/lib/supabase/server';
import { logError } from '@/lib/monitoring/errorLogger';

// ============================================================
// TYPES
// ============================================================

interface HereGeocodeAddress {
  countryCode: string;
  countryName: string;
  state?: string;
  county?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

interface HereGeocodeItem {
  title: string;
  resultType: string;
  localityType?: string;
  address: HereGeocodeAddress;
  position: { lat: number; lng: number };
}

interface HereGeocodeResponse {
  items: HereGeocodeItem[];
}

interface CityResult {
  id: number;
  city_name: string;
  state_name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// ============================================================
// SUPABASE SEARCH (fast path — your own data)
// ============================================================

async function searchSupabase(query: string): Promise<CityResult[]> {
  const supabase = await createClient();
  const searchPattern = `%${query}%`;

  const { data, error } = await supabase
    .from('cities')
    .select('id, city_name, state_name, country, latitude, longitude, timezone')
    .or(`city_name.ilike.${searchPattern},state_name.ilike.${searchPattern}`)
    .order('city_name')
    .limit(10);

  if (error) {
    logError('Supabase city search failed', new Error(error.message), { query });
    return [];
  }

  return (data || []) as CityResult[];
}

// ============================================================
// HERE MAPS GEOCODE SEARCH (fallback)
// ============================================================

async function searchHereMaps(query: string): Promise<CityResult[]> {
  const apiKey = process.env.HERE_MAPS_API_KEY;
  if (!apiKey) {
    logError('HERE_MAPS_API_KEY not set in environment');
    return [];
  }

  // Use geocode endpoint — no center point required, works globally
  const url = new URL('https://geocode.search.hereapi.com/v1/geocode');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '8');
  url.searchParams.set('lang', 'en');
  url.searchParams.set('apiKey', apiKey);
  // Only return locality/city level results
  url.searchParams.set('types', 'city');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Here Maps geocode API returned ${response.status}: ${await response.text()}`);
  }

  const data: HereGeocodeResponse = await response.json();

  if (!data.items || data.items.length === 0) {
    return [];
  }

  return data.items
    .map((item): CityResult | null => {
      // Only keep locality-level results (city/town/village)
      if (item.resultType !== 'locality' && item.resultType !== 'administrativeArea') {
        return null;
      }

      const cityName = item.address.city || item.address.county || item.title.split(',')[0].trim();
      const stateName = item.address.state || item.address.county || '';
      const country = item.address.countryName || '';
      const lat = item.position.lat;
      const lng = item.position.lng;

      if (!cityName || !country) return null;

      // geo-tz: local package, no API call, returns exact IANA timezone string
      const timezone = findTimezone(lat, lng)[0] || 'Asia/Kolkata';

      return {
        id: 0, // assigned by DB on save
        city_name: cityName,
        state_name: stateName,
        country,
        latitude: lat,
        longitude: lng,
        timezone,
      };
    })
    .filter((c): c is CityResult => c !== null);
}

// ============================================================
// BACKGROUND CACHE SAVE (non-blocking)
// ============================================================

async function saveCitiesToCache(cities: CityResult[]): Promise<void> {
  const supabase = await createClient();

  const rows = cities
    .filter((c) => c.city_name && c.country)
    .map((c) => ({
      city_name: c.city_name,
      state_name: c.state_name,
      country: c.country,
      latitude: c.latitude,
      longitude: c.longitude,
      timezone: c.timezone,
      // search_text auto-populated by DB trigger
    }));

  if (rows.length === 0) return;

  const { error } = await supabase
    .from('cities')
    .upsert(rows, {
      onConflict: 'city_name,state_name,country',
      ignoreDuplicates: true,
    });

  if (error) {
    logError('Background city cache save failed', new Error(error.message), {
      count: rows.length,
    });
  }
}

// ============================================================
// ROUTE HANDLER
// ============================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  try {
    // 1. Supabase first — fast, free, your own data
    const supabaseResults = await searchSupabase(query);
    if (supabaseResults.length > 0) {
      return NextResponse.json({ cities: supabaseResults });
    }

    // 2. Fall back to Here Maps geocode API
    let hereMapsResults: CityResult[] = [];
    try {
      hereMapsResults = await searchHereMaps(query);
    } catch (error) {
      logError('Here Maps search failed', error, { query });
      return NextResponse.json({ cities: [] });
    }

    if (hereMapsResults.length === 0) {
      return NextResponse.json({ cities: [] });
    }

    // 3. Save to Supabase in background — don't await, don't block the response
    saveCitiesToCache(hereMapsResults).catch((err) =>
      logError('Background city cache failed', err)
    );

    // 4. Return immediately
    return NextResponse.json({ cities: hereMapsResults });

  } catch (error) {
    logError('City search route failed', error, { query });
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
}

