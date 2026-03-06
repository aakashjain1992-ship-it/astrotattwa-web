/**
 * GET /api/transits/saturn/sadesati
 * 
 * Returns complete Sade Sati and Dhaiya analysis for lifetime.
 * Lazy-loaded by SadeSatiTableView component on mount.
 * 
 * Response: ~50KB (full lifetime analysis with all periods)
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateSadeSatiFromMoon } from '@/lib/astrology/sadesati/saturnWrappers'; // ✅ NEW
import { withErrorHandling } from '@/lib/api/withErrorHandling';
import { RateLimitPresets, rateLimit } from '@/lib/api/rateLimit';
import { validationError, successResponse } from '@/lib/api/apiResponse';
import { logError } from '@/lib/api/logger';

async function handler(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(req, RateLimitPresets.standard);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    
    // Extract query parameters
    const moonLongitude = searchParams.get('moonLongitude');
    const birthDateUtc = searchParams.get('birthDateUtc');

    // Validation
    if (!moonLongitude || !birthDateUtc) {
      return validationError('Missing required parameters: moonLongitude, birthDateUtc');
    }

    // Validate moonLongitude range
    const moonLong = parseFloat(moonLongitude);
    if (isNaN(moonLong) || moonLong < 0 || moonLong >= 360) {
      return validationError('moonLongitude must be between 0 and 360');
    }

    // Validate date
    const birthDate = new Date(birthDateUtc);
    if (isNaN(birthDate.getTime())) {
      return validationError('Invalid birthDateUtc format');
    }

    // Calculate full Saturn analysis using wrapper
    const result = await calculateSadeSatiFromMoon(moonLong, birthDate);

    // Build summary
    const isSadeSatiActive = result.sadeSati.current && 'isActive' in result.sadeSati.current
      ? result.sadeSati.current.isActive !== false
      : false;
    
    const isDhaiyaActive = result.dhaiya.current !== null;

    let currentStatus: 'in_sadesati' | 'in_dhaiya' | 'in_both' | 'clear';
    if (isSadeSatiActive && isDhaiyaActive) {
      currentStatus = 'in_both';
    } else if (isSadeSatiActive) {
      currentStatus = 'in_sadesati';
    } else if (isDhaiyaActive) {
      currentStatus = 'in_dhaiya';
    } else {
      currentStatus = 'clear';
    }

    // Collect top recommendations from the result
    const topRecommendations: string[] = result.summary?.topRecommendations || [];

    // Build complete response
    const analysisData = {
      sadeSati: {
        past: result.sadeSati.past || [],
        current: result.sadeSati.current,
        upcoming: result.sadeSati.upcoming,
        future: result.sadeSati.future || [],
        next: result.sadeSati.next,
      },
      dhaiya: {
        current: result.dhaiya.current,
        upcoming4th: result.dhaiya.upcoming4th || [],
        upcoming8th: result.dhaiya.upcoming8th || [],
      },
      summary: {
        currentStatus,
        totalSadeSatiPeriods: (result.sadeSati.past?.length || 0) + 
                              (isSadeSatiActive ? 1 : 0) + 
                              (result.sadeSati.future?.length || 0),
        topRecommendations: topRecommendations.slice(0, 5),
      },
      currentSaturn: result.currentSaturn,
      calculatedAt: new Date().toISOString(),
    };

    return successResponse(analysisData);

  } catch (error) {
    logError(error, {
      context: 'GET /api/transits/saturn/sadesati',
      params: Object.fromEntries(new URL(req.url).searchParams),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate Saturn transits',
      },
      { status: 500 }
    );
  }
}

export const GET = withErrorHandling(handler);
