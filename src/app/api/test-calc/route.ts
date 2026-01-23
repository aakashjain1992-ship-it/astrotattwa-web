import { NextResponse } from 'next/server';
import { testCalculations } from '@/lib/astrology/test-swisseph';

export async function GET() {
  try {
    const results = await testCalculations();  // ✅ Added await
    
    return NextResponse.json({
      success: true,
      message: '✅ Swiss Ephemeris is working!',
      testDate: 'March 25, 1992, 11:55 AM IST',
      results: results
    });
    
  } catch (error: any) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
