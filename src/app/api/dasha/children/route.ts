import { NextResponse } from "next/server";
import { buildNineChildren } from "@/lib/astrology/kp/dasa";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parent = body?.parent;
    const yearDays = Number(body?.yearDays ?? 360);

    if (!parent?.lord || !parent?.startUtc || !parent?.endUtc) {
      return NextResponse.json({ success: false, error: "Missing parent {lord,startUtc,endUtc}" }, { status: 400 });
    }

    const start = new Date(parent.startUtc);
    const end = new Date(parent.endUtc);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return NextResponse.json({ success: false, error: "Invalid startUtc/endUtc" }, { status: 400 });
    }

    const durationDays = (end.getTime() - start.getTime()) / 86400000;
    const durationYears = durationDays / yearDays;

    const children = buildNineChildren(parent.lord, durationYears, start, yearDays);

    return NextResponse.json({ success: true, parent, yearDays, children });
  } catch (err: any) {
    console.error("Dasha children API error:", err);
    return NextResponse.json({ success: false, error: err?.message || "Unknown error" }, { status: 500 });
  }
}
