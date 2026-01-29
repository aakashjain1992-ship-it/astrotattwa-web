import { NextResponse } from "next/server";
import { calculateAvakahada } from "@/lib/astrology/kp/avakahada";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const ascendantLongitude = searchParams.get("ascendantLongitude");
    const moonLongitude = searchParams.get("moonLongitude");
    const sunLongitude = searchParams.get("sunLongitude");
    const moonNakshatraIndex = searchParams.get("moonNakshatraIndex");
    const moonNakshatraPada = searchParams.get("moonNakshatraPada");
    const moonNakshatraLord = searchParams.get("moonNakshatraLord");

    // Validation
    if (!ascendantLongitude || !moonLongitude || !sunLongitude || 
        !moonNakshatraIndex || !moonNakshatraPada || !moonNakshatraLord) {
      return NextResponse.json(
        {
          success: false,
          error: "MissingParameters",
          message: "Required parameters: ascendantLongitude, moonLongitude, sunLongitude, moonNakshatraIndex, moonNakshatraPada, moonNakshatraLord",
          example: "/api/avakahada?ascendantLongitude=75.44&moonLongitude=241.94&sunLongitude=341.2&moonNakshatraIndex=18&moonNakshatraPada=1&moonNakshatraLord=Ketu",
        },
        { status: 400 }
      );
    }

    // Parse and validate numbers
    const ascLon = parseFloat(ascendantLongitude);
    const moonLon = parseFloat(moonLongitude);
    const sunLon = parseFloat(sunLongitude);
    const nakIndex = parseInt(moonNakshatraIndex);
    const nakPada = parseInt(moonNakshatraPada);

    if (isNaN(ascLon) || isNaN(moonLon) || isNaN(sunLon) || 
        isNaN(nakIndex) || isNaN(nakPada)) {
      return NextResponse.json(
        {
          success: false,
          error: "InvalidParameter",
          message: "Longitude and index parameters must be valid numbers",
        },
        { status: 400 }
      );
    }

    // Validate ranges
    if (ascLon < 0 || ascLon >= 360 || moonLon < 0 || moonLon >= 360 || 
        sunLon < 0 || sunLon >= 360) {
      return NextResponse.json(
        {
          success: false,
          error: "InvalidParameter",
          message: "Longitudes must be between 0 and 360 degrees",
        },
        { status: 400 }
      );
    }

    if (nakIndex < 0 || nakIndex > 26) {
      return NextResponse.json(
        {
          success: false,
          error: "InvalidParameter",
          message: "Nakshatra index must be between 0 and 26",
        },
        { status: 400 }
      );
    }

    if (nakPada < 1 || nakPada > 4) {
      return NextResponse.json(
        {
          success: false,
          error: "InvalidParameter",
          message: "Nakshatra pada must be between 1 and 4",
        },
        { status: 400 }
      );
    }

    // Validate nakshatra lord
    const validLords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
    if (!validLords.includes(moonNakshatraLord)) {
      return NextResponse.json(
        {
          success: false,
          error: "InvalidParameter",
          message: `Invalid nakshatra lord. Must be one of: ${validLords.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Calculate Avakahada
    const avakahada = calculateAvakahada(
      ascLon,
      moonLon,
      sunLon,
      nakIndex,
      nakPada,
      moonNakshatraLord
    );

    return NextResponse.json({
      success: true,
      data: avakahada,
    });
  } catch (error) {
    console.error("Avakahada calculation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "InternalError",
        message: "Failed to calculate Avakahada attributes. Please try again.",
      },
      { status: 500 }
    );
  }
}
