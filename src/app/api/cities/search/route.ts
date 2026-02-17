import { NextRequest, NextResponse } from 'next/server';
import { find as findTimezone } from 'geo-tz';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { logError } from '@/lib/monitoring/errorLogger';
import { SupabaseClient } from '@supabase/supabase-js';
import { withErrorHandling } from '@/lib/api/errorHandling'


interface HereGeocodeAddress {
  countryCode: string;
  countryName: string;
  state?: string;
  county?: string;
  city?: string;
}

interface HereGeocodeItem {
  title: string;
  resultType: string;
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

// Service role client — bypasses RLS, used only for cache writes
function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createServiceClient(url, key);
}

async function searchSupabase(supabase: SupabaseClient, query: string): Promise<CityResult[]> {
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

async function searchHereMaps(query: string): Promise<CityResult[]> {
  const apiKey = process.env.HERE_MAPS_API_KEY;
  if (!apiKey) {
    logError('HERE_MAPS_API_KEY not set in environment');
    return [];
  }
  const url = new URL('https://geocode.search.hereapi.com/v1/geocode');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '8');
  url.searchParams.set('lang', 'en');
  url.searchParams.set('apiKey', apiKey);
  url.searchParams.set('types', 'city');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Here Maps returned ${response.status}`);
  }
  const data: HereGeocodeResponse = await response.json();
  if (!data.items?.length) return [];

  return data.items
    .map((item): CityResult | null => {
      if (item.resultType !== 'locality' && item.resultType !== 'administrativeArea') {
        return null;
      }
      const cityName = item.address.city || item.address.county || item.title.split(',')[0].trim();
      const stateName = item.address.state || item.address.county || '';
      const country = item.address.countryName || '';
      const lat = item.position.lat;
      const lng = item.position.lng;
      if (!cityName || !country) return null;
      const timezone = findTimezone(lat, lng)[0] || 'Asia/Kolkata';
      return { id: 0, city_name: cityName, state_name: stateName, country, latitude: lat, longitude: lng, timezone };
    })
    .filter((c): c is CityResult => c !== null);
}

async function saveCitiesToCache(cities: CityResult[]): Promise<void> {
  const rows = cities
    .filter((c) => c.city_name && c.country)
    .map((c) => ({
      city_name: c.city_name,
      state_name: c.state_name,
      country: c.country,
      latitude: c.latitude,
      longitude: c.longitude,
      timezone: c.timezone,
    }));
  if (rows.length === 0) return;

  // Use service role client — bypasses RLS for server-side cache writes
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('cities')
    .upsert(rows, { onConflict: 'city_name,state_name,country', ignoreDuplicates: true });
  if (error) {
    logError('City cache save failed', new Error(error.message), {
      count: rows.length,
      cities: rows.map(r => `${r.city_name}, ${r.country}`).join('; '),
    });
  }
}

export const GET= withErrorHandling(async (request: NextRequest)=> {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  try {
    const supabase = await createClient();

    const supabaseResults = await searchSupabase(supabase, query);
    if (supabaseResults.length > 0) {
      return NextResponse.json({ cities: supabaseResults });
    }

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

    // Service role client created fresh here — no request context needed
    saveCitiesToCache(hereMapsResults).catch((err) =>
      logError('Background city cache failed', err)
    );

    return NextResponse.json({ cities: hereMapsResults });

  } catch (error) {
    logError('City search route failed', error, { query });
    return NextResponse.json({ cities: [] }, { status: 500 });
  }
})
