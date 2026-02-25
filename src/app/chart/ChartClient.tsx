'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Loader2, Stars } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartFocusMode, type ChartConfig } from '@/components/chart/ChartFocusMode';
import { DivisionalChartsTab } from '@/components/chart/divisional';
import { generateChartInsights } from '@/lib/utils/generateChartInsights';

// Layout
import { Header, Footer } from '@/components/layout';

// Chart components
import { UserDetailsCard } from '@/components/chart/UserDetailsCard';
import { EditBirthDetailsForm } from '@/components/forms/EditBirthDetailsForm';
import { PlanetaryTable } from '@/components/chart/PlanetaryTable';
import { AvakhadaTable } from '@/components/chart/AvakhadaTable';
import { ChartLegend } from '@/components/chart/ChartLegend';
import { DashaNavigator } from '@/components/chart/DashaNavigator';
import { buildLagnaHouses, buildMoonHouses, buildNavamsaHouses } from '@/lib/utils/chartHelpers';

// Import proper types from astrology module
import type { PlanetData, AscendantData as AstroAscendantData } from '@/types/astrology';
import { useIdleLogout } from '@/hooks/useIdleLogout'


// ============================================
// TYPE DEFINITIONS
// ============================================

// Local types for page-specific data structures
interface ChartInput {
  localDateTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// Minimal ascendant type for page logic (compatible with AstroAscendantData)
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
  birthPlace?: string;   // city name e.g. "Baghpat, Uttar Pradesh, IN"
  ayanamsha?: string;
}

type TabType = 'overview' | 'dasha'| 'divisional';
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Calculating cosmic blueprint...
        </div>
      </div>
    </div>
  );
}

// ============================================
// TAB BUTTON COMPONENT
// ============================================

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
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
        Avakhada
      </button>
    </div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ChartClient() {
  useIdleLogout()

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Data state
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileSubTab, setMobileSubTab] = useState<MobileSubTab>('planets');
  const [isEditing, setIsEditing] = useState(false);
  const [, setIsRecalculating] = useState(false);

  // ✅ TAB URL SYNC (only change vs original)
  const tabParam = searchParams.get('tab') as TabType | null;

  useEffect(() => {
    if (tabParam === 'overview' || tabParam === 'dasha' || tabParam === 'divisional') {
      setActiveTab(tabParam);
    } else {
      setActiveTab('overview');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  const setTab = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);

      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'overview') {
        params.delete('tab'); // keep /chart clean
      } else {
        params.set('tab', tab);
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Load chart data from localStorage
  useEffect(() => {
    const data = getChartFromStorage();
    
    if (!data) {
      router.push('/');
      return;
    }

    // ✅ minimal guard to prevent "signNumber of undefined" crashes from bad cache
    if (!data.ascendant || typeof (data.ascendant as any).signNumber !== 'number') {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      router.push('/');
      return;
    }
    if (!data.planets || !data.planets.Moon) {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      router.push('/');
      return;
    }
    
    setChartData(data);
    setIsLoading(false);
  }, [router]);

  // Handle edit form submission - call API and update
  const handleEditSubmit = useCallback(async (formData: {
    name: string;
    gender: 'Male' | 'Female';
    birthDate: string;
    birthTime: string;
    timePeriod: 'AM' | 'PM';
    latitude: number;
    longitude: number;
    timezone: string;
    cityName?: string;
  }) => {
    setIsRecalculating(true);
    
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
      
      // Call API to recalculate
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const updatedData = {
          ...result.data,
          birthPlace: formData.cityName ?? chartData?.birthPlace,
        };
        setChartData(updatedData);
        saveChartToStorage(updatedData);
        setIsEditing(false);
      } else {
        throw new Error(result.error || 'Calculation failed');
      }
    } catch {
      // Could show a toast here
    } finally {
      setIsRecalculating(false);
    }
  }, [chartData]);

  // Show loading screen
  if (isLoading || !chartData) {
    return <LoadingScreen />;
  }

  // Cast ascendant to proper type for chartHelpers functions
  const ascendant = chartData.ascendant as AstroAscendantData;

  // Build houses using chartHelpers (proper types)
  const houses = buildLagnaHouses(chartData.planets, ascendant);
  
  // Build Moon Chart (Chandra Lagna)
  const moonHouses = buildMoonHouses(chartData.planets, ascendant);
  
  // Build D9 Navamsa Chart
  const navamsaHouses = buildNavamsaHouses(chartData.planets, ascendant);

  const chartConfigs: ChartConfig[] = [
    {
      id: 'lagna',
      title: 'D1 - Lagna',
      subtitle: `Ascendant: ${chartData.ascendant.sign} ${chartData.ascendant.degreeInSign.toFixed(2)}°`,
      houses: houses,
      insights: generateChartInsights(houses, 'lagna'),
    },
    {
      id: 'moon',
      title: 'Moon Chart',
      subtitle: `Moon: ${chartData.planets.Moon.sign} ${chartData.planets.Moon.degreeInSign.toFixed(2)}°`,
      houses: moonHouses,
      insights: generateChartInsights(moonHouses, 'moon'),
    },
    {
      id: 'd9',
      title: 'D9 - Navamsa',
      subtitle: 'Marriage & Dharma',
      houses: navamsaHouses,
      insights: generateChartInsights(navamsaHouses, 'd9'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header showNav={false} />

      {/* Main Content */}
      <main
        className="flex-1 py-6 space-y-6"
        style={{
          paddingTop: "80px",
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
          paddingLeft: "1rem",
          paddingRight: "1rem"
        }}
      >
        {/* User Details Card */}
        <UserDetailsCard
          name={chartData.name}
          gender={chartData.gender}
          input={chartData.input}
          birthPlace={chartData.birthPlace}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
        />

        {/* Edit Form (Collapsible) */}
        <EditBirthDetailsForm
          isOpen={isEditing}
          currentData={{
            name: chartData.name,
            gender: chartData.gender as "Male" | "Female",
            localDateTime: chartData.input.localDateTime,
            latitude: chartData.input.latitude,
            longitude: chartData.input.longitude,
            timezone: chartData.input.timezone,
            cityName: chartData.birthPlace,
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
        />

        {/* Main Tabs */}
        <div className="flex gap-2 p-1 rounded-lg bg-muted w-fit">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton
            active={activeTab === 'dasha'}
            onClick={() => setTab('dasha')}
          >
            Dasha Timeline
          </TabButton>
          <TabButton
            active={activeTab === 'divisional'}
            onClick={() => setTab('divisional')}
          >
            Divisional Charts
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
              <div className={cn('md:block', mobileSubTab === 'planets' ? 'block' : 'hidden')}>
                <PlanetaryTable planets={chartData.planets} />
              </div>

              <div className={cn('md:block', mobileSubTab === 'avakahada' ? 'block' : 'hidden')}>
                <AvakhadaTable data={chartData.avakahada} variant="compact" />
              </div>
            </div>

            <ChartFocusMode charts={chartConfigs} />

            <div className="max-w-2xl mx-auto">
              <ChartLegend variant="accordion" />
            </div>
          </div>
        )}

        {activeTab === 'dasha' && (
          <div className="animate-fade-in">
            <DashaNavigator dashaData={chartData.dasa} />
          </div>
        )}

        {activeTab === 'divisional' && (
          <div className="animate-fade-in">
            <DivisionalChartsTab
              planets={chartData.planets}
              ascendant={ascendant}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
