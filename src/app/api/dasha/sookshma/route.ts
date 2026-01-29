import { NextResponse } from "next/server";
import { calculateSookshmas } from "@/lib/astrology/kp/dasa";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const mahadashaLord = searchParams.get("mahadashaLord");
    const antardashaLord = searchParams.get("antardashaLord");
    const pratyantarLord = searchParams.get("pratyantarLord");
    const pratyantarStartUtc = searchParams.get("startUtc");
    const pratyantarEndUtc = searchParams.get("endUtc");

    // Validation
    if (!mahadashaLord || !antardashaLord || !pratyantarLord || !pratyantarStartUtc || !pratyantarEndUtc) {
      return NextResponse.json(
        {
          success: false,
          error: "MissingParameters",
          message: "Required parameters: mahadashaLord, antardashaLord, pratyantarLord, startUtc, endUtc",
          example: "/api/dasha/sookshma?mahadashaLord=Moon&antardashaLord=Mars&pratyantarLord=Rahu&startUtc=2024-04-06T01:07:12.600Z&endUtc=2024-05-01T01:07:12.600Z",
        },
        { status: 400 }
      );
    }

    // Validate lords
    const validLords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
    if (!validLords.includes(mahadashaLord) || !validLords.includes(antardashaLord) || !validLords.includes(pratyantarLord)) {
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
    const startDate = new Date(pratyantarStartUtc);
    const endDate = new Date(pratyantarEndUtc);
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

    // Calculate sookshmas
    const sookshmas = calculateSookshmas(
      mahadashaLord as any,
      antardashaLord as any,
      pratyantarLord as any,
      pratyantarStartUtc,
      pratyantarEndUtc
    );

    return NextResponse.json({
      success: true,
      data: {
        mahadashaLord,
        antardashaLord,
        pratyantarLord,
        sookshmas,
      },
    });
  } catch (error) {
    console.error("Sookshma calculation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "InternalError",
        message: "Failed to calculate sookshmas. Please try again.",
      },
      { status: 500 }
    );
  }
}
