'use client';

import { useEffect, useState } from 'react';
import { NorthIndianChart } from '@/components/chart/NorthIndianChart';
import { ChartLegend } from '@/components/chart/ChartLegend';
import { getHouseSystemName, type HouseSystem } from '@/lib/utils/chartHelpers';
import type { ChartData } from '@/types/chart-display';

export default function TestChartPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [houseSystem, setHouseSystem] = useState<HouseSystem>('whole-sign');

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
        <div className="text-center mb-4">
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

        {/* House System Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-900">
            <button
              onClick={() => setHouseSystem('whole-sign')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                houseSystem === 'whole-sign'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Whole Sign
            </button>
            <button
              onClick={() => setHouseSystem('equal-house')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                houseSystem === 'equal-house'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Equal House (Lagna-Chalit)
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-500 mb-6">
          Current: {getHouseSystemName(houseSystem)}
        </p>

        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 space-y-6 lg:space-y-0">
          <div>
            <NorthIndianChart
              chartData={chartData}
              houseSystem={houseSystem}
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
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Expected Placements (Lagna-Chalit / Equal House):
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div>• House 1: Ketu (ASC at 75.35°)</div>
            <div>• House 7: Moon, Rahu</div>
            <div>• House 3: Jupiter R</div>
            <div>• House 8: Saturn</div>
            <div>• House 9: Mars, Venus</div>
            <div>• House 10 or 12: Sun, Mercury R C D</div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
            ✅ Rahu (11°35') and Ketu (11°35') are exactly opposite (180° apart)
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            💡 Toggle between systems to see the difference!
          </p>
        </div>
      </div>
    </div>
  );
}
