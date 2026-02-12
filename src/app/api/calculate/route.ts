import { NextRequest, NextResponse } from "next/server";
import { calculateKpChart } from "@/lib/astrology/kp/calculate";
import { chartCalculationSchema } from "@/lib/validation/chart-calculation";
import { roundAllPlanets, roundAscendantDecimals } from "@/lib/utils";
import { convert12to24 } from "@/lib/astrology/time";
import { successResponse, withErrorHandling, calculationError } from "@/lib/api/errorHandling";
import { rateLimit, RateLimitPresets } from "@/lib/api/rateLimit";
import { logError } from "@/lib/monitoring/errorLogger";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: { code: "METHOD_NOT_ALLOWED", message: "Use POST /api/calculate with JSON body." },
      example: {
        name: "Aakash Jain",
        gender: "male",
        birthDate: "1992-03-25",
        birthTime: "11:55",
        timePeriod: "AM",
        cityId: 1,
        latitude: 28.6139,
        longitude: 77.209,
        timezone: "Asia/Kolkata",
      },
    },
    { status: 405 }
  );
}

export const POST = withErrorHandling(async (req: NextRequest) => {
  // Rate limit: 5 requests per minute (expensive calculation)
  await rateLimit(req, RateLimitPresets.strict);

  // 1. Parse and validate request body
  const body = await req.json();
  const validationResult = chartCalculationSchema.safeParse(body);

  if (!validationResult.success) {
    throw validationResult.error;
  }

  const { name, gender, birthDate, birthTime, timePeriod, cityId, latitude, longitude, timezone } =
    validationResult.data;

  // 2. Convert 12-hour time to 24-hour format
  const birthTime24 = convert12to24(birthTime, timePeriod);

  // 3. Calculate chart
  let chart;
  try {
    chart = await calculateKpChart({ birthDate, birthTime: birthTime24, latitude, longitude, timezone });
  } catch (error) {
    logError("Chart calculation failed", error, { birthDate, birthTime: birthTime24, latitude, longitude, timezone });
    throw calculationError("Failed to calculate chart. Please verify your birth data.");
  }

  // 4. Round all decimals and return
  const roundedChart = {
    ...chart,
    name,
    gender,
    timePeriod,
    cityId,
    planets: chart.planets ? roundAllPlanets(chart.planets) : chart.planets,
    ascendant: chart.ascendant ? roundAscendantDecimals(chart.ascendant) : chart.ascendant,
    rahuKetuModes: chart.rahuKetuModes,
  };

  return successResponse(roundedChart);
});
