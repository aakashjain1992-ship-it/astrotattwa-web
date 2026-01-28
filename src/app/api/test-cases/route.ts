export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getEnv(name: string): string {
  // Read env at runtime, not build time
  const v = (globalThis as any).process?.env?.[name];
  return (typeof v === "string" ? v : "").trim();
}

function getSupabase() {
  const url = getEnv("SUPABASE_URL") || getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  // Debug once per request (you can remove later)
  console.log("TEST-CASES ENV DEBUG (runtime)", {
    SUPABASE_URL: url ? "[set]" : "",
    NEXT_PUBLIC_SUPABASE_URL: getEnv("NEXT_PUBLIC_SUPABASE_URL") ? "[set]" : "",
    hasServiceRole: !!key,
  });

  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error("Invalid/missing SUPABASE URL env (SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL)");
  }
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, { auth: { persistSession: false } });
}

function hhmm(t: string | null | undefined) {
  if (!t) return null;
  const parts = t.split(":");
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : t;
}

export async function GET() {
  try {
    const sb = getSupabase();

    const { data, error } = await sb
      .from("test_cases")
      .select(
        `
        id,
        name,
        gender,
        birth_date,
        birth_time,
        timezone,
        city_id,
        cities!inner (
          name,
          state_name,
          country,
          longitude,
          latitude
        )
      `
      )
      .order("name", { ascending: true })
      .limit(100);

    if (error) throw error;

    const items = (data ?? []).map((row: any) => {
      const c = row.cities;
      const latitude = c?.latitude != null ? Number(c.latitude) : null;
      const longitude = c?.longitude != null ? Number(c.longitude) : null;

      return {
        id: row.id,
        name: row.name,
        gender: row.gender,
        birthDate: row.birth_date,
        birthTime: hhmm(row.birth_time),
        timezone: row.timezone,
        city_id: row.city_id,

        city_name: c?.name ?? null,
        state_name: c?.state_name ?? null,
        country: c?.country ?? null,
        latitude,
        longitude,

        locationLabel: [c?.name, c?.state_name, c?.country].filter(Boolean).join(", "),
      };
    });

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    console.error("test-cases API error:", err);
    return NextResponse.json({ success: false, error: err?.message || "Unknown error" }, { status: 500 });
  }
}
