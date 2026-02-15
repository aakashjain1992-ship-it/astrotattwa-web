import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logError } from "@/lib/monitoring/errorLogger";
import { validateAdminToken, unauthorizedResponse } from "@/lib/api/adminAuth";

// Service role client bypasses RLS — safe here because this endpoint is protected
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  if (!validateAdminToken(req)) {
    return unauthorizedResponse();
  }

  try {
    const { data, error } = await supabase
      .from("test_case_runs")
      .select("id, run_at, status, differences, test_case_id")
      .order("run_at", { ascending: false })
      .limit(20);

    if (error) {
      logError("Failed to fetch test history", new Error(error.message));
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    logError("History fetch crashed", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch history" } },
      { status: 500 }
    );
  }
}
