'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Stars } from 'lucide-react';
import { cn } from '@/lib/utils';

// Layout
import { Header, Footer } from '@/components/layout';

// Chart components
import { UserDetailsCard } from '@/components/chart/UserDetailsCard';
import { EditBirthDetailsForm } from '@/components/forms/EditBirthDetailsForm';
import { PlanetaryTable } from '@/components/chart/PlanetaryTable';
import { AvakhadaTable } from '@/components/chart/AvakhadaTable';
import { DiamondChart } from '@/components/chart/diamond';
import { ChartLegend } from '@/components/chart/ChartLegend';
import { DashaNavigator } from '@/components/chart/DashaNavigator';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ChartInput {
  localDateTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface PlanetData {
  longitude: number;
  sign: string;
  signNumber: number;
  degreeInSign: number;
  retrograde: boolean;
  combust?: boolean;
  exalted?: boolean;
  debilitated?: boolean;
  nakshatra?: {
    name: string;
    pada: number;
    lord: string;
  };
}

interface AscendantData {
  sign: string;
  signNumber: number;
  degreeInSign: number;
}

interface DashaData {
  balance?: {
    planet: string;
    years: number;
    months: number;
    days: number;
  };
  currentMahadasha?: string;
  allMahadashas?: Array<{
    planet: string;
    startUtc: string;
    endUtc: string;
    duration?: { years: number; months: number; days: number };
  }>;
}

interface AvakhadaData {
  rasiSign?: string;
  rasiLord?: string;
  nakshatraCharan?: string;
  nakshatra?: string;
  nakshatraPada?: number;
  nakshatraLord?: string;
  yoga?: string;
  karan?: string;
  gana?: string;
  yoni?: string;
  nadi?: string;
  varan?: string;
  vashya?: string;
  nameAlphabet?: string;
  sunSignWestern?: string;
}

interface ChartData {
  input: ChartInput;
  planets: Record<string, PlanetData>;
  ascendant: AscendantData;
  dasa: DashaData;
  avakahada: AvakhadaData;
  name: string;
  gender?: string;
  ayanamsha?: string;
}

type TabType = 'overview' | 'dasha';
type MobileSubTab = 'planets' | 'avakahada';

// ============================================
// HELPER FUNCTIONS
// ============================================

const STORAGE_KEY = 'lastChart';

function getChartFromStorage(): ChartData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveChartToStorage(data: ChartData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Build houses for DiamondChart from planet data
function buildHousesFromChart(
  planets: Record<string, PlanetData>,
  ascendant: AscendantData
): import('@/components/chart/diamond').HouseData[] {
  const RASHI_NAMES = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  const PLANET_SYMBOLS: Record<string, string> = {
    Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
    Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
  };

  // Create 12 empty houses starting from ascendant sign
  const ascSignNumber = ascendant.signNumber; // 1-12
  const houses: import('@/components/chart/diamond').HouseData[] = [];

  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const rasiNumber = ((ascSignNumber - 1 + i) % 12) + 1;
    
    houses.push({
      houseNumber,
      rasiNumber,
      rasiName: RASHI_NAMES[rasiNumber - 1],
      planets: [],
      isAscendant: houseNumber === 1,
    });
  }

  // Place planets in houses based on their sign
  Object.entries(planets).forEach(([planetKey, planetData]) => {
    const planetSignNumber = planetData.signNumber;
    
    // Find which house this sign falls into
    // House 1 = ascendant sign, House 2 = next sign, etc.
    let houseIndex = (planetSignNumber - ascSignNumber + 12) % 12;
    
    // Build status flags
    const statusFlags: string[] = [];
    if (planetData.retrograde) statusFlags.push('R');
    if (planetData.combust) statusFlags.push('C');
    if (planetData.exalted) statusFlags.push('Ex');
    if (planetData.debilitated) statusFlags.push('Db');

    houses[houseIndex].planets.push({
      key: planetKey,
      symbol: PLANET_SYMBOLS[planetKey] || planetKey.substring(0, 2),
      degree: planetData.degreeInSign,
      longitude: planetData.longitude,
      statusFlags,
    });
  });

  return houses;
}

// ============================================
// LOADING COMPONENT
// ============================================

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <Stars className="h-12 w-12 text-primary animate-pulse" />
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 animate-ping" />
        </div>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Astrotattwa
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading your chart...</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TAB BUTTON COMPONENT
// ============================================

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      )}
    >
      {children}
    </button>
  );
}

// ============================================
// MOBILE SUB-TAB COMPONENT
// ============================================

function MobileSubTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: MobileSubTab;
  onTabChange: (tab: MobileSubTab) => void;
}) {
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-muted md:hidden">
      <button
        type="button"
        onClick={() => onTabChange('planets')}
        className={cn(
          'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          activeTab === 'planets'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground'
        )}
      >
        Planets
      </button>
      <button
        type="button"
        onClick={() => onTabChange('avakahada')}
        className={cn(
          'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          activeTab === 'avakahada'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground'
        )}
      >
        Avakahada
      </button>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ChartPage() {
  const router = useRouter();
  
  // Data state
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileSubTab, setMobileSubTab] = useState<MobileSubTab>('planets');
  const [isEditing, setIsEditing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Load chart data from localStorage
  useEffect(() => {
    const data = getChartFromStorage();
    
    if (!data) {
      // No chart data, redirect to home
      router.push('/');
      return;
    }
    
    setChartData(data);
    setIsLoading(false);
  }, [router]);

  // Handle edit form submission - call API and update
  const handleEditSubmit = useCallback(async (formData: {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    birthTime: string;
    timePeriod: 'AM' | 'PM';
    latitude: number;
    longitude: number;
    timezone: string;
  }) => {
    setIsRecalculating(true);
    
    // DEBUG: Log what we received from form
    console.log('🔍 ChartPage - Received from EditBirthDetailsForm:', formData);
    
    try {
      const apiPayload = {
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        timePeriod: formData.timePeriod,
        latitude: formData.latitude,
        longitude: formData.longitude,
        timezone: formData.timezone,
      };
      
      // DEBUG: Log what we're sending to API
      console.log('🔍 ChartPage - Sending to /api/calculate:', apiPayload);
      
      // Call API to recalculate
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Update state and storage
        setChartData(result.data);
        saveChartToStorage(result.data);
        setIsEditing(false);
      } else {
        throw new Error(result.error || 'Calculation failed');
      }
    } catch (error) {
      console.error('Recalculation failed:', error);
      // Could show a toast here
    } finally {
      setIsRecalculating(false);
    }
  }, []);

  // Show loading screen
  if (isLoading || !chartData) {
    return <LoadingScreen />;
  }

  // Build houses for chart
  const houses = buildHousesFromChart(chartData.planets, chartData.ascendant);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header showNav={false} />

      {/* Main Content */}
      <main className="flex-1 container py-6 space-y-6">
        {/* User Details Card */}
        <UserDetailsCard
          name={chartData.name}
          gender={chartData.gender}
          input={chartData.input}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
        />

        {/* Edit Form (Collapsible) */}
        <EditBirthDetailsForm
          isOpen={isEditing}
          currentData={{
            name: chartData.name,
            gender: chartData.gender,
            localDateTime: chartData.input.localDateTime,
            latitude: chartData.input.latitude,
            longitude: chartData.input.longitude,
            timezone: chartData.input.timezone,
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
        />

        {/* Main Tabs */}
        <div className="flex gap-2 p-1 rounded-lg bg-muted w-fit">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton
            active={activeTab === 'dasha'}
            onClick={() => setActiveTab('dasha')}
          >
            Dasha Timeline
          </TabButton>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Mobile Sub-tabs for tables */}
            <MobileSubTabs
              activeTab={mobileSubTab}
              onTabChange={setMobileSubTab}
            />

            {/* Two-column section: Planets + Avakahada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Planetary Table - always visible on desktop, conditional on mobile */}
              <div className={cn(
                'md:block',
                mobileSubTab === 'planets' ? 'block' : 'hidden'
              )}>
                <PlanetaryTable planets={chartData.planets} />
              </div>

              {/* Avakahada Table - always visible on desktop, conditional on mobile */}
              <div className={cn(
                'md:block',
                mobileSubTab === 'avakahada' ? 'block' : 'hidden'
              )}>
                <AvakhadaTable data={chartData.avakahada} variant="compact" />
              </div>
            </div>

            {/* Lagna Chart */}
            <div className="space-y-4">
              <DiamondChart
                houses={houses}
                title="D1 - Lagna Chart"
                subtitle={`Ascendant: ${chartData.ascendant.sign} ${chartData.ascendant.degreeInSign.toFixed(2)}°`}
                size="lg"
                showRashiNumbers
                showAscLabel
                className="max-w-lg mx-auto"
              />

              {/* Collapsible Legend - using existing accordion variant */}
              <div className="max-w-lg mx-auto">
                <ChartLegend variant="accordion" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dasha' && (
          <div className="animate-fade-in">
            <DashaNavigator dashaData={chartData.dasa} />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
