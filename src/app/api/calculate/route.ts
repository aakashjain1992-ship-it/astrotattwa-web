import { NextRequest, NextResponse } from "next/server";
import { calculateBirthChart } from "@/lib/astrology/core/calculate";
import { chartCalculationSchema } from "@/lib/validation/chart-calculation";
import { roundAllPlanets } from "@/lib/utils";
import { convert12to24 } from "@/lib/astrology/time";
import { successResponse, withErrorHandling, calculationError } from "@/lib/api/errorHandling";
import { rateLimit, RateLimitPresets } from "@/lib/api/rateLimit";
import { logError } from "@/lib/monitoring/errorLogger";


/**
 * Generate a unique chart ID
 * Format: chart_<timestamp>_<random>
 * Example: chart_1709654321000_a7f3
 */

function generateChartId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `chart_${timestamp}_${random}`;
}

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
        birthPlace: "Baghpat, Uttar Pradesh",
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

  const { name, gender, birthDate, birthTime, timePeriod, birthPlace, latitude, longitude, timezone } =
    validationResult.data;

  // 2. Convert 12-hour time to 24-hour format
  const birthTime24 = convert12to24(birthTime, timePeriod);

  // 3. Calculate chart
  let chart;
  try {
  chart = await calculateBirthChart({
      name,
      gender,
      birthDate,
      birthTime: birthTime24,
      birthPlace,
      timePeriod,
      latitude,
      longitude,
      timezone
    });  } catch (error) {
    logError("Chart calculation failed", error, { birthDate, birthTime: birthTime24, latitude, longitude, timezone });
    throw calculationError("Failed to calculate chart. Please verify your birth data.");
  }

  // 4. Round all decimals and return
  const roundedChart = {
    id: generateChartId(),
    createdAt: new Date().toISOString(),
    ...chart,
    planets: chart.planets ? roundAllPlanets(chart.planets) : chart.planets,
    rahuKetuModes: chart.rahuKetuModes,
  };

  return successResponse(roundedChart);
});
