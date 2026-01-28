import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('=== SUPABASE DEBUG ===');
    console.log('URL exists:', !!url);
    console.log('Key exists:', !!key);
    console.log('URL:', url);
    console.log('Key prefix:', key?.substring(0, 30));
    
    if (!url || !key) {
      return NextResponse.json({
        error: 'Missing credentials',
        hasUrl: !!url,
        hasKey: !!key,
        url: url,
        keyPrefix: key?.substring(0, 30)
      }, { status: 500 });
    }
    
    // Try to create client
    const supabase = createClient(url, key);
    console.log('Client created');
    
    // Try to count cities
    const { data, error, count } = await supabase
      .from('cities')
      .select('*', { count: 'exact', head: true });
    
    console.log('Query result:', { error: error?.message, count });
    
    if (error) {
      return NextResponse.json({
        error: 'Query failed',
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      citiesCount: count,
      message: 'Supabase connected!'
    });
    
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: 'Exception',
      message: error.message,
      name: error.name,
      cause: error.cause?.message
    }, { status: 500 });
  }
}
