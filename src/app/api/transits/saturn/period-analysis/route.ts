/**
 * POST /api/transits/saturn/period-analysis
 *
 * On-demand deep analysis for a specific Saturn transit period.
 * Called when a user clicks a row in the Sade Sati timeline.
 *
 * Receives: selected period + chart data
 * Returns:  PeriodAnalysisResult with all 11 factors
 *
 * Key difference from the main sadesati route:
 * - This route computes allMahadashas internally via vimshottariDasha()
 *   because chartData.dasa never includes allMahadashas (a known bug
 *   in the calculate API — see periodAnalyzer.ts Section 3a).
 * - maxDuration: 30s (no Swiss Ephemeris calls, pure math + one DB query)
 */

import { NextRequest } from 'next/server';
import { analyzeSadeSatiPeriod } from '@/lib/astrology/sadesati/periodAnalyzer';
import { successResponse, withErrorHandling, validationError } from '@/lib/api/errorHandling';
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit';
import { logError } from '@/lib/monitoring/errorLogger';
import type { PlanetData, AscendantData } from '@/types/astrology';
import type { SelectedPeriod } from '@/lib/astrology/sadesati/period-analysis-types';

export const maxDuration = 30;

const VALID_TYPES = new Set(['ss_rising', 'ss_peak', 'ss_setting', 'dhaiya_4th', 'dhaiya_8th']);
const VALID_LORDS = new Set(['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']);

export const POST = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard);

  const body = await req.json();
  const {
    selectedPeriod,
    planets,
    ascendant,
    birthDateUtc,
    moonLongitude,
    elapsedFractionOfNakshatra,
    nakshatraLord,
  } = body;

  // ── Validation ────────────────────────────────────────────────────────────

  if (!selectedPeriod || !selectedPeriod.type)
    return validationError('Missing selectedPeriod');

  if (!VALID_TYPES.has(selectedPeriod.type))
    return validationError(`Invalid selectedPeriod.type: ${selectedPeriod.type}`);

  if (!planets || !planets.Moon || !planets.Saturn)
    return validationError('Missing required planet data (Moon, Saturn)');

  if (!ascendant || typeof ascendant.signNumber !== 'number')
    return validationError('Missing or invalid ascendant data');

  if (!birthDateUtc)
    return validationError('Missing birthDateUtc');

  if (typeof moonLongitude !== 'number' || moonLongitude < 0 || moonLongitude >= 360)
    return validationError('moonLongitude must be a number 0–360');

  if (typeof elapsedFractionOfNakshatra !== 'number' || elapsedFractionOfNakshatra < 0 || elapsedFractionOfNakshatra > 1)
    return validationError('elapsedFractionOfNakshatra must be 0–1');

  if (!nakshatraLord || !VALID_LORDS.has(nakshatraLord))
    return validationError(`Invalid nakshatraLord: ${nakshatraLord}`);

  // ── Date parsing ──────────────────────────────────────────────────────────

  const birthDate = new Date(birthDateUtc);
  if (isNaN(birthDate.getTime()))
    return validationError('Invalid birthDateUtc format');

  // Revive date strings in selectedPeriod (JSON serialises Date → string)
  const period: SelectedPeriod = {
    ...selectedPeriod,
    startDate: new Date(selectedPeriod.startDate),
    endDate:   new Date(selectedPeriod.endDate),
    passes:    (selectedPeriod.passes ?? []).map((p: any) => ({
      start: new Date(p.start),
      end:   new Date(p.end),
    })),
  };

  if (isNaN(period.startDate.getTime()) || isNaN(period.endDate.getTime()))
    return validationError('Invalid dates in selectedPeriod');

  // ── Run analysis ──────────────────────────────────────────────────────────

  try {
    const result = await analyzeSadeSatiPeriod(
      period,
      planets.Moon    as PlanetData,
      planets.Saturn  as PlanetData,
      planets         as Record<string, PlanetData>,
      ascendant       as AscendantData,
      birthDate,
      moonLongitude,
      elapsedFractionOfNakshatra,
      nakshatraLord,
    );

    return successResponse(result);
  } catch (error) {
    logError(error, {
      context: 'POST /api/transits/saturn/period-analysis',
      periodType: selectedPeriod.type,
      periodStart: selectedPeriod.startDate,
    });
    throw error;
  }
});
