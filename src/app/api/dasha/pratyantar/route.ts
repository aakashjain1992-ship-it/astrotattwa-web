import { NextResponse } from "next/server";
import { calculatePratyantars } from "@/lib/astrology/kp/dasa";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const mahadashaLord = searchParams.get("mahadashaLord");
    const antardashaLord = searchParams.get("antardashaLord");
    const antardashaStartUtc = searchParams.get("startUtc");
    const antardashaEndUtc = searchParams.get("endUtc");

    // Validation
    if (!mahadashaLord || !antardashaLord || !antardashaStartUtc || !antardashaEndUtc) {
      return NextResponse.json(
        {
          success: false,
          error: "MissingParameters",
          message: "Required parameters: mahadashaLord, antardashaLord, startUtc, endUtc",
          example: "/api/dasha/pratyantar?mahadashaLord=Moon&antardashaLord=Mars&startUtc=2024-04-06T01:07:12.600Z&endUtc=2025-02-20T01:07:12.600Z",
        },
        { status: 400 }
      );
    }

    // Validate lords
    const validLords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
    if (!validLords.includes(mahadashaLord) || !validLords.includes(antardashaLord)) {
      return NextResponse.json(
        {
          success: false,
          error: "InvalidParameter",
          message: `Invalid lord. Must be one of: ${validLords.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(antardashaStartUtc);
    const endDate = new Date(antardashaEndUtc);
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

    // Calculate pratyantars
    const pratyantars = calculatePratyantars(
      mahadashaLord as any,
      antardashaLord as any,
      antardashaStartUtc,
      antardashaEndUtc
    );

    return NextResponse.json({
      success: true,
      data: {
        mahadashaLord,
        antardashaLord,
        pratyantars,
      },
    });
  } catch (error) {
    console.error("Pratyantar calculation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "InternalError",
        message: "Failed to calculate pratyantars. Please try again.",
      },
      { status: 500 }
    );
  }
}
