import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  
  if (!query || query.length < 2) {
    return NextResponse.json({ cities: [] })
  }

  try {
    const supabase = await createClient()
    
    const searchPattern = `%${query}%`
    
    const { data, error } = await supabase
      .from('cities')
      .select('id, city_name, state_name, country, latitude, longitude, timezone')
      .or(`city_name.ilike.${searchPattern},state_name.ilike.${searchPattern}`)
      .order('city_name')
      .limit(10)


    if (error) {
      return NextResponse.json({ 
        error: 'Search failed', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ cities: data || [] })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Search failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
