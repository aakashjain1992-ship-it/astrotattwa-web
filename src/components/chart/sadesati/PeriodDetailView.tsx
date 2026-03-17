'use client';

/**
 * Period Detail View
 *
 * Renders the deep analysis for a single clicked timeline period.
 * Replaces the 4-tab view inside SadeSatiTableView when a row is clicked.
 *
 * Sections (in order):
 *   A. Header        — instant, from selectedPeriod prop (no API wait)
 *   B. Summary       — plain language paragraph
 *   1. What to do    — guidance, open by default
 *   2. When hardest  — timing windows, open by default
 *   3. Life areas    — collapsible
 *   4. Astro details — collapsible (jargon lives here)
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

// ─── Props ─────────────────────────────────────────────────────────────────────

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

// Status badge text shown top-right
function statusText(period: SelectedPeriod): string {
  if (period.status === 'current') return 'Active now';
  if (period.status === 'past')    return 'Past';
  const yearsAway = (period.startDate.getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000);
  if (yearsAway < 1)  return `~${Math.round(yearsAway * 12)} months away`;
  if (yearsAway < 2)  return `~${yearsAway.toFixed(1)} years away`;
  return `~${Math.round(yearsAway)} years away`;
}

// Intensity → plain text label
const INTENSITY_LABEL: Record<PeriodAnalysisResult['overallIntensity'], string> = {
  very_intense: 'Very intense',
  intense:      'Intense',
  moderate:     'Moderate',
  mild:         'Mild',
  very_mild:    'Mild',
};

// Intensity → text color class (text only — no background fill per design spec)
const INTENSITY_COLOR: Record<PeriodAnalysisResult['overallIntensity'], string> = {
  very_intense: 'text-destructive',
  intense:      'text-destructive',
  moderate:     'text-amber-600 dark:text-amber-400',
  mild:         'text-muted-foreground',
  very_mild:    'text-muted-foreground',
};

// Timing intensity → color
const TIMING_COLOR: Record<string, string> = {
  hardest:  'text-destructive',
  pressured: 'text-amber-600 dark:text-amber-400',
  easing:   'text-emerald-600 dark:text-emerald-400',
  neutral:  'text-muted-foreground',
};

// Guidance left-border colors
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

// Nakshatra significance color
const NAK_COLOR: Record<string, string> = {
  critical: 'text-destructive',
  high:     'text-amber-600 dark:text-amber-400',
  medium:   'text-muted-foreground',
};

// Jupiter protection color
const JUP_COLOR: Record<string, string> = {
  strong:   'text-emerald-600 dark:text-emerald-400',
  moderate: 'text-emerald-600 dark:text-emerald-400',
  weak:     'text-muted-foreground',
  none:     'text-muted-foreground',
};

// ─── Skeleton (loading state) ──────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-muted rounded-md', className)} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      <Skeleton className="h-16 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

// ─── Guidance card (left-border) ───────────────────────────────────────────────

function GuidanceCard({
  variant,
  windowLabel,
  items,
}: {
  variant: 'avoid' | 'build' | 'practices';
  windowLabel: string;
  items: string[];
}) {
  const LABEL: Record<typeof variant, string> = {
    avoid:     'Avoid',
    build:     'Build during this window',
    practices: 'Throughout the period',
  };

  return (
    <div className={cn('border-l-2 pl-3 py-2 mb-3', GUIDANCE_BORDER[variant])}>
      <div className="flex items-baseline gap-2 mb-2 flex-wrap">
        <span className={cn('text-xs font-semibold uppercase tracking-wide', GUIDANCE_LABEL_COLOR[variant])}>
          {LABEL[variant]}
        </span>
        {windowLabel && (
          <span className="text-xs text-muted-foreground">· {windowLabel}</span>
        )}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-muted-foreground mt-0.5 flex-shrink-0">›</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function PeriodDetailView({
  period,
  birthDate,
  planets,
  ascendant,
  moonLongitude,
  elapsedFractionOfNakshatra,
  nakshatraLord,
  utcBirthDate,
  onBack,
}: PeriodDetailViewProps) {
  const [analysis, setAnalysis] = useState<PeriodAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analysis on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchAnalysis() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/transits/saturn/period-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedPeriod: period,
            planets,
            ascendant,
            birthDateUtc: utcBirthDate,
            moonLongitude,
            elapsedFractionOfNakshatra,
            nakshatraLord,
          }),
        });

        const result = await response.json();

        if (cancelled) return;

        if (result.success && result.data) {
          setAnalysis(convertDates(result.data));
        } else {
          throw new Error(result.error?.message || 'Analysis failed');
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load analysis');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAnalysis();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period.id]);

  const result = TRANSIT_RESULTS[period.type];

  return (
    <Card>
      {/* ── Top nav bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to timeline
        </button>
        <span className="text-xs text-muted-foreground">{statusText(period)}</span>
      </div>

      <CardContent className="pt-5 pb-6">
        {/* ── A. Header (instant — no API wait) ── */}
        <div className="mb-5 pb-5 border-b border-border">
          {/* Intensity label + title */}
          {analysis && (
            <p className={cn('text-xs font-semibold mb-1', INTENSITY_COLOR[analysis.overallIntensity])}>
              {INTENSITY_LABEL[analysis.overallIntensity]}
            </p>
          )}
          <h2 className="text-lg font-semibold leading-snug text-foreground mb-1">
            {analysis?.plainTitle ?? result?.result ?? period.label}
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            {ageRange(period.startDate, period.endDate, birthDate)}
            {' · '}
            {fmtFull(period.startDate)} – {fmtFull(period.endDate)}
          </p>

          {/* Chips */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs px-2.5 py-1 bg-muted rounded-md text-muted-foreground border border-border">
              Saturn in {period.saturnSignName}
            </span>
            {period.passes.length > 1 && (
              <span className="text-xs px-2.5 py-1 bg-muted rounded-md text-muted-foreground border border-border">
                {period.passes.length} visits (retrograde)
              </span>
            )}
            <span className="text-xs px-2.5 py-1 bg-muted rounded-md text-muted-foreground border border-border">
              {period.cycleNumber === 1 ? 'First' : period.cycleNumber === 2 ? 'Second' : 'Third'} in lifetime
            </span>
          </div>

          {/* Pass date blocks */}
          {period.passes.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {period.passes.map((pass, i) => (
                <div
                  key={i}
                  className="border border-border rounded-md px-3 py-2 bg-muted/30"
                >
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {i === 0 ? '1st entry' : i === 1 ? 'Re-entry' : 'Final entry'}
                  </p>
                  <p className="text-xs font-medium">{fmtPass(pass)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && <LoadingSkeleton />}

        {/* Error state */}
        {error && !isLoading && (
          <div className="py-8 text-center">
            <p className="text-sm text-destructive mb-3">Failed to load analysis</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                // Re-trigger effect by toggling a dummy state — simplest safe approach
                // The useEffect runs once on mount so we reload the page section
                window.location.reload();
              }}
              className="text-sm text-primary underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Analysis sections (once loaded) ── */}
        {!isLoading && !error && analysis && (
          <div className="space-y-0">
            {/* B. Summary (always visible, no wrapper) */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 pb-4 border-b border-border">
              {analysis.summary}
            </p>

            {/* 1. What to do — open by default */}
            <Section
              title="What to do"
              subtitle="Cautions · Opportunities · Practices"
              defaultOpen
            >
              <GuidanceCard
                variant="avoid"
                windowLabel={analysis.guidance.avoidWindow}
                items={analysis.guidance.avoid}
              />
              <GuidanceCard
                variant="build"
                windowLabel={analysis.guidance.buildWindow}
                items={analysis.guidance.build}
              />
              <GuidanceCard
                variant="practices"
                windowLabel=""
                items={analysis.guidance.practices}
              />
            </Section>

            {/* 2. When hardest — open by default */}
            <Section title="When is it hardest?" defaultOpen>
              <div className="space-y-2 pt-1">
                {analysis.timingWindows.map((tw, i) => (
                  <div
                    key={i}
                    className="border border-border rounded-md px-3 py-2.5"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{tw.label}</span>
                      <span className={cn('text-xs font-semibold capitalize flex-shrink-0', TIMING_COLOR[tw.intensity])}>
                        {tw.intensity === 'hardest' ? 'Hardest' :
                         tw.intensity === 'pressured' ? 'Pressured' :
                         tw.intensity === 'easing'   ? 'Easing' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tw.description}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 3. Life areas — closed by default */}
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

            {/* 4. Astrological details — closed by default */}
            <Section title="Astrological details">
              {/* Strength cards */}
              <div className="mb-3 pt-1">
                <StrengthCard data={analysis.moonStrength} />
                <StrengthCard data={analysis.saturnStrength} />
              </div>

              {/* Info rows */}
              <div className="border border-border rounded-md px-3 py-1 mb-3">
                <InfoRow
                  label="Type"
                  value={`${period.label} · Cycle ${period.cycleNumber}`}
                />
                <InfoRow label="Saturn sign" value={period.saturnSignName} />
                <InfoRow label="House from Moon" value={`${period.houseFromMoon}${period.houseFromMoon === 1 ? 'st' : period.houseFromMoon === 2 ? 'nd' : 'th'}`} />
                <InfoRow
                  label="House from Lagna"
                  value={`${analysis.saturnAspects.houseFromLagna}th house`}
                />
                <InfoRow
                  label="Saturn house effect"
                  value={
                    analysis.saturnAspects.saturnHouseEffect.charAt(0).toUpperCase() +
                    analysis.saturnAspects.saturnHouseEffect.slice(1)
                  }
                  valueClass={
                    analysis.saturnAspects.saturnHouseEffect === 'positive'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : analysis.saturnAspects.saturnHouseEffect === 'challenging'
                      ? 'text-amber-600 dark:text-amber-400'
                      : ''
                  }
                />
                <InfoRow
                  label="Saturn aspects"
                  value={`${analysis.saturnAspects.aspectsHouses.map(h => `${h}th`).join(', ')} house`}
                />
                <InfoRow
                  label="Passes (retrograde)"
                  value={`${period.passes.length} — ${period.passes.map(p => fmtPass(p)).join(' · ')}`}
                />
                <InfoRow
                  label="Age at start"
                  value={`${analysis.cycleMeaning.ageAtStart} years`}
                />
              </div>

              {/* Dasha peak */}
              {analysis.mostActivatedWindows.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Peak Dasha windows
                  </p>
                  {analysis.mostActivatedWindows.slice(0, 3).map((w, i) => (
                    <div key={i} className="border border-border rounded-md px-3 py-2 mb-1.5">
                      <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                        <span className="text-xs font-medium text-foreground">
                          {w.mahadasha.lord} MD · {w.antardasha.lord} AD · {w.pratyantar.lord} PD
                        </span>
                        <span className={cn(
                          'text-xs font-semibold',
                          w.activationLevel === 'very_high' ? 'text-destructive' :
                          w.activationLevel === 'high'      ? 'text-amber-600 dark:text-amber-400' :
                          'text-muted-foreground'
                        )}>
                          {w.activationLevel.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {fmtFull(w.pratyantar.start)} – {fmtFull(w.pratyantar.end)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Jupiter summary */}
              {analysis.jupiterSummary.bestProtectedPeriod && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Jupiter protection
                  </p>
                  <div className="border border-border rounded-md px-3 py-2">
                    <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                      <span className="text-xs font-medium text-foreground">
                        Jupiter in {analysis.jupiterSummary.bestProtectedPeriod.jupiterSignName}
                      </span>
                      <span className={cn('text-xs font-semibold', JUP_COLOR[analysis.jupiterSummary.bestProtectedPeriod.protectionStrength])}>
                        {analysis.jupiterSummary.bestProtectedPeriod.protectionStrength}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {fmtFull(analysis.jupiterSummary.bestProtectedPeriod.startDate)} – {fmtFull(analysis.jupiterSummary.bestProtectedPeriod.exitDate)}
                    </p>
                  </div>
                </div>
              )}

              {/* Nakshatra trigger */}
              {analysis.nakshatraTriggers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Nakshatra trigger
                  </p>
                  {analysis.nakshatraTriggers.slice(0, 2).map((nt, i) => (
                    <div key={i} className="border border-border rounded-md px-3 py-2 mb-1.5">
                      <div className="flex justify-between items-start mb-1 flex-wrap gap-2">
                        <span className="text-xs font-medium text-foreground">
                          {nt.nakshatra} · Pada {nt.pada}
                        </span>
                        <span className={cn('text-xs font-semibold capitalize', NAK_COLOR[nt.significance])}>
                          {nt.significance}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {fmtFull(nt.entryDate)} – {fmtFull(nt.exitDate)}
                      </p>
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
