/**
 * FILE 6: src/app/api/dasha/mahadashas/route.ts
 * 
 * API endpoint to calculate complete 120-year Vimshottari Dasha timeline
 * Called by DashaNavigator component when user clicks "Dasha Timeline" tab
 * 
 * Returns: ~30KB JSON with all 9 mahadasha periods
 */

import { NextRequest } from "next/server";
import { vimshottariDasha } from "@/lib/astrology/kp/dasa";
import { successResponse, withErrorHandling, validationError } from "@/lib/api/errorHandling";
import { rateLimit, RateLimitPresets } from "@/lib/api/rateLimit";
import { logError } from "@/lib/monitoring/errorLogger";

const VALID_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard);

  const { searchParams } = new URL(req.url);

  // Extract query parameters
  const moonLongitude = searchParams.get('moonLongitude');
  const birthDateUtc = searchParams.get('birthDateUtc');
  const elapsedFraction = searchParams.get('elapsedFraction');
  const nakLord = searchParams.get('nakLord');

  // Validate required parameters
  if (!moonLongitude || !birthDateUtc || !elapsedFraction || !nakLord) {
    throw validationError(
      "Required parameters: moonLongitude, birthDateUtc, elapsedFraction, nakLord",
      { 
        example: "/api/dasha/mahadashas?moonLongitude=211.95&birthDateUtc=1992-03-25T06:25:00.000Z&elapsedFraction=0.123&nakLord=Ketu" 
      }
    );
  }

  // Validate nakLord
  if (!VALID_LORDS.includes(nakLord)) {
    throw validationError(`Invalid nakLord. Must be one of: ${VALID_LORDS.join(", ")}`);
  }

  // Validate numeric parameters
  const moonLongNum = parseFloat(moonLongitude);
  const elapsedFracNum = parseFloat(elapsedFraction);
  
  if (isNaN(moonLongNum) || isNaN(elapsedFracNum)) {
    throw validationError("moonLongitude and elapsedFraction must be valid numbers");
  }

  if (moonLongNum < 0 || moonLongNum >= 360) {
    throw validationError("moonLongitude must be between 0 and 360");
  }

  if (elapsedFracNum < 0 || elapsedFracNum > 1) {
    throw validationError("elapsedFraction must be between 0 and 1");
  }

  // Validate birth date
  const birthDate = new Date(birthDateUtc);
  if (isNaN(birthDate.getTime())) {
    throw validationError("birthDateUtc must be a valid ISO date string");
  }

  // Calculate complete dasha timeline (120 years)
  let dashaResult;
  try {
    dashaResult = vimshottariDasha(
      moonLongNum,
      birthDate,
      elapsedFracNum,
      nakLord as any,
      360 // Use 360-day year (classical Vedic)
    );
  } catch (error) {
    logError("Mahadasha calculation failed", error, {
      moonLongitude: moonLongNum,
      birthDateUtc,
      elapsedFraction: elapsedFracNum,
      nakLord
    });
    throw error;
  }

  return successResponse({
    allMahadashas: dashaResult.allMahadashas,
    balance: dashaResult.balance,
    currentMahadasha: dashaResult.currentMahadasha,
  });
});
