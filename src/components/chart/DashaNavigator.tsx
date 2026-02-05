'use client';

import { useState, useCallback } from 'react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { ChevronRight, ChevronLeft, Loader2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================
// TYPE DEFINITIONS
// ============================================

type DashaLevel = 'mahadasha' | 'antardasha' | 'pratyantar' | 'sookshma';

interface DashaPeriod {
  planet: string;
  startUtc: string;     // ISO date string
  endUtc: string;       // ISO date string
  startDate?: string;   // Formatted display date
  endDate?: string;     // Formatted display date
  duration?: {
    years: number;
    months: number;
    days: number;
  };
  isCurrent?: boolean;
}

interface MahadashaData {
  balance?: {
    planet: string;
    years: number;
    months: number;
    days: number;
  };
  currentMahadasha?: string;
  allMahadashas?: DashaPeriod[];
}

interface DashaNavigatorProps {
  /** Mahadasha data from chart */
  dashaData: MahadashaData;
  /** Additional className */
  className?: string;
}

// ============================================
// HELPERS
// ============================================

/**
 * Normalize Dasha API payloads into the UI-friendly shape used by this component.
 * Keeps the component's internal data structure stable even if the API field names differ.
 */
function normalizeMahadashaData(raw: any): MahadashaData {
  const normalized: MahadashaData = {};

  // ---- balance ----
  const bal360 = raw?.balance?.classical360;
  if (bal360) {
    normalized.balance = {
      planet: String(bal360.mahadashaLord ?? bal360.lord ?? ''),
      years: Number(bal360.balanceYears ?? bal360.years ?? 0),
      months: Number(bal360.balanceMonths ?? bal360.months ?? 0),
      days: Number(bal360.balanceDays ?? bal360.days ?? 0),
    };
  } else if (raw?.balance && typeof raw.balance === 'object') {
    // already normalized, or a flatter API variant
    const b = raw.balance;
    if (typeof b.planet === 'string') {
      normalized.balance = {
        planet: b.planet,
        years: Number(b.years ?? 0),
        months: Number(b.months ?? 0),
        days: Number(b.days ?? 0),
      };
    } else if (typeof b.mahadashaLord === 'string') {
      normalized.balance = {
        planet: b.mahadashaLord,
        years: Number(b.balanceYears ?? b.years ?? 0),
        months: Number(b.balanceMonths ?? b.months ?? 0),
        days: Number(b.balanceDays ?? b.days ?? 0),
      };
    }
  }

  // ---- current mahadasha ----
  if (typeof raw?.currentMahadasha === 'string') {
    normalized.currentMahadasha = raw.currentMahadasha;
  } else if (raw?.currentMahadasha && typeof raw.currentMahadasha === 'object') {
    normalized.currentMahadasha = String(raw.currentMahadasha.lord ?? raw.currentMahadasha.planet ?? '');
  }

  // ---- all mahadashas ----
  const list = raw?.allMahadashas ?? raw?.data?.allMahadashas ?? raw?.mahadashas ?? [];
  if (Array.isArray(list)) {
    normalized.allMahadashas = list
      .map((p: any): DashaPeriod => {
        const startUtc = String(p.startUtc ?? p.startUTC ?? p.start ?? '');
        const endUtc = String(p.endUtc ?? p.endUTC ?? p.end ?? '');

        // Build duration (optional) from durationDays/durationYears if provided
        let duration: DashaPeriod['duration'] | undefined = p.duration;
        const durDays = typeof p.durationDays === 'number' ? p.durationDays : undefined;
        const durYears = typeof p.durationYears === 'number' ? p.durationYears : undefined;

        if (!duration && (durDays !== undefined || durYears !== undefined)) {
          // Prefer durationDays if present (API uses ~365.25-day years)
          const totalDays = durDays ?? (durYears !== undefined ? durYears * 365.25 : 0);
          const years = Math.max(0, Math.floor(totalDays / 365.25));
          const remAfterYears = Math.max(0, totalDays - years * 365.25);
          const months = Math.max(0, Math.floor(remAfterYears / 30.4375));
          const days = Math.max(0, Math.round(remAfterYears - months * 30.4375));

          duration = { years, months, days };
        }

        return {
          planet: String(p.planet ?? p.lord ?? ''),
          startUtc,
          endUtc,
          duration,
        };
      })
      .filter((p: DashaPeriod) => Boolean(p.planet) && Boolean(p.startUtc) && Boolean(p.endUtc));
  }

  return normalized;
}



/**
 * Normalize sub-period arrays (Antardasha / Pratyantar / Sookshma) into DashaPeriod[]
 * Expected API shape: items use `lord` for planet name.
 */
function normalizeSubPeriods(list: any): DashaPeriod[] {
  if (!Array.isArray(list)) return [];

  return list
    .map((p: any): DashaPeriod => {
      const startUtc = String(p.startUtc ?? p.startUTC ?? p.start ?? '');
      const endUtc = String(p.endUtc ?? p.endUTC ?? p.end ?? '');

      // Build duration (optional) from durationDays/durationYears if provided
      let duration: DashaPeriod['duration'] | undefined = p.duration;
      const durDays = typeof p.durationDays === 'number' ? p.durationDays : undefined;
      const durYears = typeof p.durationYears === 'number' ? p.durationYears : undefined;

      if (!duration && (durDays !== undefined || durYears !== undefined)) {
        const totalDays = durDays ?? (durYears !== undefined ? durYears * 365.25 : 0);
        const years = Math.max(0, Math.floor(totalDays / 365.25));
        const remAfterYears = Math.max(0, totalDays - years * 365.25);
        const months = Math.max(0, Math.floor(remAfterYears / 30.4375));
        const days = Math.max(0, Math.round(remAfterYears - months * 30.4375));
        duration = { years, months, days };
      }

      return {
        planet: String(p.planet ?? p.lord ?? ''),
        startUtc,
        endUtc,
        duration,
      };
    })
    .filter((p: DashaPeriod) => Boolean(p.planet) && Boolean(p.startUtc) && Boolean(p.endUtc));
}


function formatDuration(duration?: { years: number; months: number; days: number }): string {
  if (!duration) return '';
  const parts = [];
  if (duration.years > 0) parts.push(`${duration.years}y`);
  if (duration.months > 0) parts.push(`${duration.months}m`);
  if (duration.days > 0) parts.push(`${duration.days}d`);
  return parts.join(' ') || '0d';
}

function formatDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'dd MMM yyyy');
  } catch {
    return isoDate;
  }
}

function isCurrentPeriod(startUtc: string, endUtc: string): boolean {
  try {
    const now = new Date();
    return isWithinInterval(now, {
      start: parseISO(startUtc),
      end: parseISO(endUtc),
    });
  } catch {
    return false;
  }
}

const LEVEL_LABELS: Record<DashaLevel, string> = {
  mahadasha: 'Mahadasha (Main Period)',
  antardasha: 'Antardasha (Sub Period)',
  pratyantar: 'Pratyantar (Sub-Sub Period)',
  sookshma: 'Sookshma (Finest Division)',
};

const LEVEL_INFO: Record<DashaLevel, string> = {
  mahadasha: 'Major planetary periods spanning years',
  antardasha: 'Sub-periods within the Mahadasha',
  pratyantar: 'Finer divisions within the Antardasha',
  sookshma: 'The finest level of dasha division',
};

// ============================================
// SUB-COMPONENTS
// ============================================

interface DashaPeriodRowProps {
  period: DashaPeriod;
  isCurrent: boolean;
  showArrow: boolean;
  onClick?: () => void;
}

function DashaPeriodRow({ period, isCurrent, showArrow, onClick }: DashaPeriodRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'w-full flex items-center justify-between p-3 rounded-lg border transition-colors',
        'text-left',
        isCurrent
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:bg-accent/50',
        onClick ? 'cursor-pointer' : 'cursor-default'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Current indicator */}
        {isCurrent && (
          <Circle className="h-2.5 w-2.5 fill-primary text-primary flex-shrink-0" />
        )}
        
        {/* Planet name */}
        <div>
          <span className={cn(
            'font-medium',
            isCurrent ? 'text-primary' : 'text-foreground'
          )}>
            {period.planet}
          </span>
          
          {/* Date range */}
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(period.startUtc)} – {formatDate(period.endUtc)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Duration */}
        {period.duration && (
          <span className="text-xs text-muted-foreground">
            {formatDuration(period.duration)}
          </span>
        )}
        
        {/* Arrow for drill-down */}
        {showArrow && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * DashaNavigator - Drill-down navigation for Vimshottari Dasha
 * 
 * Levels:
 * 1. Mahadasha (9 periods, 120 years total)
 * 2. Antardasha (9 sub-periods within selected Mahadasha)
 * 3. Pratyantar (9 sub-sub-periods within selected Antardasha)
 * 4. Sookshma (9 finest divisions - terminal level)
 * 
 * Navigation:
 * - Click any row to drill down to next level
 * - Back button returns to previous level
 * - Current running period is highlighted
 */
export function DashaNavigator({
  dashaData,
  className,
}: DashaNavigatorProps) {
  // Normalize API payload to the UI shape (mapping lord -> planet, nested balance, etc.)
  const normalizedDashaData = normalizeMahadashaData(dashaData);

  // Navigation state
  const [currentLevel, setCurrentLevel] = useState<DashaLevel>('mahadasha');
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  
  // Data state for fetched sub-periods
  const [antardashaData, setAntardashaData] = useState<DashaPeriod[] | null>(null);
  const [pratyantarData, setPratyantarData] = useState<DashaPeriod[] | null>(null);
  const [sookshmaData, setSookshmaData] = useState<DashaPeriod[] | null>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get selected period at each level
  const selectedMahadasha = navigationPath[0];
  const selectedAntardasha = navigationPath[1];
  const selectedPratyantar = navigationPath[2];

  // Find the selected mahadasha data to get date range
  const findMahadashaData = useCallback((planet: string) => {
    return normalizedDashaData.allMahadashas?.find(m => m.planet === planet);
  }, [normalizedDashaData.allMahadashas]);

  // Find antardasha data
  const findAntardashaData = useCallback((planet: string) => {
    return antardashaData?.find(a => a.planet === planet);
  }, [antardashaData]);

  // Find pratyantar data
  const findPratyantarData = useCallback((planet: string) => {
    return pratyantarData?.find(p => p.planet === planet);
  }, [pratyantarData]);

  // Fetch antardasha data
  const fetchAntardashas = useCallback(async (mahadashaLord: string, startUtc: string, endUtc: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        mahadashaLord,
        startUtc,
        endUtc,
      });
      
      const response = await fetch(`/api/dasha/antardasha?${params}`);
      const result = await response.json();
      
      if (result.success && result.data?.antardashas) {
        setAntardashaData(normalizeSubPeriods(result.data.antardashas));
      } else if (result.antardashas) {
        // Alternate response format
        setAntardashaData(normalizeSubPeriods(result.antardashas));
      } else {
        throw new Error(result.error || 'Failed to fetch Antardashas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setAntardashaData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch pratyantar data
  const fetchPratyantars = useCallback(async (mahadashaLord: string, antardashaLord: string, startUtc: string, endUtc: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        mahadashaLord,
        antardashaLord,
        startUtc,
        endUtc,
      });
      
      const response = await fetch(`/api/dasha/pratyantar?${params}`);
      const result = await response.json();
      
      if (result.success && result.data?.pratyantars) {
        setPratyantarData(normalizeSubPeriods(result.data.pratyantars));
      } else if (result.pratyantars) {
        setPratyantarData(normalizeSubPeriods(result.pratyantars));
      } else {
        throw new Error(result.error || 'Failed to fetch Pratyantars');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setPratyantarData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch sookshma data
  const fetchSookshmas = useCallback(async (mahadashaLord: string, antardashaLord: string, pratyantarLord: string, startUtc: string, endUtc: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        mahadashaLord,
        antardashaLord,
        pratyantarLord,
        startUtc,
        endUtc,
      });
      
      const response = await fetch(`/api/dasha/sookshma?${params}`);
      const result = await response.json();
      
      if (result.success && result.data?.sookshmas) {
        setSookshmaData(normalizeSubPeriods(result.data.sookshmas));
      } else if (result.sookshmas) {
        setSookshmaData(normalizeSubPeriods(result.sookshmas));
      } else {
        throw new Error(result.error || 'Failed to fetch Sookshmas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setSookshmaData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle click on a period
  const handlePeriodClick = useCallback(async (level: DashaLevel, planet: string) => {
    if (level === 'mahadasha') {
      const mahadasha = findMahadashaData(planet);
      if (mahadasha) {
        setNavigationPath([planet]);
        setCurrentLevel('antardasha');
        await fetchAntardashas(planet, mahadasha.startUtc, mahadasha.endUtc);
      }
    } else if (level === 'antardasha') {
      const antardasha = findAntardashaData(planet);
      if (antardasha) {
        setNavigationPath([selectedMahadasha, planet]);
        setCurrentLevel('pratyantar');
        await fetchPratyantars(selectedMahadasha, planet, antardasha.startUtc, antardasha.endUtc);
      }
    } else if (level === 'pratyantar') {
      const pratyantar = findPratyantarData(planet);
      if (pratyantar) {
        setNavigationPath([selectedMahadasha, selectedAntardasha, planet]);
        setCurrentLevel('sookshma');
        await fetchSookshmas(selectedMahadasha, selectedAntardasha, planet, pratyantar.startUtc, pratyantar.endUtc);
      }
    }
    // Sookshma is terminal level - no further drill-down
  }, [
    findMahadashaData,
    findAntardashaData,
    findPratyantarData,
    selectedMahadasha,
    selectedAntardasha,
    fetchAntardashas,
    fetchPratyantars,
    fetchSookshmas,
  ]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (currentLevel === 'antardasha') {
      setCurrentLevel('mahadasha');
      setNavigationPath([]);
      setAntardashaData(null);
    } else if (currentLevel === 'pratyantar') {
      setCurrentLevel('antardasha');
      setNavigationPath([selectedMahadasha]);
      setPratyantarData(null);
    } else if (currentLevel === 'sookshma') {
      setCurrentLevel('pratyantar');
      setNavigationPath([selectedMahadasha, selectedAntardasha]);
      setSookshmaData(null);
    }
  }, [currentLevel, selectedMahadasha, selectedAntardasha]);

  // Get current data based on level
  const getCurrentData = (): DashaPeriod[] => {
    switch (currentLevel) {
      case 'mahadasha':
        return normalizedDashaData.allMahadashas || [];
      case 'antardasha':
        return antardashaData || [];
      case 'pratyantar':
        return pratyantarData || [];
      case 'sookshma':
        return sookshmaData || [];
      default:
        return [];
    }
  };

  // Build breadcrumb
  const getBreadcrumb = (): string => {
    const parts = [];
    if (selectedMahadasha) parts.push(selectedMahadasha);
    if (selectedAntardasha) parts.push(selectedAntardasha);
    if (selectedPratyantar) parts.push(selectedPratyantar);
    return parts.join(' → ');
  };

  const currentData = getCurrentData();
  const showArrow = currentLevel !== 'sookshma';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with level info and back button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{LEVEL_LABELS[currentLevel]}</h3>
          {currentLevel !== 'mahadasha' && (
            <p className="text-sm text-muted-foreground">{getBreadcrumb()}</p>
          )}
        </div>
        
        {currentLevel !== 'mahadasha' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      </div>

      {/* Balance at birth (only on mahadasha level) */}
      {currentLevel === 'mahadasha' && normalizedDashaData.balance && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">Balance at Birth</p>
          <p className="font-medium">
            {normalizedDashaData.balance.planet}: {formatDuration(normalizedDashaData.balance)}
          </p>
        </div>
      )}

      {/* Info text for sookshma */}
      {currentLevel === 'sookshma' && (
        <p className="text-sm text-muted-foreground italic">
          Sookshma is the finest division of the Vimshottari Dasha system.
        </p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Period list */}
      {!isLoading && !error && (
        <div className="space-y-2">
          {currentData.map((period) => {
            const isCurrent = isCurrentPeriod(period.startUtc, period.endUtc);
            
            return (
              <DashaPeriodRow
                key={`${currentLevel}-${period.planet}`}
                period={period}
                isCurrent={isCurrent}
                showArrow={showArrow}
                onClick={showArrow ? () => handlePeriodClick(currentLevel, period.planet) : undefined}
              />
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && currentData.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No dasha periods available
        </p>
      )}
    </div>
  );
}

