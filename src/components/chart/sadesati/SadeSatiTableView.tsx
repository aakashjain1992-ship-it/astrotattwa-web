'use client';

/**
 * Enhanced Sade Sati View
 *
 * Displays all 15 Sade Sati + 11 Dhaiya factors from the professional calculator.
 * Consumes EnhancedSaturnTransitAnalysis from calculator-PROFESSIONAL.ts
 *
 * Sections:
 *  1. Status Banner         — currentStatus + activationLevel
 *  2. Analysis Summary      — overallImpact + topRecommendations
 *  3. Strength Factors      — Moon strength, Saturn strength, Yogakaraka
 *  4. Activation Factors    — Dasha activation, Jupiter protection
 *  5. Saturn Positioning    — house from lagna, aspected areas
 *  6. Sade Sati Phases      — three phases with internal entry/peak/exit
 *  7. Peak Windows          — degree-based peak activation
 *  8. Dhaiya               — 4th/8th house periods with their own analysis
 *  9. Timeline             — lifetime view
 *
 * @file EnhancedSadeSatiView.tsx
 * @version 1.0.0
 */

import { useState } from 'react';
import { Circle, ChevronDown, ChevronRight, Shield, AlertTriangle, TrendingUp, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EnhancedSaturnTransitAnalysis, EnhancedSadeSatiPeriod, DashaActivation } from '@/lib/astrology/sadesati/types-enhanced';
import type { StrengthAssessment } from '@/lib/astrology/sadesati/strengthAnalyzer';
import { PHASE_EFFECTS, PHASE_REMEDIES } from '@/lib/astrology/sadesati/constants';

// ─── Props ────────────────────────────────────────────────────────────────────

interface EnhancedSadeSatiViewProps {
  analysis: EnhancedSaturnTransitAnalysis;
  birthDate: Date;
}

type ActiveTab = 'analysis' | 'phases' | 'dhaiya' | 'timeline';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDate = (d: any): Date => (d instanceof Date ? d : new Date(d));
const fmt = (d: any) => toDate(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
const fmtFull = (d: any) => toDate(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
const age = (d: any, birth: Date) =>
  Math.floor((toDate(d).getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

const INTENSITY_COLORS: Record<string, string> = {
  very_intense: 'text-red-600 bg-red-50 border-red-200',
  intense:      'text-orange-600 bg-orange-50 border-orange-200',
  moderate:     'text-amber-600 bg-amber-50 border-amber-200',
  mild:         'text-emerald-600 bg-emerald-50 border-emerald-200',
  very_mild:    'text-emerald-600 bg-emerald-50 border-emerald-200',
};

const ACTIVATION_COLORS: Record<string, string> = {
  very_high: 'text-red-600 bg-red-50 border-red-200',
  high:      'text-orange-600 bg-orange-50 border-orange-200',
  moderate:  'text-amber-600 bg-amber-50 border-amber-200',
  low:       'text-emerald-600 bg-emerald-50 border-emerald-200',
  minimal:   'text-emerald-600 bg-emerald-50 border-emerald-200',
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
  transformative_growth:  { label: 'Transformative Growth',  icon: '🌱' },
  challenging_lessons:    { label: 'Challenging Lessons',     icon: '⚡' },
  mixed:                  { label: 'Mixed Results',           icon: '⚖️' },
  relatively_smooth:      { label: 'Relatively Smooth',       icon: '✨' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Collapsible section with chevron */
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
          {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="pb-4 space-y-3">{children}</div>}
    </div>
  );
}

/** Row like AvakhadaTable's AttributeRow */
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

/** Pill badge for intensity / activation */
function IntensityPill({ level, label }: { level: string; label: string }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold capitalize',
      INTENSITY_COLORS[level] ?? 'text-muted-foreground bg-muted border-border',
    )}>
      {label}
    </span>
  );
}

/** Strength card for Moon / Saturn */
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

/** Dasha activation card */
function DashaCard({ data }: { data: DashaActivation }) {
  return (
    <div className={cn(
      'rounded-lg border p-3',
      data.isActivating ? 'border-orange-200 bg-orange-50' : 'border-border bg-card',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Zap className={cn(
            'h-4 w-4 mt-0.5 flex-shrink-0',
            data.isActivating ? 'text-orange-500' : 'text-muted-foreground',
          )} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{data.currentDasha} Mahadasha</span>
              {data.currentAntardasha && (
                <span className="text-xs text-muted-foreground">/ {data.currentAntardasha} Antardasha</span>
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

/** Jupiter protection card */
function JupiterCard({ data }: {
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
        <Shield className={cn(
          'h-4 w-4 flex-shrink-0',
          data.isProtecting ? 'text-emerald-600' : 'text-muted-foreground',
        )} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Jupiter Protection</span>
            <span className={cn(
              'text-xs font-semibold capitalize',
              data.isProtecting ? 'text-emerald-700' : 'text-muted-foreground',
            )}>
              {data.protectionStrength}
            </span>
          </div>
          {data.protectionType && (
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {data.protectionType.replace(/_/g, ' ')}
            </p>
          )}
          {!data.isProtecting && (
            <p className="text-xs text-muted-foreground mt-0.5">No active Jupiter aspect on Moon or Saturn</p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Phase block (Rising / Peak / Setting) with internal Entry-Peak-Exit breakdown */
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
    <div className={cn(
      'rounded-lg border bg-card',
      isCurrent ? 'border-primary' : 'border-border',
      isPast && 'opacity-50',
    )}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          {isCurrent && <Circle className="h-2.5 w-2.5 fill-primary text-primary flex-shrink-0" />}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'text-sm font-semibold',
                isCurrent ? 'text-primary' : phaseColor[phase.phase ?? ''] ?? 'text-foreground',
              )}>
                {phase.phase} Phase
              </span>
              {isCurrent && <Badge variant="default" className="text-xs px-1.5 py-0 h-4">Now</Badge>}
              {isPast && <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">Past</Badge>}
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
          {/* Internal phases */}
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
                      <span className="text-xs">{fmt(ip.start)} – {fmt(ip.end)}</span>
                    </div>
                    <p className="text-xs mt-0.5 opacity-80">{ip.description}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Peak windows */}
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

          {/* Effects & Remedies */}
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

/** Timeline entry */
function TimelineEntry({
  label, sub, extra, status,
}: {
  label: string; sub: string; extra?: string;
  status: 'past' | 'current' | 'upcoming' | 'future';
}) {
  const dot =
    status === 'current'  ? 'bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]'
    : status === 'upcoming' ? 'bg-blue-400'
    : 'bg-border';

  return (
    <div className="relative pl-6 pb-5 last:pb-0">
      <div className="absolute left-[7px] top-2 bottom-0 w-px bg-border" />
      <div className={cn('absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background', dot)} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={cn(
            'text-sm font-semibold',
            status === 'current'  && 'text-primary',
            status === 'upcoming' && 'text-foreground',
            (status === 'past' || status === 'future') && 'text-muted-foreground',
          )}>
            {label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          {extra && <p className={cn('text-xs mt-0.5 italic', status === 'current' ? 'text-primary' : 'text-muted-foreground')}>{extra}</p>}
        </div>
        {status === 'current'  && <Badge variant="default"    className="text-xs flex-shrink-0 mt-0.5">Active</Badge>}
        {status === 'upcoming' && <Badge variant="secondary"  className="text-xs flex-shrink-0 mt-0.5">Next</Badge>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SadeSatiTableView({ analysis, birthDate }: EnhancedSadeSatiViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analysis');
  const { sadeSati, dhaiya, summary, currentSaturn } = analysis;
  const { current } = sadeSati;

  // Is the current period an active EnhancedSadeSatiPeriod?
  const activePeriod: EnhancedSadeSatiPeriod | null =
    'isActive' in current && current.isActive === false ? null : current as EnhancedSadeSatiPeriod;

  const currentPhaseIdx = activePeriod?.allPhases?.findIndex(
    p => p.phase === activePeriod.currentPhase?.phase
  ) ?? -1;

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'analysis',  label: 'Analysis' },
    { id: 'phases',    label: 'Phases' },
    { id: 'dhaiya',    label: 'Dhaiya' },
    { id: 'timeline',  label: 'Timeline' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        {/* Title + status pill */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Saturn Transit Analysis</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Professional 15-factor Sade Sati &amp; Dhaiya analysis
            </p>
          </div>

          <div className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',
            summary.currentStatus !== 'clear'
              ? INTENSITY_COLORS[activePeriod?.overallImpact?.intensity ?? 'moderate']
              : 'border-border bg-muted/50 text-muted-foreground',
          )}>
            <Circle className={cn(
              'h-2 w-2',
              summary.currentStatus !== 'clear' ? 'fill-current' : 'fill-muted-foreground text-muted-foreground',
            )} />
            {{
              in_sadesati: 'In Sade Sati',
              in_dhaiya:   'In Dhaiya',
              in_both:     'Sade Sati + Dhaiya',
              clear:       'Not Active',
            }[summary.currentStatus]}
          </div>
        </div>

        {/* Tab bar */}
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
            Shows: overall impact, strength factors, dasha activation,
            Jupiter protection, saturn positioning, recommendations
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'analysis' && (
          <div>

            {/* Overall Impact Banner (only when active) */}
            {activePeriod && (
              <div className={cn(
                'rounded-lg border p-4 mb-1',
                INTENSITY_COLORS[activePeriod.overallImpact.intensity],
              )}>
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
                    <p className="text-xs mt-1 opacity-80">{activePeriod.overallImpact.recommendation}</p>
                  </div>
                  <div className="text-right text-xs opacity-70">
                    <p>Cycle {activePeriod.cycleNumber} · {activePeriod.ageGroup.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Saturn position */}
            <Section title="Current Saturn Position" defaultOpen>
              <div className="rounded-lg border border-border bg-card px-3 py-1">
                <InfoRow label="Sign" value={`${currentSaturn.sign ? ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][currentSaturn.sign - 1] : '—'} · ${currentSaturn.degreeInSign?.toFixed(2)}°`} />
                <InfoRow label="Motion" value={currentSaturn.isRetrograde ? '↩ Retrograde' : '→ Direct'} valueClass={currentSaturn.isRetrograde ? 'text-orange-600' : 'text-emerald-600'} />
                {activePeriod && (
                  <>
                    <InfoRow label="House from Lagna" value={`${activePeriod.saturnHouseFromLagna}th house`} />
                    <InfoRow
                      label="House Effect"
                      value={activePeriod.saturnHouseEffect.charAt(0).toUpperCase() + activePeriod.saturnHouseEffect.slice(1)}
                      valueClass={
                        activePeriod.saturnHouseEffect === 'positive'   ? 'text-emerald-600' :
                        activePeriod.saturnHouseEffect === 'challenging' ? 'text-orange-600'  : ''
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

            {/* Moon & Saturn Strength */}
            <Section title="Planetary Strength" defaultOpen icon={<Star className="h-3.5 w-3.5" />}>
              {activePeriod ? (
                <div className="space-y-2">
                  <StrengthCard data={activePeriod.moonStrength} />
                  <StrengthCard data={activePeriod.saturnStrength} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active Sade Sati to analyze.</p>
              )}
            </Section>

            {/* Dasha Activation */}
            <Section title="Dasha Activation" defaultOpen icon={<Zap className="h-3.5 w-3.5" />}>
              {activePeriod
                ? <DashaCard data={activePeriod.dashaActivation} />
                : <p className="text-sm text-muted-foreground">No active period.</p>}
            </Section>

            {/* Jupiter Protection */}
            <Section title="Jupiter Protection" defaultOpen icon={<Shield className="h-3.5 w-3.5" />}>
              {activePeriod
                ? <JupiterCard data={activePeriod.jupiterProtection} />
                : <p className="text-sm text-muted-foreground">No active period.</p>}
            </Section>

            {/* Top Recommendations */}
            {summary.topRecommendations.length > 0 && (
              <Section title="Recommendations" defaultOpen icon={<TrendingUp className="h-3.5 w-3.5" />}>
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

            {/* Special crossings */}
            {activePeriod?.specialCrossings && (
              <Section title="Special Crossings">
                <div className="rounded-lg border border-border bg-card px-3 py-1">
                  <InfoRow
                    label="Crosses Atmakaraka"
                    value={activePeriod.specialCrossings.crossesAtmakaraka ? '⚠ Yes' : 'No'}
                    valueClass={activePeriod.specialCrossings.crossesAtmakaraka ? 'text-orange-600' : 'text-muted-foreground'}
                  />
                  <InfoRow
                    label="Crosses Lagna Degree"
                    value={activePeriod.specialCrossings.crossesLagnaDegree ? '⚠ Yes' : 'No'}
                    valueClass={activePeriod.specialCrossings.crossesLagnaDegree ? 'text-orange-600' : 'text-muted-foreground'}
                  />
                  <InfoRow
                    label="Crosses 10th Lord"
                    value={activePeriod.specialCrossings.crosses10thLord ? '⚠ Yes' : 'No'}
                    valueClass={activePeriod.specialCrossings.crosses10thLord ? 'text-orange-600' : 'text-muted-foreground'}
                  />
                  <InfoRow
                    label="Crosses Yogakaraka"
                    value={activePeriod.specialCrossings.crossesYogakaraka ? '✓ Yes' : 'No'}
                    valueClass={activePeriod.specialCrossings.crossesYogakaraka ? 'text-emerald-600' : 'text-muted-foreground'}
                  />
                </div>
              </Section>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 2: PHASES
            Shows: three phases with internal entry/peak/exit,
            peak windows, effects & remedies
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'phases' && (
          <div>
            {activePeriod ? (
              <>
                {/* Summary row */}
                <div className="rounded-lg border border-border bg-card px-3 py-1 mb-1">
                  <InfoRow label="Period" value={`${fmt(activePeriod.startDate)} – ${fmt(activePeriod.endDate)}`} />
                  <InfoRow label="Age Range" value={`${age(activePeriod.startDate, birthDate)}–${age(activePeriod.endDate, birthDate)}`} />
                  <InfoRow label="Current Phase" value={activePeriod.currentPhase?.phase ?? '—'} valueClass="text-primary font-semibold" />
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
                {/* Not active — show next period info */}
                <div className="rounded-lg border border-border bg-card px-3 py-1 mb-3">
                  <InfoRow label="Status" value="No active Sade Sati" valueClass="text-muted-foreground" />
                  {sadeSati.next && (
                    <>
                      <InfoRow label="Next Sade Sati" value={fmt(sadeSati.next.startDate)} />
                      <InfoRow label="Years Away" value={`${sadeSati.next.yearsFromNow.toFixed(1)} years`} />
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
                  value={dhaiya.current
                    ? `${dhaiya.current.type} House · Saturn in ${dhaiya.current.saturnSign}`
                    : 'None active'}
                  valueClass={dhaiya.current ? 'text-primary' : 'text-muted-foreground'}
                />
              </div>
            </Section>

            {dhaiya.current && (
              <Section title={`${dhaiya.current.type} House Details`} defaultOpen>
                <div className="rounded-lg border border-border bg-card px-3 py-1 mb-3">
                  <InfoRow label="Period" value={`${fmt(dhaiya.current.startDate)} – ${fmt(dhaiya.current.endDate)}`} />
                  <InfoRow label="Impact" value={
                    <IntensityPill level={dhaiya.current.overallImpact.intensity} label={dhaiya.current.overallImpact.intensity} />
                  } />
                  <InfoRow label="Retrograde" value={
                    dhaiya.current.retrogradePattern?.hasRetrograde
                      ? `${dhaiya.current.retrogradePattern.touchCount}× passes (${dhaiya.current.retrogradePattern.pattern.replace(/_/g, ' ')})`
                      : 'Single pass'
                  } />
                </div>

                {/* Dhaiya internal phases */}
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
                            <span className="text-xs">{fmt(ip.start)} – {fmt(ip.end)}</span>
                          </div>
                          <p className="text-xs mt-0.5 opacity-80">{ip.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dasha + Jupiter for Dhaiya */}
                <div className="space-y-2 mt-3">
                  <DashaCard data={dhaiya.current.dashaActivation} />
                  <p className="text-xs text-muted-foreground mt-2">{dhaiya.current.overallImpact.recommendation}</p>
                </div>
              </Section>
            )}

            <Section title="4th House (Ardha Sade Sati)" badge={dhaiya.upcoming4th.length.toString()} defaultOpen>
              <p className="text-xs text-muted-foreground mb-2">
                Saturn transiting the 4th house from Moon. Domestic pressures, property concerns, emotional challenges.
              </p>
              {dhaiya.upcoming4th.length > 0
                ? dhaiya.upcoming4th.map((d, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-3">
                      <p className="text-sm font-medium">{fmt(d.startDate)} – {fmt(d.endDate)} · Saturn in {d.saturnSign}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {d.overallImpact.intensity} impact · {d.retrogradePattern?.pattern?.replace(/_/g, ' ')}
                      </p>
                    </div>
                  ))
                : <p className="text-sm text-muted-foreground">No upcoming 4th house periods calculated.</p>}
            </Section>

            <Section title="8th House (Ashtama Shani)" badge={dhaiya.upcoming8th.length.toString()} defaultOpen>
              <p className="text-xs text-muted-foreground mb-2">
                Saturn transiting the 8th house from Moon. Sudden obstacles, health concerns, transformation.
              </p>
              {dhaiya.upcoming8th.length > 0
                ? dhaiya.upcoming8th.map((d, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-3">
                      <p className="text-sm font-medium">{fmt(d.startDate)} – {fmt(d.endDate)} · Saturn in {d.saturnSign}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {d.overallImpact.intensity} impact · {d.retrogradePattern?.pattern?.replace(/_/g, ' ')}
                      </p>
                    </div>
                  ))
                : <p className="text-sm text-muted-foreground">No upcoming 8th house periods calculated.</p>}
            </Section>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 4: TIMELINE
        ══════════════════════════════════════════════════════ */}
        {activeTab === 'timeline' && (
          <div className="pt-2">
            <Section title="Past Periods" badge={sadeSati.past.length.toString()}>
              <div className="pt-2">
                {sadeSati.past.length > 0
                  ? sadeSati.past.map((p, i) => {
                      const phases = p.allPhases;
                      const first = phases?.[0];
                      const last = phases?.[phases.length - 1];
                      return (
                        <TimelineEntry
                          key={i}
                          status="past"
                          label={first && last
                            ? `${new Date(first.startDate).getFullYear()} – ${new Date(last.endDate).getFullYear()}`
                            : 'Past period'}
                          sub={`${p.overallImpact?.intensity ?? ''} intensity · Cycle ${p.cycleNumber}`}
                        />
                      );
                    })
                  : <p className="text-sm text-muted-foreground">No past periods in lifetime.</p>}
              </div>
            </Section>

            {activePeriod && (
              <Section title="Current Period" defaultOpen>
                <div className="pt-2">
                  <TimelineEntry
                    status="current"
                    label={`${fmt(activePeriod.startDate)} – ${fmt(activePeriod.endDate)}`}
                    sub={`${activePeriod.overallImpact.intensity.replace('_', ' ')} intensity · ${activePeriod.currentPhase?.phase} phase`}
                    extra={`${activePeriod.elapsedPercentage?.toFixed(1)}% complete · ${activePeriod.daysRemainingInPhase} days remaining`}
                  />
                </div>
              </Section>
            )}

            {sadeSati.upcoming && (
              <Section title="Next Sade Sati" defaultOpen>
                <div className="pt-2">
                  <TimelineEntry
                    status="upcoming"
                    label={`${fmt(sadeSati.upcoming.startDate)} – ${fmt(sadeSati.upcoming.endDate)}`}
                    sub={`Expected ${sadeSati.upcoming.overallImpact?.intensity?.replace('_', ' ') ?? ''} intensity`}
                    extra={sadeSati.next ? `In ${sadeSati.next.yearsFromNow.toFixed(1)} years` : undefined}
                  />
                </div>
              </Section>
            )}

            {sadeSati.future.length > 0 && (
              <Section title="Future Periods" badge={sadeSati.future.length.toString()}>
                <div className="pt-2">
                  {sadeSati.future.map((p, i) => {
                    const phases = p.allPhases;
                    const first = phases?.[0];
                    const last = phases?.[phases.length - 1];
                    return (
                      <TimelineEntry
                        key={i}
                        status="future"
                        label={first && last
                          ? `${new Date(first.startDate).getFullYear()} – ${new Date(last.endDate).getFullYear()}`
                          : 'Future period'}
                        sub={`Cycle ${p.cycleNumber} · ${p.ageGroup?.replace('_', ' ')}`}
                      />
                    );
                  })}
                </div>
              </Section>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
