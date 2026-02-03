
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { compareTestCase } from '@/lib/test/compare-results';

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

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial event
    console.log('🚀 TEST RUNNER STARTED');
       
 controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'started', message: 'Starting test run...' })}\n\n`)
        );

        const startTime = Date.now();

        // 1. Fetch all active test cases from Supabase
        const { data: testCases, error: fetchError } = await supabase
          .from('test_cases')
          .select('*')
          .eq('is_active', true)
          .order('birth_date', { ascending: true });

        if (fetchError) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: `Failed to fetch test cases: ${fetchError.message}` })}\n\n`)
          );
          controller.close();
          return;
        }

        if (!testCases || testCases.length === 0) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'No active test cases found' })}\n\n`)
          );
          controller.close();
          return;
        }

        const totalTests = testCases.length;
        let passedCount = 0;
        let failedCount = 0;
        const allResults: any[] = [];

        // 2. Run each test case
        for (let i = 0; i < testCases.length; i++) {
          const testCase = testCases[i] as TestCase;
          const currentTest = i + 1;
if (i > 0) {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

          // Send progress update
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'progress',
                current: currentTest,
                total: totalTests,
                testName: testCase.name,
                message: `Running test ${currentTest}/${totalTests}: ${testCase.name}`,
              })}\n\n`
            )
          );

          try {
            // 3. Call /api/calculate
            
const parseTime24to12 = (time24: string) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const min = minutes || '00';
  
  let hour12: number;
  let period: 'AM' | 'PM';
  
  if (hour === 0) {
    // Midnight: 00:00 → 12:00 AM
    hour12 = 12;
    period = 'AM';
  } else if (hour < 12) {
    // Morning: 01:00-11:59 → 1:00-11:59 AM
    hour12 = hour;
    period = 'AM';
  } else if (hour === 12) {
    // Noon: 12:00 → 12:00 PM
    hour12 = 12;
    period = 'PM';
  } else {
    // Afternoon/Evening: 13:00-23:59 → 1:00-11:59 PM
    hour12 = hour - 12;
    period = 'PM';
  }
  
  return {
    time: `${hour12}:${min}`,
    period: period
  };
};

const { time, period } = parseTime24to12(testCase.birth_time);



const requestBody = {
name: testCase.name,
gender: 'Male',
                birthDate: testCase.birth_date,
                birthTime: time,
                timePeriod: period,
                latitude: testCase.latitude,
                longitude: testCase.longitude,
                timezone: testCase.timezone,
                cityId: '00000000-0000-0000-0000-000000000000', // Dummy UUID
              };
           

console.log('🔍 Calling /api/calculate with:', JSON.stringify(requestBody, null, 2));
if (testCase.name.includes('Midnight')) {
  console.log('🚨 MIDNIGHT TEST DEBUG:');
  console.log('DB birth_date:', testCase.birth_date);
  console.log('DB birth_time:', testCase.birth_time);
  console.log('Converted time:', time);
  console.log('Period:', period);
  console.log('Request body:', JSON.stringify(requestBody, null, 2));
}



const calculateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://172.236.176.107'}/api/calculate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
});

console.log('📡 API Response Status:', calculateResponse.status);





           if (!calculateResponse.ok) {
  const errorText = await calculateResponse.text();
  console.error('❌ API Error Response:', errorText);
  throw new Error(`API returned ${calculateResponse.status}: ${errorText}`);
}
   

            const calculateResult = await calculateResponse.json();
            const actualData = calculateResult.data;

            // DEBUG: Log rahuKetuModes to verify it's being returned
            console.log('🔍 DEBUG rahuKetuModes for', testCase.name, ':', JSON.stringify(actualData.rahuKetuModes));
            console.log('🔍 DEBUG actualData keys:', Object.keys(actualData));

            // 4. Compare results
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
                dasha: { mahadasha: actualData.dasa?.balance?.classical360?.mahadashaLord || 'Unknown' },
rahuKetuModes: actualData.rahuKetuModes,

              },
              {
                planet: testCase.planet_tolerance_arcmin,
                ascendant: testCase.ascendant_tolerance_arcmin,
              }
            );
 if (comparison.dasha && actualData.dasa?.currentMahadasha?.lord) {
comparison.dasha.actualMahadasha = actualData.dasa.balance.classical360.mahadashaLord;
}


            
// 5. Save result to database
            const { error: insertError } = await supabase
              .from('test_case_runs')
              .insert({
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
               console.error('❌ Failed to save test result:', insertError);
  console.error('Test case ID:', testCase.id);
  console.error('Status:', comparison.status);
} else {
  console.log('✅ Saved test result for:', testCase.name);
}

            // Update counters
            if (comparison.status === 'passed') {
              passedCount++;
            } else {
              failedCount++;
            }

            allResults.push(comparison);

            // Send test result event
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'test_result',
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
            console.error(`Test ${testCase.name} failed with error:`, error);
            
            // Mark as failed due to error
            failedCount++;
            
            // Save error to database
            await supabase
              .from('test_case_runs')
              .insert({
                test_case_id: testCase.id,
                status: 'failed',
                differences: {
                  error: error.message || 'Unknown error',
                },
              });

            // Send error event for this test
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'test_result',
                  testId: testCase.id,
                  testName: testCase.name,
                  status: 'failed',
                  error: error.message,
                })}\n\n`
              )
            );
          }
        }

        // 6. Send completion event
        const executionTime = Date.now() - startTime;
        
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'completed',
              summary: {
                total: totalTests,
                passed: passedCount,
                failed: failedCount,
                executionTime,
              },
              results: allResults,
            })}\n\n`
          )
        );

        controller.close();

      } catch (error: any) {
        console.error('Test run error:', error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              message: error.message || 'Unknown error occurred',
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
