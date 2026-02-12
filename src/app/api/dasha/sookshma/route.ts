import { NextRequest } from "next/server";
import { calculateSookshmas } from "@/lib/astrology/kp/dasa";
import { successResponse, withErrorHandling, validationError } from "@/lib/api/errorHandling";
import { rateLimit, RateLimitPresets } from "@/lib/api/rateLimit";
import { logError } from "@/lib/monitoring/errorLogger";

const VALID_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard);

  const { searchParams } = new URL(req.url);

  const mahadashaLord = searchParams.get("mahadashaLord");
  const antardashaLord = searchParams.get("antardashaLord");
  const pratyantarLord = searchParams.get("pratyantarLord");
  const pratyantarStartUtc = searchParams.get("startUtc");
  const pratyantarEndUtc = searchParams.get("endUtc");

  if (!mahadashaLord || !antardashaLord || !pratyantarLord || !pratyantarStartUtc || !pratyantarEndUtc) {
    throw validationError(
      "Required parameters: mahadashaLord, antardashaLord, pratyantarLord, startUtc, endUtc",
      { example: "/api/dasha/sookshma?mahadashaLord=Moon&antardashaLord=Mars&pratyantarLord=Rahu&startUtc=2024-04-06T01:07:12.600Z&endUtc=2024-05-01T01:07:12.600Z" }
    );
  }

  if (!VALID_LORDS.includes(mahadashaLord) || !VALID_LORDS.includes(antardashaLord) || !VALID_LORDS.includes(pratyantarLord)) {
    throw validationError(`Invalid lord. Must be one of: ${VALID_LORDS.join(", ")}`);
  }

  const startDate = new Date(pratyantarStartUtc);
  const endDate = new Date(pratyantarEndUtc);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw validationError("startUtc and endUtc must be valid ISO date strings");
  }

  let sookshmas;
  try {
    sookshmas = calculateSookshmas(
      mahadashaLord as any,
      antardashaLord as any,
      pratyantarLord as any,
      pratyantarStartUtc,
      pratyantarEndUtc
    );
  } catch (error) {
    logError("Sookshma calculation failed", error, { mahadashaLord, antardashaLord, pratyantarLord, pratyantarStartUtc, pratyantarEndUtc });
    throw error;
  }

  return successResponse({ mahadashaLord, antardashaLord, pratyantarLord, sookshmas });
});

