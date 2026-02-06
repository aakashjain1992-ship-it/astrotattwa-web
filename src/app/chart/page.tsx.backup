'use client';

import { useEffect, useState } from 'react';
import { BirthDetails } from '@/components/chart/BirthDetails';
import { AscendantCard } from '@/components/chart/AscendantCard';
import { PlanetaryTable } from '@/components/chart/PlanetaryTable';
import { DashaTimeline } from '@/components/chart/DashaTimeline';

interface ChartData {
  input: any;
  planets: any;
  ascendant: any;
  dasa: any;
  nakshatra: any;
  ayanamsha?: number | string;
}

export default function ChartPage() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem('lastChart');
      console.log('Retrieved from localStorage:', data);
      
      if (!data) {
        setError('No chart data found');
        return;
      }
      
      const parsed = JSON.parse(data);
      console.log('Parsed chart data:', parsed);
      
      if (!parsed.planets || !parsed.ascendant || !parsed.dasa) {
        setError('Invalid chart data structure');
        return;
      }
      
      setChartData(parsed);
    } catch (err: any) {
      console.error('Error loading chart:', err);
      setError(err.message);
    }
  }, []);

  const getAyanamshaString = (): string => {
    if (!chartData?.ayanamsha) return '23.864567';
    
    const ayanamsha = chartData.ayanamsha;
    
    if (typeof ayanamsha === 'string') return ayanamsha;
    if (typeof ayanamsha === 'number') return ayanamsha.toFixed(6);
    
    return '23.864567';
  };

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Chart</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <a href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">Create New Chart</a>
      </div>
    </div>;
  }

  if (!chartData) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Loading Chart...</h2>
      </div>
    </div>;
  }

  return <div className="min-h-screen bg-background py-8">
    <div className="container mx-auto px-4 max-w-6xl space-y-6">
      <h1 className="text-3xl font-bold mb-6">Birth Chart - KP Astrology</h1>
      
      <BirthDetails input={chartData.input} ayanamsha={getAyanamshaString()} />
      <AscendantCard ascendant={chartData.ascendant} />
      <PlanetaryTable planets={chartData.planets} />
      <DashaTimeline dasa={chartData.dasa} />
    </div>
  </div>;
}
