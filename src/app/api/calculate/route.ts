import { NextResponse } from "next/server";
import { calculateKpChart } from "@/lib/astrology/kp/calculate";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Method Not Allowed",
      message: "Use POST /api/calculate with JSON body. This endpoint does not support GET.",
      example: {
        birthDate: "1992-03-25",
        birthTime: "11:55",
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
    const body = await req.json();

    for (const key of ["birthDate", "birthTime", "latitude", "longitude", "timezone"] as const) {
      if (body?.[key] === undefined || body?.[key] === null || body?.[key] === "") {
        return NextResponse.json({ success: false, error: `Missing field: ${key}` }, { status: 400 });
      }
    }

    const chart = await calculateKpChart({
      name: body.name,
      birthDate: String(body.birthDate),
      birthTime: String(body.birthTime),
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      timezone: String(body.timezone),
    });

    return NextResponse.json({ success: true, chart, selfTest: undefined });
  } catch (err: any) {
    console.error("Calculate API error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error", stack: err?.stack },
      { status: 500 }
    );
  }
}
