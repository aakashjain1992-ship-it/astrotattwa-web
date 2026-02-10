import { NextResponse } from "next/server";
import { getCurrentPeriods } from "@/lib/astrology/kp/dasa";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const birthDateUtc = searchParams.get("birthDateUtc");
    const nakLord = searchParams.get("nakLord");
    const balanceYears = searchParams.get("balanceYears");

    // Validation
    if (!birthDateUtc || !nakLord || !balanceYears) {
      return NextResponse.json(
        {
          success: false,
          error: "MissingParameters",
          message: "Required parameters: birthDateUtc, nakLord, balanceYears",
          example: "/api/dasha/current?birthDateUtc=1992-03-25T06:25:00.000Z&nakLord=Ketu&balanceYears=6.03225",
        },
        { status: 400 }
      );
    }

    // Validate nakLord
    const validLords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
    if (!validLords.includes(nakLord)) {
      return NextResponse.json(
        {
          success: false,
          error: "InvalidParameter",
          message: `Invalid nakLord. Must be one of: ${validLords.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate dates
    const birthDate = new Date(birthDateUtc);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "InvalidDate",
          message: "birthDateUtc must be a valid ISO date string",
        },
        { status: 400 }
      );
    }

    // Validate balanceYears
    const balance = parseFloat(balanceYears);
    if (isNaN(balance) || balance < 0 || balance > 20) {
      return NextResponse.json(
        {
          success: false,
          error: "InvalidParameter",
          message: "balanceYears must be a number between 0 and 20",
        },
        { status: 400 }
      );
    }

    // Calculate current periods
    const currentPeriods = getCurrentPeriods(
      birthDate,
      nakLord as any,
      balance
    );

    if (!currentPeriods) {
      return NextResponse.json(
        {
          success: false,
          error: "CalculationError",
          message: "Could not determine current dasha periods",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        currentDate: new Date().toISOString(),
        ...currentPeriods,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "InternalError",
        message: "Failed to calculate current periods. Please try again.",
      },
      { status: 500 }
    );
  }
}
