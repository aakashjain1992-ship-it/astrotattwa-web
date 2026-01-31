import { NextResponse } from "next/server";
import { calculateKpChart } from "@/lib/astrology/kp/calculate";
import { chartCalculationSchema } from "@/lib/validation/chart-calculation";
import { roundAllPlanets, roundAscendantDecimals } from "@/lib/utils";
import { convert12to24 } from "@/lib/astrology/time";


export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Method Not Allowed",
      message: "Use POST /api/calculate with JSON body.",
      example: {
        name: "Aakash Jain",
        gender: "male",
        birthDate: "1992-03-25",
        birthTime: "11:55",
        timePeriod: "AM",
        cityId: "550e8400-e29b-41d4-a716-446655440000",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: "Asia/Kolkata",
      },
    },
    { status: 405 }
  );
}

export async function POST(req: Request) {
  try {
    // 1. Parse request body
    const body = await req.json();

    // 2. Validate with Zod schema
    const validationResult = chartCalculationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "ValidationError",
          message: "Invalid input data",
          details: validationResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    // 3. Use validated data
    const {
      name,
      gender,
      birthDate,
      birthTime,
      timePeriod,
      cityId,
      latitude,
      longitude,
      timezone,
    } = validationResult.data;

   // 4. Convert 12-hour time to 24-hour format
    const birthTime24 = convert12to24(birthTime, timePeriod);
    
  // 5. Calculate chart with 24-hour time
    const chart = await calculateKpChart({
      birthDate,
      birthTime: birthTime24,  // Use converted 24-hour time
      latitude,
      longitude,
      timezone,
    });

    // 6. Round all decimals to 2 places (NEW - Day 1, Task 4)
    const roundedChart = {
      ...chart,
      // Add new fields to response
      name,
      gender,
      timePeriod,
      cityId,
      // Round planetary positions
      planets: chart.planets ? roundAllPlanets(chart.planets) : chart.planets,
      // Round ascendant
      ascendant: chart.ascendant
        ? roundAscendantDecimals(chart.ascendant)
        : chart.ascendant,
    };

    // 7. Return response
    return NextResponse.json({
      success: true,
      data: roundedChart,
    });
  } catch (error) {
    console.error("Chart calculation error:", error);

    // Don't expose internal error details to client
    return NextResponse.json(
      {
        success: false,
        error: "InternalError",
        message: "Failed to calculate chart. Please try again.",
      },
      { status: 500 }
    );
  }
}
