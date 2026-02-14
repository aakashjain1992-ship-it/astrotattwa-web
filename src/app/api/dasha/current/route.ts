import { NextRequest } from "next/server";
import { getCurrentPeriods } from "@/lib/astrology/kp/dasa";
import { successResponse, withErrorHandling, validationError, calculationError } from "@/lib/api/errorHandling";
import { rateLimit, RateLimitPresets } from "@/lib/api/rateLimit";
import { logError } from "@/lib/monitoring/errorLogger";

const VALID_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard);

  const { searchParams } = new URL(req.url);

  const birthDateUtc = searchParams.get("birthDateUtc");
  const nakLord = searchParams.get("nakLord");
  const balanceYears = searchParams.get("balanceYears");

  if (!birthDateUtc || !nakLord || !balanceYears) {
    throw validationError(
      "Required parameters: birthDateUtc, nakLord, balanceYears",
      { example: "/api/dasha/current?birthDateUtc=1992-03-25T06:25:00.000Z&nakLord=Ketu&balanceYears=6.03225" }
    );
  }

  if (!VALID_LORDS.includes(nakLord)) {
    throw validationError(`Invalid nakLord. Must be one of: ${VALID_LORDS.join(", ")}`);
  }

  const birthDate = new Date(birthDateUtc);
  if (isNaN(birthDate.getTime())) {
    throw validationError("birthDateUtc must be a valid ISO date string");
  }

  const balance = parseFloat(balanceYears);
  if (isNaN(balance) || balance < 0 || balance > 20) {
    throw validationError("balanceYears must be a number between 0 and 20");
  }

  let currentPeriods;
  try {
    currentPeriods = getCurrentPeriods(birthDate, nakLord as any, balance);
  } catch (error) {
    logError("Current dasha calculation failed", error, { birthDateUtc, nakLord, balance });
    throw error;
  }

  if (!currentPeriods) {
    logError("getCurrentPeriods returned null", undefined, { birthDateUtc, nakLord, balance });
    throw calculationError("Could not determine current dasha periods");
  }

  return successResponse({
    currentDate: new Date().toISOString(),
    ...currentPeriods,
  });
});

