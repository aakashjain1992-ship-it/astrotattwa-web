'use client';

/**
 * Sade Sati Table View
 *
 * Three states:
 *   1A — Active: user is currently in a Sade Sati or Dhaiya period
 *   1B — Clear:  no active period right now
 *   2  — Detail: a timeline row was clicked → shows PeriodDetailView
 *
 * The 4-tab design (Analysis / Phases / Dhaiya / Timeline) has been removed.
 * All depth is now accessed by clicking a row in the Saturn Cycles table.
 *
 * @file SadeSatiTableView.tsx
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  fmtDMY,
  fmtPass,
  convertDates,
  TRANSIT_RESULTS,
  CYCLE_LABELS,
} from './shared';
import { PeriodDetailView } from './PeriodDetailView';
import type {
  EnhancedSaturnTransitAnalysis,
} from '@/lib/astrology/sadesati/types-enhanced';
import type { PlanetData, AscendantData } from '@/types/astrology';
import type { SelectedPeriod } from '@/lib/astrology/sadesati/period-analysis-types';
import { RASHI_NAMES } from '@/lib/astrology/sadesati/constants';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface EnhancedSadeSatiViewProps {
  analysis?: EnhancedSaturnTransitAnalysis;
  birthDate: Date;
  planets?: Record<string, PlanetData>;
  ascendant?: AscendantData;
  dashaInfo?: any;
  moonLongitude?: number;
  elapsedFractionOfNakshatra?: number;
  nakshatraLord?: string;
  utcBirthDate?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const toDate = (d: any): Date => (d instanceof Date ? d : new Date(d));

function ageAt(date: Date, birth: Date): number {
  return Math.floor((date.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function yearsAway(date: Date): string {
  const ms = date.getTime() - Date.now();
  if (ms <= 0) return 'past';
  const yrs = ms / (365.25 * 24 * 60 * 60 * 1000);
  if (yrs < 1) return `~${Math.round(yrs * 12)} months`;
  return `~${Math.round(yrs)} years`;
}

function displayLabel(label: string): string {
  const map: Record<string, string> = {
    "Sadesati's 1st Dhaiya": 'Sade Sati — Rising Phase',
    "Sadesati's 2nd Dhaiya": 'Sade Sati — Peak Phase',
    "Sadesati's 3rd Dhaiya": 'Sade Sati — Setting Phase',
    'Dhaiya over 4th House': 'Dhaiya — 4th House',
    'Dhaiya over 8th House': 'Dhaiya — 8th House',
  };
  return map[label] ?? label;
}

function eventToSelectedPeriod(ev: any): SelectedPeriod {
  const signName = ev.saturnSign ?? '';
  const signIdx  = RASHI_NAMES.indexOf(signName as any);
  const signNum  = signIdx >= 0 ? signIdx + 1 : 1;

  const typeToHouse: Record<string, 12 | 1 | 2 | 4 | 8> = {
    ss_rising:  12,
    ss_peak:    1,
    ss_setting: 2,
    dhaiya_4th: 4,
    dhaiya_8th: 8,
  };

  return {
    type:           ev.type,
    label:          displayLabel(ev.label),
    cycleNumber:    ev.cycleNumber,
    saturnSign:     signNum,
    saturnSignName: signName,
    startDate:      toDate(ev.startDate),
    endDate:        toDate(ev.endDate),
    passes:         (ev.passes ?? []).map((p: any) => ({
      start: toDate(p.start),
      end:   toDate(p.end),
    })),
    status:         ev.status,
    houseFromMoon:  typeToHouse[ev.type] ?? 1,
  };
}

// ─── Intensity fill for timeline bar ──────────────────────────────────────────

const INTENSITY_FILL: Record<string, string> = {
  ss_peak:    'bg-foreground/40',
  ss_rising:  'bg-foreground/25 border border-border',
  ss_setting: 'bg-foreground/25 border border-border',
  dhaiya_8th: 'bg-foreground/30',
  dhaiya_4th: 'bg-foreground/15 border border-border',
};

// ─── Period card ───────────────────────────────────────────────────────────────

function PeriodCard({ ev, birthDate, onClick }: {
  ev: any;
  birthDate: Date;
  onClick: (ev: any) => void;
}) {
  const resultInfo = TRANSIT_RESULTS[ev.type];
  const startDate  = toDate(ev.startDate);
  const isActive   = ev.status === 'current';

  return (
    <button
      onClick={() => onClick(ev)}
      className={cn(
        'w-full text-left border border-border rounded-lg p-3 transition-colors hover:bg-muted/40 mb-2',
        isActive && 'bg-muted/30 border-foreground/20',
      )}
    >
      <div className="flex justify-between items-start mb-1 gap-2">
        <span className="text-sm font-semibold text-foreground">{displayLabel(ev.label)}</span>
        <span className={cn('text-xs font-semibold flex-shrink-0', resultInfo?.resultClass)}>
          {resultInfo?.result}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {ev.saturnSign} · {fmtDMY(startDate)}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        When you&rsquo;re {ageAt(startDate, birthDate)} · {yearsAway(startDate)} away
      </p>
    </button>
  );
}

// ─── Grayscale timeline bar ────────────────────────────────────────────────────

function TimelineBar({ saturnCycles, birthDate, onEventClick }: {
  saturnCycles: any[];
  birthDate: Date;
  onEventClick: (ev: any) => void;
}) {
  const allEvents: any[] = saturnCycles
    .flatMap((c: any) => c.events ?? [])
    .filter((ev: any) => toDate(ev.endDate).getTime() >= birthDate.getTime())
    .sort((a: any, b: any) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime());

  if (!allEvents.length) return null;

  // For each event, compute the display start (clamped to birth) and display end
  const eventDisplayRanges = allEvents.map(ev => ({
    ev,
    displayStart: toDate(ev.startDate) < birthDate ? birthDate : toDate(ev.startDate),
    displayEnd:   toDate(ev.endDate),
  }));

  const totalMs = eventDisplayRanges.reduce((sum, { displayStart, displayEnd }) =>
    sum + Math.max(0, displayEnd.getTime() - displayStart.getTime()), 0);

  if (totalMs === 0) return null;

  return (
    <div>
      <p className="text-xs text-muted-foreground/60 mb-2">
        Age at start · darker = heavier · tap to open
      </p>
      <div className="flex gap-1 items-stretch overflow-x-auto pb-1">
        {eventDisplayRanges.map(({ ev, displayStart, displayEnd }, i) => {
          const durationMs = displayEnd.getTime() - displayStart.getTime();
          const widthPct   = Math.max(5, (durationMs / totalMs) * 100);
          const isNow      = ev.status === 'current';
          const startAge   = ageAt(displayStart, birthDate);
          // Show age label if block is wide enough (> 4% of total)
          const showAge    = widthPct > 4;

          return (
            <button
              key={i}
              onClick={() => onEventClick(ev)}
              title={`${displayLabel(ev.label)} — ${ev.saturnSign} · Age ${startAge}`}
              style={{ flexBasis: `${widthPct}%`, flexShrink: 0 }}
              className={cn(
                'h-10 rounded-md transition-opacity hover:opacity-70 flex items-center justify-center relative',
                INTENSITY_FILL[ev.type] ?? 'bg-foreground/10',
                isNow && 'outline outline-2 outline-foreground outline-offset-1',
              )}
            >
              {showAge && (
                <span className={cn(
                  'text-[10px] font-medium leading-none select-none',
                  ev.type === 'ss_peak' || ev.type === 'dhaiya_8th'
                    ? 'text-foreground/70'
                    : 'text-foreground/50',
                )}>
                  {startAge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── What are these periods? ───────────────────────────────────────────────────

function SadeSatiDescription() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm text-muted-foreground">What are these periods?</span>
        {open
          ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-border space-y-3 text-sm text-muted-foreground">
          <p>
            A horoscope is under <strong className="text-foreground">Sade Sati</strong> when Saturn
            transits through the 12th, 1st, and 2nd house from the natal Moon. It is under{' '}
            <strong className="text-foreground">Dhaiya</strong> when Saturn transits the 4th or 8th
            house from the natal Moon.
          </p>
          <p>
            Sade Sati lasts approximately <strong className="text-foreground">7½ years</strong> and
            Dhaiya lasts <strong className="text-foreground">2½ years</strong>. These periods
            generally influence health, mental peace, and finances.
          </p>
          <p>
            Sade Sati occurs three times in a lifetime — in childhood, youth, and old age.
            The first affects education and parents; the second affects profession and family;
            the third affects health most significantly.
          </p>
          <div className="rounded-md border border-border overflow-hidden mt-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {['Phase', 'House from Moon', 'Duration', 'Focus Area'].map(h => (
                    <th key={h} className="py-2 px-3 text-left font-semibold text-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { phase: 'Sade Sati — Rising',  house: '12th (before Moon)', dur: '~2.5 yrs', focus: 'Expenses, foreign travel, losses' },
                  { phase: 'Sade Sati — Peak',    house: '1st (Moon sign)',    dur: '~2.5 yrs', focus: 'Health, identity, mental stress' },
                  { phase: 'Sade Sati — Setting', house: '2nd (after Moon)',   dur: '~2.5 yrs', focus: 'Family, finances, speech' },
                  { phase: 'Dhaiya — 4th House',  house: '4th from Moon',      dur: '~2.5 yrs', focus: 'Career, property, mother' },
                  { phase: 'Dhaiya — 8th House',  house: '8th from Moon',      dur: '~2.5 yrs', focus: 'Wealth, sudden changes, health' },
                ].map((row, i) => (
                  <tr key={i} className={cn('border-t border-border/50', i % 2 === 0 ? 'bg-background' : 'bg-muted/20')}>
                    <td className="py-2 px-3 font-medium text-foreground">{row.phase}</td>
                    <td className="py-2 px-3">{row.house}</td>
                    <td className="py-2 px-3 whitespace-nowrap">{row.dur}</td>
                    <td className="py-2 px-3">{row.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs">
            <strong className="text-foreground">1st Entry / Re-entry / Final Entry:</strong>{' '}
            Saturn's retrograde motion can cause it to leave a sign and re-enter it — sometimes
            twice. Each column shows a separate stay period, with re-entries often being the
            most intense phase.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Cycle block ───────────────────────────────────────────────────────────────

function CycleBlock({ cycle, defaultOpen, onEventClick }: {
  cycle: any;
  defaultOpen: boolean;
  onEventClick: (ev: any) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const events: any[] = [...(cycle.events ?? [])].sort(
    (a: any, b: any) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime(),
  );
  if (!events.length) return null;

  const hasCurrent  = events.some((e: any) => e.status === 'current');
  const allPast     = events.every((e: any) => e.status === 'past');
  const cycleStatus = hasCurrent ? 'current' : allPast ? 'past' : 'future';
  const badgeClass  =
    cycleStatus === 'current' ? 'bg-amber-500 text-white' :
    cycleStatus === 'past'    ? 'bg-muted text-muted-foreground' :
                                'bg-blue-500 text-white';
  const badgeLabel  = cycleStatus === 'current' ? 'Current' : cycleStatus === 'past' ? 'Past' : 'Future';

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold text-foreground text-sm">
          {CYCLE_LABELS[cycle.cycleNumber] ?? `Cycle ${cycle.cycleNumber}:`}
        </span>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', badgeClass)}>
            {badgeLabel}
          </span>
          {open
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <>
          {/* ── Mobile card layout (< md) ── */}
          <div className="md:hidden divide-y divide-border/30">
            {events.map((ev: any, idx: number) => {
              const passes: any[] = ev.passes ?? [];
              const isNow = ev.status === 'current';
              const resultInfo = TRANSIT_RESULTS[ev.type];
              return (
                <button
                  key={idx}
                  onClick={() => onEventClick(ev)}
                  className={cn(
                    'w-full text-left px-4 py-3 transition-colors active:bg-muted/40',
                    isNow ? 'bg-amber-50/40 dark:bg-amber-950/10' :
                    ev.status === 'past' ? 'opacity-60' : '',
                  )}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className={cn(
                      'text-sm font-semibold leading-tight',
                      ev.status === 'past' ? 'text-muted-foreground' : 'text-foreground',
                    )}>
                      {displayLabel(ev.label)}
                      {isNow && <span className="ml-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse align-middle" />}
                    </span>
                    <span className={cn(
                      'text-xs font-semibold flex-shrink-0 mt-0.5',
                      ev.status === 'past' ? 'text-muted-foreground/60' : resultInfo?.resultClass,
                    )}>
                      {resultInfo?.result ?? '—'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Saturn in {ev.saturnSign ?? '—'} · {resultInfo?.area ?? '—'}
                  </p>
                  <div className="space-y-0.5">
                    {passes.map((pass, pi) => pass && (
                      <p key={pi} className="text-xs text-muted-foreground/80 tabular-nums">
                        <span className="text-muted-foreground/50 mr-1">
                          {pi === 0 ? '1st:' : pi === 1 ? 'Re-entry:' : 'Final:'}
                        </span>
                        {fmtPass(pass)}
                      </p>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Desktop table layout (≥ md) ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="py-2 pl-4 pr-3 text-left text-xs font-medium text-muted-foreground min-w-[170px]">Transit</th>
                  <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Saturn in</th>
                  <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">1st Entry</th>
                  <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">Re-entry</th>
                  <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">Final Entry</th>
                  <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Result</th>
                  <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Life Area</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev: any, idx: number) => {
                  const passes: any[] = ev.passes ?? [];
                  const cols = [passes[0], passes[1], passes[2]];
                  const isNow = ev.status === 'current';
                  return (
                    <tr
                      key={idx}
                      onClick={() => onEventClick(ev)}
                      className={cn(
                        'border-t border-border/30 cursor-pointer transition-colors hover:bg-muted/30',
                        isNow          ? 'bg-amber-50/40 dark:bg-amber-950/10' :
                        ev.status === 'past' ? 'opacity-60 hover:opacity-100' : '',
                      )}
                    >
                      <td className={cn(
                        'py-2.5 pl-4 pr-3 font-semibold whitespace-nowrap',
                        ev.status === 'past' ? 'text-muted-foreground' : 'text-foreground',
                      )}>
                        {displayLabel(ev.label)}
                        {isNow && <span className="ml-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse align-middle" />}
                      </td>
                      <td className="py-2.5 px-2 text-xs text-muted-foreground whitespace-nowrap">{ev.saturnSign ?? '—'}</td>
                      {cols.map((pass, ci) => (
                        <td key={ci} className={cn(
                          'py-2.5 px-2 tabular-nums text-xs',
                          !pass                ? 'text-muted-foreground/30' :
                          isNow                ? 'text-foreground font-medium' :
                          ev.status === 'past' ? 'text-muted-foreground/70' :
                                                 'text-foreground/80',
                        )}>
                          {fmtPass(pass)}
                        </td>
                      ))}
                      <td className="py-2.5 px-2 text-xs whitespace-nowrap">
                        <span className={cn(
                          'font-semibold',
                          ev.status === 'past' ? 'text-muted-foreground/60' : TRANSIT_RESULTS[ev.type]?.resultClass ?? 'text-muted-foreground',
                        )}>
                          {TRANSIT_RESULTS[ev.type]?.result ?? '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-xs text-muted-foreground whitespace-nowrap">
                        {TRANSIT_RESULTS[ev.type]?.area ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Saturn Cycles Table ───────────────────────────────────────────────────────

function SaturnCyclesTable({ analysis, birthDate, onEventClick }: {
  analysis: any;
  birthDate: Date;
  onEventClick: (ev: any) => void;
}) {
  const saturnCycles: any[] = (analysis as any).saturnCycles ?? [];
  const birthMs = birthDate.getTime();
  if (!saturnCycles.length) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Saturn cycle data is not available. Please regenerate the chart.
      </div>
    );
  }
  return (
    <div className="space-y-3 pt-2">
      {saturnCycles.map((cycle: any) => {
        const filteredEvents = (cycle.events ?? []).filter(
          (e: any) => toDate(e.endDate).getTime() >= birthMs,
        );
        if (!filteredEvents.length) return null;
        const hasCurrent = filteredEvents.some((e: any) => e.status === 'current');
        return (
          <CycleBlock
            key={cycle.cycleNumber}
            cycle={{ ...cycle, events: filteredEvents }}
            defaultOpen={hasCurrent}
            onEventClick={onEventClick}
          />
        );
      })}
    </div>
  );
}

// ─── Active status card ────────────────────────────────────────────────────────

function ActiveStatusCard({ analysis, birthDate, onOpenDetail }: {
  analysis: EnhancedSaturnTransitAnalysis;
  birthDate: Date;
  onOpenDetail: (ev: any) => void;
}) {
  const currentEvent = ((analysis as any).saturnCycles ?? [])
    .flatMap((c: any) => c.events ?? [])
    .find((e: any) => e.status === 'current');

  if (!currentEvent) return null;

  const endDate   = toDate(currentEvent.endDate);
  const startDate = toDate(currentEvent.startDate);
  const totalMs   = endDate.getTime() - startDate.getTime();
  const elapsedMs = Date.now() - startDate.getTime();
  const pct       = Math.max(0, Math.min(100, Math.round((elapsedMs / totalMs) * 100)));
  const msLeft    = endDate.getTime() - Date.now();
  const mthsLeft  = Math.max(0, Math.round(msLeft / (30.44 * 24 * 60 * 60 * 1000)));
  const timeLeft  = mthsLeft > 18 ? `~${Math.round(mthsLeft / 12)} years` : `~${mthsLeft} months`;

  return (
    <div className="border border-border rounded-lg mb-4 overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Active now · ends in {timeLeft}
          </span>
        </div>
        <p className="text-base font-semibold text-foreground mb-1">{displayLabel(currentEvent.label)}</p>
        <p className="text-sm text-muted-foreground mb-3">
          Saturn in your{' '}
          {currentEvent.type === 'ss_rising'  ? '12th house from Moon' :
           currentEvent.type === 'ss_peak'    ? '1st house (Moon sign)' :
           currentEvent.type === 'ss_setting' ? '2nd house from Moon' :
           currentEvent.type === 'dhaiya_4th' ? '4th house from Moon' :
                                                '8th house from Moon'}
        </p>
        <div className="h-[3px] bg-border rounded-full mb-1.5">
          <div className="h-full bg-muted-foreground rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{fmtDMY(startDate)}</span>
          <span className="text-foreground/70">{pct}% done</span>
          <span>{fmtDMY(endDate)}</span>
        </div>
      </div>
      <button
        onClick={() => onOpenDetail(currentEvent)}
        className="w-full flex justify-between items-center px-4 py-2.5 border-t border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <span>See full analysis</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Clear status card ─────────────────────────────────────────────────────────

function ClearStatusCard({ analysis, birthDate }: {
  analysis: EnhancedSaturnTransitAnalysis;
  birthDate: Date;
}) {
  const upcoming = ((analysis as any).saturnCycles ?? [])
    .flatMap((c: any) => c.events ?? [])
    .filter((e: any) => e.status === 'upcoming')
    .sort((a: any, b: any) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime());

  const nextSS = upcoming.find((e: any) => ['ss_rising','ss_peak','ss_setting'].includes(e.type));
  const nextDH = upcoming.find((e: any) => ['dhaiya_4th','dhaiya_8th'].includes(e.type));

  const yrsToSS = nextSS ? (toDate(nextSS.startDate).getTime() - Date.now()) / (365.25*24*60*60*1000) : null;
  const yrsToDH = nextDH ? (toDate(nextDH.startDate).getTime() - Date.now()) / (365.25*24*60*60*1000) : null;

  return (
    <div className="border border-border rounded-lg mb-4 overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">No active Saturn pressure</span>
        </div>
        <p className="text-base font-semibold text-foreground mb-1.5">You&rsquo;re in a clear window</p>
        <p className="text-sm text-muted-foreground">
          Saturn is not transiting any sensitive position. These years reward consistent effort.
        </p>
      </div>
      {(nextSS || nextDH) && (
        <div className={cn('border-t border-border grid', nextSS && nextDH ? 'grid-cols-2' : 'grid-cols-1')}>
          {nextSS && (
            <div className={cn('px-4 py-3', nextDH && 'border-r border-border')}>
              <p className="text-xs text-muted-foreground mb-1">Next Sade Sati</p>
              <p className="text-base font-semibold text-foreground">~{Math.round(yrsToSS!)} yrs</p>
              <p className="text-xs text-muted-foreground">Age {ageAt(toDate(nextSS.startDate), birthDate)}</p>
            </div>
          )}
          {nextDH && (
            <div className="px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Next Dhaiya</p>
              <p className="text-base font-semibold text-foreground">~{Math.round(yrsToDH!)} yrs</p>
              <p className="text-xs text-muted-foreground">Age {ageAt(toDate(nextDH.startDate), birthDate)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Clear window advice ───────────────────────────────────────────────────────

function ClearWindowAdvice({ isYogakaraka }: { isYogakaraka?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-semibold text-foreground">How to use this clear window</span>
        {open
          ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          <div className="border-l-2 border-l-emerald-500 pl-3 py-1">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">Build now</p>
            <ul className="space-y-1.5">
              {[
                'Health habits formed now persist through future pressure periods',
                'Financial foundations built here withstand Saturn\'s scrutiny later',
                'Relationships deepened in clear windows carry more resilience',
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 flex-shrink-0">›</span>{s}
                </li>
              ))}
            </ul>
          </div>
          {isYogakaraka && (
            <div className="border-l-2 border-l-blue-500 pl-3 py-1">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Your chart specifically</p>
              <p className="text-sm text-muted-foreground">
                Saturn is constructive for your rising sign — even future Saturn periods
                tend to build something lasting rather than just cause difficulty.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function SadeSatiTableView({
  analysis,
  birthDate,
  planets,
  ascendant,
  dashaInfo,
  moonLongitude,
  elapsedFractionOfNakshatra,
  nakshatraLord,
  utcBirthDate,
}: EnhancedSadeSatiViewProps) {

  const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod | null>(null);
  const [fetchedAnalysis, setFetchedAnalysis] = useState<EnhancedSaturnTransitAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch sadesati analysis from API when not provided via props
  // (chartData.saturnTransits is only populated after first load + localStorage save)
  useEffect(() => {
    // Use props data if it has the required fields
    if (
      analysis &&
      analysis.sadeSati &&
      analysis.dhaiya &&
      analysis.summary &&
      analysis.currentSaturn
    ) {
      return;
    }

    if (!planets?.Moon || !ascendant) {
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    fetch('/api/transits/saturn/sadesati', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planets,
        ascendant,
        birthDateUtc: birthDate.toISOString(),
        dashaInfo,
      }),
    })
      .then(r => r.json())
      .then(result => {
        if (result.success && result.data) {
          setFetchedAnalysis(convertDates(result.data));
        } else {
          throw new Error(result.error?.message || 'Failed to load Saturn analysis');
        }
      })
      .catch(err => setFetchError(err.message || 'Failed to load Saturn transit analysis'))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeAnalysis = fetchedAnalysis ?? analysis ?? null;

  // ── State 2: Period selected ───────────────────────────────────
  // ── State 2: Period selected ───────────────────────────────────
  if (selectedPeriod) {
    return (
      <PeriodDetailView
        period={selectedPeriod}
        birthDate={birthDate}
        planets={planets ?? {}}
        ascendant={ascendant!}
        moonLongitude={moonLongitude ?? planets?.Moon?.longitude ?? 0}
        elapsedFractionOfNakshatra={
          elapsedFractionOfNakshatra ?? planets?.Moon?.kp?.elapsedFractionOfNakshatra ?? 0
        }
        nakshatraLord={nakshatraLord ?? planets?.Moon?.kp?.nakshatraLord ?? 'Ketu'}
        utcBirthDate={utcBirthDate ?? birthDate.toISOString()}
        onBack={() => setSelectedPeriod(null)}
      />
    );
  }

  // ── Loading ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Loading Saturn transit analysis…</p>
        </CardContent>
      </Card>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-destructive mb-2">⚠️ {fetchError}</p>
          <p className="text-xs text-muted-foreground">Please refresh the page to try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (!activeAnalysis) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-sm text-muted-foreground">No Saturn transit data available.</p>
        </CardContent>
      </Card>
    );
  }

  const handleEventClick = (ev: any) => setSelectedPeriod(eventToSelectedPeriod(ev));

  const { summary } = activeAnalysis;
  const isActive   = summary.currentStatus !== 'clear';
  const saturnCycles: any[] = (activeAnalysis as any).saturnCycles ?? [];

  const upcomingEvents = saturnCycles
    .flatMap((c: any) => c.events ?? [])
    .filter((e: any) => e.status === 'upcoming')
    .sort((a: any, b: any) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime())
    .slice(0, 2);

  const lagnaSign = ascendant?.signNumber;
  const isYogakaraka = lagnaSign === 2 || lagnaSign === 7;

  return (
    <Card>
      <CardContent className="pt-5 pb-6">
        {/* State 1A: Active */}
        {isActive && (
          <>
            <ActiveStatusCard analysis={activeAnalysis} birthDate={birthDate} onOpenDetail={handleEventClick} />
            {upcomingEvents.length > 0 && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-5">
                  Coming up
                </p>
                {upcomingEvents.map((ev: any, i: number) => (
                  <PeriodCard key={i} ev={ev} birthDate={birthDate} onClick={handleEventClick} />
                ))}
              </>
            )}
          </>
        )}

        {/* State 1B: Clear */}
        {!isActive && (
          <>
            <ClearStatusCard analysis={activeAnalysis} birthDate={birthDate} />
            <ClearWindowAdvice isYogakaraka={isYogakaraka} />
            {upcomingEvents[0] && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-4">
                  Next approaching
                </p>
                <PeriodCard ev={upcomingEvents[0]} birthDate={birthDate} onClick={handleEventClick} />
              </>
            )}
          </>
        )}

        {/* Timeline bar — both states */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-5">
          All periods
        </p>
        <div className="border border-border rounded-lg p-4 mb-4">
          <TimelineBar saturnCycles={saturnCycles} birthDate={birthDate} onEventClick={handleEventClick} />
        </div>

        {/* Full cycle table */}
        <SaturnCyclesTable analysis={activeAnalysis} birthDate={birthDate} onEventClick={handleEventClick} />

        {/* Explainer — bottom */}
        <div className="mt-4">
          <SadeSatiDescription />
        </div>
      </CardContent>
    </Card>
  );
}
