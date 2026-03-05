/**
 * FILE 8: src/app/api/transits/saturn/summary/route.ts
 * 
 * Returns quick summary of Saturn transits (for indicator dot)
 * Used to show orange dot on Sade Sati tab when currently active
 * 
 * Returns: ~1KB JSON with current status
 */

import { NextRequest } from "next/server";
import { calculateLifetimeSadeSati } from "@/lib/astrology/saturn/calculator-PROFESSIONAL";
import { successResponse, withErrorHandling, validationError } from "@/lib/api/errorHandling";
import { rateLimit, RateLimitPresets } from "@/lib/api/rateLimit";
import { logError } from "@/lib/monitoring/errorLogger";

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard);

  const { searchParams } = new URL(req.url);

  const moonLongitude = searchParams.get('moonLongitude');
  const birthDateUtc = searchParams.get('birthDateUtc');

  // Validate required parameters
  if (!moonLongitude || !birthDateUtc) {
    throw validationError(
      "Required parameters: moonLongitude, birthDateUtc",
      { 
        example: "/api/transits/saturn/summary?moonLongitude=211.95&birthDateUtc=1992-03-25T06:25:00.000Z" 
      }
    );
  }

  // Validate numeric parameter
  const moonLongNum = parseFloat(moonLongitude);
  if (isNaN(moonLongNum)) {
    throw validationError("moonLongitude must be a valid number");
  }

  if (moonLongNum < 0 || moonLongNum >= 360) {
    throw validationError("moonLongitude must be between 0 and 360");
  }

  // Validate birth date
  const birthDate = new Date(birthDateUtc);
  if (isNaN(birthDate.getTime())) {
    throw validationError("birthDateUtc must be a valid ISO date string");
  }

  const currentDate = new Date();

  // Calculate Sade Sati periods
  let sadeSatiPeriods;
  try {
    sadeSatiPeriods = await calculateLifetimeSadeSati(
      moonLongNum,
      birthDate,
      currentDate
    );
  } catch (error) {
    logError("Saturn summary calculation failed", error, {
      moonLongitude: moonLongNum,
      birthDateUtc
    });
    throw error;
  }

  // Find if currently active
  const activePeriod = sadeSatiPeriods.find(period => 
    currentDate >= period.startDate && currentDate <= period.endDate
  );

  return successResponse({
    isCurrentlyActive: !!activePeriod,
    activePeriod: activePeriod || null,
    totalPeriods: sadeSatiPeriods.length
  });
});
