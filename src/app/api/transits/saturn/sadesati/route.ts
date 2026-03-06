/**
 * POST /api/transits/saturn/sadesati
 * 
 * COMPLETE Saturn transit analysis with ALL factors from specification
 * 
 * Receives: Full chart data (planets, ascendant, dasha)
 * Returns: Professional-grade Sade Sati + Dhaiya analysis
 * 
 * Response: ~50KB
 */

import { NextRequest } from 'next/server';
import { calculateProfessionalSaturnAnalysis } from '@/lib/astrology/sadesati/calculator-PROFESSIONAL';
import { successResponse, withErrorHandling, validationError } from '@/lib/api/errorHandling';
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit';
import { logError } from '@/lib/monitoring/errorLogger';
import type { PlanetData, AscendantData } from '@/types/astrology';

export const POST = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard);

  const body = await req.json();
  
  // Extract all required data
  const { 
    planets,      // ALL planets (not just Moon)
    ascendant,    // Real ascendant (not placeholder)
    birthDateUtc, 
    dashaInfo     // Current dasha
  } = body;

  // Validation
  if (!planets || !planets.Moon || !planets.Saturn) {
    return validationError('Missing required planet data (Moon, Saturn)');
  }

  if (!ascendant || !ascendant.signNumber) {
    return validationError('Missing ascendant data');
  }

  if (!birthDateUtc) {
    return validationError('Missing birthDateUtc');
  }

  try {
    const birthDate = new Date(birthDateUtc);
    if (isNaN(birthDate.getTime())) {
      return validationError('Invalid birthDateUtc format');
    }

    // Call professional calculator with COMPLETE data
    const result = await calculateProfessionalSaturnAnalysis(
      planets.Moon as PlanetData,
      planets.Saturn as PlanetData,
      planets as Record<string, PlanetData>,  // ALL planets
      ascendant as AscendantData,              // Real ascendant
      birthDate,
      dashaInfo,  // Dasha info for activation analysis
      {
        // Enable ALL features from specification
        includeDashaAnalysis: !!dashaInfo,      // YES - we have dasha
        calculatePeakWindows: true,              // YES - degree-based peaks
        detectRetrogradeCycles: true,            // YES - retrograde 3-touch pattern
        findNakshatraCrossings: true,            // YES - nakshatra triggers
        analyzeJupiterProtection: !!planets.Jupiter, // YES - if Jupiter exists
        includeDetailedPhases: true,             // YES - internal phases
      }
    );

    // Build complete response matching specification
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

    const topRecommendations: string[] = result.summary?.topRecommendations || [];

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
      context: 'POST /api/transits/saturn/sadesati',
      bodyKeys: Object.keys(body),
    });
    throw error;
  }
});
