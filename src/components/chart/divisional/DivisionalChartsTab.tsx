'use client';

import { useState, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { DiamondChart } from '@/components/chart/diamond';
import { ChartSelector } from './ChartSelector';
import { ChartEducation } from './ChartEducation';
import { ChartInsights } from './ChartInsights';
import { calculateDivisionalChart, isChartImplemented, type DivisionalChartId } from '@/lib/utils/divisional';
import { getChartById } from './DivisionalChartConfig';
import type { PlanetData, AscendantData } from '@/types/astrology';

interface DivisionalChartsTabProps {
  planets: Record<string, PlanetData>;
  ascendant: AscendantData;
  className?: string;
}

export function DivisionalChartsTab({ planets, ascendant, className }: DivisionalChartsTabProps) {
  const [selectedChartId, setSelectedChartId] = useState<DivisionalChartId>('d9');
  const [error, setError] = useState<string | null>(null);
  
  const houses = useMemo(() => {
    try {
      setError(null);
      if (!isChartImplemented(selectedChartId)) {
        setError(`${selectedChartId.toUpperCase()} chart is coming soon!`);
        return [];
      }
      return calculateDivisionalChart(selectedChartId, planets, ascendant);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chart calculation failed';
      setError(errorMessage);
      return [];
    }
  }, [selectedChartId, planets, ascendant]);
  
  const chartInfo = getChartById(selectedChartId);
  
  if (!chartInfo) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Chart configuration not found for {selectedChartId}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className={className}>
      {/* Mobile horizontal selector */}
      <div className="mb-6 lg:hidden">
        <ChartSelector
          selectedChartId={selectedChartId}
          onSelectChart={(id) => setSelectedChartId(id as DivisionalChartId)}
          variant="horizontal"
        />
      </div>
      
      {/* ⭐ FIXED LAYOUT: Sidebar in grid, not fixed positioned */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_380px] gap-6">
        
        {/* LEFT: Desktop Sidebar (inside grid, not fixed) */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <ChartSelector
              selectedChartId={selectedChartId}
              onSelectChart={(id) => setSelectedChartId(id as DivisionalChartId)}
              variant="sidebar"
            />
          </div>
        </div>
        
        {/* CENTER: Chart + Education */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">
              {chartInfo.label} - {chartInfo.name}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {chartInfo.primarySignifies}
            </p>
            {selectedChartId !== 'moon' && (
              <p className="text-sm text-muted-foreground">
                Ascendant: {ascendant.sign} {ascendant.degreeInSign.toFixed(2)}°
              </p>
            )}
            {selectedChartId === 'moon' && planets.Moon && (
              <p className="text-sm text-muted-foreground">
                Moon: {planets.Moon.sign} {planets.Moon.degreeInSign.toFixed(2)}°
              </p>
            )}
          </div>
          
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!error && houses.length > 0 && (
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <DiamondChart houses={houses} size="lg" className="mx-auto" />
              </div>
            </div>
          )}
          
          <ChartEducation chartInfo={chartInfo} />
        </div>
        
        {/* RIGHT: Key Insights Sidebar */}
        <div className="lg:block hidden">
          {!error && houses.length > 0 && (
            <div className="sticky top-24">
              <ChartInsights houses={houses} chartInfo={chartInfo} />
            </div>
          )}
        </div>
        
        {/* Mobile: Key Insights below chart */}
        <div className="lg:hidden lg:col-span-3">
          {!error && houses.length > 0 && (
            <ChartInsights houses={houses} chartInfo={chartInfo} />
          )}
        </div>
      </div>
    </div>
  );
}
