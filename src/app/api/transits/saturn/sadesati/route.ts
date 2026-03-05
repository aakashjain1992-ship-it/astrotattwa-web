/**
 * FILE 9: src/app/api/transits/saturn/sadesati/route.ts
 * 
 * Returns complete Saturn transit analysis (Sade Sati + Dhaiya)
 * Called by SadeSatiTableView component when user clicks "Sade Sati" tab
 * 
 * Returns: ~50KB JSON with lifetime Saturn transits
 */

import { NextRequest } from "next/server";
import { 
  calculateLifetimeSadeSati, 
  calculateLifetimeDhaiya 
} from "@/lib/astrology/saturn/calculator-PROFESSIONAL";
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
        example: "/api/transits/saturn/sadesati?moonLongitude=211.95&birthDateUtc=1992-03-25T06:25:00.000Z" 
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

  // Calculate both Sade Sati and Dhaiya
  let sadeSatiPeriods, dhaiyaPeriods;
  try {
    [sadeSatiPeriods, dhaiyaPeriods] = await Promise.all([
      calculateLifetimeSadeSati(moonLongNum, birthDate, currentDate),
      calculateLifetimeDhaiya(moonLongNum, birthDate, currentDate)
    ]);
  } catch (error) {
    logError("Saturn transit calculation failed", error, {
      moonLongitude: moonLongNum,
      birthDateUtc
    });
    throw error;
  }

  // Find current periods
  const currentSadeSati = sadeSatiPeriods.find(p => 
    currentDate >= p.startDate && currentDate <= p.endDate
  );

  const currentDhaiya = dhaiyaPeriods.find(p =>
    currentDate >= p.startDate && currentDate <= p.endDate
  );

  return successResponse({
    sadeSati: {
      current: {
        isActive: !!currentSadeSati,
        period: currentSadeSati || null
      },
      allPeriods: sadeSatiPeriods
    },
    dhaiya: {
      current: {
        isActive: !!currentDhaiya,
        period: currentDhaiya || null
      },
      allPeriods: dhaiyaPeriods
    },
    calculatedAt: new Date().toISOString()
  });
});
