'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Stars } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartFocusMode, type ChartConfig } from '@/components/chart/ChartFocusMode';
import { DivisionalChartsTab } from '@/components/chart/divisional';
import { generateChartInsights } from '@/lib/utils/generateChartInsights';
import { detectVargottama, getVargottamaInsights } from '@/lib/astrology/vargottama';

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
import { SadeSatiTableView } from '@/components/chart/sadesati/SadeSatiTableView';
import { PlanetsTab } from '@/components/chart/PlanetsTab';
import { YogasTab } from '@/components/chart/yogas/YogasTab';
import type { YogaAnalysisResponse } from '@/lib/astrology/yogas/types';
import { StrengthTab } from '@/components/chart/strength/StrengthTab';
import type { ShadbalaResult } from '@/lib/astrology/shadbala';
import type { AshtakavargaResult } from '@/lib/astrology/ashtakavarga';

// Import proper types from astrology module
import type {  PlanetData, AscendantData, ChartData, } from '@/types/astrology';
import { useIdleLogout } from '@/hooks/useIdleLogout';

import { useSavedCharts } from '@/hooks/useSavedCharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartLabelModal } from '@/components/chart/ChartLabelModal';
import { DeleteChartDialog } from '@/components/chart/DeleteChartDialog';



type TabType = 'overview' | 'planets' | 'yogas' | 'dasha' | 'divisional' | 'sadesati' | 'strength';
type MobileSubTab = 'planets' | 'avakahada';

// ============================================
// HELPER FUNCTIONS
// ============================================

const STORAGE_KEY = 'lastChart';

function reviveSaturnTransitDates(obj: any): any {
  if (!obj) return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => reviveSaturnTransitDates(item));
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    const result: any = {};
    
    for (const key in obj) {
      const value = obj[key];
      
      // Convert date strings to Date objects
      if (key === 'startDate' || key === 'endDate' || key === 'calculatedAt') {
        result[key] = typeof value === 'string' ? new Date(value) : value;
      } else if (typeof value === 'object') {
        result[key] = reviveSaturnTransitDates(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  return obj;
}

function getChartFromStorage(): ChartData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);

     if (data.saturnTransits) {
      data.saturnTransits = reviveSaturnTransitDates(data.saturnTransits);
    }
     
    return data;

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
        'px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0',
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
  const searchParams = useSearchParams();
  // Data state
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileSubTab, setMobileSubTab] = useState<MobileSubTab>('planets');
  const [isEditing, setIsEditing] = useState(false);
  const [, setIsRecalculating] = useState(false);

  const saved = useSavedCharts();
  const [selectedSavedChartId, setSelectedSavedChartId] = useState<string | null>(() => {
    // Initialise from URL path /chart/[id] so dropdown reflects state on direct visit
    if (typeof window !== 'undefined') {
      const segments = window.location.pathname.split('/')
      const id = segments[2] // /chart/[id]
      return id || null
    }
    return null
  });

  const handleYogasReady = useCallback((analysis: YogaAnalysisResponse) => {
    setChartData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, yogaAnalysis: analysis };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const handleStrengthReady = useCallback(
    (shadBala: ShadbalaResult, ashtakavarga: AshtakavargaResult) => {
      setChartData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, shadBala, ashtakavarga };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [],
  );

  // Modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [editLabelModalOpen, setEditLabelModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  // Holds formData while modal is open waiting for user input
  const [pendingFormData, setPendingFormData] = useState<any>(null);

  // ✅ TAB URL SYNC
  const tabParam = searchParams.get('tab') as TabType | null;

  useEffect(() => {
    if (tabParam === 'overview' || tabParam === 'planets' || tabParam === 'yogas' || tabParam === 'dasha' || tabParam === 'divisional' || tabParam === 'sadesati' || tabParam === 'strength') {
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
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }

      const qs = params.toString();
      // After replaceState('/chart/[id]'), Next.js's pathname is still '/chart'
      // but the browser URL is '/chart/[id]'. Using router.replace('/chart?tab=…')
      // would navigate away from /chart/[id] causing a full remount.
      // Instead, always use window.history.replaceState for tab URL updates so
      // we stay on whichever path the browser is currently showing.
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const nextUrl = qs ? `${currentPath}?${qs}` : currentPath;
        window.history.replaceState(null, '', nextUrl);
      }
    },
    [searchParams]
  );

  // Load chart data from localStorage
  useEffect(() => {
    const data = getChartFromStorage();
    
    if (!data) {
      router.push('/');
      return;
    }

    // ✅ minimal guard to prevent crashes from bad cache
     const ascendantCheck = data.planets?.Ascendant;
    if (!ascendantCheck || typeof (ascendantCheck as any).signNumber !== 'number')
 {
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

  // Handle edit form submission
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
        birthPlace: formData.cityName ?? chartData?.input?.birthPlace ?? '',
        latitude: formData.latitude,
        longitude: formData.longitude,
        timezone: formData.timezone,
      };
      
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const cityName = formData.cityName ?? chartData?.input?.birthPlace ?? (chartData as any)?.birthPlace ?? '';
        const updatedData = {
          ...result.data,
          input: {
            ...result.data.input,
            birthPlace: cityName,
          },
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

  const selectedSavedChart = useMemo(() => {
    if (!selectedSavedChartId) return null;
    return saved.charts.find((c) => c.id === selectedSavedChartId) ?? null;
  }, [saved.charts, selectedSavedChartId]);

  function convert24To12(time24: string): { time12: string; period: 'AM' | 'PM' } {
    const [hhStr, mmStr] = String(time24).split(':');
    const hh = Number(hhStr);
    const mm = Number(mmStr);
    const period: 'AM' | 'PM' = hh >= 12 ? 'PM' : 'AM';
    let h12 = hh % 12;
    if (h12 === 0) h12 = 12;
    return {
      time12: `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
      period,
    };
  }

  const handleSelectSavedChart = useCallback(
    async (chartId: string) => {
      const c = saved.charts.find((x) => x.id === chartId);
      if (!c) return;

      const genderUi: 'Male' | 'Female' =
        String(c.gender).toLowerCase() === 'female' ? 'Female' : 'Male';

      const { time12, period } = convert24To12(c.birth_time);

      setSelectedSavedChartId(c.id);

      // Always return to overview so Dasha/SadeSati tabs re-fetch on next visit
      setTab('overview');

      // Fill + Trigger recalculation (as you requested)
      await handleEditSubmit({
        name: c.name,
        gender: genderUi,
        birthDate: c.birth_date,
        birthTime: time12,
        timePeriod: period,
        latitude: Number(c.latitude),
        longitude: Number(c.longitude),
        timezone: c.timezone,
        cityName: c.birth_place,
      });

      // Update URL to /chart/[id] without remounting the component
      window.history.replaceState(null, '', '/chart/' + c.id);
    },
    [handleEditSubmit, saved.charts]
  );

  const buildSavePayloadFromEditForm = useCallback(
    (formData: any, label: string | null) => ({
      name: formData.name,
      label,
      gender: formData.gender,
      birthDate: formData.birthDate,
      birthTime: formData.birthTime,
      timePeriod: formData.timePeriod,
      birthPlace: formData.cityName ?? chartData?.input?.birthPlace ?? '',
      latitude: formData.latitude,
      longitude: formData.longitude,
      timezone: formData.timezone,
    }),
    [chartData?.input?.birthPlace]
  );

  const handleSaveChart = useCallback(
    async (formData: any) => {
      setPendingFormData(formData);
      setSaveModalOpen(true);
    },
    []
  );

  const handleSaveModalConfirm = useCallback(
    async (label: string | null, isFavorite: boolean) => {
      if (!pendingFormData) return;
      setModalLoading(true);
      try {
        const payload = buildSavePayloadFromEditForm(pendingFormData, label);
        const created = await saved.saveChart(payload, isFavorite);
        await saved.refresh();
        setSelectedSavedChartId(created.id);
        setSaveModalOpen(false);
        setPendingFormData(null);
      } finally {
        setModalLoading(false);
      }
    },
    [pendingFormData, buildSavePayloadFromEditForm, saved]
  );

  const handleUpdateChart = useCallback(
    async (chartId: string, formData: any) => {
      const payload = buildSavePayloadFromEditForm(formData, selectedSavedChart?.label ?? null);
      await saved.updateChart(chartId, payload);
      await saved.refresh();
      setSelectedSavedChartId(chartId);
    },
    [buildSavePayloadFromEditForm, saved, selectedSavedChart?.label]
  );

  const handleDeleteChart = useCallback(
    async (chartId: string) => {
      setPendingFormData(chartId); // reuse pendingFormData to store chartId for delete
      setDeleteDialogOpen(true);
    },
    []
  );

  const handleDeleteConfirm = useCallback(
    async () => {
      if (!pendingFormData) return;
      setModalLoading(true);
      try {
        await saved.deleteChart(pendingFormData);
        await saved.refresh();
        setSelectedSavedChartId(null);
        setDeleteDialogOpen(false);
        setPendingFormData(null);
      } finally {
        setModalLoading(false);
      }
    },
    [saved, pendingFormData]
  );

  const handleEditLabel = useCallback(
    async (chartId: string, formData: any) => {
      setPendingFormData({ chartId, formData });
      setEditLabelModalOpen(true);
    },
    []
  );

  const handleEditLabelConfirm = useCallback(
    async (label: string | null, isFavorite: boolean) => {
      if (!pendingFormData) return;
      const { chartId, formData } = pendingFormData;
      setModalLoading(true);
      try {
        const payload = buildSavePayloadFromEditForm(formData, label);
        await saved.updateChart(chartId, payload, isFavorite);
        await saved.refresh();
        setSelectedSavedChartId(chartId);
        setEditLabelModalOpen(false);
        setPendingFormData(null);
      } finally {
        setModalLoading(false);
      }
    },
    [pendingFormData, buildSavePayloadFromEditForm, saved]
  );
  

  
  // Show loading screen
  if (isLoading || !chartData) {
    return <LoadingScreen />;
  }

  // Cast ascendant to proper type
  const ascendant = chartData.planets.Ascendant as AscendantData;

  const houses = buildLagnaHouses(chartData.planets, ascendant);
  const moonHouses = buildMoonHouses(chartData.planets, ascendant);
  const navamsaHouses = buildNavamsaHouses(chartData.planets, ascendant);

  // ⭐ DETECT VARGOTTAMA
  const vargottamaPlanets = detectVargottama(houses, navamsaHouses);
  const vargottamaInsights = getVargottamaInsights(vargottamaPlanets);

  // Chart configs with vargottama insights injected at the top
  const chartConfigs: ChartConfig[] = [
    {
      id: 'lagna',
      title: 'D1 - Lagna',
      subtitle: `Ascendant: ${ascendant.sign} ${ascendant.degreeInSign.toFixed(2)}°`,
      houses: houses,
      insights: [
        ...vargottamaInsights,  // ⭐ Vargottama first!
        ...generateChartInsights(houses, 'lagna'),
      ],
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
          name={chartData.input.name}
          gender={chartData.input.gender}
          input={{
               localDateTime: chartData.calculated.localDateTime,
               latitude: chartData.input.latitude,
               longitude: chartData.input.longitude,
               timezone: chartData.input.timezone,
               }}
          birthPlace={chartData.input.birthPlace || (chartData as any).birthPlace || ''}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
          rightContent={
              saved.isLoggedIn && saved.hasSavedCharts ? (
                <Select value={selectedSavedChartId ?? ''} onValueChange={handleSelectSavedChart}>
                  <SelectTrigger className="w-[220px] h-9">
                    <SelectValue placeholder="Select saved chart" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[60vh] overflow-y-auto">
                    {saved.charts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label ? `${c.name} (${c.label})` : c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null
            }
        />

        {/* Edit Form */}
        <EditBirthDetailsForm
          isOpen={isEditing}
          currentData={{
            name: chartData.input.name,
            gender: chartData.input.gender as "Male" | "Female",
            localDateTime: chartData.calculated.localDateTime,
            latitude: chartData.input.latitude,
            longitude: chartData.input.longitude,
            timezone: chartData.input.timezone,
            cityName: chartData.input.birthPlace,
          }}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
          isLoggedIn={saved.isLoggedIn}
            savedChartId={selectedSavedChartId}
            savedChartLabel={selectedSavedChart?.label ?? null}
            onSaveChart={handleSaveChart}
            onUpdateChart={handleUpdateChart}
            onDeleteChart={handleDeleteChart}
            onEditLabel={handleEditLabel}
        />

        {/* Main Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted overflow-x-auto scrollbar-none w-full sm:w-fit">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton
            active={activeTab === 'planets'}
            onClick={() => setTab('planets')}
          >
            Planets
          </TabButton>
          <TabButton
            active={activeTab === 'yogas'}
            onClick={() => setTab('yogas')}
          >
            Yogas
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
           <TabButton
            active={activeTab === 'sadesati'}
            onClick={() => setTab('sadesati')}
          >
            Sade Sati
          {chartData.saturnTransits?.sadeSati.current.isActive && ( <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          )}
          </TabButton>
          <TabButton
            active={activeTab === 'strength'}
            onClick={() => setTab('strength')}
          >
            Strength
          </TabButton>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Mobile Sub-tabs */}
            <MobileSubTabs
              activeTab={mobileSubTab}
              onTabChange={setMobileSubTab}
            />

             {/* Two-column section: Planets + Avakahada */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
              <div className={cn('lg:block', mobileSubTab === 'planets' ? 'block' : 'hidden')}>
                <PlanetaryTable planets={chartData.planets} />
              </div>

              <div className={cn('lg:block', mobileSubTab === 'avakahada' ? 'block' : 'hidden')}>
                <AvakhadaTable data={chartData.avakahada} variant="compact" />
              </div>
            </div>

            <ChartFocusMode charts={chartConfigs} />

            <div className="max-w-2xl mx-auto">
              <ChartLegend variant="accordion" />
            </div>
          </div>
        )}
        {activeTab === 'planets' && (
          <div className="animate-fade-in">
            <PlanetsTab
              planets={chartData.planets}
              ascendant={ascendant}
              dashaInfo={chartData.dasa}
              birthDate={chartData.calculated?.utcDateTime}
            />
          </div>
        )}

        {activeTab === 'yogas' && (
          <div className="animate-fade-in">
            <YogasTab chart={chartData} onAnalysisReady={handleYogasReady} />
          </div>
        )}

        {activeTab === 'dasha' && (
          <div className="animate-fade-in">
            <DashaNavigator dashaData={chartData.dasa}
              moonLongitude={chartData.planets.Moon.longitude}
              birthDateUtc={chartData.calculated.utcDateTime}
              nakshatraLord={chartData.avakahada.nakshatraLord}
              />
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

     {activeTab === 'sadesati' && (
  <div className="animate-fade-in">
    <SadeSatiTableView
      analysis={chartData.saturnTransits}
      birthDate={new Date(chartData.calculated.localDateTime)}
      planets={chartData.planets}
      ascendant={chartData.planets.Ascendant as AscendantData}
      dashaInfo={chartData.dasa}
      moonLongitude={chartData.planets.Moon?.longitude}
      elapsedFractionOfNakshatra={chartData.planets.Moon?.kp?.elapsedFractionOfNakshatra}
      nakshatraLord={chartData.avakahada?.nakshatraLord}
      utcBirthDate={chartData.calculated.utcDateTime}
    />
  </div>
)}

        {activeTab === 'strength' && (
          <div className="animate-fade-in">
            <StrengthTab chart={chartData} onStrengthReady={handleStrengthReady} />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Save chart modal */}
      <ChartLabelModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        mode="save"
        initialLabel=""
        initialIsFavorite={false}
        currentFavoriteChartName={saved.charts.find(c => c.is_favorite)?.name ?? null}
        onConfirm={handleSaveModalConfirm}
        isLoading={modalLoading}
      />

      {/* Edit label modal */}
      <ChartLabelModal
        open={editLabelModalOpen}
        onOpenChange={setEditLabelModalOpen}
        mode="edit-label"
        initialLabel={selectedSavedChart?.label ?? ''}
        initialIsFavorite={selectedSavedChart?.is_favorite ?? false}
        currentFavoriteChartName={
          saved.charts.find(c => c.is_favorite && c.id !== selectedSavedChartId)?.name ?? null
        }
        onConfirm={handleEditLabelConfirm}
        isLoading={modalLoading}
      />

      {/* Delete confirm dialog */}
      <DeleteChartDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        chartName={selectedSavedChart?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        isLoading={modalLoading}
      />
    </div>
  );
}
