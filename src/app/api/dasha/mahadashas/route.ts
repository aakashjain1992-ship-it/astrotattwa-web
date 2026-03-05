/**
 * FILE 6: src/app/api/dasha/mahadashas/route.ts
 * 
 * API endpoint to calculate complete 120-year Vimshottari Dasha timeline
 * Called by DashaNavigator component when user clicks "Dasha Timeline" tab
 * 
 * Returns: ~30KB JSON with all 9 mahadasha periods
 */

import { NextRequest, NextResponse } from 'next/server';
import { vimshottariDasha } from '@/lib/astrology/kp/dasha';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const moonLongitude = parseFloat(searchParams.get('moonLongitude') || '0');
    const birthDateUtc = searchParams.get('birthDateUtc');
    const elapsedFraction = parseFloat(searchParams.get('elapsedFraction') || '0');
    const nakLord = searchParams.get('nakLord');
    
    // Validate required parameters
    if (!birthDateUtc || !nakLord) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: birthDateUtc, nakLord' 
        },
        { status: 400 }
      );
    }
    
    if (isNaN(moonLongitude) || isNaN(elapsedFraction)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid numeric parameters' 
        },
        { status: 400 }
      );
    }
    
    // Parse birth date
    const birthDate = new Date(birthDateUtc);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid birthDateUtc format' 
        },
        { status: 400 }
      );
    }
    
    // Calculate complete dasha timeline (120 years)
    const dashaResult = vimshottariDasha(
      moonLongitude,
      birthDate,
      elapsedFraction,
      nakLord as any,
      360 // Use 360-day year (classical Vedic)
    );
    
    return NextResponse.json({
      success: true,
      data: {
        allMahadashas: dashaResult.allMahadashas,
        balance: dashaResult.balance,
        currentMahadasha: dashaResult.currentMahadasha,
      }
    });
    
  } catch (error) {
    console.error('Mahadasha calculation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate mahadashas' 
      },
      { status: 500 }
    );
  }
}
