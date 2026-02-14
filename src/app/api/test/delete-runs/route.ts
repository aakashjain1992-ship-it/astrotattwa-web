import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logError } from "@/lib/monitoring/errorLogger";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE() {
  try {
    const { error } = await supabase
      .from("test_case_runs")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      logError("Failed to delete test runs", new Error(error.message));
      return NextResponse.json(
        { success: false, error: { code: "DATABASE_ERROR", message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "All test runs deleted successfully" },
    });
  } catch (error) {
    logError("Delete runs failed", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete test runs" } },
      { status: 500 }
    );
  }
}

