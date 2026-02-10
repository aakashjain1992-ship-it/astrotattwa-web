import { NextResponse } from "next/server";
import { calculateAntardashas } from "@/lib/astrology/kp/dasa";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const mahadashaLord = searchParams.get("mahadashaLord");
    const mahadashaStartUtc = searchParams.get("startUtc");
    const mahadashaEndUtc = searchParams.get("endUtc");

    // Validation
    if (!mahadashaLord || !mahadashaStartUtc || !mahadashaEndUtc) {
      return NextResponse.json(
        {
          success: false,
          error: "MissingParameters",
          message: "Required parameters: mahadashaLord, startUtc, endUtc",
          example: "/api/dasha/antardasha?mahadashaLord=Moon&startUtc=2024-04-06T01:07:12.600Z&endUtc=2034-04-06T13:07:12.600Z",
        },
        { status: 400 }
      );
    }

    // Validate mahadashaLord
    const validLords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
    if (!validLords.includes(mahadashaLord)) {
      return NextResponse.json(
        {
          success: false,
          error: "InvalidParameter",
          message: `Invalid mahadashaLord. Must be one of: ${validLords.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(mahadashaStartUtc);
    const endDate = new Date(mahadashaEndUtc);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "InvalidDate",
          message: "startUtc and endUtc must be valid ISO date strings",
        },
        { status: 400 }
      );
    }

    // Calculate antardashas
    const antardashas = calculateAntardashas(
      mahadashaLord as any,
      mahadashaStartUtc,
      mahadashaEndUtc
    );

    return NextResponse.json({
      success: true,
      data: {
        mahadashaLord,
        antardashas,
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "InternalError",
        message: "Failed to calculate antardashas. Please try again.",
      },
      { status: 500 }
    );
  }
}
