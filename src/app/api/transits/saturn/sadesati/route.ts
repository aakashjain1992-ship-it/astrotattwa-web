/**
 * POST /api/transits/saturn/sadesati
 *
 * Complete Saturn transit analysis — Sade Sati + Dhaiya + Saturn Cycles.
 *
 * Receives: Full chart data (planets, ascendant, dasha)
 * Returns:  Professional-grade analysis including saturnCycles for Timeline tab
 */

import { NextRequest } from 'next/server';
import { calculateProfessionalSaturnAnalysis } from '@/lib/astrology/sadesati/calculator-PROFESSIONAL';
import { successResponse, withErrorHandling, validationError } from '@/lib/api/errorHandling';
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit';
import { logError } from '@/lib/monitoring/errorLogger';
import type { PlanetData, AscendantData } from '@/types/astrology';
 
export const maxDuration = 120;
 
export const POST = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard);
 
  const body = await req.json();
  const { planets, ascendant, birthDateUtc, dashaInfo } = body;
 
  if (!planets || !planets.Moon || !planets.Saturn)
    return validationError('Missing required planet data (Moon, Saturn)');
  if (!ascendant || !ascendant.signNumber)
    return validationError('Missing ascendant data');
  if (!birthDateUtc)
    return validationError('Missing birthDateUtc');
 
  try {
    const birthDate = new Date(birthDateUtc);
    if (isNaN(birthDate.getTime()))
      return validationError('Invalid birthDateUtc format');
 
    const result = await calculateProfessionalSaturnAnalysis(
      planets.Moon    as PlanetData,
      planets.Saturn  as PlanetData,
      planets         as Record<string, PlanetData>,
      ascendant       as AscendantData,
      birthDate,
      dashaInfo,
      {
        includeDashaAnalysis:     !!dashaInfo,
        calculatePeakWindows:     false,
        detectRetrogradeCycles:   true,
        findNakshatraCrossings:   false,
        analyzeJupiterProtection: !!planets.Jupiter,
        includeDetailedPhases:    true,
      },
    );
 
    const isSadeSatiActive =
      result.sadeSati.current &&
      'isActive' in result.sadeSati.current
        ? result.sadeSati.current.isActive !== false
        : false;
 
    // FIX: use !! to handle undefined correctly (null !== undefined = true was the bug)
    const isDhaiyaActive = !!result.dhaiya.current;
 
    const currentStatus: 'in_sadesati' | 'in_dhaiya' | 'in_both' | 'clear' =
      isSadeSatiActive && isDhaiyaActive ? 'in_both'     :
      isSadeSatiActive                   ? 'in_sadesati' :
      isDhaiyaActive                     ? 'in_dhaiya'   : 'clear';
 
    const analysisData = {
      sadeSati: {
        past:     result.sadeSati.past     || [],
        current:  result.sadeSati.current,
        upcoming: result.sadeSati.upcoming,
        future:   result.sadeSati.future   || [],
        next:     result.sadeSati.next,
      },
      dhaiya: {
        current:     result.dhaiya.current,
        upcoming4th: result.dhaiya.upcoming4th || [],
        upcoming8th: result.dhaiya.upcoming8th || [],
      },
      saturnCycles:    result.saturnCycles || [],
      // Upcoming analysis — populated when status is 'clear'
      upcomingAnalysis: result.upcomingAnalysis ?? null,
      summary: {
        currentStatus,
        totalSadeSatiPeriods:
          (result.sadeSati.past?.length  || 0) +
          (isSadeSatiActive ? 1 : 0)           +
          (result.sadeSati.future?.length || 0),
        topRecommendations: (result.summary?.topRecommendations || []).slice(0, 5),
      },
      currentSaturn:  result.currentSaturn,
      calculatedAt:   new Date().toISOString(),
    };
 
    return successResponse(analysisData);
 
  } catch (error) {
    logError(error, { context: 'POST /api/transits/saturn/sadesati', bodyKeys: Object.keys(body) });
    throw error;
  }
});
