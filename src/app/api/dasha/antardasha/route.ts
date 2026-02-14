import { NextRequest } from "next/server";
import { calculateAntardashas } from "@/lib/astrology/kp/dasa";
import { successResponse, withErrorHandling, validationError } from "@/lib/api/errorHandling";
import { rateLimit, RateLimitPresets } from "@/lib/api/rateLimit";
import { logError } from "@/lib/monitoring/errorLogger";

const VALID_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard);

  const { searchParams } = new URL(req.url);

  const mahadashaLord = searchParams.get("mahadashaLord");
  const mahadashaStartUtc = searchParams.get("startUtc");
  const mahadashaEndUtc = searchParams.get("endUtc");

  if (!mahadashaLord || !mahadashaStartUtc || !mahadashaEndUtc) {
    throw validationError(
      "Required parameters: mahadashaLord, startUtc, endUtc",
      { example: "/api/dasha/antardasha?mahadashaLord=Moon&startUtc=2024-04-06T01:07:12.600Z&endUtc=2034-04-06T13:07:12.600Z" }
    );
  }

  if (!VALID_LORDS.includes(mahadashaLord)) {
    throw validationError(`Invalid mahadashaLord. Must be one of: ${VALID_LORDS.join(", ")}`);
  }

  const startDate = new Date(mahadashaStartUtc);
  const endDate = new Date(mahadashaEndUtc);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw validationError("startUtc and endUtc must be valid ISO date strings");
  }

  let antardashas;
  try {
    antardashas = calculateAntardashas(mahadashaLord as any, mahadashaStartUtc, mahadashaEndUtc);
  } catch (error) {
    logError("Antardasha calculation failed", error, { mahadashaLord, mahadashaStartUtc, mahadashaEndUtc });
    throw error;
  }

  return successResponse({ mahadashaLord, antardashas });
});

