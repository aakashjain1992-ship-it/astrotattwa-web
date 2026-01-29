'use client';

import { useEffect, useState } from 'react';
import { NorthIndianChart } from '@/components/chart/NorthIndianChart';
import { ChartLegend } from '@/components/chart/ChartLegend';
import type { ChartData } from '@/types/chart-display';

export default function TestChartPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChart() {
      try {
        const response = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Aakash Jain',
            gender: 'male',
            birthDate: '1992-03-25',
            birthTime: '11:55',
            timePeriod: 'AM',
            cityId: '550e8400-e29b-41d4-a716-446655440000',
            latitude: 28.6139,
            longitude: 77.209,
            timezone: 'Asia/Kolkata',
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          setChartData(result.data);
        } else {
          setError(result.error || 'Failed to load chart');
        }
      } catch (err) {
        setError('Network error: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadChart();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-semibold text-red-600 dark:text-red-400">Error loading chart</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            North Indian Chart - Test
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {chartData.name} • {chartData.ascendant.sign} Ascendant
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            Birth: 25/03/1992, 11:55 AM, Delhi
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 space-y-6 lg:space-y-0">
          <div>
            <NorthIndianChart
              chartData={chartData}
              onPlanetClick={(key) => console.log('Clicked planet:', key)}
              onHouseClick={(num) => console.log('Clicked house:', num)}
              showHouseNumbers={true}
            />
          </div>

          <div className="hidden lg:block">
            <ChartLegend variant="sidebar" />
          </div>
        </div>

        <div className="lg:hidden mt-6">
          <ChartLegend variant="accordion" />
        </div>

        <div className="mt-8 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Expected Placements:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div>• House 1: Ketu (ASC)</div>
            <div>• House 7: Moon, Rahu</div>
            <div>• House 3: Jupiter R</div>
            <div>• House 8: Saturn</div>
            <div>• House 9: Mars, Venus</div>
            <div>• House 10: Sun, Mercury R C D</div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
            ✅ Rahu (House 7) and Ketu (House 1) should be opposite
          </p>
        </div>
      </div>
    </div>
  );
}
