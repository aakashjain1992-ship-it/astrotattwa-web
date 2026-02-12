import { NextRequest } from "next/server";
import { calculateAvakahada } from "@/lib/astrology/kp/avakahada";
import { successResponse, withErrorHandling, validationError } from "@/lib/api/errorHandling";
import { rateLimit, RateLimitPresets } from "@/lib/api/rateLimit";
import { logError } from "@/lib/monitoring/errorLogger";

const VALID_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard);

  const { searchParams } = new URL(req.url);

  const ascendantLongitude = searchParams.get("ascendantLongitude");
  const moonLongitude = searchParams.get("moonLongitude");
  const sunLongitude = searchParams.get("sunLongitude");
  const moonNakshatraIndex = searchParams.get("moonNakshatraIndex");
  const moonNakshatraPada = searchParams.get("moonNakshatraPada");
  const moonNakshatraLord = searchParams.get("moonNakshatraLord");

  // Check required params
  if (!ascendantLongitude || !moonLongitude || !sunLongitude ||
      !moonNakshatraIndex || !moonNakshatraPada || !moonNakshatraLord) {
    throw validationError(
      "Required parameters: ascendantLongitude, moonLongitude, sunLongitude, moonNakshatraIndex, moonNakshatraPada, moonNakshatraLord",
      { example: "/api/avakahada?ascendantLongitude=75.44&moonLongitude=241.94&sunLongitude=341.2&moonNakshatraIndex=18&moonNakshatraPada=1&moonNakshatraLord=Ketu" }
    );
  }

  // Parse numbers
  const ascLon = parseFloat(ascendantLongitude);
  const moonLon = parseFloat(moonLongitude);
  const sunLon = parseFloat(sunLongitude);
  const nakIndex = parseInt(moonNakshatraIndex);
  const nakPada = parseInt(moonNakshatraPada);

  if (isNaN(ascLon) || isNaN(moonLon) || isNaN(sunLon) || isNaN(nakIndex) || isNaN(nakPada)) {
    throw validationError("Longitude and index parameters must be valid numbers");
  }

  // Validate ranges
  if (ascLon < 0 || ascLon >= 360 || moonLon < 0 || moonLon >= 360 || sunLon < 0 || sunLon >= 360) {
    throw validationError("Longitudes must be between 0 and 360 degrees");
  }

  if (nakIndex < 0 || nakIndex > 26) {
    throw validationError("Nakshatra index must be between 0 and 26");
  }

  if (nakPada < 1 || nakPada > 4) {
    throw validationError("Nakshatra pada must be between 1 and 4");
  }

  if (!VALID_LORDS.includes(moonNakshatraLord)) {
    throw validationError(`Invalid nakshatra lord. Must be one of: ${VALID_LORDS.join(", ")}`);
  }

  // Calculate
  let avakahada;
  try {
    avakahada = calculateAvakahada(ascLon, moonLon, sunLon, nakIndex, nakPada, moonNakshatraLord);
  } catch (error) {
    logError("Avakahada calculation failed", error, { ascLon, moonLon, sunLon, nakIndex, nakPada });
    throw error;
  }

  return successResponse(avakahada);
});

