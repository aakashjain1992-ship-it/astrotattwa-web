/**
 * GET /api/transits/saturn/summary
 * 
 * Returns a quick summary of Saturn transit status.
 * Used for showing the orange indicator dot on the Sade Sati tab.
 * 
 * Response: ~1KB
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateSadeSatiFromMoon } from '@/lib/astrology/sadesati/saturnWrappers'; // ✅ NEW
import { successResponse, withErrorHandling, validationError } from '@/lib/api/errorHandling';
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit';
import { logError } from '@/lib/monitoring/errorLogger';

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

    // Calculate Sade Sati using wrapper
    const result = await calculateSadeSatiFromMoon(moonLong, birthDate);

    // Check if currently active
    const isCurrentlyActive = result.sadeSati.current && 'isActive' in result.sadeSati.current
      ? result.sadeSati.current.isActive !== false
      : false;
    
    let activePeriod = null;
    if (isCurrentlyActive && result.sadeSati.current && 'currentPhase' in result.sadeSati.current) {
      const current = result.sadeSati.current as any;
      activePeriod = {
        startDate: current.startDate,
        endDate: current.endDate,
        phase: current.currentPhase?.phase || 'Unknown',
        intensity: current.overallImpact?.intensity || 'moderate',
      };
    }

    // Count total periods
    const totalPeriods = 
      result.sadeSati.past.length + 
      (isCurrentlyActive ? 1 : 0) + 
      result.sadeSati.future.length;

    return successResponse({
      isCurrentlyActive,
      activePeriod,
      totalPeriods,
    });

  } catch (error) {
    logError(error, {
      context: 'GET /api/transits/saturn/summary',
      params: Object.fromEntries(new URL(req.url).searchParams),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate Saturn summary',
      },
      { status: 500 }
    );
  }
}

export const GET = withErrorHandling(handler);
