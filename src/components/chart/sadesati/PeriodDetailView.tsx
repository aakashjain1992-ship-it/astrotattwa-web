'use client';

/**
 * Period Detail View — v2
 *
 * Dashboard-style header with dimensional intensity chips,
 * phase progression narrative, window summary, and actionable sections.
 *
 * @file PeriodDetailView.tsx
 */

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Section, InfoRow, StrengthCard, fmtFull, fmtPass, age, convertDates, TRANSIT_RESULTS } from './shared';
import type { SelectedPeriod, PeriodAnalysisResult } from '@/lib/astrology/sadesati/period-analysis-types';
import type { PlanetData, AscendantData } from '@/types/astrology';

interface PeriodDetailViewProps {
  period: SelectedPeriod;
  birthDate: Date;
  planets: Record<string, PlanetData>;
  ascendant: AscendantData;
  moonLongitude: number;
  elapsedFractionOfNakshatra: number;
  nakshatraLord: string;
  utcBirthDate: string;
  onBack: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function ageRange(start: Date, end: Date, birth: Date): string {
  const a1 = age(start, birth);
  const a2 = age(end, birth);
  return a1 === a2 ? `Age ${a1}` : `Age ${a1}–${a2}`;
}

function statusText(period: SelectedPeriod): string {
  if (period.status === 'current') return 'Active now';
  if (period.status === 'past')    return 'Past';
  const y = (period.startDate.getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000);
  if (y < 1)  return `~${Math.round(y * 12)} months away`;
  if (y < 2)  return `~${y.toFixed(1)} years away`;
  return `~${Math.round(y)} years away`;
}

// Dimensional level → display label
const DIM_LABEL: Record<string, string> = {
  very_high: 'Very high',
  high:      'High',
  moderate:  'Moderate',
  low:       'Low',
};

// Dimensional level → color class (text only)
const DIM_COLOR: Record<string, string> = {
  very_high: 'text-destructive',
  high:      'text-amber-600 dark:text-amber-400',
  moderate:  'text-muted-foreground',
  low:       'text-muted-foreground',
};

const GUIDANCE_BORDER: Record<'avoid' | 'build' | 'practices', string> = {
  avoid:     'border-l-destructive',
  build:     'border-l-emerald-500',
  practices: 'border-l-blue-500',
};
const GUIDANCE_LABEL_COLOR: Record<'avoid' | 'build' | 'practices', string> = {
  avoid:     'text-destructive',
  build:     'text-emerald-600 dark:text-emerald-400',
  practices: 'text-blue-600 dark:text-blue-400',
};
const TIMING_COLOR: Record<string, string> = {
  hardest:   'text-destructive',
  pressured: 'text-amber-600 dark:text-amber-400',
  easing:    'text-emerald-600 dark:text-emerald-400',
  neutral:   'text-muted-foreground',
};
const TIMING_LABEL: Record<string, string> = {
  hardest:   'Hardest',
  pressured: 'Pressured',
  easing:    'Easing',
  neutral:   '',
};

const TYPE_LABEL: Record<SelectedPeriod['type'], string> = {
  ss_rising:  'Sade Sati — Rising Phase',
  ss_peak:    'Sade Sati — Peak Phase',
  ss_setting: 'Sade Sati — Setting Phase',
  dhaiya_4th: 'Dhaiya (4th House)',
  dhaiya_8th: 'Dhaiya (8th House)',
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-muted rounded-md', className)} />;
}
function LoadingSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}

function GuidanceCard({ variant, windowLabel, items }: {
  variant: 'avoid' | 'build' | 'practices';
  windowLabel: string;
  items: string[];
}) {
  const LABEL = { avoid: 'Avoid', build: 'Build during this window', practices: 'Throughout the period' };
  return (
    <div className={cn('border-l-2 pl-3 py-2 mb-3', GUIDANCE_BORDER[variant])}>
      <div className="flex items-baseline gap-2 mb-2 flex-wrap">
        <span className={cn('text-xs font-semibold uppercase tracking-wide', GUIDANCE_LABEL_COLOR[variant])}>
          {LABEL[variant]}
        </span>
        {windowLabel && <span className="text-xs text-muted-foreground">· {windowLabel}</span>}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-0.5 flex-shrink-0">›</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export function PeriodDetailView({
  period, birthDate, planets, ascendant,
  moonLongitude, elapsedFractionOfNakshatra, nakshatraLord, utcBirthDate,
  onBack,
}: PeriodDetailViewProps) {
  const [analysis, setAnalysis] = useState<PeriodAnalysisResult | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch('/api/transits/saturn/period-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedPeriod: period, planets, ascendant,
        birthDateUtc: utcBirthDate, moonLongitude, elapsedFractionOfNakshatra, nakshatraLord }),
    })
      .then(r => r.json())
      .then(result => {
        if (cancelled) return;
        if (result.success && result.data) setAnalysis(convertDates(result.data));
        else throw new Error(result.error?.message || 'Analysis failed');
      })
      .catch(err => { if (!cancelled) setError(err.message || 'Failed to load analysis'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.id]);

  const result = TRANSIT_RESULTS[period.type];

  return (
    <Card>
      {/* Nav bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to timeline
        </button>
        <span className="text-xs text-muted-foreground">{statusText(period)}</span>
      </div>

      <CardContent className="pt-5 pb-6">

        {/* ── A. Header — instant ── */}
        <div className="mb-5 pb-5 border-b border-border">

          {/* Type label — structured, not generic title */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {TYPE_LABEL[period.type]}
          </p>

          {/* Date + age */}
          <p className="text-sm text-muted-foreground mb-3">
            {ageRange(period.startDate, period.endDate, birthDate)}
            {' · '}
            {fmtFull(period.startDate)} – {fmtFull(period.endDate)}
          </p>

          {/* ── Dimensional intensity chips (loaded) or skeleton chips ── */}
          {isLoading ? (
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-28" />
            </div>
          ) : analysis ? (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: '🧠 Emotional', level: analysis.dimensionalIntensity.emotional,  reason: analysis.dimensionalIntensity.emotionalReason },
                { label: '🧱 Structural', level: analysis.dimensionalIntensity.structural, reason: analysis.dimensionalIntensity.structuralReason },
                { label: '🌍 External',  level: analysis.dimensionalIntensity.external,   reason: analysis.dimensionalIntensity.externalReason },
              ].map(({ label, level, reason }) => (
                <div key={label} className="border border-border rounded-md px-3 py-2" title={reason}>
                  <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                  <p className={cn('text-sm font-semibold', DIM_COLOR[level])}>
                    {DIM_LABEL[level]}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {/* ── Window summary row — at a glance ── */}
          {analysis && (
            <div className="border border-border rounded-md divide-y divide-border">
              <div className="flex items-start gap-3 px-3 py-2">
                <span className="text-xs text-muted-foreground flex-shrink-0 w-20">Best window</span>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{analysis.windowSummary.bestWindow.label}</span>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">{analysis.windowSummary.bestWindow.reason}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-3 py-2">
                <span className="text-xs text-muted-foreground flex-shrink-0 w-20">Highest risk</span>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-destructive">{analysis.windowSummary.highestRisk.label}</span>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">{analysis.windowSummary.highestRisk.reason}</p>
                </div>
              </div>
              {analysis.windowSummary.reviewPhase && (
                <div className="flex items-start gap-3 px-3 py-2">
                  <span className="text-xs text-muted-foreground flex-shrink-0 w-20">Review phase</span>
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{analysis.windowSummary.reviewPhase.label}</span>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">{analysis.windowSummary.reviewPhase.reason}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pass date chips */}
          {period.passes.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {period.passes.map((pass, i) => (
                <div key={i} className="border border-border rounded-md px-3 py-2 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {i === 0 ? '1st entry' : i === 1 ? 'Re-entry' : 'Final entry'}
                  </p>
                  <p className="text-xs font-medium">{fmtPass(pass)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Confidence basis */}
          {analysis && (
            <p className="text-xs text-muted-foreground/60 mt-3 italic">
              {analysis.confidenceBasis}
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && <LoadingSkeleton />}

        {/* Error */}
        {error && !isLoading && (
          <div className="py-8 text-center">
            <p className="text-sm text-destructive mb-3">Failed to load analysis</p>
            <button onClick={() => window.location.reload()} className="text-sm text-primary underline">
              Try again
            </button>
          </div>
        )}

        {/* ── Analysis sections ── */}
        {!isLoading && !error && analysis && (
          <div className="space-y-0">

            {/* Summary */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 pb-4 border-b border-border">
              {analysis.summary}
            </p>

            {/* 1. What to do — open */}
            <Section title="What to do" subtitle="Cautions · Opportunities · Practices" defaultOpen>
              <GuidanceCard variant="avoid"     windowLabel={analysis.guidance.avoidWindow} items={analysis.guidance.avoid} />
              <GuidanceCard variant="build"     windowLabel={analysis.guidance.buildWindow} items={analysis.guidance.build} />
              <GuidanceCard variant="practices" windowLabel="" items={analysis.guidance.practices} />
            </Section>

            {/* 2. How this period unfolds — open */}
            <Section title="How this period unfolds" subtitle="Early · Mid · Late" defaultOpen>
              <div className="space-y-2 pt-1">
                {[
                  { phase: 'Early phase', window: analysis.phaseProgression.earlyWindow, desc: analysis.phaseProgression.early },
                  { phase: 'Mid phase',   window: analysis.phaseProgression.midWindow,   desc: analysis.phaseProgression.mid   },
                  { phase: 'Late phase',  window: analysis.phaseProgression.lateWindow,  desc: analysis.phaseProgression.late  },
                ].map(({ phase, window, desc }) => (
                  <div key={phase} className="border border-border rounded-md px-3 py-2.5">
                    <div className="flex justify-between items-start gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{phase}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{window}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 3. When hardest — open */}
            <Section title="When is it hardest?" defaultOpen>
              <div className="space-y-2 pt-1">
                {analysis.timingWindows.map((tw, i) => (
                  <div key={i} className="border border-border rounded-md px-3 py-2.5">
                    <div className="flex justify-between items-start gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{tw.label}</span>
                      {tw.intensity !== 'neutral' && (
                        <span className={cn('text-xs font-semibold flex-shrink-0', TIMING_COLOR[tw.intensity])}>
                          {TIMING_LABEL[tw.intensity]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tw.description}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 4. Which life areas — closed */}
            <Section title="Which life areas">
              <div className="space-y-2 pt-1">
                {analysis.lifeAreaItems.map((item, i) => (
                  <div key={i} className="border border-border rounded-md px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 5. Astrological details — closed */}
            <Section title="Astrological details">
              {/* Strength cards with translated meaning */}
              <div className="mb-3 pt-1">
                <StrengthCard data={analysis.moonStrength} />
                <StrengthCard data={analysis.saturnStrength} />
                {/* Translated meanings */}
                <div className="border border-border rounded-md px-3 py-2 text-xs text-muted-foreground space-y-1 mt-2">
                  <p>
                    <span className="font-medium text-foreground">Moon {analysis.moonStrength.overallStrength}</span>
                    {' → '}
                    {analysis.moonStrength.overallStrength === 'weak'
                      ? 'Emotional sensitivity is higher — this period requires more self-care'
                      : analysis.moonStrength.overallStrength === 'strong'
                      ? 'Emotional resilience is available — inner stability helps navigate pressure'
                      : 'Moderate emotional stability — manageable with consistent practice'}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Saturn {analysis.saturnStrength.overallStrength}</span>
                    {analysis.saturnStrength.isYogakaraka ? ' (Yogakaraka)' : ''}
                    {' → '}
                    {analysis.saturnStrength.isYogakaraka
                      ? 'Results come through discipline — this chart benefits from Saturn\'s pressure'
                      : analysis.saturnStrength.overallStrength === 'strong'
                      ? 'Saturn delivers lessons cleanly — structured effort is rewarded'
                      : analysis.saturnStrength.overallStrength === 'weak'
                      ? 'Saturn\'s tests may feel heavier — remedies and patience are especially helpful'
                      : 'Neutral Saturn placement — standard transit effects apply'}
                  </p>
                </div>
              </div>

              {/* Info rows */}
              <div className="border border-border rounded-md px-3 py-1 mb-3">
                <InfoRow label="Type" value={`${TYPE_LABEL[period.type]} · Cycle ${period.cycleNumber}`} />
                <InfoRow label="Saturn sign" value={period.saturnSignName} />
                <InfoRow label="House from Moon" value={`${period.houseFromMoon}${period.houseFromMoon === 1 ? 'st' : period.houseFromMoon === 2 ? 'nd' : 'th'}`} />
                <InfoRow
                  label="House from Lagna"
                  value={(() => { const h = analysis.saturnAspects.houseFromLagna; return `${h}${h===1?'st':h===2?'nd':h===3?'rd':'th'} house`; })()}
                />
                <InfoRow
                  label="Saturn house effect"
                  value={analysis.saturnAspects.saturnHouseEffect.charAt(0).toUpperCase() + analysis.saturnAspects.saturnHouseEffect.slice(1)}
                  valueClass={analysis.saturnAspects.saturnHouseEffect === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : analysis.saturnAspects.saturnHouseEffect === 'challenging' ? 'text-amber-600 dark:text-amber-400' : ''}
                />
                <InfoRow label="Saturn aspects" value={`${analysis.saturnAspects.aspectsHouses.map(h => `${h}th`).join(', ')} house`} />
                <InfoRow label="Passes" value={`${period.passes.length} — ${period.passes.map(p => fmtPass(p)).join(' · ')}`} />
                <InfoRow label="Age at start" value={`${analysis.cycleMeaning.ageAtStart} years`} />
              </div>

              {/* Peak dasha windows */}
              {analysis.mostActivatedWindows.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Peak Dasha windows</p>
                  {analysis.mostActivatedWindows.slice(0, 3).map((w, i) => (
                    <div key={i} className="border border-border rounded-md px-3 py-2 mb-1.5">
                      <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                        <span className="text-xs font-medium text-foreground">
                          {w.mahadasha.lord} MD · {w.antardasha.lord} AD · {w.pratyantar.lord} PD
                        </span>
                        <span className={cn('text-xs font-semibold', w.activationLevel === 'very_high' ? 'text-destructive' : w.activationLevel === 'high' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
                          {w.activationLevel.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{fmtFull(w.pratyantar.start)} – {fmtFull(w.pratyantar.end)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Jupiter protection */}
              {analysis.jupiterSummary.bestProtectedPeriod && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Jupiter protection</p>
                  <div className="border border-border rounded-md px-3 py-2">
                    <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                      <span className="text-xs font-medium text-foreground">Jupiter in {analysis.jupiterSummary.bestProtectedPeriod.jupiterSignName}</span>
                      <span className={cn('text-xs font-semibold', analysis.jupiterSummary.bestProtectedPeriod.protectionStrength === 'strong' || analysis.jupiterSummary.bestProtectedPeriod.protectionStrength === 'moderate' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
                        {analysis.jupiterSummary.bestProtectedPeriod.protectionStrength}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{fmtFull(analysis.jupiterSummary.bestProtectedPeriod.startDate)} – {fmtFull(analysis.jupiterSummary.bestProtectedPeriod.exitDate)}</p>
                  </div>
                </div>
              )}

              {/* Nakshatra trigger */}
              {analysis.nakshatraTriggers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Nakshatra trigger</p>
                  {analysis.nakshatraTriggers.slice(0, 2).map((nt, i) => (
                    <div key={i} className="border border-border rounded-md px-3 py-2 mb-1.5">
                      <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                        <span className="text-xs font-medium text-foreground">{nt.nakshatra} · Pada {nt.pada}</span>
                        <span className={cn('text-xs font-semibold capitalize', nt.significance === 'critical' ? 'text-destructive' : nt.significance === 'high' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
                          {nt.significance}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{fmtFull(nt.entryDate)} – {fmtFull(nt.exitDate)}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
