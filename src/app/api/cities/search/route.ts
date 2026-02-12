import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, withErrorHandling, validationError } from "@/lib/api/errorHandling";
import { rateLimit, RateLimitPresets } from "@/lib/api/rateLimit";
import { logError } from "@/lib/monitoring/errorLogger";

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.lenient);

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return successResponse({ cities: [] });
  }

  const supabase = await createClient();
  const searchPattern = `%${query}%`;

  const { data, error } = await supabase
    .from("cities")
    .select("id, city_name, state_name, country, latitude, longitude, timezone")
    .or(`city_name.ilike.${searchPattern},state_name.ilike.${searchPattern}`)
    .order("city_name")
    .limit(10);

  if (error) {
    logError("City search failed", new Error(error.message), { query });
    throw new Error("City search failed");
  }

  return successResponse({ cities: data || [] });
});

