'use client';

/**
 * Enhanced Sade Sati View
 *
 * Displays all 15 Sade Sati + 11 Dhaiya factors from the professional calculator.
 * Consumes EnhancedSaturnTransitAnalysis from calculator-PROFESSIONAL.ts
 *
 * @file SadeSatiTableView.tsx
 * @version 1.2.0 - COMPLETE with full chart data
 */
import { useState, useEffect } from 'react';  
import { Circle, ChevronDown, ChevronRight, Shield, TrendingUp, Zap, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  EnhancedSaturnTransitAnalysis,
  EnhancedSadeSatiPeriod,
  EnhancedDhaiyaPeriod,
  DashaActivation,
} from '@/lib/astrology/sadesati/types-enhanced';
import type { StrengthAssessment } from '@/lib/astrology/sadesati/strengthAnalyzer';
import type { PlanetData, AscendantData } from '@/types/astrology';  // ✅ ADDED
import { PHASE_EFFECTS, PHASE_REMEDIES } from '@/lib/astrology/sadesati/constants';

// ─── Props ────────────────────────────────────────────────────────────────────

interface EnhancedSadeSatiViewProps {
  analysis?: EnhancedSaturnTransitAnalysis; 
  birthDate: Date;
  planets?: Record<string, PlanetData>;  // ✅ FIXED - replaced moonLongitude
  ascendant?: AscendantData;
  dashaInfo?: any;
}

type ActiveTab = 'analysis' | 'phases' | 'dhaiya' | 'timeline';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDate = (d: any): Date => (d instanceof Date ? d : new Date(d));
const fmt = (d: any) =>
  toDate(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
const fmtFull = (d: any) =>
  toDate(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
const age = (d: any, birth: Date) =>
  Math.floor((toDate(d).getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

const SIGN_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const INTENSITY_COLORS: Record<string, string> = {
  very_intense: 'text-red-600 bg-red-50 border-red-200',
  intense:      'text-orange-600 bg-orange-50 border-orange-200',
  moderate:     'text-amber-600 bg-amber-50 border-amber-200',
  high:         'text-orange-600 bg-orange-50 border-orange-200',
  mild:         'text-emerald-600 bg-emerald-50 border-emerald-200',
  low:          'text-emerald-600 bg-emerald-50 border-emerald-200',
  very_mild:    'text-emerald-600 bg-emerald-50 border-emerald-200',
};

const STRENGTH_COLORS: Record<string, string> = {
  strong:   'text-emerald-700',
  moderate: 'text-amber-600',
  weak:     'text-red-600',
};

const DIGNITY_LABEL: Record<string, string> = {
  exalted:     'Exalted ↑',
  own_sign:    'Own Sign',
  friendly:    'Friendly',
  neutral:     'Neutral',
  enemy:       'Enemy',
  debilitated: 'Debilitated ↓',
};

const OUTCOME_LABELS: Record<string, { label: string; icon: string }> = {
  transformative_growth: { label: 'Transformative Growth', icon: '🌱' },
  challenging_lessons:   { label: 'Challenging Lessons',   icon: '⚡' },
  mixed:                 { label: 'Mixed Results',          icon: '⚖️' },
  relatively_smooth:     { label: 'Relatively Smooth',      icon: '✨' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────


/**
 * Convert date strings in API response back to Date objects
 */
function convertDates(obj: any): any {
  if (!obj) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertDates(item));
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    
    for (const key in obj) {
      const value = obj[key];
      
      // Convert date strings to Date objects
      if (key === 'startDate' || key === 'endDate' || key === 'calculatedAt' || key === 'start' || key === 'end') {
        result[key] = typeof value === 'string' ? new Date(value) : value;
      } else if (typeof value === 'object') {
        result[key] = convertDates(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  return obj;
}

function Section({
  title,
  badge,
  defaultOpen = false,
  children,
  icon,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="text-sm font-semibold">{title}</span>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-border last:border-0 gap-4">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className={cn('text-sm font-medium text-right', valueClass)}>{value}</span>
    </div>
  );
}

function IntensityPill({ level, label }: { level: string; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold capitalize',
        INTENSITY_COLORS[level] ?? 'text-muted-foreground bg-muted border-border',
      )}
    >
      {label}
    </span>
  );
}

function StrengthCard({ data }: { data: StrengthAssessment }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">
              {data.planet === 'Moon' ? '☽' : '♄'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{data.planet}</span>
              <span className={cn('text-xs font-semibold capitalize', STRENGTH_COLORS[data.overallStrength])}>
                {data.overallStrength}
              </span>
              {data.isYogakaraka && (
                <Badge variant="default" className="text-xs px-1.5 py-0 h-4 bg-amber-500">
                  Yogakaraka
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {DIGNITY_LABEL[data.dignity] ?? data.dignity}
              {' · '}House {data.housePosition}
              {data.planet === 'Moon' && ` · ${data.isPakshaBala ? 'Waxing' : 'Waning'}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="text-xs text-primary hover:underline flex-shrink-0"
        >
          {open ? 'Less' : 'Details'}
        </button>
      </div>
      {open && data.recommendations.length > 0 && (
        <div className="px-3 pb-3 border-t border-border pt-3">
          <ul className="space-y-1.5">
            {data.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5 flex-shrink-0">›</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DashaCard({ data }: { data: DashaActivation }) {
  // Guard against object leak — currentDasha should always be a string
  const dashaLabel =
    typeof data.currentDasha === 'string'
      ? data.currentDasha
      : (data.currentDasha as any)?.lord ?? 'Unknown';

  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        data.isActivating ? 'border-orange-200 bg-orange-50' : 'border-border bg-card',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Zap
            className={cn(
              'h-4 w-4 mt-0.5 flex-shrink-0',
              data.isActivating ? 'text-orange-500' : 'text-muted-foreground',
            )}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{dashaLabel} Mahadasha</span>
              {data.currentAntardasha && (
                <span className="text-xs text-muted-foreground">
                  / {data.currentAntardasha} Antardasha
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{data.reason}</p>
          </div>
        </div>
        <IntensityPill
          level={data.activationLevel}
          label={data.activationLevel.replace('_', ' ')}
        />
      </div>
    </div>
  );
}

function JupiterCard({
  data,
}: {
  data: { isProtecting: boolean; protectionStrength: string; protectionType?: string };
}) {
  const colors: Record<string, string> = {
    strong:   'border-emerald-200 bg-emerald-50',
    moderate: 'border-blue-200 bg-blue-50',
    weak:     'border-border bg-card',
    none:     'border-border bg-card opacity-60',
  };
  return (
    <div className={cn('rounded-lg border p-3', colors[data.protectionStrength] ?? 'border-border bg-card')}>
      <div className="flex items-center gap-2.5">
        <Shield
          className={cn(
            'h-4 w-4 flex-shrink-0',
            data.isProtecting ? 'text-emerald-600' : 'text-muted-foreground',
          )}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Jupiter Protection</span>
            <span
              className={cn(
                'text-xs font-semibold capitalize',
                data.isProtecting ? 'text-emerald-700' : 'text-muted-foreground',
              )}
            >
              {data.protectionStrength}
            </span>
          </div>
          {data.protectionType && (
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {data.protectionType.replace(/_/g, ' ')}
            </p>
          )}
          {!data.isProtecting && (
            <p className="text-xs text-muted-foreground mt-0.5">
              No active Jupiter aspect on Moon or Saturn
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PhaseBlock({
  phase,
  isCurrent,
  isPast,
  birthDate,
}: {
  phase: EnhancedSadeSatiPeriod;
  isCurrent: boolean;
  isPast: boolean;
  birthDate: Date;
}) {
  const [open, setOpen] = useState(isCurrent);

  const phaseColor: Record<string, string> = {
    Rising:  'text-amber-600',
    Peak:    'text-red-600',
    Setting: 'text-emerald-600',
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-card',
        isCurrent ? 'border-primary' : 'border-border',
        isPast && 'opacity-50',
      )}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          {isCurrent && (
            <Circle className="h-2.5 w-2.5 fill-primary text-primary flex-shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'text-sm font-semibold',
                  isCurrent
                    ? 'text-primary'
                    : phaseColor[phase.phase ?? ''] ?? 'text-foreground',
                )}
              >
                {phase.phase} Phase
              </span>
              {isCurrent && (
                <Badge variant="default" className="text-xs px-1.5 py-0 h-4">
                  Now
                </Badge>
              )}
              {isPast && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                  Past
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {fmt(phase.startDate)} – {fmt(phase.endDate)} · Saturn in {phase.saturnSign}
            </p>
            {phase.retrogradePassCount && phase.retrogradePassCount > 1 && (
              <p className="text-xs text-orange-600 mt-0.5">
                ↩ Saturn crosses this sign {phase.retrogradePassCount}× (retrograde)
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          className="text-xs text-primary hover:underline flex-shrink-0"
        >
          {open ? 'Hide' : 'Details'}
        </button>
      </div>

      {open && (
        <div className="border-t border-border">
          {phase.internalPhases && (
            <div className="p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Internal Phases
              </p>
              {(['entry', 'peak', 'exit'] as const).map(key => {
                const ip = phase.internalPhases[key];
                const colors = {
                  entry: 'bg-blue-50 border-blue-200 text-blue-700',
                  peak:  'bg-red-50 border-red-200 text-red-700',
                  exit:  'bg-emerald-50 border-emerald-200 text-emerald-700',
                };
                return (
                  <div key={key} className={cn('rounded-md border px-3 py-2', colors[key])}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold capitalize">{key}</span>
                      <span className="text-xs">
                        {fmt(ip.start)} – {fmt(ip.end)}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 opacity-80">{ip.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {phase.peakWindows && phase.peakWindows.length > 0 && (
            <div className="px-3 pb-3 border-t border-border pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Peak Activation Windows
              </p>
              {phase.peakWindows.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Star className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    {fmtFull(w.startDate)} – {fmtFull(w.endDate)}
                    <span className="text-xs ml-1 opacity-70">({w.description})</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="px-3 pb-3 border-t border-border pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Effects
              </p>
              <ul className="space-y-1.5">
                {(PHASE_EFFECTS[phase.phase ?? ''] ?? []).map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive mt-0.5 flex-shrink-0">▸</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Remedies
              </p>
              <ul className="space-y-1.5">
                {(PHASE_REMEDIES[phase.phase ?? ''] ?? []).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-emerald-600 mt-0.5 flex-shrink-0">◈</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineEntry({
  label,
  sub,
  extra,
  status,
}: {
  label: string;
  sub: string;
  extra?: string;
  status: 'past' | 'current' | 'upcoming' | 'future';
}) {
  const dot =
    status === 'current'
      ? 'bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]'
      : status === 'upcoming'
      ? 'bg-blue-400'
      : 'bg-border';

  return (
    <div className="relative pl-6 pb-5 last:pb-0">
      <div className="absolute left-[7px] top-2 bottom-0 w-px bg-border" />
      <div
        className={cn(
          'absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background',
          dot,
        )}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={cn(
              'text-sm font-semibold',
              status === 'current' && 'text-primary',
              status === 'upcoming' && 'text-foreground',
              (status === 'past' || status === 'future') && 'text-muted-foreground',
            )}
          >
            {label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          {extra && (
            <p
              className={cn(
                'text-xs mt-0.5 italic',
                status === 'current' ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {extra}
            </p>
          )}
        </div>
        {status === 'current' && (
          <Badge variant="default" className="text-xs flex-shrink-0 mt-0.5">
            Active
          </Badge>
        )}
        {status === 'upcoming' && (
          <Badge variant="secondary" className="text-xs flex-shrink-0 mt-0.5">
            Next
          </Badge>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Saturn Cycles Table (Timeline Tab) ──────────────────────────────────────

/** Format a date as DD/MM/YYYY to match reference image */
function fmtDMY(d: any): string {
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return '—';
  const dd   = String(dt.getDate()).padStart(2, '0');
  const mm   = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Format a pass as "DD/MM/YYYY-DD/MM/YYYY" */
function fmtPass(pass: { start: Date | string; end: Date | string } | undefined): string {
  if (!pass) return '—————————————————';
  return `${fmtDMY(pass.start)}-${fmtDMY(pass.end)}`;
}

const CYCLE_LABELS: Record<number, string> = {
  1: 'First Cycle:',
  2: 'Second Cycle:',
  3: 'Third Cycle:',
};

/** Fixed display order within a cycle — matches reference image */
const EVENT_ORDER: Record<string, number> = {
  ss_setting:  0,
  dhaiya_4th:  1,
  dhaiya_8th:  2,
  ss_rising:   3,
  ss_peak:     4,
};

// ── Single cycle block ────────────────────────────────────────────────────────

function CycleBlock({ cycle, defaultOpen }: { cycle: any; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  // Sort purely chronologically within cycle
  const events: any[] = [...(cycle.events ?? [])].sort((a: any, b: any) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  if (!events.length) return null;

  // Determine group status for the cycle header badge
  const hasCurrent  = events.some((e: any) => e.status === 'current');
  const allPast     = events.every((e: any) => e.status === 'past');
  const cycleStatus = hasCurrent ? 'current' : allPast ? 'past' : 'future';

  const badgeClass =
    cycleStatus === 'current' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
    cycleStatus === 'past'    ? 'bg-muted text-muted-foreground' :
                                'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';

  const badgeLabel =
    cycleStatus === 'current' ? 'Current' :
    cycleStatus === 'past'    ? 'Past'    : 'Future';

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span className="font-bold text-[#8B1A1A] dark:text-[#e87070] text-sm">
          {CYCLE_LABELS[cycle.cycleNumber] ?? `Cycle ${cycle.cycleNumber}:`}
        </span>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', badgeClass)}>
            {badgeLabel}
          </span>
          {open
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </button>

      {/* Events table */}
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {events.map((ev: any, idx: number) => {
                const passes: any[] = ev.passes ?? [];
                const cols = [passes[0], passes[1], passes[2]];
                const isCurrentEvent = ev.status === 'current';

                return (
                  <tr
                    key={idx}
                    className={cn(
                      'border-t border-border/30',
                      isCurrentEvent
                        ? 'bg-amber-50/70 dark:bg-amber-950/25'
                        : 'hover:bg-muted/20',
                    )}
                  >
                    {/* Event label */}
                    <td className="py-2.5 pl-4 pr-3 font-medium whitespace-nowrap text-[#8B1A1A] dark:text-[#e87070] min-w-[170px]">
                      {ev.label}
                      {isCurrentEvent && (
                        <span className="ml-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse align-middle" />
                      )}
                    </td>

                    {/* Pass date columns */}
                    {cols.map((pass, ci) => (
                      <td
                        key={ci}
                        className={cn(
                          'py-2.5 px-2 tabular-nums text-xs md:text-sm',
                          pass
                            ? 'text-foreground/80'
                            : 'text-muted-foreground/40',
                        )}
                      >
                        {fmtPass(pass)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Full cycles table ─────────────────────────────────────────────────────────

function SaturnCyclesTable({
  analysis,
}: {
  analysis: any;
  birthDate: Date;
}) {
  const saturnCycles: any[] = (analysis as any).saturnCycles ?? [];

  if (!saturnCycles.length) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Saturn cycle data is not available. Please regenerate the chart.
      </div>
    );
  }

  const birthMs = birthDate.getTime();

  return (
    <div className="pt-2 space-y-3">
      {saturnCycles.map((cycle: any) => {
        // Filter out events that ended before birth date
        const filteredEvents = (cycle.events ?? []).filter(
          (e: any) => new Date(e.endDate).getTime() >= birthMs
        );
        if (!filteredEvents.length) return null;

        const filteredCycle = { ...cycle, events: filteredEvents };
        const hasCurrent = filteredEvents.some((e: any) => e.status === 'current');
        return (
          <CycleBlock
            key={cycle.cycleNumber}
            cycle={filteredCycle}
            defaultOpen={hasCurrent}
          />
        );
      })}

      <p className="text-xs text-muted-foreground text-center pt-1 pb-2">
        Dates shown as DD/MM/YYYY · Up to 3 retrograde passes per transit
      </p>
    </div>
  );
}

export function SadeSatiTableView({ 
  analysis, 
  birthDate, 
  planets,      // ✅ FIXED - added to destructuring
  ascendant,    // ✅ FIXED - added to destructuring
  dashaInfo     // ✅ FIXED - added to destructuring
}: EnhancedSadeSatiViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analysis');

  const [fetchedAnalysis, setFetchedAnalysis] = useState<EnhancedSaturnTransitAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
   console.log('🔍 SadeSati useEffect triggered');
   console.log('📊 analysis prop:', analysis);
   console.log('🌙 planets:', planets);
   console.log('🔺 ascendant:', ascendant);
   console.log('📅 dashaInfo:', dashaInfo);
    
    // If analysis provided via props AND has complete valid data, use it
    if (
      analysis && 
      analysis.sadeSati && 
      analysis.dhaiya && 
      analysis.summary &&
      analysis.currentSaturn
    ) {
      console.log('✅ Using complete analysis from props');
      setFetchedAnalysis(analysis);
      setIsLoading(false);
      return;
    }

    // If analysis exists but incomplete, log and continue to fetch
    if (analysis) {
      console.log('⚠️ Incomplete analysis prop, will fetch from API');
    }

    // Otherwise fetch from API
    const fetchSaturnTransits = async () => {
     if (!planets || !planets.Moon) {
      setError('Planet data not provided');
      setIsLoading(false);
      return;
    }

    if (!ascendant) {
      setError('Ascendant data not provided');
      setIsLoading(false);
      return;
    }

    console.log('🚀 Starting Saturn transit fetch with COMPLETE data...');
    setIsLoading(true);
    setError(null);

    try {
      const body = {
        planets,              // ALL planets (Moon, Saturn, Jupiter, etc.)
        ascendant,            // Real ascendant
        birthDateUtc: birthDate.toISOString(),
        dashaInfo,            // Dasha for activation analysis
      };

      console.log('📡 Calling API with body:', Object.keys(body));

      const response = await fetch('/api/transits/saturn/sadesati', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      console.log('📥 API response:', result);

      if (result.success && result.data) {
        // Convert date strings back to Date objects
        const processedData = convertDates(result.data);
        console.log('✅ Data processed successfully');
        setFetchedAnalysis(processedData);
      } else {
        throw new Error(result.error || 'Failed to fetch Saturn transits');
      }
    } catch (err) {
      console.error('❌ Error fetching Saturn transits:', err);
      setError('Failed to load Saturn transit analysis');
    } finally {
      setIsLoading(false);
    }
  };

  fetchSaturnTransits();
}, []); // Empty dependency array - only fetch once on mount

  // Use fetched data or props data
  const activeAnalysis = fetchedAnalysis || analysis;

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Loading Saturn transit analysis...</p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-destructive mb-2">⚠️ {error}</p>
          <p className="text-xs text-muted-foreground">Please refresh the page to try again.</p>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!activeAnalysis) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">No Saturn transit data available.</p>
        </CardContent>
      </Card>
    );
  }

  
  const { sadeSati, dhaiya, summary, currentSaturn } = activeAnalysis;
  const { current } = sadeSati;

  // Active Sade Sati period (null if not in Sade Sati)
  const activePeriod: EnhancedSadeSatiPeriod | null =
    'isActive' in current && current.isActive === false
      ? null
      : (current as EnhancedSadeSatiPeriod);

  // Active Dhaiya period (null if not in Dhaiya)
  const dhaiyaPeriod: EnhancedDhaiyaPeriod | null = dhaiya.current ?? null;

  // Shared strength source — prefer Sade Sati, fall back to Dhaiya
  const strengthSource = activePeriod ?? dhaiyaPeriod;

  // Shared dasha activation — prefer Sade Sati, fall back to Dhaiya
  const dashaSource = activePeriod?.dashaActivation ?? dhaiyaPeriod?.dashaActivation ?? null;

  // House from lagna — prefer Sade Sati, fall back to Dhaiya
  const houseFromLagna =
    activePeriod?.saturnHouseFromLagna ?? dhaiyaPeriod?.saturnHouseFromLagna ?? null;

  const currentPhaseIdx =
    activePeriod?.allPhases?.findIndex(
      p => p.phase === activePeriod.currentPhase?.phase,
    ) ?? -1;

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'analysis', label: 'Analysis' },
    { id: 'phases',   label: 'Phases' },
    { id: 'dhaiya',   label: 'Dhaiya' },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Saturn Transit Analysis</CardTitle>
          </div>

          <div
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',
              summary.currentStatus !== 'clear'
                ? INTENSITY_COLORS[
                    activePeriod?.overallImpact?.intensity ??
                    dhaiyaPeriod?.overallImpact?.intensity ??
                    'moderate'
                  ]
                : 'border-border bg-muted/50 text-muted-foreground',
            )}
          >
            <Circle
              className={cn(
                'h-2 w-2',
                summary.currentStatus !== 'clear'
                  ? 'fill-current'
                  : 'fill-muted-foreground text-muted-foreground',
              )}
            />
            {{
              in_sadesati: 'In Sade Sati',
              in_dhaiya:   'In Dhaiya',
              in_both:     'Sade Sati + Dhaiya',
              clear:       'Not Active',
            }[summary.currentStatus]}
          </div>
        </div>

        <div className="flex gap-1 mt-4 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === t.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-2">

        {/* ══════════════════════════════════════════════════════
            TAB 1: ANALYSIS
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'analysis' && (
          <div>

            {/* Impact Banner — Sade Sati */}
            {activePeriod && (
              <div
                className={cn(
                  'rounded-lg border p-4 mb-1',
                  INTENSITY_COLORS[activePeriod.overallImpact.intensity],
                )}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold">Overall Impact</span>
                      <IntensityPill
                        level={activePeriod.overallImpact.intensity}
                        label={activePeriod.overallImpact.intensity.replace('_', ' ')}
                      />
                    </div>
                    <p className="text-sm mt-1 font-medium">
                      {OUTCOME_LABELS[activePeriod.overallImpact.likelyOutcome]?.icon}{' '}
                      {OUTCOME_LABELS[activePeriod.overallImpact.likelyOutcome]?.label}
                    </p>
                    <p className="text-xs mt-1 opacity-80">
                      {activePeriod.overallImpact.recommendation}
                    </p>
                  </div>
                  <div className="text-right text-xs opacity-70">
                    <p>
                      Cycle {activePeriod.cycleNumber} ·{' '}
                      {activePeriod.ageGroup.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Impact Banner — Dhaiya (when not in Sade Sati) */}
            {!activePeriod && dhaiyaPeriod && (
              <div
                className={cn(
                  'rounded-lg border p-4 mb-1',
                  INTENSITY_COLORS[dhaiyaPeriod.overallImpact.intensity],
                )}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold">
                        {dhaiyaPeriod.type} House Dhaiya
                      </span>
                      <IntensityPill
                        level={dhaiyaPeriod.overallImpact.intensity}
                        label={dhaiyaPeriod.overallImpact.intensity}
                      />
                    </div>
                    <p className="text-sm mt-1 font-medium">
                      Saturn in {dhaiyaPeriod.saturnSign} · {dhaiyaPeriod.type} from Moon
                    </p>
                    <p className="text-xs mt-1 opacity-80">
                      {dhaiyaPeriod.overallImpact.recommendation}
                    </p>
                  </div>
                  <div className="text-right text-xs opacity-70">
                    <p>{fmt(dhaiyaPeriod.startDate)} – {fmt(dhaiyaPeriod.endDate)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Saturn Position */}
            <Section title="Current Saturn Position" defaultOpen>
              <div className="rounded-lg border border-border bg-card px-3 py-1">
                <InfoRow
                  label="Sign"
                  value={
                    currentSaturn.sign
                      ? `${SIGN_NAMES[currentSaturn.sign - 1]} · ${currentSaturn.degreeInSign?.toFixed(2)}°`
                      : '—'
                  }
                />
                <InfoRow
                  label="Motion"
                  value={currentSaturn.isRetrograde ? '↩ Retrograde' : '→ Direct'}
                  valueClass={currentSaturn.isRetrograde ? 'text-orange-600' : 'text-emerald-600'}
                />
                {houseFromLagna !== null && (
                  <InfoRow label="House from Lagna" value={`${houseFromLagna}th house`} />
                )}
                {activePeriod && (
                  <>
                    <InfoRow
                      label="House Effect"
                      value={
                        activePeriod.saturnHouseEffect.charAt(0).toUpperCase() +
                        activePeriod.saturnHouseEffect.slice(1)
                      }
                      valueClass={
                        activePeriod.saturnHouseEffect === 'positive'
                          ? 'text-emerald-600'
                          : activePeriod.saturnHouseEffect === 'challenging'
                          ? 'text-orange-600'
                          : ''
                      }
                    />
                    {activePeriod.aspectedHouses.length > 0 && (
                      <InfoRow
                        label="Saturn Aspects Houses"
                        value={activePeriod.aspectedHouses.map(h => `${h}th`).join(', ')}
                      />
                    )}
                  </>
                )}
              </div>
            </Section>

            {/* Planetary Strength — works for both Sade Sati and Dhaiya */}
            <Section
              title="Planetary Strength"
              defaultOpen
              icon={<Star className="h-3.5 w-3.5" />}
            >
              {strengthSource ? (
                <div className="space-y-2">
                  <StrengthCard data={strengthSource.moonStrength} />
                  <StrengthCard data={strengthSource.saturnStrength} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active period to analyze.</p>
              )}
            </Section>

            {/* Dasha Activation — works for both Sade Sati and Dhaiya */}
            <Section
              title="Dasha Activation"
              defaultOpen
              icon={<Zap className="h-3.5 w-3.5" />}
            >
              {dashaSource ? (
                <DashaCard data={dashaSource} />
              ) : (
                <p className="text-sm text-muted-foreground">No active period.</p>
              )}
            </Section>

            {/* Jupiter Protection — Sade Sati only */}
            <Section
              title="Jupiter Protection"
              defaultOpen
              icon={<Shield className="h-3.5 w-3.5" />}
            >
              {activePeriod ? (
                <JupiterCard data={activePeriod.jupiterProtection} />
              ) : dhaiyaPeriod ? (
                <p className="text-sm text-muted-foreground">
                  Jupiter protection analysis is available during active Sade Sati only.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No active period.</p>
              )}
            </Section>

            {/* Recommendations */}
            {summary.topRecommendations.length > 0 && (
              <Section
                title="Recommendations"
                defaultOpen
                icon={<TrendingUp className="h-3.5 w-3.5" />}
              >
                <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                  {summary.topRecommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-emerald-600 flex-shrink-0 mt-0.5">◈</span>
                      <span className="text-sm text-muted-foreground">{r}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Special Crossings — Sade Sati only */}
            {activePeriod?.specialCrossings && (
              <Section title="Special Crossings">
                <div className="rounded-lg border border-border bg-card px-3 py-1">
                  <InfoRow
                    label="Crosses Atmakaraka"
                    value={activePeriod.specialCrossings.crossesAtmakaraka ? '⚠ Yes' : 'No'}
                    valueClass={
                      activePeriod.specialCrossings.crossesAtmakaraka
                        ? 'text-orange-600'
                        : 'text-muted-foreground'
                    }
                  />
                  <InfoRow
                    label="Crosses Lagna Degree"
                    value={activePeriod.specialCrossings.crossesLagnaDegree ? '⚠ Yes' : 'No'}
                    valueClass={
                      activePeriod.specialCrossings.crossesLagnaDegree
                        ? 'text-orange-600'
                        : 'text-muted-foreground'
                    }
                  />
                  <InfoRow
                    label="Crosses 10th Lord"
                    value={activePeriod.specialCrossings.crosses10thLord ? '⚠ Yes' : 'No'}
                    valueClass={
                      activePeriod.specialCrossings.crosses10thLord
                        ? 'text-orange-600'
                        : 'text-muted-foreground'
                    }
                  />
                  <InfoRow
                    label="Crosses Yogakaraka"
                    value={activePeriod.specialCrossings.crossesYogakaraka ? '✓ Yes' : 'No'}
                    valueClass={
                      activePeriod.specialCrossings.crossesYogakaraka
                        ? 'text-emerald-600'
                        : 'text-muted-foreground'
                    }
                  />
                </div>
              </Section>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 2: PHASES
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'phases' && (
          <div>
            {activePeriod ? (
              <>
                <div className="rounded-lg border border-border bg-card px-3 py-1 mb-1">
                  <InfoRow
                    label="Period"
                    value={`${fmt(activePeriod.startDate)} – ${fmt(activePeriod.endDate)}`}
                  />
                  <InfoRow
                    label="Age Range"
                    value={`${age(activePeriod.startDate, birthDate)}–${age(activePeriod.endDate, birthDate)}`}
                  />
                  <InfoRow
                    label="Current Phase"
                    value={activePeriod.currentPhase?.phase ?? '—'}
                    valueClass="text-primary font-semibold"
                  />
                  <InfoRow
                    label="Progress"
                    value={`${activePeriod.elapsedPercentage?.toFixed(1)}% · ${activePeriod.daysRemainingInPhase} days left in ${activePeriod.currentPhase?.phase}`}
                  />
                  {activePeriod.retrogradePassCount > 1 && (
                    <InfoRow
                      label="Retrograde Passes"
                      value={`Saturn crosses ${activePeriod.retrogradePassCount}× due to retrograde`}
                      valueClass="text-orange-600"
                    />
                  )}
                </div>

                <div className="space-y-2 mt-3">
                  {activePeriod.allPhases?.map((p, i) => (
                    <PhaseBlock
                      key={p.phase}
                      phase={p as EnhancedSadeSatiPeriod}
                      isCurrent={i === currentPhaseIdx}
                      isPast={i < currentPhaseIdx}
                      birthDate={birthDate}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-border bg-card px-3 py-1 mb-3">
                  <InfoRow
                    label="Status"
                    value="No active Sade Sati"
                    valueClass="text-muted-foreground"
                  />
                  {sadeSati.next && (
                    <>
                      <InfoRow label="Next Sade Sati" value={fmt(sadeSati.next.startDate)} />
                      <InfoRow
                        label="Years Away"
                        value={`${sadeSati.next.yearsFromNow.toFixed(1)} years`}
                      />
                      <InfoRow
                        label="Expected Intensity"
                        value={sadeSati.next.expectedIntensity}
                        valueClass="capitalize"
                      />
                    </>
                  )}
                </div>
                {sadeSati.upcoming && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Upcoming Period Phases
                    </p>
                    {sadeSati.upcoming.allPhases?.map((p, i) => (
                      <PhaseBlock
                        key={p.phase}
                        phase={p as EnhancedSadeSatiPeriod}
                        isCurrent={false}
                        isPast={false}
                        birthDate={birthDate}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 3: DHAIYA
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'dhaiya' && (
          <div>
            <Section title="Current Status" defaultOpen>
              <div className="rounded-lg border border-border bg-card px-3 py-1">
                <InfoRow
                  label="Active Dhaiya"
                  value={
                    dhaiya.current
                      ? `${dhaiya.current.type} House · Saturn in ${dhaiya.current.saturnSign}`
                      : 'None active'
                  }
                  valueClass={dhaiya.current ? 'text-primary' : 'text-muted-foreground'}
                />
              </div>
            </Section>

            {dhaiya.current && (
              <Section title={`${dhaiya.current.type} House Details`} defaultOpen>
                <div className="rounded-lg border border-border bg-card px-3 py-1 mb-3">
                  <InfoRow
                    label="Period"
                    value={`${fmt(dhaiya.current.startDate)} – ${fmt(dhaiya.current.endDate)}`}
                  />
                  <InfoRow
                    label="Impact"
                    value={
                      <IntensityPill
                        level={dhaiya.current.overallImpact.intensity}
                        label={dhaiya.current.overallImpact.intensity}
                      />
                    }
                  />
                  <InfoRow
                    label="Retrograde"
                    value={
                      dhaiya.current.retrogradePattern?.hasRetrograde
                        ? `${dhaiya.current.retrogradePattern.touchCount}× passes (${dhaiya.current.retrogradePattern.pattern.replace(/_/g, ' ')})`
                        : 'Single pass'
                    }
                  />
                </div>

                {dhaiya.current.internalPhases && (
                  <div className="space-y-2">
                    {(['entry', 'peak', 'exit'] as const).map(key => {
                      const ip = dhaiya.current!.internalPhases[key];
                      const colors = {
                        entry: 'bg-blue-50 border-blue-200 text-blue-700',
                        peak:  'bg-red-50 border-red-200 text-red-700',
                        exit:  'bg-emerald-50 border-emerald-200 text-emerald-700',
                      };
                      return (
                        <div key={key} className={cn('rounded-md border px-3 py-2', colors[key])}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold capitalize">{key}</span>
                            <span className="text-xs">
                              {fmt(ip.start)} – {fmt(ip.end)}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5 opacity-80">{ip.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-2 mt-3">
                  <DashaCard data={dhaiya.current.dashaActivation} />
                  <p className="text-xs text-muted-foreground mt-2">
                    {dhaiya.current.overallImpact.recommendation}
                  </p>
                </div>
              </Section>
            )}

            <Section
              title="4th House (Ardha Sade Sati)"
              badge={dhaiya.upcoming4th.length.toString()}
              defaultOpen
            >
              <p className="text-xs text-muted-foreground mb-2">
                Saturn transiting the 4th house from Moon. Domestic pressures, property
                concerns, emotional challenges.
              </p>
              {dhaiya.upcoming4th.length > 0 ? (
                dhaiya.upcoming4th.map((d, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-3">
                    <p className="text-sm font-medium">
                      {fmt(d.startDate)} – {fmt(d.endDate)} · Saturn in {d.saturnSign}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {d.overallImpact.intensity} impact ·{' '}
                      {d.retrogradePattern?.pattern?.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No upcoming 4th house periods calculated.
                </p>
              )}
            </Section>

            <Section
              title="8th House (Ashtama Shani)"
              badge={dhaiya.upcoming8th.length.toString()}
              defaultOpen
            >
              <p className="text-xs text-muted-foreground mb-2">
                Saturn transiting the 8th house from Moon. Sudden obstacles, health
                concerns, transformation.
              </p>
              {dhaiya.upcoming8th.length > 0 ? (
                dhaiya.upcoming8th.map((d, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-3">
                    <p className="text-sm font-medium">
                      {fmt(d.startDate)} – {fmt(d.endDate)} · Saturn in {d.saturnSign}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {d.overallImpact.intensity} impact ·{' '}
                      {d.retrogradePattern?.pattern?.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No upcoming 8th house periods calculated.
                </p>
              )}
            </Section>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 4: TIMELINE
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'timeline' && (
          <SaturnCyclesTable
            analysis={activeAnalysis}
            birthDate={birthDate}
          />
        )}

      </CardContent>
    </Card>
  );
}
