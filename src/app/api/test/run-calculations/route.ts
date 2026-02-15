/* eslint-disable no-console */
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { compareTestCase } from "@/lib/test/compare-results";
import { logError } from "@/lib/monitoring/errorLogger";
import { validateAdminToken, unauthorizedResponse } from "@/lib/api/adminAuth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TestCase {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  expected_planets: Record<string, { longitude: number; rasi?: string; degree?: number }>;
  expected_ascendant: { longitude: number; rasi?: string; degree?: number };
  expected_dasha: { mahadasha: string; balance_years?: number; balance_months?: number; balance_days?: number };
  planet_tolerance_arcmin: number;
  ascendant_tolerance_arcmin: number;
}

const parseTime24to12 = (time24: string) => {
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours, 10);
  const min = minutes || "00";

  let hour12: number;
  let period: "AM" | "PM";

  if (hour === 0) {
    hour12 = 12;
    period = "AM";
  } else if (hour < 12) {
    hour12 = hour;
    period = "AM";
  } else if (hour === 12) {
    hour12 = 12;
    period = "PM";
  } else {
    hour12 = hour - 12;
    period = "PM";
  }

  return { time: `${hour12}:${min}`, period };
};

export async function GET(request: NextRequest) {
 // ── AUTH CHECK ──────────────────────────────────────────────────────────────
  if (!validateAdminToken(request)) {
    return unauthorizedResponse();
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "started", message: "Starting test run..." })}\n\n`)
        );

        const startTime = Date.now();

        // Fetch all active test cases
        const { data: testCases, error: fetchError } = await supabase
          .from("test_cases")
          .select("*")
          .eq("is_active", true)
          .order("birth_date", { ascending: true });

        if (fetchError) {
          logError("Failed to fetch test cases", new Error(fetchError.message));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", message: `Failed to fetch test cases: ${fetchError.message}` })}\n\n`)
          );
          controller.close();
          return;
        }

        if (!testCases || testCases.length === 0) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", message: "No active test cases found" })}\n\n`)
          );
          controller.close();
          return;
        }

        const totalTests = testCases.length;
        let passedCount = 0;
        let failedCount = 0;
        const allResults: any[] = [];

        for (let i = 0; i < testCases.length; i++) {
          const testCase = testCases[i] as TestCase;
          const currentTest = i + 1;

          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                current: currentTest,
                total: totalTests,
                testName: testCase.name,
                message: `Running test ${currentTest}/${totalTests}: ${testCase.name}`,
              })}\n\n`
            )
          );

          try {
            const { time, period } = parseTime24to12(testCase.birth_time);

            const requestBody = {
              name: testCase.name,
              gender: "Male",
              birthDate: testCase.birth_date,
              birthTime: time,
              timePeriod: period,
              latitude: testCase.latitude,
              longitude: testCase.longitude,
              timezone: testCase.timezone,
           //   cityId: "00000000-0000-0000-0000-000000000000",
            };

            const calculateResponse = await fetch(
             "https://astrotattwa.com/api/calculate",
              {
                method: "POST",
                headers: { 
			"Content-Type": "application/json",
			 "X-Internal-Call": process.env.ADMIN_SECRET_TOKEN || "",  // bypasses rate limit for server→server calls
			 },
                body: JSON.stringify(requestBody),
              }
            );

            if (!calculateResponse.ok) {
              const errorText = await calculateResponse.text();
              logError("Test calculate API failed", new Error(errorText), { testName: testCase.name });
              throw new Error(`API returned ${calculateResponse.status}: ${errorText}`);
            }

            const calculateResult = await calculateResponse.json();
            const actualData = calculateResult.data;

            const comparison = compareTestCase(
              testCase.id,
              testCase.name,
              {
                planets: testCase.expected_planets,
                ascendant: testCase.expected_ascendant,
                dasha: testCase.expected_dasha,
              },
              {
                planets: actualData.planets,
                ascendant: actualData.ascendant,
                dasha: { mahadasha: actualData.dasa?.balance?.classical360?.mahadashaLord || "Unknown" },
                rahuKetuModes: actualData.rahuKetuModes,
              },
              {
                planet: testCase.planet_tolerance_arcmin,
                ascendant: testCase.ascendant_tolerance_arcmin,
              }
            );

            if (comparison.dasha && actualData.dasa?.balance?.classical360?.mahadashaLord) {
              comparison.dasha.actualMahadasha = actualData.dasa.balance.classical360.mahadashaLord;
            }

            const { error: insertError } = await supabase.from("test_case_runs").insert({
              test_case_id: testCase.id,
              status: comparison.status,
              actual_planets: actualData.planets,
              actual_ascendant: actualData.ascendant,
              actual_dasha: actualData.dasa,
              differences: {
                planets: comparison.planets,
                ascendant: comparison.ascendant,
                dasha: comparison.dasha,
                summary: comparison.summary,
              },
            });

            if (insertError) {
              logError("Failed to save test result", new Error(insertError.message), { testName: testCase.name });
            }

            if (comparison.status === "passed") {
              passedCount++;
            } else {
              failedCount++;
            }

            allResults.push(comparison);

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "test_result",
                  testId: testCase.id,
                  testName: testCase.name,
                  status: comparison.status,
                  summary: comparison.summary,
                  planets: comparison.planets,
                  ascendant: comparison.ascendant,
                  dasha: comparison.dasha,
                })}\n\n`
              )
            );
          } catch (error: any) {
            logError(`Test failed: ${testCase.name}`, error, { testCaseId: testCase.id });

            failedCount++;

            await supabase.from("test_case_runs").insert({
              test_case_id: testCase.id,
              status: "failed",
              differences: { error: error.message || "Unknown error" },
            });

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "test_result",
                  testId: testCase.id,
                  testName: testCase.name,
                  status: "failed",
                  error: error.message,
                })}\n\n`
              )
            );
          }
        }

        const executionTime = Date.now() - startTime;

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "completed",
              summary: { total: totalTests, passed: passedCount, failed: failedCount, executionTime },
              results: allResults,
            })}\n\n`
          )
        );

        controller.close();
      } catch (error: any) {
        logError("Test run crashed", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: error.message || "Unknown error occurred" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
