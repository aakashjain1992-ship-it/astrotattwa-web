import { NextRequest } from "next/server";
import { calculatePratyantars } from "@/lib/astrology/kp/dasa";
import { successResponse, withErrorHandling, validationError } from "@/lib/api/errorHandling";
import { rateLimit, RateLimitPresets } from "@/lib/api/rateLimit";
import { logError } from "@/lib/monitoring/errorLogger";

const VALID_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard);

  const { searchParams } = new URL(req.url);

  const mahadashaLord = searchParams.get("mahadashaLord");
  const antardashaLord = searchParams.get("antardashaLord");
  const antardashaStartUtc = searchParams.get("startUtc");
  const antardashaEndUtc = searchParams.get("endUtc");

  if (!mahadashaLord || !antardashaLord || !antardashaStartUtc || !antardashaEndUtc) {
    throw validationError(
      "Required parameters: mahadashaLord, antardashaLord, startUtc, endUtc",
      { example: "/api/dasha/pratyantar?mahadashaLord=Moon&antardashaLord=Mars&startUtc=2024-04-06T01:07:12.600Z&endUtc=2025-02-20T01:07:12.600Z" }
    );
  }

  if (!VALID_LORDS.includes(mahadashaLord) || !VALID_LORDS.includes(antardashaLord)) {
    throw validationError(`Invalid lord. Must be one of: ${VALID_LORDS.join(", ")}`);
  }

  const startDate = new Date(antardashaStartUtc);
  const endDate = new Date(antardashaEndUtc);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw validationError("startUtc and endUtc must be valid ISO date strings");
  }

  let pratyantars;
  try {
    pratyantars = calculatePratyantars(
      mahadashaLord as any,
      antardashaLord as any,
      antardashaStartUtc,
      antardashaEndUtc
    );
  } catch (error) {
    logError("Pratyantar calculation failed", error, { mahadashaLord, antardashaLord, antardashaStartUtc, antardashaEndUtc });
    throw error;
  }

  return successResponse({ mahadashaLord, antardashaLord, pratyantars });
});

